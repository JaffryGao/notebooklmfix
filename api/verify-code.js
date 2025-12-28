import { kv } from '@vercel/kv';

export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { accessCode } = await req.json();

        if (!accessCode) {
            return new Response(JSON.stringify({ error: "Access Code is required" }), { status: 400 });
        }

        const key = `ac:${accessCode}`;
        const data = await kv.hgetall(key);

        if (!data) {
            return new Response(JSON.stringify({ valid: false, error: "Invalid Access Code" }), { status: 200 });
        }

        // Handle potential string to number conversion from Redis Hash
        const quotaInfo = {
            total: parseInt(data.total),
            remaining: parseInt(data.remaining),
            valid: data.valid
        };

        if (quotaInfo.remaining <= 0) {
            return new Response(JSON.stringify({
                valid: false,
                error: "Quota Exceeded",
                quota: quotaInfo
            }), { status: 200 });
        }

        return new Response(JSON.stringify({
            valid: true,
            quota: quotaInfo
        }), { status: 200 });

    } catch (error) {
        console.error("Verify Code Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
