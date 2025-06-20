import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Play, Clock, Eye, Calendar, ChevronDown, ChevronUp, MoreVertical } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import DemoModeIndicator from "@/components/DemoModeIndicator";

interface Video {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  transcript: string;
  reflectionQuestions: { question: string }[];
  duration: number;
  views: number;
  createdAt: string;
}

interface ReflectionResponse {
  question: string;
  response: string;
}

export default function Video() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { id: videoId } = useParams();
  const [showTranscript, setShowTranscript] = useState(false);
  const [reflectionResponses, setReflectionResponses] = useState<ReflectionResponse[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
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

  // Fetch today's video if no specific video ID
  const { data: todayVideo } = useQuery({
    queryKey: ["/api/videos/today"],
    enabled: !videoId && isAuthenticated,
    retry: false,
  });

  // Fetch specific video
  const { data: video, isLoading: videoLoading } = useQuery({
    queryKey: ["/api/videos", videoId || todayVideo?.id],
    enabled: !!(videoId || todayVideo?.id) && isAuthenticated,
    retry: false,
  });

  // Initialize reflection responses when video loads
  useEffect(() => {
    if (video?.reflectionQuestions) {
      setReflectionResponses(
        video.reflectionQuestions.map((q: { question: string }) => ({
          question: q.question,
          response: ""
        }))
      );
    }
  }, [video]);

  // Submit reflection mutation
  const submitReflectionMutation = useMutation({
    mutationFn: async () => {
      const videoIdToUse = videoId || todayVideo?.id;
      if (!videoIdToUse) throw new Error("비디오 ID가 없습니다.");
      
      return await apiRequest("POST", `/api/videos/${videoIdToUse}/reflections`, {
        responses: reflectionResponses
      });
    },
    onSuccess: async (response) => {
      const result = await response.json();
      toast({
        title: "성찰 완료",
        description: "AI 상담사와 대화를 시작합니다.",
        variant: "default",
      });
      
      // Create new conversation with the discussion starter
      const conversationResponse = await apiRequest("POST", "/api/conversations", {
        title: `"${video?.title}" 영상 토론`
      });
      const conversation = await conversationResponse.json();
      
      // Add the discussion starter as first AI message
      await apiRequest("POST", `/api/conversations/${conversation.id}/messages`, {
        role: "assistant",
        content: result.discussionStarter
      });
      
      // Navigate to chat
      navigate(`/chat/${conversation.id}`);
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
        description: "성찰 내용을 저장할 수 없습니다.",
        variant: "destructive",
      });
    },
  });

  const handleReflectionChange = (index: number, value: string) => {
    setReflectionResponses(prev =>
      prev.map((response, i) =>
        i === index ? { ...response, response: value } : response
      )
    );
  };

  const handleSubmitReflection = () => {
    const hasAllResponses = reflectionResponses.every(r => r.response.trim());
    if (!hasAllResponses) {
      toast({
        title: "입력 필요",
        description: "모든 질문에 답변해주세요.",
        variant: "destructive",
      });
      return;
    }
    submitReflectionMutation.mutate();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (videoLoading || !video) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">영상을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <DemoModeIndicator />
      {/* Video Header */}
      <div className="bg-black/80 backdrop-blur-sm text-white px-6 py-4 absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-white hover:text-gray-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-bold">오늘의 영상ON</h2>
          <Button variant="ghost" size="sm" className="text-white hover:text-gray-300 hover:bg-white/10">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative pt-16">
        <VideoPlayer
          url={video.videoUrl}
          playing={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>

      {/* Video Content Info */}
      <div className="bg-white">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">{video.title}</h1>
          <p className="text-neutral-600 mb-4">{video.description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-neutral-500 mb-6">
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatDuration(video.duration || 0)}
            </span>
            <span className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {video.views || 0}회
            </span>
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(video.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>

        {/* Video Transcript */}
        {video.transcript && (
          <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
            <Button
              variant="ghost"
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex items-center justify-between w-full text-left p-0 h-auto"
            >
              <span className="font-medium text-gray-800">스크립트 보기</span>
              {showTranscript ? (
                <ChevronUp className="h-4 w-4 text-neutral-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              )}
            </Button>
            
            {showTranscript && (
              <div className="mt-4 text-sm text-neutral-700 space-y-2 whitespace-pre-wrap">
                {video.transcript}
              </div>
            )}
          </div>
        )}

        {/* Reflection Questions */}
        <div className="px-6 py-6 border-t border-neutral-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">영상 감상 후 성찰 질문</h3>
          
          <div className="space-y-6">
            {reflectionResponses.map((response, index) => (
              <div key={index}>
                <p className="font-medium text-gray-700 mb-3">
                  {index + 1}. {response.question}
                </p>
                <Textarea
                  value={response.response}
                  onChange={(e) => handleReflectionChange(index, e.target.value)}
                  className="w-full bg-neutral-100 border-0 rounded-xl p-4 resize-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                  rows={3}
                  placeholder="자유롭게 생각을 적어보세요..."
                />
              </div>
            ))}
          </div>

          <Button
            onClick={handleSubmitReflection}
            disabled={submitReflectionMutation.isPending || !reflectionResponses.every(r => r.response.trim())}
            className="w-full bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl py-4 font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mt-6"
          >
            {submitReflectionMutation.isPending ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                처리 중...
              </div>
            ) : (
              "AI 상담사 가온이와 대화하기"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
