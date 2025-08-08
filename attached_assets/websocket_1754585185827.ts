interface WebSocketMessage {
  type: 'join_room' | 'leave_room' | 'chat_message' | 'user_joined' | 'user_left' | 'error';
  roomId?: string;
  message?: string;
  encryptedMessage?: string;
  rsaPublicKey?: string;
  rsaModulus?: string;
  username?: string;
  userId?: string;
  timestamp?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  encryptedMessage?: string;
  rsaPublicKey?: string;
  rsaModulus?: string;
  timestamp: Date;
  type: 'message' | 'user_joined' | 'user_left';
}

type MessageHandler = (message: ChatMessage) => void;
type ErrorHandler = (error: string) => void;
type ConnectionHandler = () => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private messageHandlers: MessageHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private connectedHandlers: ConnectionHandler[] = [];
  private disconnectedHandlers: ConnectionHandler[] = [];

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.connectedHandlers.forEach(handler => handler());
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.disconnectedHandlers.forEach(handler => handler());
        this.reconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.errorHandlers.forEach(handler => handler('Connection error'));
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      this.errorHandlers.forEach(handler => 
        handler('Maximum reconnection attempts reached')
      );
    }
  }

  private handleMessage(data: WebSocketMessage) {
    switch (data.type) {
      case 'chat_message':
        if (data.userId && data.username && data.message && data.timestamp) {
          const message: ChatMessage = {
            id: `${data.userId}-${Date.now()}`, // Simple ID generation
            userId: data.userId,
            username: data.username,
            message: data.message,
            encryptedMessage: data.encryptedMessage,
            rsaPublicKey: data.rsaPublicKey,
            rsaModulus: data.rsaModulus,
            timestamp: new Date(data.timestamp),
            type: 'message',
          };
          this.messageHandlers.forEach(handler => handler(message));
        }
        break;

      case 'user_joined':
        if (data.userId && data.username && data.timestamp) {
          const message: ChatMessage = {
            id: `join-${data.userId}-${Date.now()}`,
            userId: data.userId,
            username: data.username,
            message: `${data.username} joined the chat`,
            timestamp: new Date(data.timestamp),
            type: 'user_joined',
          };
          this.messageHandlers.forEach(handler => handler(message));
        }
        break;

      case 'user_left':
        if (data.userId && data.username && data.timestamp) {
          const message: ChatMessage = {
            id: `leave-${data.userId}-${Date.now()}`,
            userId: data.userId,
            username: data.username,
            message: `${data.username} left the chat`,
            timestamp: new Date(data.timestamp),
            type: 'user_left',
          };
          this.messageHandlers.forEach(handler => handler(message));
        }
        break;

      case 'error':
        this.errorHandlers.forEach(handler => handler(data.message || 'Unknown error'));
        break;

      default:
        console.log('Unknown message type:', data);
    }
  }

  joinRoom(roomId: string, userId: string, username: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'join_room',
        roomId,
        userId,
        username,
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  leaveRoom(roomId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'leave_room',
        roomId,
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  sendMessage(
    roomId: string,
    message: string,
    encryptedMessage?: string,
    rsaPublicKey?: string,
    rsaModulus?: string
  ) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const wsMessage: WebSocketMessage = {
        type: 'chat_message',
        roomId,
        message,
        encryptedMessage,
        rsaPublicKey,
        rsaModulus,
      };
      this.ws.send(JSON.stringify(wsMessage));
    }
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.push(handler);
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  onError(handler: ErrorHandler) {
    this.errorHandlers.push(handler);
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index > -1) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }

  onConnected(handler: ConnectionHandler) {
    this.connectedHandlers.push(handler);
    return () => {
      const index = this.connectedHandlers.indexOf(handler);
      if (index > -1) {
        this.connectedHandlers.splice(index, 1);
      }
    };
  }

  onDisconnected(handler: ConnectionHandler) {
    this.disconnectedHandlers.push(handler);
    return () => {
      const index = this.disconnectedHandlers.indexOf(handler);
      if (index > -1) {
        this.disconnectedHandlers.splice(index, 1);
      }
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
