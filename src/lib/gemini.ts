import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const generateQuestions = async (topic: string, count: number) => {
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
  
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Hãy tạo ${count} câu hỏi trắc nghiệm về chủ đề: "${topic}". 
    Mỗi câu hỏi phải có 4 phương án (A, B, C, D) và chỉ có 1 đáp án đúng.
    Ngôn ngữ: Tiếng Việt.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: "Nội dung câu hỏi" },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Mảng 4 phương án trả lời"
            },
            correctAnswer: { type: Type.INTEGER, description: "Chỉ số của đáp án đúng (0-3)" }
          },
          required: ["question", "options", "correctAnswer"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};
