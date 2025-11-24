import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY is not set in environment variables");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

interface GeneratedImageResult {
  base64Image: string;
  mimeType: string;
}

export const generateImageFromImage = async (
  base64ImageData: string,
  mimeType: string,
  newUserPrompt: string
): Promise<GeneratedImageResult | null> => {
  try {
    // A clear instruction for the model
    const fullPrompt = `Giữ nguyên phong cách, ánh sáng, và bố cục của ảnh gốc. Chỉ thay đổi loại phương tiện trong ảnh thành một "${newUserPrompt}". Yêu cầu đặc biệt: toàn bộ bánh xe của phương tiện mới phải được tạo thành từ các quả bóng. Các quả bóng này phải tròn xoe, bóng loáng, có màu sắc cầu vồng, và trông như được làm từ nhựa cứng. Kích thước và tỷ lệ của các quả bóng phải phù hợp với chiếc xe, tương tự như bánh xe trong ảnh gốc. Đảm bảo ảnh mới có cùng tỷ lệ khung hình với ảnh gốc.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: fullPrompt,
          },
        ],
      },
    });

    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return {
            base64Image: part.inlineData.data,
            mimeType: part.inlineData.mimeType,
          };
        }
      }
    }
    
    console.warn("No image part found in the Gemini response.");
    return null;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Lỗi từ Gemini API: ${error.message}`);
    }
    throw new Error("Đã xảy ra lỗi không xác định khi giao tiếp với API.");
  }
};