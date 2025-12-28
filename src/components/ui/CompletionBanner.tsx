import React from 'react';
import {
    Sparkles,
    AlertCircle,
    Loader2,
    FileText,
    Presentation,
    Download,
    Upload,
    X
} from 'lucide-react';

interface CompletionBannerProps {
    show: boolean;
    isStopped: boolean;
    t: any;
    lang: 'en' | 'cn';
    completedCount: number;
    handleExportPdf: () => void;
    isExportingPdf: boolean;
    handleExportPptx: () => void;
    isExportingPptx: boolean;
    handleDownloadZip: () => void;
    uploadMode: 'pdf' | 'image';
    onUploadClick: () => void; // Logic handled in parent
    showUploadWarning: boolean;
    onClose: () => void;
}

export const CompletionBanner: React.FC<CompletionBannerProps> = ({
    show,
    isStopped,
    t,
    lang,
    completedCount,
    handleExportPdf,
    isExportingPdf,
    handleExportPptx,
    isExportingPptx,
    handleDownloadZip,
    uploadMode,
    onUploadClick,
    showUploadWarning,
    onClose
}) => {
    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-center pointer-events-none">
            <div className={`pointer-events-auto max-w-3xl w-full bg-white dark:bg-zinc-900 border shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-10 fade-in duration-500 ${isStopped ? 'border-amber-500/30 shadow-amber-500/10' : 'border-emerald-500/30 shadow-emerald-500/20'}`}>

                {/* Left: Icon + Text */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className={`p-2.5 rounded-full shrink-0 ${isStopped ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {isStopped ? <AlertCircle className="w-5 h-5" /> : <Sparkles className="w-5 h-5 fill-current" />}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white whitespace-nowrap">
                            {isStopped ? t.stopped : t.allDone}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                            {isStopped
                                ? `${completedCount} ${lang === 'en' ? 'pages ready' : '页已就绪'}`
                                : t.downloadNow}
                        </p>
                    </div>
                </div>

                {/* Right: Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    {uploadMode === 'pdf' ? (
                        <>
                            {/* PDF Button */}
                            <button
                                onClick={handleExportPdf}
                                disabled={isExportingPdf}
                                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${isExportingPdf
                                    ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 cursor-wait"
                                    : "bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/10"
                                    }`}
                            >
                                {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                <span>PDF</span>
                            </button>

                            {/* PPTX Button */}
                            <button
                                onClick={handleExportPptx}
                                disabled={isExportingPptx}
                                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${isExportingPptx
                                    ? "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-400 cursor-wait"
                                    : "bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/10"
                                    }`}
                            >
                                {isExportingPptx ? <Loader2 className="w-4 h-4 animate-spin" /> : <Presentation className="w-4 h-4" />}
                                <span>PPTX</span>
                            </button>
                        </>
                    ) : (
                        /* ZIP Button for Image Mode */
                        <button
                            onClick={handleDownloadZip}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/10"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download ZIP</span>
                        </button>
                    )}

                    {/* Upload New File Button */}
                    <div className="relative">
                        <button
                            onClick={onUploadClick}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${showUploadWarning ? 'bg-amber-500 border-amber-500 text-white' : 'bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10'}`}
                        >
                            <Upload className="w-4 h-4" />
                            <span className="hidden sm:inline">{showUploadWarning ? (lang === 'en' ? 'Confirm' : '确认') : t.uploadNew}</span>
                        </button>

                        {/* Inline Warning Tooltip */}
                        {showUploadWarning && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-900 dark:bg-zinc-800 text-white text-xs rounded-lg shadow-xl border border-white/10 whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <p>{lang === 'en' ? 'Pages not downloaded yet!' : '页面尚未下载！'}</p>
                                <p className="text-zinc-400 mt-0.5">{lang === 'en' ? 'Click again to confirm' : '再次点击确认上传'}</p>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-800"></div>
                            </div>
                        )}
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
