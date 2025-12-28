import { GoogleGenAI } from "@google/genai";
import { kv } from '@vercel/kv';

export const config = {
    runtime: 'edge',
};



export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { image, prompt, accessCode, imageSize, aspectRatio } = await req.json();

        // 1. Validate Access Code & Quota via Vercel KV (Hash)
        const key = `ac:${accessCode}`;
        const quotaData = await kv.hgetall(key);

        if (!quotaData) {
            return new Response(JSON.stringify({ error: "无效的激活码 (Invalid Access Code)" }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const remaining = parseInt(quotaData.remaining);
        if (remaining <= 0) {
            return new Response(JSON.stringify({
                error: "配额已用尽 (Quota Exceeded)",
                quota: { ...quotaData, remaining }
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 2. Validate API Key (Server-side)
        const SERVER_KEY = process.env.GEMINI_API_KEY;
        if (!SERVER_KEY) {
            return new Response(JSON.stringify({ error: "Server Error: GEMINI_API_KEY Config Missing" }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
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
        // Returns the new value after decrement
        const newRemaining = await kv.hincrby(key, 'remaining', -1);

        // Safety check: if it went below 0 (race condition), treat as 0 or refund?
        // For "User Friendly" loose limit policy, we just accept it.
        // If we strictly don't want negatives:
        // if (newRemaining < 0) await kv.hset(key, { remaining: 0 }); 

        const newQuota = {
            total: parseInt(quotaData.total),
            remaining: Math.max(0, newRemaining)
        };

        // 5. Return result with new quota info
        const candidates = response.candidates;
        if (!candidates || !candidates[0] || !candidates[0].content) {
            // Restore quota if generation failed (User Friendly: No deduct on failure)
            await kv.hincrby(key, 'remaining', 1);
            throw new Error("No candidates returned");
        }

        return new Response(JSON.stringify({
            candidates,
            quota: newQuota // Return updated quota to frontend
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Proxy Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
