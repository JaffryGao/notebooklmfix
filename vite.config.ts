import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      {
        name: 'configure-server',
        configureServer(server) {
          server.middlewares.use('/api/proxy', async (req, res) => {
            if (req.method === 'POST') {
              try {
                // 1. Read Body
                const buffers = [];
                for await (const chunk of req) {
                  buffers.push(chunk);
                }
                const data = JSON.parse(Buffer.concat(buffers).toString());
                const { prompt, image, accessCode, imageSize, aspectRatio } = data;

                // 2. Validate Access Code - 使用真实 KV 或 Mock
                const KV_REST_API_URL = env.KV_REST_API_URL;
                const KV_REST_API_TOKEN = env.KV_REST_API_TOKEN;

                let isValidCode = false;

                if (KV_REST_API_URL && KV_REST_API_TOKEN) {
                  // 真实 KV 验证
                  try {
                    const kvKey = `ac:${accessCode}`;
                    const kvResponse = await fetch(`${KV_REST_API_URL}/hgetall/${kvKey}`, {
                      headers: { 'Authorization': `Bearer ${KV_REST_API_TOKEN}` }
                    });
                    const kvResult = await kvResponse.json();

                    if (kvResult.result && kvResult.result.length > 0) {
                      const fields: Record<string, string> = {};
                      for (let i = 0; i < kvResult.result.length; i += 2) {
                        fields[kvResult.result[i]] = kvResult.result[i + 1];
                      }
                      const remaining = parseInt(fields.remaining || '0');
                      const valid = fields.valid === '1';
                      isValidCode = valid && remaining > 0;

                      // 不在验证阶段扣减，等 Gemini 成功后再扣
                    }
                  } catch (err) {
                    console.error('[proxy] KV validation error:', err);
                  }
                } else {
                  // Mock 模式
                  const ACCESS_CODES = ["notebook888", "vip666", "jaffry"];
                  isValidCode = ACCESS_CODES.includes(accessCode);
                }

                if (!isValidCode) {
                  res.statusCode = 401;
                  res.end(JSON.stringify({ error: "Invalid Access Code" }));
                  return;
                }

                // 3. Call Gemini (Using Env Key)
                const { GoogleGenAI } = await import('@google/genai');
                const apiKey = env.GEMINI_API_KEY || env.API_KEY;

                console.log("------------------------------------------------");
                console.log("Local Proxy Request Received");
                console.log("Access Code:", accessCode);
                console.log("Image Size:", imageSize || '2K');
                console.log("Aspect Ratio:", aspectRatio || 'auto');
                console.log("Using Server Key:", apiKey ? `${apiKey.substring(0, 8)}...` : "NOT FOUND");
                console.log("------------------------------------------------");

                if (!apiKey) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: "Server API Key not found in .env" }));
                  return;
                }

                const ai = new GoogleGenAI({ apiKey });
                const model = 'gemini-3-pro-image-preview';

                // 定义提示词
                const SYSTEM_PROMPT = "你是一个专业的图像修复专家。";

                const response = await ai.models.generateContent({
                  model: model,
                  contents: {
                    parts: [
                      { text: prompt },
                      {
                        inlineData: {
                          mimeType: 'image/png',
                          data: image,
                        },
                      },
                    ],
                  },
                  config: {
                    systemInstruction: SYSTEM_PROMPT,
                    imageConfig: {
                      aspectRatio: aspectRatio || '16:9',
                      imageSize: imageSize || '2K',
                    }
                  },
                });

                // 4. 成功后扣减额度，并返回最新额度
                let updatedQuota = null;
                if (KV_REST_API_URL && KV_REST_API_TOKEN) {
                  const kvKey = `ac:${accessCode}`;
                  // 扣减
                  await fetch(`${KV_REST_API_URL}/hincrby/${kvKey}/remaining/-1`, {
                    headers: { 'Authorization': `Bearer ${KV_REST_API_TOKEN}` }
                  });
                  // 查询最新值
                  const refreshRes = await fetch(`${KV_REST_API_URL}/hgetall/${kvKey}`, {
                    headers: { 'Authorization': `Bearer ${KV_REST_API_TOKEN}` }
                  });
                  const refreshData = await refreshRes.json();
                  if (refreshData.result && refreshData.result.length > 0) {
                    const fields: Record<string, string> = {};
                    for (let i = 0; i < refreshData.result.length; i += 2) {
                      fields[refreshData.result[i]] = refreshData.result[i + 1];
                    }
                    updatedQuota = {
                      total: parseInt(fields.total || '0'),
                      remaining: parseInt(fields.remaining || '0'),
                      valid: fields.valid === '1'
                    };
                  }
                  console.log(`[proxy] SUCCESS - Deducted 1 from ${accessCode}, new remaining: ${updatedQuota?.remaining}`);
                }

                // 5. Return result with quota
                const candidates = response.candidates;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ candidates, quota: updatedQuota }));

              } catch (e) {
                console.error("Local Proxy Error:", e);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.toString() }));
              }
              // Next middleware
              res.statusCode = 405;
              res.end();
            }
          });

          // Real Vercel KV (Upstash Redis) - 使用环境变量连接真实数据库
          server.middlewares.use('/api/verify-code', async (req, res) => {
            if (req.method === 'POST') {
              const buffers = [];
              for await (const chunk of req) { buffers.push(chunk); }
              const data = JSON.parse(Buffer.concat(buffers).toString());
              const { accessCode } = data;

              const KV_REST_API_URL = env.KV_REST_API_URL;
              const KV_REST_API_TOKEN = env.KV_REST_API_TOKEN;

              // 如果没有配置 KV 环境变量，回退到 Mock 模式
              if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
                console.log('[verify-code] No KV env vars, using Mock mode');
                if (accessCode === 'vip666') {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ valid: true, quota: { total: 100, remaining: 99, valid: true } }));
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ valid: false, error: "Mock Mode: Try 'vip666' or configure .env.local" }));
                }
                return;
              }

              try {
                // 使用 Upstash REST API 查询口令
                const kvKey = `ac:${accessCode}`;
                const response = await fetch(`${KV_REST_API_URL}/hgetall/${kvKey}`, {
                  headers: { 'Authorization': `Bearer ${KV_REST_API_TOKEN}` }
                });
                const result = await response.json();

                // result.result 是一个数组，如 ["valid", "1", "remaining", "5", "total", "5"]
                if (result.result && result.result.length > 0) {
                  const fields: Record<string, string> = {};
                  for (let i = 0; i < result.result.length; i += 2) {
                    fields[result.result[i]] = result.result[i + 1];
                  }

                  const remaining = parseInt(fields.remaining || '0');
                  const total = parseInt(fields.total || '0');
                  const valid = fields.valid === '1';

                  if (valid && remaining > 0) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      valid: true,
                      quota: { total, remaining, valid: true }
                    }));
                  } else {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      valid: false,
                      error: remaining <= 0 ? 'Quota exhausted' : 'Code disabled'
                    }));
                  }
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ valid: false, error: 'Invalid access code' }));
                }
              } catch (error) {
                console.error('[verify-code] KV Error:', error);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ valid: false, error: 'KV connection error' }));
              }
            } else {
              res.statusCode = 405;
              res.end();
            }
          });
        },
      }
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  };
});
