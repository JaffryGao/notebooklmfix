import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

interface OnboardingTooltipProps {
    lang: 'en' | 'cn';
}

export const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({ lang }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Minimal delay to ensure mount animation plays nicely
        const timer = setTimeout(() => {
            const hasSeen = localStorage.getItem('onboarding_archive_seen');
            if (!hasSeen) {
                setIsVisible(true);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = (e?: React.MouseEvent) => {
        e?.stopPropagation(); // Prevent triggering parent button click
        setIsVisible(false);
        localStorage.setItem('onboarding_archive_seen', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.9, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                    exit={{ opacity: 0, scale: 0.9, x: "-50%" }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[120%] left-1/2 z-[60] flex flex-col items-center pointer-events-auto"
                >
                    {/* Arrow - pointing up to the button center */}
                    <div className="w-3 h-3 bg-zinc-900 border-l border-t border-white/10 transform rotate-45 -mb-1.5 z-10"></div>

                    {/* Tooltip Body */}
                    <div className="relative bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-4 w-64 text-center cursor-default" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={handleDismiss}
                            className="absolute top-2 right-2 text-zinc-500 hover:text-white transition-colors p-1"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center mb-1">
                                <Sparkles className="w-4 h-4 text-indigo-400 fill-current" />
                            </div>
                            <h3 className="text-sm font-bold text-white">
                                {lang === 'en' ? 'New: Local Archive Box' : '新增：本地档案盒'}
                            </h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                {lang === 'en'
                                    ? 'Auto-save your high-res images locally. Never lose your work.'
                                    : '自动保存您生成的高清原图。数据存储在本地，安全防丢失。'}
                            </p>

                            <button
                                onClick={handleDismiss}
                                className="mt-2 text-[10px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                {lang === 'en' ? 'Got it' : '知道啦'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
