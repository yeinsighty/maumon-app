import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Brain, Video, MessageCircle } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">마음ON</h1>
            </div>
            <Button onClick={handleLogin} className="bg-primary hover:bg-primary/90">
              로그인
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center mb-8 mx-auto shadow-lg">
            <Heart className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">마음ON</h1>
          <p className="text-2xl text-gray-600 mb-8 font-light">내 마음의 스위치 ON</p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            AI 상담사와 함께하는 마음 건강 관리 플랫폼으로 
            일상 속 평온을 찾아보세요
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            마음ON 시작하기
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl text-gray-800">오늘의 마음ON</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                간단한 자가진단으로 오늘의 마음 상태를 확인하고 
                맞춤형 관리 방법을 추천받아보세요
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-2xl flex items-center justify-center mb-4">
                <Video className="h-8 w-8 text-secondary" />
              </div>
              <CardTitle className="text-xl text-gray-800">오늘의 영상ON</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                마음을 달래는 영상 콘텐츠를 시청하고 
                성찰 질문을 통해 깊이 있는 사고를 경험해보세요
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-accent/10 to-accent/20 rounded-2xl flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-xl text-gray-800">오늘의 대화ON</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                AI 상담사 마음이와 따뜻한 대화를 나누며 
                마음의 짐을 덜어보세요
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-8">
            지금 시작해서 더 건강한 마음을 만들어보세요
          </p>
          <Button 
            onClick={handleLogin}
            variant="outline"
            size="lg"
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            무료로 시작하기
          </Button>
        </div>
      </main>
    </div>
  );
}
