import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateChatResponse, generateVideoDiscussion, assessMentalHealthScore, isDemoMode } from "./openai";
import { 
  insertAssessmentSchema,
  insertConversationSchema, 
  insertMessageSchema,
  insertVideoSchema,
  insertVideoReflectionSchema 
} from "@shared/schema";

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
      res.status(500).json({ message: "사용자 정보를 가져올 수 없습니다." });
    }
  });

  // Demo mode check endpoint
  app.get('/api/demo-mode', (req, res) => {
    res.json({ isDemoMode: isDemoMode() });
  });

  // User stats routes
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats || { streak: 0, totalConversations: 0, totalVideos: 0 });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "사용자 통계를 가져올 수 없습니다." });
    }
  });

  // Assessment routes
  app.post('/api/assessments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertAssessmentSchema.parse({ ...req.body, userId });
      
      // Calculate score and get AI analysis
      const responses = data.questions as { question: string; answer: string; score: number }[];
      const analysis = await assessMentalHealthScore(responses);
      
      const assessment = await storage.createAssessment({
        ...data,
        score: analysis.score
      });
      
      res.json({ assessment, analysis });
    } catch (error) {
      console.error("Error creating assessment:", error);
      res.status(500).json({ message: "평가를 저장할 수 없습니다." });
    }
  });

  app.get('/api/assessments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assessments = await storage.getUserAssessments(userId);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      res.status(500).json({ message: "평가 기록을 가져올 수 없습니다." });
    }
  });

  app.get('/api/assessments/latest', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assessment = await storage.getLatestAssessment(userId);
      res.json(assessment);
    } catch (error) {
      console.error("Error fetching latest assessment:", error);
      res.status(500).json({ message: "최근 평가를 가져올 수 없습니다." });
    }
  });

  // Conversation routes
  app.post('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertConversationSchema.parse({ ...req.body, userId });
      const conversation = await storage.createConversation(data);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "대화를 시작할 수 없습니다." });
    }
  });

  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "대화 기록을 가져올 수 없습니다." });
    }
  });

  app.get('/api/conversations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const conversation = await storage.getConversation(conversationId);
      
      if (!conversation || conversation.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "대화를 찾을 수 없습니다." });
      }
      
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "대화를 가져올 수 없습니다." });
    }
  });

  // Message routes
  app.post('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify conversation ownership
      const conversation = await storage.getConversation(conversationId);
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ message: "대화를 찾을 수 없습니다." });
      }
      
      const messageData = insertMessageSchema.parse({
        ...req.body,
        conversationId
      });
      
      // Save user message
      const userMessage = await storage.createMessage(messageData);
      
      // Get conversation history for AI context
      const messages = await storage.getConversationMessages(conversationId);
      const chatHistory = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));
      
      // Generate AI response
      const aiResponse = await generateChatResponse(chatHistory);
      
      // Save AI message
      const aiMessage = await storage.createMessage({
        conversationId,
        role: 'assistant',
        content: aiResponse
      });
      
      res.json({ userMessage, aiMessage });
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "메시지를 보낼 수 없습니다." });
    }
  });

  app.get('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify conversation ownership
      const conversation = await storage.getConversation(conversationId);
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ message: "대화를 찾을 수 없습니다." });
      }
      
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "메시지를 가져올 수 없습니다." });
    }
  });

  // Video routes
  app.get('/api/videos', async (req, res) => {
    try {
      const videos = await storage.getAllVideos();
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "영상 목록을 가져올 수 없습니다." });
    }
  });

  app.get('/api/videos/today', async (req, res) => {
    try {
      const video = await storage.getTodayVideo();
      res.json(video);
    } catch (error) {
      console.error("Error fetching today's video:", error);
      res.status(500).json({ message: "오늘의 영상을 가져올 수 없습니다." });
    }
  });

  app.get('/api/videos/:id', async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const video = await storage.getVideo(videoId);
      
      if (!video) {
        return res.status(404).json({ message: "영상을 찾을 수 없습니다." });
      }
      
      // Increment view count
      await storage.incrementVideoViews(videoId);
      
      res.json(video);
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ message: "영상을 가져올 수 없습니다." });
    }
  });

  // Video reflection routes
  app.post('/api/videos/:id/reflections', isAuthenticated, async (req: any, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const reflectionData = insertVideoReflectionSchema.parse({
        ...req.body,
        userId,
        videoId
      });
      
      const reflection = await storage.createVideoReflection(reflectionData);
      
      // Get video info for discussion context
      const video = await storage.getVideo(videoId);
      const responses = req.body.responses as { question: string; response: string }[];
      
      // Generate discussion starter
      const discussionStarter = await generateVideoDiscussion(
        video?.title || "영상",
        responses
      );
      
      res.json({ reflection, discussionStarter });
    } catch (error) {
      console.error("Error creating video reflection:", error);
      res.status(500).json({ message: "성찰 내용을 저장할 수 없습니다." });
    }
  });

  app.get('/api/videos/:id/reflections', isAuthenticated, async (req: any, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const reflection = await storage.getVideoReflection(userId, videoId);
      res.json(reflection);
    } catch (error) {
      console.error("Error fetching video reflection:", error);
      res.status(500).json({ message: "성찰 내용을 가져올 수 없습니다." });
    }
  });

  // Admin route to seed videos (temporary for demo)
  app.post('/api/admin/videos', async (req, res) => {
    try {
      const videoData = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(videoData);
      res.json(video);
    } catch (error) {
      console.error("Error creating video:", error);
      res.status(500).json({ message: "영상을 생성할 수 없습니다." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
