import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, QuizQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Simple cache to prevent regenerating audio for the same text
// Key format: "voiceName:text"
const speechCache = new Map<string, string>();

/**
 * Retries an async operation with exponential backoff.
 */
async function retryOperation<T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3, 
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.warn(`Attempt ${i + 1} failed. Retrying...`, error);
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
  const cacheKey = `${voiceName}:${text}`;
  
  if (speechCache.has(cacheKey)) {
    return speechCache.get(cacheKey)!;
  }

  try {
    const response = await retryOperation(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: {
          parts: [{ text: text }]
        },
        config: {
          responseModalities: ["AUDIO"], // Use string literal to avoid import issues
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      console.warn("Gemini TTS response missing audio data. Response:", response);
      throw new Error("No audio data received from Gemini API");
    }

    speechCache.set(cacheKey, base64Audio);
    return base64Audio;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};

export const generateQuiz = async (
  topic: string,
  difficulty: Difficulty,
  count: number,
  language: string = "English",
  level?: number
): Promise<QuizQuestion[]> => {
  try {
    let difficultyInstruction = `Difficulty: ${difficulty}.`;
    
    // Add specific instruction for Extreme difficulty
    if (difficulty === Difficulty.EXTREME) {
      difficultyInstruction = `Difficulty: Extreme (Very Hard). Focus on obscure facts, deep technical details, rare knowledge, or complex relationships that only an expert in "${topic}" would know. Do not ask common or easy questions.`;
    }

    // Add specific Level instruction if provided (Career Mode)
    let levelInstruction = "";
    if (level) {
      levelInstruction = `This is Level ${level} of 100 in a progressive game. 
      - Level 1-20: Beginner/Easy.
      - Level 21-50: Intermediate/Medium.
      - Level 51-80: Advanced/Hard.
      - Level 81-100: Expert/Extreme.
      Adjust the complexity precisely to match Level ${level}.`;
    }

    const prompt = `Generate a quiz about "${topic}". 
    Language: ${language}.
    ${difficultyInstruction}
    ${levelInstruction}
    Number of questions: ${count}.
    Ensure questions are engaging and accurate. 
    Provide 4 options for each question.
    IMPORTANT: All questions, options, and explanations MUST be written in ${language}.
    
    For the explanation:
    - Make it detailed and educational.
    - Write 2-4 sentences (approx 40-60 words).
    - Explain *why* the answer is correct and provide interesting context.
    - Use simple language so it is easy to understand.`;

    const response = await retryOperation(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are an expert quiz master. You generate accurate, educational, and fun trivia quizzes in ${language}. Your explanations are famous for being clear and very helpful for learning.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: {
                  type: Type.STRING,
                  description: "The question text",
                },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "A list of exactly 4 possible answers",
                },
                correctAnswer: {
                  type: Type.STRING,
                  description: "The correct answer string, must be exactly equal to one of the options",
                },
                explanation: {
                  type: Type.STRING,
                  description: "A detailed, educational explanation (30-60 words) helping the user understand the answer clearly.",
                },
              },
              required: ["question", "options", "correctAnswer", "explanation"],
            },
          },
        },
      });
    }, 3, 2000); // 3 retries, starting with 2s delay

    const text = response.text;
    if (!text) {
      throw new Error("No data received from Gemini");
    }

    const questions = JSON.parse(text) as QuizQuestion[];
    return questions;

  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};