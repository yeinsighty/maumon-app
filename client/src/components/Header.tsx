import { Bell, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">마음ON</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="relative text-gray-600 hover:bg-neutral-100 rounded-full p-2"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-8 h-8 rounded-full overflow-hidden border-2 border-neutral-200 p-0"
          >
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt="프로필 이미지"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-neutral-300 flex items-center justify-center">
                <User className="h-4 w-4 text-neutral-600" />
              </div>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
