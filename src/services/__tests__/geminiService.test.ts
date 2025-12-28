// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { processImageWithGemini, checkApiKeySelection } from '../geminiService';
import { GoogleGenAI } from "@google/genai";

// Mock GoogleGenAI
const mockGenerate = vi.fn();
vi.mock('@google/genai', () => {
    return {
        GoogleGenAI: vi.fn().mockImplementation(function () {
            return {
                models: {
                    generateContent: mockGenerate
                }
            };
        })
    };
});

describe('geminiService', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        vi.unstubAllGlobals();
        // Clear env vars that might affect the test
        process.env.API_KEY = '';
        process.env.GEMINI_API_KEY = '';
    });

    describe('checkApiKeySelection', () => {
        it('should return true if local storage has key', async () => {
            localStorage.setItem('gemini_api_key_local', 'test');
            expect(await checkApiKeySelection()).toBe(true);
        });

        it('should return false if empty', async () => {
            expect(await checkApiKeySelection()).toBe(false);
        });
    });
    // ... rest of file

    describe('processImageWithGemini', () => {
        it('should use proxy if access code is present', async () => {
            localStorage.setItem('gemini_access_code', 'code-123');

            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    candidates: [{
                        content: { parts: [{ inlineData: { data: 'base64image' } }] }
                    }],
                    quota: { remaining: 9 }
                })
            });
            global.fetch = mockFetch;

            const result = await processImageWithGemini('data:image/png;base64,start', 100, 100, '2K');

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith('/api/proxy', expect.any(Object));
            expect(result.image).toContain('base64image');
            expect(result.quota).toBeDefined();
        });

        it('should use direct API if key is present', async () => {
            localStorage.setItem('gemini_api_key_local', 'sk-key');

            // Setup Mock Return
            mockGenerate.mockResolvedValueOnce({
                candidates: [{
                    content: { parts: [{ inlineData: { data: 'directBase64' } }] }
                }]
            });

            const result = await processImageWithGemini('data:image/png;base64,start', 100, 100, '2K');

            expect(result.image).toContain('directBase64');
            expect(mockGenerate).toHaveBeenCalled();
        });
    });
});
