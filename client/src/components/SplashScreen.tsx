import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary via-blue-600 to-secondary flex flex-col items-center justify-center z-50 animate-in fade-in duration-800">
      <div className="text-center">
        {/* App logo */}
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-lg mx-auto animate-in zoom-in duration-500 delay-200">
          <Heart className="h-12 w-12 text-primary" />
        </div>
        
        <h1 className="text-5xl font-bold text-white mb-4 animate-in slide-in-from-bottom duration-600 delay-400">
          마음ON
        </h1>
        <p className="text-xl text-white/90 font-light animate-in slide-in-from-bottom duration-600 delay-500">
          내 마음의 스위치 ON
        </p>
        
        {/* Loading indicator */}
        <div className="mt-12 animate-in fade-in duration-500 delay-700">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
