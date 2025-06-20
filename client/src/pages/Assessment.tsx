import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Lightbulb } from "lucide-react";
import DemoModeIndicator from "@/components/DemoModeIndicator";

interface AssessmentQuestion {
  id: number;
  question: string;
  options: { text: string; score: number }[];
}

interface AssessmentResult {
  score: number;
  interpretation: string;
  recommendations: string[];
}

// PHQ-9 기반 간단한 정신건강 자가진단 질문들
const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 1,
    question: "지난 2주 동안 일을 하거나 다른 활동을 하는데 흥미나 즐거움을 거의 느끼지 못했습니까?",
    options: [
      { text: "전혀 그렇지 않다", score: 0 },
      { text: "며칠 동안", score: 1 },
      { text: "1주일 이상", score: 2 },
      { text: "거의 매일", score: 3 }
    ]
  },
  {
    id: 2,
    question: "지난 2주 동안 기분이 가라앉거나, 우울하거나, 절망적이라고 느꼈습니까?",
    options: [
      { text: "전혀 그렇지 않다", score: 0 },
      { text: "며칠 동안", score: 1 },
      { text: "1주일 이상", score: 2 },
      { text: "거의 매일", score: 3 }
    ]
  },
  {
    id: 3,
    question: "지난 2주 동안 잠들기가 어렵거나, 자주 깨거나, 너무 많이 잠을 자는 문제가 있었습니까?",
    options: [
      { text: "전혀 그렇지 않다", score: 0 },
      { text: "며칠 동안", score: 1 },
      { text: "1주일 이상", score: 2 },
      { text: "거의 매일", score: 3 }
    ]
  },
  {
    id: 4,
    question: "지난 2주 동안 피곤하다고 느끼거나 기력이 거의 없다고 느꼈습니까?",
    options: [
      { text: "전혀 그렇지 않다", score: 0 },
      { text: "며칠 동안", score: 1 },
      { text: "1주일 이상", score: 2 },
      { text: "거의 매일", score: 3 }
    ]
  },
  {
    id: 5,
    question: "지난 2주 동안 식욕이 떨어지거나 과식을 하는 문제가 있었습니까?",
    options: [
      { text: "전혀 그렇지 않다", score: 0 },
      { text: "며칠 동안", score: 1 },
      { text: "1주일 이상", score: 2 },
      { text: "거의 매일", score: 3 }
    ]
  },
  {
    id: 6,
    question: "지난 2주 동안 자신이 실패자라고 느끼거나, 자신이나 가족을 실망시켰다고 느꼈습니까?",
    options: [
      { text: "전혀 그렇지 않다", score: 0 },
      { text: "며칠 동안", score: 1 },
      { text: "1주일 이상", score: 2 },
      { text: "거의 매일", score: 3 }
    ]
  },
  {
    id: 7,
    question: "지난 2주 동안 신문을 읽거나 TV를 보는 것과 같은 일에 집중하는 것이 어려웠습니까?",
    options: [
      { text: "전혀 그렇지 않다", score: 0 },
      { text: "며칠 동안", score: 1 },
      { text: "1주일 이상", score: 2 },
      { text: "거의 매일", score: 3 }
    ]
  }
];

export default function Assessment() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

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

  // Submit assessment mutation
  const submitAssessmentMutation = useMutation({
    mutationFn: async () => {
      const questions = assessmentQuestions.map(q => ({
        question: q.question,
        answer: q.options[answers[q.id]]?.text || "",
        score: answers[q.id] || 0
      }));

      return await apiRequest("POST", "/api/assessments", {
        questions
      });
    },
    onSuccess: async (response) => {
      const result = await response.json();
      setResult(result.analysis);
      setIsCompleted(true);
      toast({
        title: "평가 완료",
        description: "마음 상태 체크가 완료되었습니다.",
        variant: "default",
      });
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
        description: "평가를 저장할 수 없습니다.",
        variant: "destructive",
      });
    },
  });

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100;

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleNext = () => {
    if (selectedOption === null) {
      toast({
        title: "답변 선택",
        description: "답변을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedOption
    }));

    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      // Complete assessment
      const finalAnswers = {
        ...answers,
        [currentQuestion.id]: selectedOption
      };
      submitAssessmentMutation.mutate();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedOption(answers[assessmentQuestions[currentQuestionIndex - 1].id] ?? null);
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

  if (isCompleted && result) {
    return (
      <div className="min-h-screen bg-neutral-50">
        {/* Header */}
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
            <div>
              <h2 className="font-bold text-gray-800">평가 결과</h2>
              <p className="text-sm text-neutral-500">마음 상태 체크 완료</p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="px-6 py-8">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">{result.score}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">검사 결과</h3>
                <p className="text-neutral-600">{result.interpretation}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <h4 className="font-bold text-gray-800 mb-4">권장사항</h4>
              <ul className="space-y-3">
                {result.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-neutral-700">{recommendation}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Button
              onClick={() => navigate("/chat")}
              className="w-full bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl py-4 font-bold"
            >
              AI 상담사와 상담하기
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary hover:text-white rounded-xl py-4"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <DemoModeIndicator />
      {/* Header */}
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
          <div>
            <h2 className="font-bold text-gray-800">오늘의 마음ON</h2>
            <p className="text-sm text-neutral-500">마음 상태 체크하기</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 py-4 bg-white border-b border-neutral-200">
        <div className="flex items-center justify-between text-sm text-neutral-600 mb-2">
          <span>진행률</span>
          <span>{currentQuestionIndex + 1}/{assessmentQuestions.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <div className="px-6 py-8">
        <Card className="mb-6 shadow-sm">
          <CardContent className="pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              {currentQuestion.question}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 rounded-xl cursor-pointer transition-colors ${
                    selectedOption === index
                      ? 'bg-primary/5 border-2 border-primary'
                      : 'bg-neutral-50 border-2 border-transparent hover:bg-primary/5'
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <input
                    type="radio"
                    name="assessment-answer"
                    value={index}
                    checked={selectedOption === index}
                    onChange={() => handleAnswerSelect(index)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 border-2 rounded-full mr-4 flex items-center justify-center ${
                    selectedOption === index ? 'border-primary' : 'border-neutral-300'
                  }`}>
                    {selectedOption === index && (
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-700">{option.text}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex space-x-4">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="flex-1 py-4"
          >
            이전
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedOption === null || submitAssessmentMutation.isPending}
            className="flex-1 bg-gradient-to-r from-primary to-blue-600 text-white py-4"
          >
            {submitAssessmentMutation.isPending ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                처리 중...
              </div>
            ) : currentQuestionIndex === assessmentQuestions.length - 1 ? (
              "완료"
            ) : (
              "다음"
            )}
          </Button>
        </div>
      </div>

      {/* Tips */}
      <div className="px-6 pb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">팁</h4>
              <p className="text-sm text-blue-700">
                정직하고 솔직하게 답변해주세요. 이 검사는 전문적인 진단이 아닌 자가 점검을 위한 도구입니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
