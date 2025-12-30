import { GoogleGenAI } from "@google/genai";
import { kv } from '@vercel/kv';

export const config = {
    // runtime: 'edge', // Disable Edge to allow larger body size and longer timeout
    maxDuration: 60,
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        // Node.js runtime automatically parses JSON body into req.body
        const { image, prompt, accessCode, imageSize, aspectRatio, validateOnly } = req.body;

        // 1. Validate Access Code & Quota via Vercel KV (Hash)
        const key = `ac:${accessCode}`;
        const quotaData = await kv.hgetall(key);

        if (!quotaData) {
            return res.status(401).json({ error: "无效的激活码 (Invalid Access Code)" });
        }

        const remaining = parseInt(quotaData.remaining);

        // --- VALIDATION ONLY MODE ---
        if (validateOnly) {
            return res.status(200).json({
                valid: true,
                quota: {
                    total: parseInt(quotaData.total),
                    remaining: Math.max(0, remaining)
                }
            });
        }

        if (remaining <= 0) {
            return res.status(403).json({
                error: "配额已用尽 (Quota Exceeded)",
                quota: { ...quotaData, remaining }
            });
        }

        // 2. Validate API Key (Server-side)
        const SERVER_KEY = process.env.GEMINI_API_KEY;
        if (!SERVER_KEY) {
            return res.status(500).json({ error: "Server Error: GEMINI_API_KEY Config Missing" });
        }

        // 3. Call Google Gemini
        const ai = new GoogleGenAI({ apiKey: SERVER_KEY });
        const cleanBase64 = image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: 'image/png',
                            data: cleanBase64,
                        },
                    },
                ],
            },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio || "1:1",
                    imageSize: imageSize || "4K", // Force 4K if using Access Code
                }
            }
        });

        // 4. Deduct Quota (Atomic HINCRBY)
        const newRemaining = await kv.hincrby(key, 'remaining', -1);

        const newQuota = {
            total: parseInt(quotaData.total),
            remaining: Math.max(0, newRemaining)
        };

        // 5. Return result with new quota info
        const candidates = response.candidates;
        if (!candidates || !candidates[0] || !candidates[0].content) {
            // Restore quota if generation failed
            await kv.hincrby(key, 'remaining', 1);
            throw new Error("No candidates returned");
        }

        return res.status(200).json({
            candidates,
            quota: newQuota
        });

    } catch (error) {
        console.error("Proxy Error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
