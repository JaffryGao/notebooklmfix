import React, { useState, useEffect } from 'react';
import { Key, X, ExternalLink, ShieldCheck, Save, Eye, EyeOff, Zap, Copy, Check } from 'lucide-react';
import wechatQr from '../../assets/wechat.png';
import { QuotaInfo } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (key: string, quota?: QuotaInfo) => void;
    lang: 'en' | 'cn';
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, lang }) => {
    const [apiKey, setApiKey] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [baseUrlError, setBaseUrlError] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [showQr, setShowQr] = useState(false);

    // Dictionary
    const t = TRANSLATIONS[lang];

    // Load existing key or code when opening
    useEffect(() => {
        if (isOpen) {
            const savedKey = localStorage.getItem('gemini_api_key_local');
            const savedCode = localStorage.getItem('gemini_access_code');
            const savedBaseUrl = localStorage.getItem('gemini_base_url_local');
            if (savedKey) setApiKey(savedKey);
            else if (savedCode) setApiKey(savedCode);
            if (savedBaseUrl) setBaseUrl(savedBaseUrl);
            else setBaseUrl('');
            setError('');
            setBaseUrlError('');
        }
    }, [isOpen]);

    const persistBaseUrl = (raw: string): boolean => {
        const trimmed = raw.trim();
        if (!trimmed) {
            localStorage.removeItem('gemini_base_url_local');
            setBaseUrlError('');
            return true;
        }

        try {
            const parsed = new URL(trimmed);
            if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                setBaseUrlError(t.baseUrlInvalid);
                return false;
            }
            const normalized = parsed.toString().replace(/\/+$/, '');
            localStorage.setItem('gemini_base_url_local', normalized);
            setBaseUrl(normalized);
            setBaseUrlError('');
            return true;
        } catch {
            setBaseUrlError(t.baseUrlInvalid);
            return false;
        }
    };

    const copyWechat = () => {
        navigator.clipboard.writeText('JaffryGao');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const value = apiKey.trim();
        if (!value) return;

        setError('');
        setBaseUrlError('');
        setVerifying(true);

        try {
            // Smart Detection
            if (value.startsWith('AIza')) {
                const baseUrlOk = persistBaseUrl(baseUrl);
                if (!baseUrlOk) return;
                // It's an API Key (Standard Mode)
                localStorage.setItem('gemini_api_key_local', value);
                localStorage.removeItem('gemini_access_code');
                onSave(value);
                onClose();
            } else {
                // It's likely an Access Code (Proxy Mode) -> Verify with Server
                const res = await fetch('/api/verify-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accessCode: value })
                });

                const data = await res.json();

                if (data.valid) {
                    localStorage.setItem('gemini_access_code', value);
                    localStorage.removeItem('gemini_api_key_local');
                    onSave(value, data.quota); // Pass initial quota info back
                    onClose();
                } else {
                    setError(data.error || t.invalidCode);
                }
            }
        } catch (err) {
            setError(t.networkError);
        } finally {
            setVerifying(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col">

                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                            <Key className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-heading font-bold text-zinc-900 dark:text-white leading-none">
                                {t.keyModalTitle}
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                {t.keyModalDesc}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Unified Input */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative group">
                                <input
                                    type={showKey ? "text" : "password"}
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder={t.keyInputPlaceholder}
                                    className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                                >
                                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {error && <p className="text-xs text-red-500 font-medium animate-in fade-in flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> {error}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                                    {t.baseUrlLabel}
                                </span>
                                {baseUrl.trim() && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setBaseUrl('');
                                            localStorage.removeItem('gemini_base_url_local');
                                            setBaseUrlError('');
                                        }}
                                        className="text-[10px] text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors"
                                    >
                                        {t.clear}
                                    </button>
                                )}
                            </div>

                            <input
                                type="text"
                                value={baseUrl}
                                onChange={(e) => {
                                    setBaseUrl(e.target.value);
                                    setBaseUrlError('');
                                }}
                                onBlur={() => persistBaseUrl(baseUrl)}
                                placeholder={t.baseUrlPlaceholder}
                                className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
                            />

                            <p className="text-[10px] text-zinc-400 leading-tight">
                                {t.baseUrlHint}
                            </p>
                            {baseUrlError && (
                                <p className="text-xs text-red-500 font-medium animate-in fade-in flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> {baseUrlError}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!apiKey.trim() || verifying}
                            className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[0px] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {verifying ? (
                                <span className="animate-pulse flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> {t.verifying}
                                </span>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>{t.save}</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-200 dark:border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-400 font-mono-custom tracking-widest">
                                {t.getKey}
                            </span>
                        </div>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Option A: Google */}
                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noreferrer"
                            className="group relative p-3 rounded-xl border border-zinc-200 dark:border-white/10 hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all flex flex-col gap-2"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{t.googleTitle}</span>
                                <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-indigo-500" />
                            </div>
                            <p className="text-[10px] text-zinc-500 leading-tight">
                                {t.googleDesc1}<br />
                                <span className="text-amber-500">{t.googleDesc2}</span>
                            </p>
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-zinc-300 rounded-full group-hover:bg-indigo-500 transition-colors"></div>
                        </a>

                        {/* Option B: Passcode */}
                        <div className="group relative p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10 hover:border-amber-500/30 transition-all flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{t.passcodeTitle}</span>
                                <Zap className="w-3 h-3 text-amber-500 fill-current" />
                            </div>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">
                                {t.passcodeDesc1}<br />
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{t.passcodeDesc2}</span>
                            </p>

                            {/* Contact Section - Compact Inline */}
                            <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-amber-100 dark:border-white/5">
                                <span className="text-[10px] text-zinc-400 whitespace-nowrap shrink-0">{t.contactMe}</span>
                                <div className="flex gap-2">
                                    {/* WeChat Button with Popover */}
                                    <div
                                        className="relative"
                                        onMouseEnter={() => setShowQr(true)}
                                        onMouseLeave={() => setShowQr(false)}
                                    >
                                        <button className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded text-[10px] border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1 hover:shadow-sm transition-all whitespace-nowrap">
                                            {/* WeChat Icon SVG */}
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                                                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047.245.245 0 0 0 .241-.245c0-.06-.024-.12-.04-.177l-.327-1.233a.49.49 0 0 1 .177-.554C23.013 18.138 24 16.39 24 14.466c0-3.372-2.93-5.608-7.062-5.608zm-2.32 2.935c.535 0 .969.44.969.983a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.983.97-.983zm4.638 0c.535 0 .969.44.969.983a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.983.97-.983z" />
                                            </svg>
                                            <span>{t.wechat}</span>
                                        </button>

                                        {/* Premium QR Popover */}
                                        <div className={`absolute bottom-full right-0 mb-1 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-100 dark:border-white/10 overflow-visible transform transition-all duration-200 ease-out z-[100] origin-bottom-right ${showQr ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}`}>
                                            {/* CRITICAL: Invisible Bridge - extends downward to fully cover the gap */}
                                            <div className="absolute -bottom-2 left-0 w-full h-3"></div>
                                            {/* QR Image */}
                                            <div className="p-4 flex items-center justify-center bg-white rounded-t-xl">
                                                <img src={wechatQr} alt="WeChat QR" className="w-32 h-32 object-contain" />
                                            </div>
                                            {/* Action Bar */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); copyWechat(); }}
                                                className="w-full bg-zinc-50 dark:bg-black/30 border-t border-zinc-100 dark:border-white/5 p-2.5 flex items-center justify-between group/copy hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors rounded-b-xl"
                                            >
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[9px] text-zinc-400 uppercase tracking-wider">微信号</span>
                                                    <span className={`text-xs font-bold font-mono transition-colors ${copied ? 'text-emerald-500' : 'text-zinc-700 dark:text-zinc-200'}`}>
                                                        {copied ? '✓ 已复制' : 'JaffryGao'}
                                                    </span>
                                                </div>
                                                <div className={`p-1.5 rounded-md shadow-sm border transition-all ${copied ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white dark:bg-zinc-700 border-zinc-200 dark:border-zinc-600 text-zinc-400 group-hover/copy:text-emerald-500'}`}>
                                                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* X/Twitter Button */}
                                    <a
                                        href="https://x.com/JaffryGao"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-2 py-1 bg-zinc-50 dark:bg-black/20 rounded text-[10px] border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1 hover:text-black dark:hover:text-white transition-all whitespace-nowrap"
                                    >
                                        {/* X (Twitter) Icon SVG */}
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>


                    <p className="text-[10px] text-center text-zinc-400">
                        {t.tip}
                    </p>

                </div>
            </div>
        </div>
    );
};
