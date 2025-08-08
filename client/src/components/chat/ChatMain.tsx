import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { WebSocketClient, type ChatMessage } from "@/lib/websocket";
import { useAuth } from "@/hooks/useAuth";
import { Hash, Users, Info, Shield } from "lucide-react";
import type { ChatMessageWithUser } from "@shared/schema";

interface ChatMainProps {
  roomId?: string;
  roomName?: string;
}

export function ChatMain({ roomId, roomName }: ChatMainProps) {
  const { user } = useAuth();
  const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
  const [newMessages, setNewMessages] = useState<ChatMessageWithUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize WebSocket connection
  useEffect(() => {
    const client = new WebSocketClient();
    setWsClient(client);

    const handleMessage = (message: ChatMessage) => {
      if (message.type === 'message') {
        // Convert WebSocket message to ChatMessageWithUser format
        const chatMessage: ChatMessageWithUser = {
          id: message.id,
          roomId: roomId || '',
          userId: message.userId,
          message: message.message,
          encryptedMessage: message.encryptedMessage || null,
          rsaPublicKey: message.rsaPublicKey || null,
          rsaModulus: message.rsaModulus || null,
          createdAt: message.timestamp,
          user: {
            id: message.userId,
            username: message.username,
            email: null,
            password: null,
            firstName: message.username,
            lastName: null,
            profileImageUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        };
        
        setNewMessages(prev => [...prev, chatMessage]);
      }
    };

    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    const unsubscribeMessage = client.onMessage(handleMessage);
    const unsubscribeConnected = client.onConnected(handleConnected);
    const unsubscribeDisconnected = client.onDisconnected(handleDisconnected);

    return () => {
      unsubscribeMessage();
      unsubscribeConnected();
      unsubscribeDisconnected();
      client.disconnect();
    };
  }, [roomId]);

  // Join room when roomId or user changes
  useEffect(() => {
    if (wsClient && roomId && user && isConnected) {
      setNewMessages([]); // Clear messages when switching rooms
      wsClient.joinRoom(roomId, user.id, user.username || user.firstName || 'Anonymous');
    }
  }, [wsClient, roomId, user, isConnected]);

  const handleSendMessage = (message: string, encryptedMessage?: string) => {
    if (wsClient && roomId && user) {
      wsClient.sendMessage(roomId, message, encryptedMessage);
    }
  };

  if (!roomId || !roomName) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Welcome to CipherChat</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Select a channel from the sidebar to start your secure, encrypted conversation.
          </p>
        </div>
      </div>
    );
  }

  const onlineCount = Math.floor(Math.random() * 50) + 1; // Placeholder for actual online count

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary to-green-600 rounded-lg flex items-center justify-center">
              <Hash className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{roomName}</h3>
              <p className="text-sm text-muted-foreground">{onlineCount} members online</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Connection Status */}
            <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
              <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {isConnected ? 'RSA Encrypted' : 'Connecting...'}
            </Badge>
            
            {/* Chat Options */}
            <Button variant="ghost" size="sm">
              <Users className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <MessageList 
        roomId={roomId} 
        newMessages={newMessages}
        typingUsers={typingUsers}
      />

      {/* Message Input */}
      <MessageInput 
        onSendMessage={handleSendMessage}
        disabled={!isConnected || !user}
      />
    </div>
  );
}
