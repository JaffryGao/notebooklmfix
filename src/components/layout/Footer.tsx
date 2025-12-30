import React from 'react';
import { Github } from 'lucide-react';

interface FooterProps {
    t: any;
}

export const Footer: React.FC<FooterProps> = ({ t }) => {
    return (
        <footer className="w-full py-12 mt-auto border-t border-zinc-200/50 dark:border-white/5 bg-zinc-50/50 dark:bg-black/20 backdrop-blur-sm">
            <div className="max-w-5xl mx-auto px-6 flex flex-col gap-8">

                {/* Minimal Disclaimer (Apple Style) */}
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed max-w-3xl">
                    <p>{t.disclaimerText}</p>
                </div>

                <div className="h-px w-full bg-zinc-200/50 dark:bg-white/5"></div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono-custom">
                    {/* Copyright */}
                    <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3 text-center md:text-left">
                        <span>{t.copyright}</span>
                        <span className="hidden md:inline text-zinc-300 dark:text-zinc-700">|</span>
                        <span>{t.builtBy}</span>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-6">
                        <span className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer">{t.privacy}</span>
                        <span className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer">{t.terms}</span>

                        <div className="h-3 w-px bg-zinc-200 dark:bg-white/10"></div>

                        <a href="https://github.com/JaffryGao/notebooklmfix" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                            <Github className="w-3.5 h-3.5" />
                            <span>GitHub</span>
                        </a>
                        <a href="https://x.com/JaffryGao" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5 fill-current">
                                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                            </svg>
                            <span>X</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
