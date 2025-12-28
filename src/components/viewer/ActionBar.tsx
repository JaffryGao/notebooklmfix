import React from 'react';
import {
    Play,
    Square,
    Loader2,
    FileText,
    Presentation,
    Zap,
    Lock,
    Download
} from 'lucide-react';
import { ProcessedPage } from '../../types';

interface ActionBarProps {
    t: any;
    lang: 'en' | 'cn';
    pages: ProcessedPage[];
    completedCount: number;
    progress: number;
    isAllComplete: boolean;
    resolution: '2K' | '4K';
    setResolution: (res: '2K' | '4K') => void;
    resolutionLocked: boolean;
    authMode: 'key' | 'passcode' | null;
    keyAuthorized: boolean;
    setIsKeyModalOpen: (isOpen: boolean) => void;
    isProcessing: boolean;
    isStopping: boolean;
    isStopped: boolean;
    startProcessing: () => void;
    stopProcessing: () => void;
    handleExportPdf: () => void;
    isExportingPdf: boolean;
    handleExportPptx: () => void;
    isExportingPptx: boolean;
    handleDownloadZip: () => void;
    uploadMode: 'pdf' | 'image';
}

export const ActionBar: React.FC<ActionBarProps> = ({
    t,
    lang,
    pages,
    completedCount,
    progress,
    isAllComplete,
    resolution,
    setResolution,
    resolutionLocked,
    authMode,
    keyAuthorized,
    setIsKeyModalOpen,
    isProcessing,
    isStopping,
    isStopped,
    startProcessing,
    stopProcessing,
    handleExportPdf,
    isExportingPdf,
    handleExportPptx,
    isExportingPptx,
    handleDownloadZip,
    uploadMode
}) => {
    if (pages.length === 0) return null;

    return (
        <div className="sticky top-24 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/50 dark:border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/5 dark:shadow-black/20 flex flex-wrap items-center justify-between gap-6 animate-in slide-in-from-bottom-4 duration-500">

            {/* Progress Info */}
            <div className="flex items-center gap-6 flex-1 min-w-[200px]">
                <div className="flex flex-col">
                    <span className="text-xs font-mono-custom text-zinc-500 uppercase tracking-wider">{t.pages}</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-heading text-zinc-900 dark:text-white">{completedCount}</span>
                        <span className="text-zinc-400">/ {pages.length}</span>
                    </div>
                </div>

                <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-white/10 rounded-full overflow-hidden relative">
                    <div
                        className={`h-full transition-all duration-500 ease-out relative ${isAllComplete
                            ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                            : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                            }`}
                        style={{ width: `${progress}%` }}
                    >
                        {!isAllComplete && <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 animate-pulse"></div>}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">

                {/* Resolution Switcher (Only show if not locked) */}
                {!resolutionLocked && completedCount < pages.length && (
                    <div className="hidden sm:flex items-center bg-zinc-100 dark:bg-white/5 p-1 rounded-xl border border-zinc-200 dark:border-white/10 mr-2">
                        <button
                            onClick={() => setResolution('2K')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${resolution === '2K'
                                ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white'
                                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                                }`}
                        >
                            {t.res2k}
                        </button>
                        <div className="w-px h-4 bg-zinc-200 dark:bg-white/10 mx-1"></div>
                        <button
                            onClick={() => {
                                if (authMode === 'key') {
                                    // Key 用户点击 4K 按钮时，打开 Modal 引导购买口令
                                    setIsKeyModalOpen(true);
                                } else {
                                    setResolution('4K');
                                }
                            }}
                            className={`group/4k relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${authMode === 'key'
                                ? 'text-zinc-300 dark:text-zinc-600 cursor-pointer hover:text-amber-500 dark:hover:text-amber-400'
                                : resolution === '4K'
                                    ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/30'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                                }`}
                        >
                            {t.res4k}
                            {resolution === '4K' && authMode !== 'key' && <Zap className="w-3 h-3 fill-current animate-pulse" />}
                            {authMode === 'key' && <Lock className="w-3 h-3 opacity-50" />}

                            {/* Tooltip: Click to unlock 4K */}
                            {authMode === 'key' && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-amber-500 text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover/4k:opacity-100 transition-opacity pointer-events-none shadow-xl z-50 text-center">
                                    <div className="font-bold">{lang === 'en' ? 'Click to unlock 4K' : '点击解锁 4K'}</div>
                                    <div className="text-amber-100 mt-0.5">{lang === 'en' ? 'Passcode required' : '需购买口令'}</div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-amber-500"></div>
                                </div>
                            )}

                            {/* Tooltip: High cost warning for active 4K */}
                            {resolution === '4K' && authMode !== 'key' && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-800 text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover/4k:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10 z-50">
                                    {t.highCost}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-800"></div>
                                </div>
                            )}
                        </button>
                    </div>
                )}

                {/* Start/Stop/Continue Button */}
                {completedCount < pages.length && (
                    isProcessing ? (
                        <button
                            onClick={stopProcessing}
                            disabled={isStopping}
                            className={`group flex items-center gap-2 pl-5 pr-6 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all transform active:scale-95 ${isStopping ? 'bg-amber-500 shadow-amber-500/20 cursor-wait' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'}`}
                        >
                            {isStopping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4 fill-current" />}
                            <span>{isStopping ? t.stopping : t.stop}</span>
                        </button>
                    ) : (
                        <button
                            onClick={startProcessing}
                            className={`group relative flex items-center gap-2 pl-5 pr-6 py-2.5 rounded-xl font-medium transition-all transform active:scale-95 overflow-hidden ${keyAuthorized
                                ? "bg-zinc-900 dark:bg-white text-white dark:text-black hover:shadow-lg hover:shadow-indigo-500/20"
                                : "bg-zinc-100 dark:bg-white/5 text-zinc-400 cursor-not-allowed border border-zinc-200 dark:border-white/5"
                                }`}
                            disabled={!keyAuthorized}
                        >
                            {keyAuthorized && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>}
                            <Play className="w-4 h-4 fill-current" />
                            <span>{isStopped ? t.continue : t.start}</span>
                        </button>
                    )
                )}

                <div className="h-8 w-px bg-zinc-200 dark:bg-white/10 mx-2"></div>

                <div className="flex gap-2">
                    {uploadMode === 'pdf' ? (
                        <>
                            <button
                                onClick={handleExportPdf}
                                disabled={completedCount === 0 || isProcessing || isExportingPdf}
                                className={`relative p-2.5 rounded-xl border transition-all group overflow-hidden ${isExportingPdf
                                    ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 cursor-wait"
                                    : "bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    }`}
                                title={t.exportPdf}
                            >
                                {isExportingPdf ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                )}
                            </button>

                            <button
                                onClick={handleExportPptx}
                                disabled={completedCount === 0 || isProcessing || isExportingPptx}
                                className={`relative p-2.5 rounded-xl border transition-all group overflow-hidden ${isExportingPptx
                                    ? "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-400 cursor-wait"
                                    : "bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    }`}
                                title={t.exportPptx}
                            >
                                {isExportingPptx ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Presentation className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                )}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleDownloadZip}
                            disabled={completedCount === 0 || isProcessing}
                            className={`relative p-2.5 rounded-xl border transition-all group overflow-hidden bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed`}
                            title="Download ZIP"
                        >
                            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
