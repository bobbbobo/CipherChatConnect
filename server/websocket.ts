import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';

interface WebSocketMessage {
  type: 'join_room' | 'leave_room' | 'chat_message' | 'user_joined' | 'user_left' | 'error' | 'typing' | 'stop_typing';
  roomId?: string;
  message?: string;
  encryptedMessage?: string;
  rsaPublicKey?: string;
  rsaModulus?: string;
  username?: string;
  userId?: string;
  timestamp?: string;
}

interface ConnectedClient {
  ws: WebSocket;
  userId?: string;
  username?: string;
  currentRoom?: string;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<WebSocket, ConnectedClient> = new Map();
  private rooms: Map<string, Set<WebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      perMessageDeflate: false 
    });
    
    this.wss.on('connection', this.handleConnection.bind(this));
  }

  private handleConnection(ws: WebSocket) {
    console.log('New WebSocket connection');
    
    const client: ConnectedClient = { ws };
    this.clients.set(ws, client);

    ws.on('message', (data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.handleMessage(ws, message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        this.sendError(ws, 'Invalid message format');
      }
    });

    ws.on('close', () => {
      this.handleDisconnection(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.handleDisconnection(ws);
    });
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage) {
    const client = this.clients.get(ws);
    if (!client) return;

    switch (message.type) {
      case 'join_room':
        this.handleJoinRoom(ws, message);
        break;
      case 'leave_room':
        this.handleLeaveRoom(ws, message);
        break;
      case 'chat_message':
        this.handleChatMessage(ws, message);
        break;
      case 'typing':
        this.handleTyping(ws, message);
        break;
      case 'stop_typing':
        this.handleStopTyping(ws, message);
        break;
      default:
        this.sendError(ws, 'Unknown message type');
    }
  }

  private async handleJoinRoom(ws: WebSocket, message: WebSocketMessage) {
    const client = this.clients.get(ws);
    if (!client || !message.roomId || !message.userId || !message.username) {
      this.sendError(ws, 'Invalid join room data');
      return;
    }

    // Leave current room if any
    if (client.currentRoom) {
      this.leaveRoom(ws, client.currentRoom);
    }

    // Update client info
    client.userId = message.userId;
    client.username = message.username;
    client.currentRoom = message.roomId;

    // Add to room
    if (!this.rooms.has(message.roomId)) {
      this.rooms.set(message.roomId, new Set());
    }
    this.rooms.get(message.roomId)!.add(ws);

    // Notify others in room
    this.broadcastToRoom(message.roomId, {
      type: 'user_joined',
      userId: message.userId,
      username: message.username,
      timestamp: new Date().toISOString()
    }, ws);

    console.log(`User ${message.username} joined room ${message.roomId}`);
  }

  private handleLeaveRoom(ws: WebSocket, message: WebSocketMessage) {
    const client = this.clients.get(ws);
    if (!client || !message.roomId) return;

    this.leaveRoom(ws, message.roomId);
  }

  private leaveRoom(ws: WebSocket, roomId: string) {
    const client = this.clients.get(ws);
    if (!client) return;

    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(ws);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }

      // Notify others in room
      if (client.userId && client.username) {
        this.broadcastToRoom(roomId, {
          type: 'user_left',
          userId: client.userId,
          username: client.username,
          timestamp: new Date().toISOString()
        });
      }
    }

    client.currentRoom = undefined;
  }

  private async handleChatMessage(ws: WebSocket, message: WebSocketMessage) {
    const client = this.clients.get(ws);
    if (!client || !client.currentRoom || !client.userId || !client.username || !message.message) {
      this.sendError(ws, 'Invalid message data');
      return;
    }

    try {
      // Save message to database
      const savedMessage = await storage.createChatMessage({
        roomId: client.currentRoom,
        userId: client.userId,
        message: message.message,
        encryptedMessage: message.encryptedMessage,
        rsaPublicKey: message.rsaPublicKey,
        rsaModulus: message.rsaModulus
      });

      // Broadcast to room
      this.broadcastToRoom(client.currentRoom, {
        type: 'chat_message',
        roomId: client.currentRoom,
        userId: client.userId,
        username: client.username,
        message: message.message,
        encryptedMessage: message.encryptedMessage,
        rsaPublicKey: message.rsaPublicKey,
        rsaModulus: message.rsaModulus,
        timestamp: savedMessage.createdAt?.toISOString() || new Date().toISOString()
      });

    } catch (error) {
      console.error('Error saving message:', error);
      this.sendError(ws, 'Failed to save message');
    }
  }

  private handleTyping(ws: WebSocket, message: WebSocketMessage) {
    const client = this.clients.get(ws);
    if (!client || !client.currentRoom || !client.userId || !client.username) return;

    this.broadcastToRoom(client.currentRoom, {
      type: 'typing',
      userId: client.userId,
      username: client.username,
      roomId: client.currentRoom
    }, ws);
  }

  private handleStopTyping(ws: WebSocket, message: WebSocketMessage) {
    const client = this.clients.get(ws);
    if (!client || !client.currentRoom || !client.userId || !client.username) return;

    this.broadcastToRoom(client.currentRoom, {
      type: 'stop_typing',
      userId: client.userId,
      username: client.username,
      roomId: client.currentRoom
    }, ws);
  }

  private broadcastToRoom(roomId: string, message: WebSocketMessage, exclude?: WebSocket) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const messageStr = JSON.stringify(message);
    room.forEach(clientWs => {
      if (clientWs !== exclude && clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(messageStr);
      }
    });
  }

  private sendError(ws: WebSocket, message: string) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'error',
        message
      }));
    }
  }

  private handleDisconnection(ws: WebSocket) {
    const client = this.clients.get(ws);
    if (client && client.currentRoom) {
      this.leaveRoom(ws, client.currentRoom);
    }
    this.clients.delete(ws);
    console.log('WebSocket disconnected');
  }
}
