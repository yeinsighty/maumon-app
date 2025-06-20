import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Paperclip, Mic, MoreVertical, Bot, User } from "lucide-react";
import { useLocation } from "wouter";
import DemoModeIndicator from "@/components/DemoModeIndicator";

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Conversation {
  id: number;
  title: string;
  userId: string;
}

export default function Chat() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { id: conversationId } = useParams();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "인증 필요",
        description: "로그인이 필요합니다. 로그인 페이지로 이동합니다...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Create new conversation if no ID provided
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/conversations", {
        title: "AI 상담사와의 대화"
      });
    },
    onSuccess: async (response) => {
      const newConversation = await response.json();
      navigate(`/chat/${newConversation.id}`);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "인증 오류",
          description: "다시 로그인해주세요.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "오류",
        description: "대화를 시작할 수 없습니다.",
        variant: "destructive",
      });
    },
  });

  // Auto-create conversation if not provided
  useEffect(() => {
    if (isAuthenticated && !conversationId) {
      createConversationMutation.mutate();
    }
  }, [isAuthenticated, conversationId]);

  // Fetch messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/conversations", conversationId, "messages"],
    enabled: !!conversationId && isAuthenticated,
    retry: false,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/conversations/${conversationId}/messages`, {
        role: "user",
        content
      });
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: async (response) => {
      const result = await response.json();
      // Invalidate and refetch messages
      queryClient.invalidateQueries({
        queryKey: ["/api/conversations", conversationId, "messages"]
      });
      setMessage("");
      setIsTyping(false);
    },
    onError: (error) => {
      setIsTyping(false);
      if (isUnauthorizedError(error)) {
        toast({
          title: "인증 오류",
          description: "다시 로그인해주세요.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "오류",
        description: "메시지를 보낼 수 없습니다.",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!message.trim() || !conversationId) return;
    sendMessageMutation.mutate(message.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">대화를 시작하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <DemoModeIndicator />
      {/* Chat Header */}
      <div className="bg-white shadow-sm border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">AI 상담사 가온이</h2>
              <p className="text-sm text-green-500 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>온라인
              </p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="text-gray-600">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messagesLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-500">메시지를 불러오는 중...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI 상담사 가온이입니다</h3>
            <p className="text-neutral-500 max-w-sm mx-auto">
              안녕하세요! 편안하게 대화를 시작해보세요. 어떤 마음의 이야기든 들어드릴게요.
            </p>
          </div>
        ) : (
          messages.map((msg: Message) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.role === 'user' ? 'justify-end' : ''
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}
              
              <div
                className={`rounded-2xl px-4 py-3 max-w-xs shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-primary to-blue-600 text-white rounded-tr-md'
                    : 'bg-gradient-to-r from-neutral-100 to-neutral-50 text-gray-700 rounded-tl-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-2 ${
                  msg.role === 'user' ? 'text-blue-100' : 'text-neutral-400'
                }`}>
                  {new Date(msg.createdAt).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-neutral-200 flex-shrink-0">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="사용자"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-300 flex items-center justify-center">
                      <User className="h-5 w-5 text-neutral-600" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="bg-gradient-to-r from-neutral-100 to-neutral-50 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="bg-white border-t border-neutral-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="text-gray-500">
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="메시지를 입력하세요..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-neutral-100 border-0 rounded-full px-4 py-3 pr-12 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              variant="ghost"
              size="sm"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary hover:text-blue-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="ghost" size="sm" className="text-gray-500">
            <Mic className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
