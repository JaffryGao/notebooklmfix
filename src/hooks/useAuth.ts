import { useState, useEffect, useCallback } from 'react';
import { QuotaInfo } from '../types';
import { checkApiKeySelection, promptForKeySelection } from '../services/geminiService';

export type AuthMode = 'key' | 'passcode';

export function useAuth() {
    const [keyAuthorized, setKeyAuthorized] = useState(false);
    const [quota, setQuota] = useState<QuotaInfo | null>(null);
    const [authMode, setAuthMode] = useState<AuthMode>('key');

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

    // Initial Check
    useEffect(() => {
        verifyKey();
        window.addEventListener('storage', handleStorageChange);

        // Initial load cache
        const savedCode = localStorage.getItem('gemini_access_code');
        if (savedCode) {
            setAuthMode('passcode');
            // Load cached quota
            const savedQuota = localStorage.getItem('gemini_quota_cache');
            if (savedQuota) {
                setQuota(JSON.parse(savedQuota));
            }
        }

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [verifyKey, handleStorageChange]);

    // Sync quota to local storage
    useEffect(() => {
        if (quota) {
            localStorage.setItem('gemini_quota_cache', JSON.stringify(quota));
        }
    }, [quota]);

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
