import { GoogleGenAI } from "@google/genai";

import { SYSTEM_PROMPT, USER_PROMPT } from '../constants/prompts';

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
  // Check Local Storage for API Key
  if (localStorage.getItem('gemini_api_key_local')) return true;

  // Check Local Storage for Access Code (Commercial Mode)
  if (localStorage.getItem('gemini_access_code')) return true;

  // Security: Do NOT check process.env.GEMINI_API_KEY on client side
  return false;
};

export const promptForKeySelection = async (): Promise<void> => {
  if (typeof window.aistudio !== 'undefined' && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
  } else {
    console.error("AI Studio key selection interface not available.");
  }
};

import { QuotaInfo } from '../types';

export const processImageWithGemini = async (
  base64Image: string,
  width: number,
  height: number,
  imageSize: '2K' | '4K' = '2K'
): Promise<{ image: string; quota?: QuotaInfo }> => {
  // Check for Access Code first (Proxy Mode)
  const accessCode = localStorage.getItem('gemini_access_code');

  // Clean base64 string if it has prefix
  let cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  if (accessCode) {
    // PROXY MODE - STRICT COMPRESSION FOR VERCEL LIMIT (4.5MB)
    // Target: Keep payload under 4MB to be safe
    const LIMIT_MB = 4;
    const currentSizeMB = (cleanBase64.length * 0.75) / (1024 * 1024);

    if (currentSizeMB > LIMIT_MB) {
      try {
        console.log(`Image too large (${currentSizeMB.toFixed(2)}MB) for Vercel Free Limit (4.5MB), compressing...`);

        const compressImage = (base64: string): Promise<string> => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');

              // Aggressive strategy: 
              // If huge (>8MB), scale 0.5; if large (>4MB), scale 0.7
              let scale = 0.7;
              if (currentSizeMB > 8) scale = 0.5;

              canvas.width = img.width * scale;
              canvas.height = img.height * scale;

              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                // Use JPEG with lower quality (0.6) to ensure small size
                resolve(canvas.toDataURL('image/jpeg', 0.6).replace(/^data:image\/jpeg;base64,/, ""));
              } else {
                resolve(base64);
              }
            };
            img.onerror = () => resolve(base64);
            img.src = `data:image/png;base64,${base64}`;
          });
        };

        cleanBase64 = await compressImage(cleanBase64);
        const newSize = (cleanBase64.length * 0.75) / (1024 * 1024);
        console.log(`Compressed size: ${newSize.toFixed(2)}MB`);

      } catch (e) {
        console.warn("Compression failed, sending original", e);
      }
    }

    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: cleanBase64,
          prompt: USER_PROMPT,
          accessCode: accessCode,
          imageSize: imageSize,
          aspectRatio: getClosestAspectRatio(width, height)
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Proxy Error: ${response.status}`);
      }

      const data = await response.json();
      // Extract image from response validation
      let imageStr = '';
      if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
        for (const part of data.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            imageStr = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!imageStr) throw new Error("No image in proxy response");

      return { image: imageStr, quota: data.quota };

    } catch (e) {
      console.error("Proxy Request Failed", e);
      throw e;
    }
  }

  // --- STANDARD MODE (Direct API Key) ---
  // --- STANDARD MODE (Direct API Key) ---
  // Priority: 1. Google Project IDX (injected) 2. Local Storage
  const localKey = localStorage.getItem('gemini_api_key_local');

  if (!localKey) {
    throw new Error("No API Key found. Please configure your key in settings.");
  }

  const apiKeyToUse = localKey;

  const ai = new GoogleGenAI({ apiKey: apiKeyToUse });
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
          return { image: `data:image/png;base64,${part.inlineData.data}` };
        }
      }
    }

    throw new Error("No image generated in response");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};