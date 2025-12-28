import React from 'react';
import { Sparkles, AlertCircle, CheckCircle, Languages, Sun, Moon, Zap } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { QuotaInfo } from '../../types';

interface HeaderProps {
    t: any;
    lang: 'en' | 'cn';
    theme: 'dark' | 'light';
    keyAuthorized: boolean;
    quota: QuotaInfo | null;
    toggleTheme: (event: React.MouseEvent) => void;
    toggleLanguage: () => void;
    handleSelectKey: () => void;
    openKeyModal: () => void;
    onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    t,
    lang,
    theme,
    keyAuthorized,
    quota,
    toggleTheme,
    toggleLanguage,
    handleSelectKey,
    openKeyModal,
    onReset
}) => {
    return (
        <header className="sticky top-0 z-50 border-b border-zinc-200/50 dark:border-white/5 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo - Clickable to reset/home */}
                <button
                    onClick={onReset}
                    className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
                >
                    {/* Logo Area */}
                    <div className="flex items-center gap-3">
                        <Logo size="md" />
                        <div className="flex flex-col items-start text-left">
                            <h1 className="text-lg md:text-xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                                {t.title}
                            </h1>
                            <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400 font-medium tracking-wide">
                                {t.subtitle}
                            </p>
                        </div>
                    </div>
                </button>

                <div className="flex items-center gap-3">
                    {/* Key Status */}
                    {!keyAuthorized ? (
                        <button
                            onClick={handleSelectKey}
                            className="hidden md:flex text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition items-center gap-2 animate-pulse"
                        >
                            <AlertCircle className="w-3.5 h-3.5" />
                            {t.selectKey}
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            {/* Quota Badge (Only show if quota exists) */}
                            {
                                quota && (
                                    <button
                                        onClick={openKeyModal}
                                        className="hidden md:flex text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-full items-center gap-1.5 hover:bg-indigo-500/20 transition-colors"
                                        title="点击充值 / Click to top up"
                                    >
                                        <Zap className="w-3 h-3 fill-current" />
                                        <span>剩余 {quota.remaining} 次</span>
                                    </button>
                                )
                            }

                            <button
                                onClick={openKeyModal}
                                className="hidden md:flex text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full items-center gap-2 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                                title="点击配置 / Click to configure"
                            >
                                <CheckCircle className="w-3.5 h-3.5" />
                                {t.apiKeyActive}
                            </button>
                        </div>
                    )}

                    <div className="h-6 w-px bg-zinc-200 dark:bg-white/10 mx-2"></div>

                    {/* GitHub Link */}
                    <a
                        href="https://github.com/JaffryGao/notebooklmfix"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-colors"
                        title="GitHub"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                    </a>

                    {/* Toggles */}
                    <button onClick={toggleLanguage} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 border border-transparent hover:border-zinc-200 dark:hover:border-white/10">
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                            <Languages className="w-4 h-4" />
                            <span className="font-mono-custom">{lang === 'en' ? 'CN' : 'EN'}</span>
                        </div>
                    </button>

                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 border border-transparent hover:border-zinc-200 dark:hover:border-white/10">
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </header>
    );
};
