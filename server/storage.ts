import {
  users,
  chatRooms,
  chatMessages,
  rsaKeys,
  type User,
  type UpsertUser,
  type InsertUser,
  type ChatRoom,
  type InsertChatRoom,
  type ChatMessage,
  type InsertChatMessage,
  type ChatMessageWithUser,
  type RsaKey,
  type InsertRsaKey,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Additional user operations
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Chat operations
  getChatRooms(): Promise<ChatRoom[]>;
  getChatRoom(id: string): Promise<ChatRoom | undefined>;
  createChatRoom(room: InsertChatRoom): Promise<ChatRoom>;
  
  // Message operations
  getChatMessages(roomId: string, limit?: number): Promise<ChatMessageWithUser[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // RSA key operations
  getUserRsaKeys(userId: string): Promise<RsaKey[]>;
  createRsaKey(key: InsertRsaKey): Promise<RsaKey>;
  deleteRsaKey(id: string, userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Additional user operations
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Hash password if provided
    const hashedUserData = { ...userData };
    if (userData.password) {
      hashedUserData.password = await bcrypt.hash(userData.password, 10);
    }

    const [user] = await db
      .insert(users)
      .values(hashedUserData)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Chat operations
  async getChatRooms(): Promise<ChatRoom[]> {
    return await db.select().from(chatRooms);
  }

  async getChatRoom(id: string): Promise<ChatRoom | undefined> {
    const [room] = await db.select().from(chatRooms).where(eq(chatRooms.id, id));
    return room;
  }

  async createChatRoom(roomData: InsertChatRoom): Promise<ChatRoom> {
    const [room] = await db
      .insert(chatRooms)
      .values(roomData)
      .returning();
    return room;
  }

  // Message operations
  async getChatMessages(roomId: string, limit: number = 50): Promise<ChatMessageWithUser[]> {
    const messages = await db
      .select({
        id: chatMessages.id,
        roomId: chatMessages.roomId,
        userId: chatMessages.userId,
        message: chatMessages.message,
        encryptedMessage: chatMessages.encryptedMessage,
        rsaPublicKey: chatMessages.rsaPublicKey,
        rsaModulus: chatMessages.rsaModulus,
        createdAt: chatMessages.createdAt,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          password: users.password,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.userId, users.id))
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);

    return messages.reverse(); // Return in chronological order
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(messageData)
      .returning();
    return message;
  }

  // RSA key operations
  async getUserRsaKeys(userId: string): Promise<RsaKey[]> {
    return await db
      .select()
      .from(rsaKeys)
      .where(eq(rsaKeys.userId, userId))
      .orderBy(desc(rsaKeys.createdAt));
  }

  async createRsaKey(keyData: InsertRsaKey): Promise<RsaKey> {
    const [key] = await db
      .insert(rsaKeys)
      .values(keyData)
      .returning();
    return key;
  }

  async deleteRsaKey(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(rsaKeys)
      .where(and(eq(rsaKeys.id, id), eq(rsaKeys.userId, userId)));
    
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Auth helper method
  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.password) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }
}

export const storage = new DatabaseStorage();
