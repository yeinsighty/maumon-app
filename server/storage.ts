import {
  users,
  assessments,
  conversations,
  messages,
  videos,
  videoReflections,
  userStats,
  type User,
  type UpsertUser,
  type Assessment,
  type InsertAssessment,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type Video,
  type InsertVideo,
  type VideoReflection,
  type InsertVideoReflection,
  type UserStats,
  type InsertUserStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User stats operations
  getUserStats(userId: string): Promise<UserStats | undefined>;
  updateUserStats(userId: string, stats: Partial<InsertUserStats>): Promise<UserStats>;
  
  // Assessment operations
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getUserAssessments(userId: string): Promise<Assessment[]>;
  getLatestAssessment(userId: string): Promise<Assessment | undefined>;
  
  // Conversation operations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: number): Promise<Message[]>;
  
  // Video operations
  createVideo(video: InsertVideo): Promise<Video>;
  getAllVideos(): Promise<Video[]>;
  getVideo(id: number): Promise<Video | undefined>;
  getTodayVideo(): Promise<Video | undefined>;
  incrementVideoViews(id: number): Promise<void>;
  
  // Video reflection operations
  createVideoReflection(reflection: InsertVideoReflection): Promise<VideoReflection>;
  getUserVideoReflections(userId: string): Promise<VideoReflection[]>;
  getVideoReflection(userId: string, videoId: number): Promise<VideoReflection | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
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
    
    // Initialize user stats if new user
    try {
      await db.insert(userStats).values({
        userId: user.id,
        streak: 0,
        totalConversations: 0,
        totalVideos: 0,
      }).onConflictDoNothing();
    } catch (error) {
      // Ignore if stats already exist
    }
    
    return user;
  }

  // User stats operations
  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    return stats;
  }

  async updateUserStats(userId: string, statsUpdate: Partial<InsertUserStats>): Promise<UserStats> {
    const [stats] = await db
      .update(userStats)
      .set({ ...statsUpdate, updatedAt: new Date() })
      .where(eq(userStats.userId, userId))
      .returning();
    return stats;
  }

  // Assessment operations
  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const [newAssessment] = await db
      .insert(assessments)
      .values(assessment)
      .returning();
    return newAssessment;
  }

  async getUserAssessments(userId: string): Promise<Assessment[]> {
    return await db
      .select()
      .from(assessments)
      .where(eq(assessments.userId, userId))
      .orderBy(desc(assessments.completedAt));
  }

  async getLatestAssessment(userId: string): Promise<Assessment | undefined> {
    const [latest] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.userId, userId))
      .orderBy(desc(assessments.completedAt))
      .limit(1);
    return latest;
  }

  // Conversation operations
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db
      .insert(conversations)
      .values(conversation)
      .returning();
    
    // Update user stats
    await db
      .update(userStats)
      .set({ 
        totalConversations: sql`${userStats.totalConversations} + 1`,
        updatedAt: new Date()
      })
      .where(eq(userStats.userId, conversation.userId));
    
    return newConversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation;
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    
    // Update conversation timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, message.conversationId));
    
    return newMessage;
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  // Video operations
  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db
      .insert(videos)
      .values(video)
      .returning();
    return newVideo;
  }

  async getAllVideos(): Promise<Video[]> {
    return await db
      .select()
      .from(videos)
      .orderBy(desc(videos.createdAt));
  }

  async getVideo(id: number): Promise<Video | undefined> {
    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, id));
    return video;
  }

  async getTodayVideo(): Promise<Video | undefined> {
    // Get a random video for today (could be improved with actual daily rotation logic)
    const [video] = await db
      .select()
      .from(videos)
      .orderBy(sql`RANDOM()`)
      .limit(1);
    return video;
  }

  async incrementVideoViews(id: number): Promise<void> {
    await db
      .update(videos)
      .set({ views: sql`${videos.views} + 1` })
      .where(eq(videos.id, id));
  }

  // Video reflection operations
  async createVideoReflection(reflection: InsertVideoReflection): Promise<VideoReflection> {
    const [newReflection] = await db
      .insert(videoReflections)
      .values(reflection)
      .returning();
    
    // Update user stats
    await db
      .update(userStats)
      .set({ 
        totalVideos: sql`${userStats.totalVideos} + 1`,
        updatedAt: new Date()
      })
      .where(eq(userStats.userId, reflection.userId));
    
    return newReflection;
  }

  async getUserVideoReflections(userId: string): Promise<VideoReflection[]> {
    return await db
      .select()
      .from(videoReflections)
      .where(eq(videoReflections.userId, userId))
      .orderBy(desc(videoReflections.completedAt));
  }

  async getVideoReflection(userId: string, videoId: number): Promise<VideoReflection | undefined> {
    const [reflection] = await db
      .select()
      .from(videoReflections)
      .where(
        and(
          eq(videoReflections.userId, userId),
          eq(videoReflections.videoId, videoId)
        )
      );
    return reflection;
  }
}

export const storage = new DatabaseStorage();
