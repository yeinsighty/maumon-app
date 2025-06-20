import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";

export default function DemoModeIndicator() {
  const { data: demoInfo } = useQuery({
    queryKey: ["/api/demo-mode"],
    retry: false,
  });

  if (!demoInfo?.isDemoMode) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 px-4 py-2 mx-6 my-2 rounded-lg">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <p className="text-sm text-blue-800">
          데모 모드 활성화 – AI 응답이 시뮬레이션됩니다 (상담사: 가온이)
        </p>
      </div>
    </div>
  );
}