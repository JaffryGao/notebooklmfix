import React from 'react';
import {
    Check,
    CheckCircle,
    AlertCircle,
    Maximize2,
    Download
} from 'lucide-react';
import { ProcessedPage } from '../../types';

interface ImageCardProps {
    page: ProcessedPage;
    index: number;
    currentProcessingIndex: number | null;
    resolution: string;
    t: any;
    isProcessing: boolean;
    toggleSelection: (index: number) => void;
    setViewingIndex: (index: number) => void;
    handleDownloadSingleImage: (page: ProcessedPage) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
    page,
    index,
    currentProcessingIndex,
    resolution,
    t,
    isProcessing,
    toggleSelection,
    setViewingIndex,
    handleDownloadSingleImage
}) => {
    // No animation logic needed here anymore

    return (
        <div
            onClick={() => !page.processedUrl && toggleSelection(index)}
            className={`relative group bg-white dark:bg-zinc-900 border rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/20 ${currentProcessingIndex === index
                ? 'border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/50 scale-[1.02] z-10 opacity-100'
                : page.status === 'completed'
                    ? 'border-emerald-500/30 dark:border-emerald-500/20 opacity-100'
                    : !page.selected
                        ? 'border-zinc-200 dark:border-white/5 opacity-50 grayscale cursor-pointer'
                        : 'border-zinc-200 dark:border-white/5 opacity-100 cursor-pointer'
                }`}
        >
            {/* Selection Checkbox (Top Left) */}
            {!page.processedUrl && (
                <div className="absolute top-4 left-4 z-40">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${page.selected
                        ? 'bg-indigo-500 border-indigo-500 md:group-hover:scale-110'
                        : 'bg-transparent border-zinc-300 dark:border-zinc-600 hover:border-zinc-400'
                        }`}>
                        {page.selected && <Check className="w-4 h-4 text-white" />}
                    </div>
                </div>
            )}

            {/* Status Badges (Top Right) */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
                {page.status === 'completed' && (
                    <>
                        <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 backdrop-blur-md shadow-lg animate-in fade-in zoom-in">
                            <CheckCircle className="w-3.5 h-3.5" /> {t.restored}
                        </span>
                        {/* Resolution Badge */}
                        {page.resolution && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-lg border animate-in fade-in zoom-in delay-100 ${page.resolution === '4K'
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                : 'bg-zinc-500/20 text-zinc-600 dark:text-zinc-400 border-zinc-500/30'
                                }`}>
                                {page.resolution}
                            </span>
                        )}
                    </>
                )}
                {page.status === 'error' && (
                    <span className="bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium px-2.5 py-1 rounded-full border border-red-500/20 flex items-center gap-1.5 backdrop-blur-md shadow-lg">
                        <AlertCircle className="w-3.5 h-3.5" /> {t.failed}
                    </span>
                )}
            </div>

            {/* Processing Overlay */}
            {page.status === 'processing' && (
                <div className="absolute inset-0 z-30 overflow-hidden rounded-2xl">
                    {/* Subtle Darkening (much lighter than before) */}
                    <div className="absolute inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-[1px]"></div>

                    {/* Shimmer / Scanning Light Effect */}
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>

                    {/* Status Text (Minimalist) */}
                    <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                            {/* Tiny breathing dot */}
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
                            <span className="text-white/90 text-[10px] font-medium tracking-widest uppercase font-mono-custom">
                                {t.enhancing}
                            </span>
                            <span className="text-white/50 text-[10px] font-mono-custom pl-1 border-l border-white/10">
                                {page.resolution || resolution}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Clickable Area for Comparison */}
            <div
                onClick={() => page.status === 'completed' && setViewingIndex(index)}
                className={`aspect-[3/4] relative w-full bg-zinc-100 dark:bg-zinc-950 p-2 ${page.status === 'completed' ? 'cursor-zoom-in' : ''}`}
            >
                {page.processedUrl ? (
                    <div className="w-full h-full relative">
                        <img
                            src={page.processedUrl}
                            alt="Enhanced"
                            className="w-full h-full object-contain rounded-lg shadow-inner bg-white dark:bg-zinc-900"
                        />
                        {/* Hover Prompt & Download */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg pointer-events-none">
                            <div className="px-4 py-2 bg-black/80 backdrop-blur-md rounded-full text-xs text-white border border-white/10 shadow-xl flex items-center gap-2 mb-2">
                                <Maximize2 className="w-3 h-3" />
                                {t.clickToView}
                            </div>

                            {/* Single Download Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadSingleImage(page);
                                }}
                                className="pointer-events-auto p-2 bg-white text-zinc-900 rounded-full shadow-xl hover:scale-110 transition-transform"
                                title="Download Image"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <img
                        src={page.originalUrl}
                        alt="Original"
                        className="w-full h-full object-contain rounded-lg opacity-60 grayscale-[20%] mix-blend-multiply dark:mix-blend-normal"
                    />
                )}
            </div>

            {/* Page Number */}
            <div className="absolute bottom-2 left-2 text-[10px] font-mono-custom text-zinc-400 px-2 py-1 bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded">
                {t.page} {page.pageIndex}
            </div>
        </div>
    );
};
