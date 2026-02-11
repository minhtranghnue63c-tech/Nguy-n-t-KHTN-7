
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getStabilityAnalysis(protons: number, neutrons: number, element: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Hãy phân tích tính bền vững của một nguyên tử có ${protons} proton và ${neutrons} neutron (được xác định là ${element}). Giải thích ngắn gọn về tỉ lệ N/Z và liệu nó có phải là một đồng vị bền hay không. Trả lời bằng tiếng Việt.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Không thể nhận phản hồi từ AI lúc này. Hãy thử lại sau.";
  }
}

export async function getFunFact(symbol: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Cho tôi một sự thật thú vị và ít người biết về nguyên tố ${symbol}. Trả lời ngắn gọn, hấp dẫn bằng tiếng Việt.`,
    });
    return response.text;
  } catch (error) {
    return "Nguyên tố này rất thú vị trong hóa học!";
  }
}
