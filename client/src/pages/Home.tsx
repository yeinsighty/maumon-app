import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Play, MessageCircle, TrendingUp, Calendar, Eye } from "lucide-react";

interface UserStats {
  streak: number;
  totalConversations: number;
  totalVideos: number;
}

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: isAuthenticated,
    retry: false,
  });

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

  const userStats: UserStats = stats || { streak: 0, totalConversations: 0, totalVideos: 0 };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <Header />
      
      {/* Welcome Section */}
      <section className="px-6 py-8 bg-white">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            안녕하세요! {user?.firstName || "사용자"}님
          </h2>
          <p className="text-neutral-500">오늘도 마음을 ON 해보세요</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {statsLoading ? "..." : userStats.streak}
            </div>
            <div className="text-xs text-neutral-500 mt-1">연속일</div>
          </div>
          <div className="bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-secondary">
              {statsLoading ? "..." : userStats.totalConversations}
            </div>
            <div className="text-xs text-neutral-500 mt-1">대화</div>
          </div>
          <div className="bg-gradient-to-br from-accent/10 to-accent/20 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-accent">
              {statsLoading ? "..." : userStats.totalVideos}
            </div>
            <div className="text-xs text-neutral-500 mt-1">영상</div>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mental Health Assessment */}
          <Button
            onClick={() => navigate("/assessment")}
            className="w-full bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl p-4 h-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:from-primary/90 hover:to-blue-500"
          >
            <div className="text-center space-y-3">
              <div className="bg-white/20 rounded-full p-3 w-fit mx-auto">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">오늘의 마음ON</h3>
                <p className="text-blue-100 text-sm">마음 상태를 확인해보세요</p>
              </div>
            </div>
          </Button>

          {/* Video Content */}
          <Button
            onClick={() => navigate("/video")}
            className="w-full bg-gradient-to-r from-secondary to-green-600 text-white rounded-2xl p-4 h-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:from-secondary/90 hover:to-green-500"
          >
            <div className="text-center space-y-3">
              <div className="bg-white/20 rounded-full p-3 w-fit mx-auto">
                <Play className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">오늘의 영상ON</h3>
                <p className="text-green-100 text-sm">마음을 달래는 영상을 보세요</p>
              </div>
            </div>
          </Button>

          {/* AI Chat */}
          <Button
            onClick={() => navigate("/chat")}
            className="w-full bg-gradient-to-r from-accent to-orange-500 text-white rounded-2xl p-4 h-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:from-accent/90 hover:to-orange-400"
          >
            <div className="text-center space-y-3">
              <div className="bg-white/20 rounded-full p-3 w-fit mx-auto">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">오늘의 대화ON</h3>
                <p className="text-orange-100 text-sm">AI 상담사와 대화해보세요</p>
              </div>
            </div>
          </Button>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="px-6 py-6 bg-neutral-50">
        <h3 className="text-lg font-bold text-gray-800 mb-4">최근 활동</h3>
        
        <Card className="mb-3 shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">마음 상태 체크</p>
                  <p className="text-sm text-neutral-500">정기적으로 확인해보세요</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/assessment")}>
                시작
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-3 shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Eye className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">오늘의 영상</p>
                  <p className="text-sm text-neutral-500">새로운 영상이 준비되었어요</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/video")}>
                시청
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">AI 상담사와 대화</p>
                  <p className="text-sm text-neutral-500">언제든지 대화할 수 있어요</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/chat")}>
                대화
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

    </div>
  );
}
