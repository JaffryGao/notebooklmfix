import { GoogleGenAI } from "@google/genai";

// Standard prompt requested by user
const SYSTEM_PROMPT = "你是一个专业的图像修复专家。";
const USER_PROMPT = "请将这张图片用最高的分辨率生成2. 修复图片中的中文文字错误，修复的过程中，如遇原文字特别不清晰的，或错误特别严重的，需要结合语境做解读，猜测它具体是什么文字。（但不可把一个文字改成另外一个毫不相干的文字）3. 请保持原图的构图、布局、文字内容完全一致，仅提升画质、清晰度以及修复文字错误。";

// Helper to calculate closest aspect ratio supported by Gemini 3 Pro Image
// Supported: "1:1", "3:4", "4:3", "9:16", "16:9"
const getClosestAspectRatio = (width: number, height: number): string => {
  const ratio = width / height;
  const supported = [
    { label: "1:1", value: 1.0 },
    { label: "3:4", value: 0.75 },
    { label: "4:3", value: 1.33 },
    { label: "9:16", value: 0.5625 },
    { label: "16:9", value: 1.77 },
  ];

  // Find the one with minimum difference
  const closest = supported.reduce((prev, curr) => {
    return Math.abs(curr.value - ratio) < Math.abs(prev.value - ratio) ? curr : prev;
  });

  return closest.label;
};

export const checkApiKeySelection = async (): Promise<boolean> => {
  if (typeof window.aistudio !== 'undefined' && window.aistudio.hasSelectedApiKey) {
    return await window.aistudio.hasSelectedApiKey();
  }
  // Check Local Storage
  if (localStorage.getItem('gemini_api_key_local')) return true;

  // Check Env Var
  if (process.env.API_KEY || process.env.GEMINI_API_KEY) return true;

  return false;
};

export const promptForKeySelection = async (): Promise<void> => {
  if (typeof window.aistudio !== 'undefined' && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
  } else {
    console.error("AI Studio key selection interface not available.");
  }
};

export const processImageWithGemini = async (
  base64Image: string,
  width: number,
  height: number,
  imageSize: '2K' | '4K' = '2K'
): Promise<string> => {
  // Priority: 1. Google Project IDX (injected) 2. Local Storage 3. Environment Variable
  const localKey = localStorage.getItem('gemini_api_key_local');
  const envKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

  // If we are in IDX environment, SDK handles it automatically if we don't pass apiKey
  // But if we have a local key or env key, we prefer that unless we are sure we are in IDX

  let apiKeyToUse = envKey;
  if (localKey) apiKeyToUse = localKey;

  const ai = new GoogleGenAI({ apiKey: apiKeyToUse });

  // Clean base64 string if it has prefix
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  const aspectRatio = getClosestAspectRatio(width, height);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview', // Mapped from "nano banana pro"
      contents: {
        parts: [
          {
            text: USER_PROMPT,
          },
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64,
            },
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize,
        }
      },
    });

    // Extract image from response
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image generated in response");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};