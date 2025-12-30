import { useState, useEffect, useCallback } from 'react';
import { QuotaInfo } from '../types';
import { checkApiKeySelection, promptForKeySelection, validateAccessCode } from '../services/geminiService';

export type AuthMode = 'key' | 'passcode';

export function useAuth() {
    // 1. Synchronous Initialization (Fixes FOUC)
    const [keyAuthorized, setKeyAuthorized] = useState(() => {
        // Guard for SSR
        if (typeof window === 'undefined') return false;
        return !!(localStorage.getItem('gemini_api_key_local') || localStorage.getItem('gemini_access_code'));
    });

    const [authMode, setAuthMode] = useState<AuthMode>(() => {
        if (typeof window === 'undefined') return 'key';
        return localStorage.getItem('gemini_access_code') ? 'passcode' : 'key';
    });

    const [quota, setQuota] = useState<QuotaInfo | null>(() => {
        if (typeof window === 'undefined') return null;
        const saved = localStorage.getItem('gemini_quota_cache');
        return saved ? JSON.parse(saved) : null;
    });

    // Handle keys from child components or other tabs
    const handleSaveLocalKey = useCallback((key: string, newQuota?: QuotaInfo) => {
        if (newQuota) {
            // Passcode Mode
            localStorage.setItem('gemini_access_code', key);
            localStorage.setItem('gemini_quota_cache', JSON.stringify(newQuota));
            setQuota(newQuota);
            setAuthMode('passcode');
        } else {
            // API Key Mode
            localStorage.setItem('gemini_api_key_local', key);
            localStorage.removeItem('gemini_access_code'); // Clear access code if switching to key
            setQuota(null);
            setAuthMode('key');
        }
        setKeyAuthorized(true);
    }, []);

    const verifyKey = useCallback(async () => {
        const authorized = await checkApiKeySelection();
        setKeyAuthorized(authorized);
        return authorized;
    }, []);

    const handleSelectKey = useCallback(async () => {
        await promptForKeySelection();
        await verifyKey();
    }, [verifyKey]);

    // Sync from other tabs
    const handleStorageChange = useCallback((e: StorageEvent) => {
        if (e.key === 'gemini_api_key_local' || e.key === 'gemini_access_code') {
            verifyKey();
            if (e.key === 'gemini_access_code' && e.newValue) {
                setAuthMode('passcode');
            } else if (e.key === 'gemini_api_key_local' && e.newValue) {
                setAuthMode('key');
            }
        }
        if (e.key === 'gemini_quota_cache' && e.newValue) {
            setQuota(JSON.parse(e.newValue));
        }
    }, [verifyKey]);

    // Async Quota Re-validation (Silent)
    useEffect(() => {
        const savedCode = localStorage.getItem('gemini_access_code');
        if (savedCode) {
            // Re-validate with server to get fresh quota
            // Using static import for robustness
            // NOTE: This call must succeed. If it fails (e.g. backend code not deployed), 
            // quota will just remain cached.
            validateAccessCode(savedCode).then(result => {
                if (result.valid && result.quota) {
                    console.log("[Auto-Sync] Quota updated:", result.quota);
                    setQuota(result.quota);
                    setKeyAuthorized(true);
                    localStorage.setItem('gemini_quota_cache', JSON.stringify(result.quota));
                } else {
                    console.warn('[Auto-Sync] Validation failed:', result.error);
                }
            });
        } else {
            // If no passcode, check key (legacy logic)
            // But strict init above covers us, verifyKey effectively double checks.
            verifyKey();
        }

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []); // Run once on mount

    return {
        keyAuthorized,
        authMode,
        quota,
        setQuota,
        handleSaveLocalKey,
        handleSelectKey,
        verifyKey
    };
}
