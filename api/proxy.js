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

        // 5. Construct Response Payload
        const candidates = response.candidates;
        if (!candidates || !candidates[0] || !candidates[0].content) {
            throw new Error("No candidates returned");
        }

        let payload = {
            candidates,
            quota: { ...quotaData, remaining } // Send OLD quota first
        };

        // 6. Check Payload Size (Vercel Limit: 4.5MB)
        const payloadSize = Buffer.byteLength(JSON.stringify(payload));
        const MAX_VERCEL_SIZE = 4.4 * 1024 * 1024; // 4.4MB safety margin

        if (payloadSize > MAX_VERCEL_SIZE) {
            console.log(`Payload too large (${(payloadSize / 1024 / 1024).toFixed(2)}MB). Switching to R2 Fallback...`);

            const S3 = await import('@aws-sdk/client-s3');
            const Presigner = await import('@aws-sdk/s3-request-presigner');

            const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
            const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
            const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
            const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

            if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
                console.error("R2 Config Missing. Returning 413.");
                return res.status(413).json({
                    error: "Image too large (Vercel Limit) and R2 not configured. Please use '2K'.",
                    quota: { ...quotaData, remaining }
                });
            }

            const s3 = new S3.S3Client({
                region: 'auto',
                endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId: R2_ACCESS_KEY_ID,
                    secretAccessKey: R2_SECRET_ACCESS_KEY,
                },
            });

            // Extract Base64 from Candidate
            const part = candidates[0].content.parts[0];
            const base64Data = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `gen_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;

            try {
                // Upload
                await s3.send(new S3.PutObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: fileName,
                    Body: buffer,
                    ContentType: mimeType,
                }));

                // Generate Signed URL
                const command = new S3.GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: fileName });
                // @ts-ignore
                const url = await Presigner.getSignedUrl(s3, command, { expiresIn: 3600 });

                // Create Lightweight Payload
                const lightCandidates = JSON.parse(JSON.stringify(candidates));
                // Remove inlineData, replace with custom imageUrl field
                lightCandidates[0].content.parts[0] = {
                    imageUrl: url,
                    mimeType: mimeType
                };

                payload = {
                    candidates: lightCandidates,
                    quota: { ...quotaData, remaining }
                };
            } catch (r2Error) {
                console.error("R2 Upload Failed:", r2Error);
                return res.status(500).json({
                    error: "Image generated but failed to deliver (Upload Error). Quota refunded.",
                    quota: { ...quotaData, remaining }
                });
            }
        }

        // 7. Deduct Quota (Atomic HINCRBY) - Only if safe to send
        const newRemaining = await kv.hincrby(key, 'remaining', -1);

        // Update payload with new quota
        payload.quota = {
            total: parseInt(quotaData.total),
            remaining: Math.max(0, newRemaining)
        };

        return res.status(200).json(payload);

    } catch (error) {
        console.error("Proxy Error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
