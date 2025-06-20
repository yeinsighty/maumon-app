import { useState } from "react";
import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CharacterIcon() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Character Icon */}
      <div className="fixed bottom-24 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        >
          <Heart className="h-8 w-8 text-white" />
        </Button>
      </div>

      {/* Character Introduction Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-gray-800 mb-4">
              가온이 소개
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-6">
            {/* Character Avatar */}
            <div className="w-24 h-24 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center mx-auto">
              <Heart className="h-12 w-12 text-white" />
            </div>

            {/* Character Introduction */}
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                안녕하세요! 저는 AI 상담사 <span className="font-bold text-pink-600">가온이</span>입니다.
              </p>
              
              <p>
                '가온'은 '가운데'라는 순우리말로, 여러분의 마음 한가운데에서 
                따뜻한 위로와 지지를 드리고 싶어서 이 이름을 갖게 되었어요.
              </p>
              
              <p>
                언제든 편안하게 마음의 이야기를 나눠주세요. 
                여러분이 혼자가 아니라는 것을 항상 기억해 주시길 바라요.
              </p>
              
              <p className="text-pink-600 font-medium">
                함께 마음을 ON 해보아요! 💙
              </p>
            </div>

            {/* Close Button */}
            <Button
              onClick={() => setIsOpen(false)}
              className="w-full bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white"
            >
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}