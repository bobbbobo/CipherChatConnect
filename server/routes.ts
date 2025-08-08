import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { WebSocketManager } from "./websocket";
import bcrypt from "bcrypt";
import { insertUserSchema, insertChatRoomSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes - supports both OAuth and guest users
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      console.log('Auth user request - session:', req.session?.guestUser ? 'Guest user found' : 'No guest user');
      console.log('Auth user request - oauth:', req.isAuthenticated() ? 'OAuth authenticated' : 'No OAuth');
      
      // Check for guest user first
      if (req.session?.guestUser) {
        console.log('Returning guest user:', req.session.guestUser.username);
        const user = await storage.getUser(req.session.guestUser.id);
        return res.json(user);
      }

      // Check for OAuth user
      if (req.isAuthenticated() && req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        return res.json(user);
      }

      // Not authenticated
      console.log('User not authenticated');
      return res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Guest user creation with session (no authentication required)
  app.post('/api/auth/guest', async (req: any, res) => {
    try {
      const { username } = req.body;
      if (!username || username.trim().length < 2) {
        return res.status(400).json({ message: "Username must be at least 2 characters" });
      }

      // Check if username is taken
      const existingUser = await storage.getUserByUsername(username.trim());
      if (existingUser) {
        return res.status(400).json({ message: "Username is already taken" });
      }

      // Create guest user (no password)
      const user = await storage.createUser({
        username: username.trim(),
        firstName: username.trim(),
        password: undefined // No password for guest
      });

      // Create a guest session
      console.log('Creating guest session for user:', user.id);
      req.session.guestUser = {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        isGuest: true
      };

      // Manually save the session to ensure it persists
      req.session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        console.log('Session saved successfully for guest:', user.username);
        res.json(user);
      });
    } catch (error) {
      console.error("Error creating guest user:", error);
      res.status(500).json({ message: "Failed to create guest user" });
    }
  });

  // Guest logout
  app.post('/api/auth/guest/logout', async (req: any, res) => {
    try {
      if (req.session?.guestUser) {
        req.session.destroy((err: any) => {
          if (err) {
            console.error('Session destroy error:', err);
            return res.status(500).json({ message: "Failed to logout" });
          }
          res.json({ message: "Logged out successfully" });
        });
      } else {
        res.json({ message: "Not logged in" });
      }
    } catch (error) {
      console.error("Error during guest logout:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });

  // Manual user registration
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = insertUserSchema.extend({
        email: z.string().email().optional(),
        confirmPassword: z.string()
      }).parse(req.body);

      if (validatedData.password !== validatedData.confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      // Check if username or email is taken
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username is already taken" });
      }

      if (validatedData.email) {
        const existingEmail = await storage.getUserByEmail(validatedData.email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email is already registered" });
        }
      }

      const user = await storage.createUser({
        username: validatedData.username,
        password: validatedData.password,
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName
      });

      // Remove password from response
      const { password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Manual user login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.verifyPassword(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // In a real app, you'd set up a session here
      // For now, just return the user
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Chat rooms
  app.get('/api/chat/rooms', async (req, res) => {
    try {
      const rooms = await storage.getChatRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      res.status(500).json({ message: "Failed to fetch chat rooms" });
    }
  });

  app.post('/api/chat/rooms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertChatRoomSchema.parse({
        ...req.body,
        createdBy: userId
      });

      const room = await storage.createChatRoom(validatedData);
      res.json(room);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Error creating chat room:", error);
      res.status(500).json({ message: "Failed to create chat room" });
    }
  });

  // Chat messages
  app.get('/api/chat/rooms/:roomId/messages', async (req, res) => {
    try {
      const { roomId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const messages = await storage.getChatMessages(roomId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // RSA Keys
  app.get('/api/rsa/keys', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const keys = await storage.getUserRsaKeys(userId);
      res.json(keys);
    } catch (error) {
      console.error("Error fetching RSA keys:", error);
      res.status(500).json({ message: "Failed to fetch RSA keys" });
    }
  });

  app.post('/api/rsa/keys', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const keyData = {
        ...req.body,
        userId
      };

      const key = await storage.createRsaKey(keyData);
      res.json(key);
    } catch (error) {
      console.error("Error creating RSA key:", error);
      res.status(500).json({ message: "Failed to create RSA key" });
    }
  });

  app.delete('/api/rsa/keys/:keyId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { keyId } = req.params;
      
      const success = await storage.deleteRsaKey(keyId, userId);
      if (success) {
        res.json({ message: "Key deleted successfully" });
      } else {
        res.status(404).json({ message: "Key not found" });
      }
    } catch (error) {
      console.error("Error deleting RSA key:", error);
      res.status(500).json({ message: "Failed to delete RSA key" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  new WebSocketManager(httpServer);

  return httpServer;
}
