import { Home, History, TrendingUp, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function BottomNavigation() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-6 py-2 z-30">
      <div className="flex items-center justify-around">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className={`flex flex-col items-center py-2 px-3 h-auto ${
            location === "/" ? "text-primary" : "text-neutral-500 hover:text-primary"
          }`}
        >
          <Home className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">홈</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center py-2 px-3 h-auto text-neutral-500 hover:text-primary transition-colors"
        >
          <History className="h-5 w-5 mb-1" />
          <span className="text-xs">기록</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center py-2 px-3 h-auto text-neutral-500 hover:text-primary transition-colors"
        >
          <TrendingUp className="h-5 w-5 mb-1" />
          <span className="text-xs">리포트</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center py-2 px-3 h-auto text-neutral-500 hover:text-primary transition-colors"
        >
          <Settings className="h-5 w-5 mb-1" />
          <span className="text-xs">설정</span>
        </Button>
      </div>
    </nav>
  );
}
