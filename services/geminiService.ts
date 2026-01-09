
import { GoogleGenAI, Type } from "@google/genai";
import { Item, SuggestionParams, AISuggestionResponse } from "../types";

export const getAISuggestion = async (
  items: Item[],
  params: SuggestionParams
): Promise<AISuggestionResponse> => {
  if (items.length === 0) {
    return { item: null, reason: "Bạn chưa có dữ liệu nào trong danh mục này để gợi ý!" };
  }

  const ai = new GoogleGenAI({ apiKey: (process as any).env.API_KEY });
  
  const prompt = `
    Dựa trên danh sách các lựa chọn sau đây:
    ${JSON.stringify(items.map(i => ({ id: i.id, name: i.name, mood: i.mood, budget: i.budget, weather: i.weather })))}
    
    Và bối cảnh người dùng:
    - Tâm trạng: ${params.mood}
    - Ngân sách: ${params.budget}
    - Thời tiết: ${params.weather}
    
    Hãy chọn ra một lựa chọn (item) phù hợp nhất. Nếu không có cái nào hoàn toàn khớp, hãy chọn cái gần nhất hoặc ngẫu nhiên một cái hợp lý.
    Trả về định dạng JSON gồm "itemId" và "reason" (lý do gợi ý bằng tiếng Việt, ngắn gọn, dễ thương).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itemId: { type: Type.STRING, description: "ID của item được chọn" },
            reason: { type: Type.STRING, description: "Lý do gợi ý" }
          },
          required: ["itemId", "reason"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    const suggestedItem = items.find(i => i.id === result.itemId) || items[0];

    return {
      item: suggestedItem,
      reason: result.reason || "Dựa trên sở thích của bạn, mình thấy cái này là ổn nhất nè!"
    };
  } catch (error) {
    console.error("AI Error:", error);
    // Fallback to random if AI fails
    const randomItem = items[Math.floor(Math.random() * items.length)];
    return {
      item: randomItem,
      reason: "Hệ thống AI đang bận tí, mình chọn đại cái này cho bạn nhé!"
    };
  }
};
