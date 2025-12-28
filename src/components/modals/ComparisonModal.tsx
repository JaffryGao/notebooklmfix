import React, { useState, useEffect } from 'react';
import {
    X,
    ChevronLeft,
    ChevronRight,
    Eye,
    Sparkles
} from 'lucide-react';
import { ProcessedPage } from '../../types';

interface ComparisonModalProps {
    viewingIndex: number | null;
    pages: ProcessedPage[];
    onClose: () => void;
    onNavigate: (index: number) => void;
    t: any;
    lang: 'en' | 'cn';
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
    viewingIndex,
    pages,
    onClose,
    onNavigate,
    t,
    lang
}) => {
    const [isHoldingCompare, setIsHoldingCompare] = useState(false);

    // Global Key Handler for Modal
    useEffect(() => {
        if (viewingIndex === null) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft') {
                // Find previous processed page
                for (let i = viewingIndex - 1; i >= 0; i--) {
                    if (pages[i].processedUrl) {
                        onNavigate(i);
                        return;
                    }
                }
            } else if (e.key === 'ArrowRight') {
                // Find next processed page
                for (let i = viewingIndex + 1; i < pages.length; i++) {
                    if (pages[i].processedUrl) {
                        onNavigate(i);
                        return;
                    }
                }
            } else if (e.key === ' ') {
                e.preventDefault(); // Prevent scrolling
                setIsHoldingCompare(true);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === ' ') {
                setIsHoldingCompare(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [viewingIndex, pages, onClose, onNavigate]);

    if (viewingIndex === null || !pages[viewingIndex]) return null;

    const page = pages[viewingIndex];

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300">

            {/* 1. Cinematic Backdrop */}
            <div
                className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                onClick={onClose}
            ></div>

            {/* 2. Top Bar (Floating) */}
            <div className="absolute top-0 left-0 right-0 z-50 p-6 flex items-start justify-between pointer-events-none">

                {/* Title & Badge */}
                <div className="flex flex-col gap-2 pointer-events-auto animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-heading text-white tracking-wide shadow-black drop-shadow-md">{t.compareModalTitle}</h3>
                        {page.resolution && (
                            <span className="text-[10px] font-bold text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded bg-amber-900/40 backdrop-blur-md shadow-lg shadow-amber-900/20">
                                {page.resolution}
                            </span>
                        )}
                    </div>
                    <span className="text-xs font-mono-custom text-white/40 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                        {t.page} {page.pageIndex}
                    </span>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="pointer-events-auto p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/5 transition-all group"
                >
                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </div>

            {/* 3. Main Content: Image Comparison */}
            <div
                className="relative z-10 w-full h-full flex items-center justify-center p-4 md:p-12 select-none"
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        onClose();
                    }
                }}

            >

                {/* Image Container */}
                <div className="relative max-w-6xl w-full h-full flex items-center justify-center">

                    {/* Navigation Arrows (Floating - Only Switch processed pages) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // Find previous processed page
                            for (let i = viewingIndex - 1; i >= 0; i--) {
                                if (pages[i].processedUrl) {
                                    onNavigate(i);
                                    return;
                                }
                            }
                        }}
                        className={`absolute left-4 md:left-8 pointer-events-auto p-4 md:p-5 text-white/30 hover:text-white hover:scale-110 transition-all duration-300 z-50 ${viewingIndex === 0 || !pages.slice(0, viewingIndex || 0).some(p => p.processedUrl) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        <ChevronLeft className="w-8 h-8 md:w-10 md:h-10 drop-shadow-lg" />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // Find next processed page
                            for (let i = viewingIndex + 1; i < pages.length; i++) {
                                if (pages[i].processedUrl) {
                                    onNavigate(i);
                                    return;
                                }
                            }
                        }}
                        className={`absolute right-4 md:right-8 pointer-events-auto p-4 md:p-5 text-white/30 hover:text-white hover:scale-110 transition-all duration-300 z-50 ${viewingIndex === pages.length - 1 || !pages.slice((viewingIndex || 0) + 1).some(p => p.processedUrl) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        <ChevronRight className="w-8 h-8 md:w-10 md:h-10 drop-shadow-lg" />
                    </button>


                    {/* The Image Itself */}
                    <div
                        className="relative max-h-full max-w-full aspect-[3/4] md:aspect-auto rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black/50 backdrop-blur-sm animate-in zoom-in-95 duration-300 cursor-zoom-in"
                        onMouseDown={() => setIsHoldingCompare(true)}
                        onMouseUp={() => setIsHoldingCompare(false)}
                        onMouseLeave={() => setIsHoldingCompare(false)}
                        onTouchStart={() => setIsHoldingCompare(true)}
                        onTouchEnd={() => setIsHoldingCompare(false)}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={isHoldingCompare ? page.originalUrl : (page.processedUrl || page.originalUrl)}
                            alt="Comparison"
                            className="max-h-[80vh] w-auto object-contain transition-opacity duration-200"
                            draggable={false}
                        />

                        {/* Hold Indicator Overlay */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 pointer-events-none transition-all duration-300">
                            {isHoldingCompare ? (
                                <>
                                    <Eye className="w-4 h-4 text-zinc-400" />
                                    <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">{t.original}</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-3 h-3 fill-current text-indigo-400" />
                                    <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-100">{t.processed}</span>
                                </>
                            )}
                        </div>

                    </div>
                </div>

            </div>

            {/* 4. Footer (Instructions) */}
            <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none animate-in slide-in-from-bottom-4 delay-100 duration-500">
                <div
                    className="pointer-events-auto inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 backdrop-blur-md transition-all cursor-pointer group"
                    onMouseDown={() => setIsHoldingCompare(true)}
                    onMouseUp={() => setIsHoldingCompare(false)}
                    onMouseLeave={() => setIsHoldingCompare(false)}
                    onTouchStart={() => setIsHoldingCompare(true)}
                    onTouchEnd={() => setIsHoldingCompare(false)}
                >
                    <div className={`p-1.5 rounded-full transition-colors ${isHoldingCompare ? 'bg-white text-black' : 'bg-white/10 text-zinc-300'}`}>
                        <Eye className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                        {t.holdToView}
                    </span>
                </div>

                <div className="mt-3 text-[10px] items-center justify-center gap-4 text-white/20 font-mono-custom hidden md:flex">
                    <span className="flex items-center gap-1.5"><span className="border border-white/20 px-1 rounded">Space</span> to compare</span>
                    <span className="flex items-center gap-1.5"><span className="border border-white/20 px-1 rounded">◄</span> <span className="border border-white/20 px-1 rounded">►</span> to navigate</span>
                </div>
            </div>

        </div>
    );
};
