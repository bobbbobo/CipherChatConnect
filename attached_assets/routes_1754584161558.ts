import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertUserSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  username?: string;
}

// WebSocket message types
interface WebSocketMessage {
  type: 'join_room' | 'leave_room' | 'chat_message' | 'user_joined' | 'user_left';
  roomId?: string;
  message?: string;
  encryptedMessage?: string;
  rsaPublicKey?: string;
  rsaModulus?: string;
  username?: string;
  userId?: string;
  timestamp?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Manual auth routes (email/password)
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  const signupSchema = insertUserSchema.extend({
    password: z.string().min(6),
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.verifyPassword(email, password);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Set up session manually for email/password auth
      (req as any).login({ claims: { sub: user.id, email: user.email } }, (err: any) => {
        if (err) {
          return res.status(500).json({ message: 'Login failed' });
        }
        res.json(user);
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: 'Invalid request' });
    }
  });

  app.post('/api/auth/signup', async (req, res) => {
    try {
      const userData = signupSchema.parse(req.body);
      
      // Check if user already exists
      if (userData.email) {
        const existingUser = await storage.getUserByEmail(userData.email);
        if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
        }
      }

      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      const user = await storage.createUser(userData);
      
      // Set up session
      (req as any).login({ claims: { sub: user.id, email: user.email } }, (err: any) => {
        if (err) {
          return res.status(500).json({ message: 'Signup failed' });
        }
        res.json(user);
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  // Chat room routes
  app.get('/api/chat/rooms', isAuthenticated, async (req, res) => {
    try {
      const rooms = await storage.getChatRooms();
      res.json(rooms);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      res.status(500).json({ message: 'Failed to fetch chat rooms' });
    }
  });

  app.get('/api/chat/rooms/:roomId/messages', isAuthenticated, async (req, res) => {
    try {
      const { roomId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getChatMessages(roomId, limit);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  // RSA key management routes
  app.get('/api/rsa/keys', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const keys = await storage.getUserRsaKeys(userId);
      res.json(keys);
    } catch (error) {
      console.error('Error fetching RSA keys:', error);
      res.status(500).json({ message: 'Failed to fetch RSA keys' });
    }
  });

  app.post('/api/rsa/keys', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const keyData = {
        ...req.body,
        userId,
      };
      const key = await storage.createRsaKey(keyData);
      res.json(key);
    } catch (error) {
      console.error('Error creating RSA key:', error);
      res.status(500).json({ message: 'Failed to create RSA key' });
    }
  });

  app.delete('/api/rsa/keys/:keyId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { keyId } = req.params;
      const success = await storage.deleteRsaKey(keyId, userId);
      
      if (!success) {
        return res.status(404).json({ message: 'Key not found' });
      }
      
      res.json({ message: 'Key deleted successfully' });
    } catch (error) {
      console.error('Error deleting RSA key:', error);
      res.status(500).json({ message: 'Failed to delete RSA key' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws'
  });

  // Store active WebSocket connections by room
  const roomConnections = new Map<string, Set<AuthenticatedWebSocket>>();

  wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        console.log('WebSocket message:', message);

        switch (message.type) {
          case 'join_room':
            if (message.roomId && message.userId && message.username) {
              ws.userId = message.userId;
              ws.username = message.username;
              
              // Add to room connections
              if (!roomConnections.has(message.roomId)) {
                roomConnections.set(message.roomId, new Set());
              }
              roomConnections.get(message.roomId)!.add(ws);

              // Notify other users in the room
              const roomUsers = roomConnections.get(message.roomId)!;
              const joinMessage: WebSocketMessage = {
                type: 'user_joined',
                username: message.username,
                userId: message.userId,
                roomId: message.roomId,
                timestamp: new Date().toISOString(),
              };

              roomUsers.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify(joinMessage));
                }
              });
            }
            break;

          case 'leave_room':
            if (message.roomId && ws.userId) {
              const roomUsers = roomConnections.get(message.roomId);
              if (roomUsers) {
                roomUsers.delete(ws);
                
                // Notify other users
                const leaveMessage: WebSocketMessage = {
                  type: 'user_left',
                  username: ws.username,
                  userId: ws.userId,
                  roomId: message.roomId,
                  timestamp: new Date().toISOString(),
                };

                roomUsers.forEach((client) => {
                  if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(leaveMessage));
                  }
                });
              }
            }
            break;

          case 'chat_message':
            if (message.roomId && ws.userId && message.message) {
              // Save message to database
              const messageData = {
                roomId: message.roomId,
                userId: ws.userId,
                message: message.message,
                encryptedMessage: message.encryptedMessage || null,
                rsaPublicKey: message.rsaPublicKey || null,
                rsaModulus: message.rsaModulus || null,
              };

              const savedMessage = await storage.createChatMessage(messageData);

              // Broadcast to all users in the room
              const roomUsers = roomConnections.get(message.roomId);
              if (roomUsers) {
                const broadcastMessage: WebSocketMessage = {
                  type: 'chat_message',
                  roomId: message.roomId,
                  userId: ws.userId,
                  username: ws.username,
                  message: message.message,
                  encryptedMessage: message.encryptedMessage,
                  rsaPublicKey: message.rsaPublicKey,
                  rsaModulus: message.rsaModulus,
                  timestamp: savedMessage.createdAt?.toISOString(),
                };

                roomUsers.forEach((client) => {
                  if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(broadcastMessage));
                  }
                });
              }
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Invalid message format' 
        }));
      }
    });

    ws.on('close', () => {
      // Remove from all room connections
      roomConnections.forEach((roomUsers, roomId) => {
        if (roomUsers.has(ws)) {
          roomUsers.delete(ws);
          
          // Notify other users in the room
          if (ws.userId && ws.username) {
            const leaveMessage: WebSocketMessage = {
              type: 'user_left',
              username: ws.username,
              userId: ws.userId,
              roomId: roomId,
              timestamp: new Date().toISOString(),
            };

            roomUsers.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(leaveMessage));
              }
            });
          }
        }
      });
      
      console.log('WebSocket connection closed');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}
