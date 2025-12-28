import React from 'react';

interface ToastProps {
    show: boolean;
    message: string;
}

export const Toast: React.FC<ToastProps> = ({ show, message }) => {
    if (!show) return null;

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in slide-in-from-top-4 zoom-in-95 fade-in duration-300">
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-zinc-900 dark:bg-zinc-800 text-white rounded-full shadow-2xl border border-white/10">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{message}</span>
            </div>
        </div>
    );
};
