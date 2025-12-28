// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuth } from '../useAuth';

// Mock geminiService
vi.mock('../../services/geminiService', () => ({
    checkApiKeySelection: vi.fn(),
    promptForKeySelection: vi.fn()
}));

import { checkApiKeySelection } from '../../services/geminiService';

describe('useAuth', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should initialize with authorized=false', async () => {
        (checkApiKeySelection as any).mockResolvedValue(false);
        const { result } = renderHook(() => useAuth());

        expect(result.current.keyAuthorized).toBe(false);
        expect(result.current.authMode).toBe('key');
    });

    it('should load passcode from localStorage', async () => {
        localStorage.setItem('gemini_access_code', 'test-code');
        (checkApiKeySelection as any).mockResolvedValue(true);

        const { result } = renderHook(() => useAuth());

        // useEffect needs time
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.authMode).toBe('passcode');
    });

    it('should handle saving local key', () => {
        const { result } = renderHook(() => useAuth());

        act(() => {
            result.current.handleSaveLocalKey('sk-new-key');
        });

        expect(localStorage.getItem('gemini_api_key_local')).toBe('sk-new-key');
        expect(result.current.keyAuthorized).toBe(true);
        expect(result.current.authMode).toBe('key');
    });

    it('should handle saving access code with quota', () => {
        const { result } = renderHook(() => useAuth());
        const quota = { remaining: 10, total: 200, level: 'test' };

        act(() => {
            result.current.handleSaveLocalKey('code-123', quota);
        });

        expect(localStorage.getItem('gemini_access_code')).toBe('code-123');
        expect(result.current.authMode).toBe('passcode');
        expect(result.current.quota).toEqual(quota);
    });
});
