import React, { useState, useEffect } from 'react';
import { Key, X, ExternalLink, ShieldCheck, Save, Eye, EyeOff } from 'lucide-react';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);

    // Load existing key when opening
    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem('gemini_api_key_local');
            if (saved) setApiKey(saved);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim()) {
            onSave(apiKey.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            ></div>

            {/* Modal Window */}
            <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                            <Key className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-none">设置 API 密钥</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">本地配置 Gemini API</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* Privacy Notice */}
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl p-4 flex gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">
                            <strong className="block mb-1 font-semibold">隐私安全承诺</strong>
                            您的 API Key 仅存储在当前浏览器的 <code>LocalStorage</code> 中，用于直接向 Google 发送请求。我们 <strong>绝不会</strong> 将其上传至任何服务器，您可随时查看开源代码验证。
                        </div>
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex justify-between">
                                输入 Gemini API Key
                                <a
                                    href="https://aistudio.google.com/app/apikey"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                                >
                                    获取 Key <ExternalLink className="w-3 h-3" />
                                </a>
                            </label>
                            <div className="relative group">
                                <input
                                    type={showKey ? "text" : "password"}
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="AIzaSy..."
                                    className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                                >
                                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!apiKey.trim()}
                            className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                        >
                            <Save className="w-4 h-4" />
                            保存并连接
                        </button>
                    </form>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => {
                                localStorage.removeItem('gemini_api_key_local');
                                setApiKey('');
                                onSave('');
                                onClose();
                            }}
                            className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                        >
                            清除本地保存的密钥
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
