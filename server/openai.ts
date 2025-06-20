import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
}) : null;

// Demo mode responses for when OpenAI API key is not available
const demoResponses = [
  "마음이: 네 말씀 잘 들었어요. 조금 더 자세히 이야기해보실래요?",
  "마음이: 그런 기분이 드시는군요. 언제부터 그렇게 느끼셨나요?",
  "마음이: 충분히 이해할 수 있어요. 그럴 때는 어떤 것들이 도움이 되시나요?",
  "마음이: 정말 힘드셨겠어요. 지금 가장 필요한 것은 무엇인가요?",
  "마음이: 좋은 생각이에요. 그것에 대해 더 말씀해주실래요?",
  "마음이: 그런 감정을 느끼는 것은 자연스러운 일이에요. 혼자가 아니라는 걸 기억해주세요.",
  "마음이: 천천히 말씀해주세요. 제가 여기서 들어드릴게요.",
  "마음이: 그런 경험을 하시는 것이 쉽지 않으셨을 것 같아요. 어떤 지원이 필요하신가요?"
];

function getRandomDemoResponse(): string {
  return demoResponses[Math.floor(Math.random() * demoResponses.length)];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function generateChatResponse(
  messages: ChatMessage[],
  context?: string
): Promise<string> {
  // Demo mode when OpenAI API key is not available
  if (!openai) {
    // Add a small delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    return getRandomDemoResponse();
  }

  try {
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `당신은 "마음이"라는 이름의 한국어 AI 상담사입니다. 다음 지침을 따라주세요:

1. 항상 한국어로 대화하세요
2. 따뜻하고 공감적인 어조를 유지하세요
3. 전문적이면서도 친근한 말투를 사용하세요
4. 사용자의 감정을 이해하고 검증해주세요
5. 판단하지 말고 경청하는 자세를 보여주세요
6. 필요시 건설적인 조언을 제공하세요
7. 심각한 정신건강 문제가 의심되면 전문가 상담을 권하세요
8. 대화를 자연스럽게 이어가도록 질문을 포함하세요

${context ? `추가 컨텍스트: ${context}` : ''}

항상 사용자의 마음 건강과 안전을 최우선으로 생각하며 대화하세요.`
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "죄송해요, 응답을 생성할 수 없습니다.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("AI 상담사와의 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
}

export async function generateVideoDiscussion(
  videoTitle: string,
  reflectionResponses: { question: string; response: string }[]
): Promise<string> {
  // Demo mode when OpenAI API key is not available
  if (!openai) {
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    return `마음이: "${videoTitle}" 영상을 보시고 깊이 있게 성찰해주셨네요. 특히 인상 깊었던 부분이 있으셨나요? 그 순간에 어떤 감정을 느끼셨는지 더 자세히 말씀해주실래요?`;
  }

  try {
    const context = `사용자가 "${videoTitle}" 영상을 시청하고 다음과 같이 성찰했습니다:
${reflectionResponses.map(r => `질문: ${r.question}\n답변: ${r.response}`).join('\n\n')}

이 성찰 내용을 바탕으로 Havruta 스타일의 대화를 시작해주세요.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: 'system',
          content: `당신은 Havruta 스타일 대화를 진행하는 AI 상담사입니다. 사용자의 영상 시청 후 성찰을 바탕으로 깊이 있는 대화를 이어가세요. 

Havruta 대화의 특징:
- 질문과 답변을 통한 상호 탐구
- 서로 다른 관점 탐색
- 깊이 있는 사고 촉진
- 판단보다는 이해에 집중

한국어로 따뜻하고 지지적인 어조로 대화를 시작하세요.`
        },
        {
          role: 'user',
          content: context
        }
      ],
      temperature: 0.8,
      max_tokens: 800,
    });

    return response.choices[0].message.content || "영상에 대한 깊이 있는 대화를 시작해보겠습니다.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("영상 토론을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }
}

export async function assessMentalHealthScore(
  responses: { question: string; answer: string; score: number }[]
): Promise<{ score: number; interpretation: string; recommendations: string[] }> {
  const totalScore = responses.reduce((sum, r) => sum + r.score, 0);
  
  // Demo mode when OpenAI API key is not available
  if (!openai) {
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
    
    let interpretation = "";
    let recommendations = [];
    
    if (totalScore <= 4) {
      interpretation = "현재 마음 상태가 양호한 편입니다. 긍정적인 마음가짐을 유지하세요.";
      recommendations = [
        "규칙적인 생활 패턴을 유지하세요",
        "취미 활동이나 운동을 통해 스트레스를 관리하세요",
        "가족이나 친구들과의 시간을 소중히 하세요"
      ];
    } else if (totalScore <= 9) {
      interpretation = "가벼운 스트레스나 우울감을 느끼고 계신 것 같습니다.";
      recommendations = [
        "충분한 휴식과 수면을 취하세요",
        "신뢰할 수 있는 사람과 이야기를 나누어보세요",
        "명상이나 요가 같은 이완 활동을 시도해보세요",
        "필요시 전문가의 도움을 받는 것을 고려해보세요"
      ];
    } else {
      interpretation = "상당한 정신적 부담을 느끼고 계신 것 같습니다. 전문가의 도움을 받아보세요.";
      recommendations = [
        "정신건강 전문가와 상담을 받아보세요",
        "신뢰할 수 있는 사람들에게 도움을 요청하세요",
        "규칙적인 일상을 유지하려 노력하세요",
        "무리하지 마시고 충분히 쉬세요",
        "위기상황시 정신건강 상담전화(1577-0199)를 이용하세요"
      ];
    }
    
    return {
      score: totalScore,
      interpretation,
      recommendations
    };
  }

  try {
    const prompt = `다음은 정신건강 자가진단 결과입니다:
${responses.map(r => `질문: ${r.question}\n답변: ${r.answer} (점수: ${r.score})`).join('\n\n')}

총점: ${totalScore}

이 결과를 바탕으로 JSON 형식으로 다음을 제공해주세요:
{
  "score": 총점,
  "interpretation": "점수에 대한 한국어 해석 (100자 이내)",
  "recommendations": ["구체적인 권장사항들을 한국어로 배열 형태로"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: 'system',
          content: "당신은 정신건강 전문가입니다. 자가진단 결과를 해석하고 도움이 되는 권장사항을 제공하세요. 반드시 JSON 형식으로 응답하세요."
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      score: result.score || 0,
      interpretation: result.interpretation || "결과를 분석할 수 없습니다.",
      recommendations: result.recommendations || ["전문가와 상담을 받아보세요."]
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("평가 결과를 분석할 수 없습니다.");
  }
}

// Helper function to check if we're in demo mode
export function isDemoMode(): boolean {
  return !openai;
}
