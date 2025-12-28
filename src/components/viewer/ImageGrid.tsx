import React from 'react';
import { ProcessedPage } from '../../types';
import { ImageCard } from './ImageCard';

interface ImageGridProps {
    pages: ProcessedPage[];
    isProcessing: boolean;
    completedCount: number;
    t: any;
    lang: 'en' | 'cn';
    selectAll: () => void;
    deselectAll: () => void;
    toggleSelection: (index: number) => void;
    setViewingIndex: (index: number) => void;
    handleDownloadSingleImage: (page: ProcessedPage) => void;
    currentProcessingIndex: number | null;
    resolution: string;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
    pages,
    isProcessing,
    completedCount,
    t,
    lang,
    selectAll,
    deselectAll,
    toggleSelection,
    setViewingIndex,
    handleDownloadSingleImage,
    currentProcessingIndex,
    resolution
}) => {
    if (pages.length === 0) return null;

    return (
        <div className="space-y-4">
            {/* Select All / Deselect All */}
            {!isProcessing && completedCount < pages.length && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={selectAll}
                        className="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-500/30 transition-colors"
                    >
                        {t.selectAll}
                    </button>
                    <button
                        onClick={deselectAll}
                        className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg border border-zinc-200 dark:border-zinc-600 transition-colors"
                    >
                        {t.deselectAll}
                    </button>
                    <span className="text-xs text-zinc-400">
                        {pages.filter(p => p.selected).length} / {pages.length} {lang === 'en' ? 'selected' : '已选'}
                    </span>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {pages.map((page, idx) => (
                    <ImageCard
                        key={idx}
                        index={idx}
                        page={page}
                        currentProcessingIndex={currentProcessingIndex}
                        resolution={resolution}
                        t={t}
                        isProcessing={isProcessing}
                        toggleSelection={toggleSelection}
                        setViewingIndex={setViewingIndex}
                        handleDownloadSingleImage={handleDownloadSingleImage}
                    />
                ))}
            </div>
        </div>
    );
};
