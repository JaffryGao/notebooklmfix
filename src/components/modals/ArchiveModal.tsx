import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Archive, Download, Trash2, CheckCircle2, Circle, AlertTriangle, Clock } from 'lucide-react';
import { useArchive } from '../../hooks/useArchive';
import { generateArchiveZip } from '../../services/pdfService';
import { ArchivedImage } from '../../db/archive';

interface ArchiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: 'en' | 'cn';
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({ isOpen, onClose, lang }) => {
    const { images, deleteItems } = useArchive();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmMode, setDeleteConfirmMode] = useState(false);

    // Reset selection when modal closes or images change significantly
    useEffect(() => {
        if (!isOpen) {
            setDeleteConfirmMode(false);
            setSelectedIds([]);
        }
    }, [isOpen]);

    const toggleSelect = (id: number) => {
        setDeleteConfirmMode(false); // Cancel delete confirm on selection change
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (!images) return;
        if (selectedIds.length === images.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(images.map(img => img.id!));
        }
    };

    const handleExportZip = async () => {
        if (!images) return;
        const selectedImages = images.filter(img => selectedIds.includes(img.id!));
        if (selectedImages.length === 0) return;

        await generateArchiveZip(selectedImages);
    };

    const handleDelete = async () => {
        if (!deleteConfirmMode) {
            setDeleteConfirmMode(true);
            return;
        }

        setIsDeleting(true);
        await deleteItems(selectedIds);
        setSelectedIds([]);
        setIsDeleting(false);
        setDeleteConfirmMode(false);
    };

    const formatTime = (ts: number) => {
        const date = new Date(ts);
        // Simple human readable format
        return lang === 'en'
            ? date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
            : date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl max-h-[85vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-100 dark:border-white/5 flex items-start justify-between bg-white dark:bg-zinc-900 z-10">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                    <Archive className="w-5 h-5 text-indigo-500" />
                                    {lang === 'en' ? 'Local Archive Box' : '本地档案盒'}
                                </h2>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                    {lang === 'en' ? 'High-res images stored locally in your browser.' : '浏览器本地存储的高清修复原图。'}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-white/5"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Warning Banner */}
                        <div className="bg-amber-50 dark:bg-amber-900/10 px-6 py-3 border-b border-amber-100 dark:border-amber-500/10 flex items-start gap-3">
                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                                {lang === 'en'
                                    ? 'Warning: Data is stored in browser cache. Cleaning cache will lose these files. System auto-deletes files older than 7 days. Please download important files immediately.'
                                    : '注意：数据存储在浏览器本地缓存中。清理缓存将丢失这些文件。系统会自动清理超过 7 天的文件。请务必及时下载重要文件。'
                                }
                            </p>
                        </div>

                        {/* Content Grid */}
                        <div className="flex-1 overflow-y-auto p-6 min-h-[300px] bg-zinc-50/50 dark:bg-black/20">
                            {!images || images.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
                                    <Archive className="w-12 h-12 mb-4 opacity-20" />
                                    <p className="text-sm">{lang === 'en' ? 'Archive is empty' : '暂无存档记录'}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    <AnimatePresence>
                                        {images.map((img) => (
                                            <motion.div
                                                key={img.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                className={`group relative aspect-[3/4] bg-white dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm border transaction-all duration-200 cursor-pointer ${selectedIds.includes(img.id!)
                                                        ? 'ring-2 ring-indigo-500 border-indigo-500'
                                                        : 'border-zinc-200 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-700'
                                                    }`}
                                                onClick={() => toggleSelect(img.id!)}
                                            >
                                                {/* Thumbnail */}
                                                <img
                                                    src={img.thumbnail}
                                                    alt="Thumbnail"
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />

                                                {/* Overlay Gradient */}
                                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                                                {/* Selection Checkbox */}
                                                <div className="absolute top-2 right-2 z-10">
                                                    {selectedIds.includes(img.id!) ? (
                                                        <CheckCircle2 className="w-5 h-5 text-indigo-500 fill-white dark:fill-zinc-900" />
                                                    ) : (
                                                        <Circle className="w-5 h-5 text-white/70 drop-shadow-md group-hover:text-white transition-colors" />
                                                    )}
                                                </div>

                                                {/* Meta Info */}
                                                <div className="absolute bottom-2 left-2 right-2 text-white/90">
                                                    <div className="flex items-center gap-1 mb-0.5">
                                                        <Clock className="w-3 h-3 opacity-70" />
                                                        <span className="text-[10px] font-mono opacity-90">{formatTime(img.createdAt)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[10px] font-mono bg-white/10 px-1 rounded backdrop-blur-sm">
                                                            {img.width > 3000 ? '4K' : '2K'}
                                                        </span>
                                                        <span className="text-[10px] opacity-60">{(img.size / 1024 / 1024).toFixed(1)}MB</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900 flex justify-between items-center gap-4 z-20">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSelectAll}
                                    className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors px-2 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-white/5"
                                >
                                    {lang === 'en'
                                        ? (selectedIds.length === images?.length ? 'Deselect All' : 'Select All')
                                        : (selectedIds.length === images?.length ? '取消全选' : '全选')
                                    }
                                </button>
                                <span className="text-xs text-zinc-400 border-l border-zinc-200 dark:border-white/10 pl-2">
                                    {selectedIds.length} {lang === 'en' ? 'selected' : '已选'}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Delete Button with Micro-Interaction */}
                                <button
                                    onClick={handleDelete}
                                    disabled={selectedIds.length === 0 || isDeleting}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                        ${deleteConfirmMode
                                            ? 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20'
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400'
                                        }
                                        ${(selectedIds.length === 0 || isDeleting) ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    <Trash2 className={`w-4 h-4 ${deleteConfirmMode ? 'animate-bounce' : ''}`} />
                                    <span>
                                        {deleteConfirmMode
                                            ? (lang === 'en' ? 'Confirm Delete?' : '确认删除?')
                                            : (lang === 'en' ? 'Delete' : '删除')
                                        }
                                    </span>
                                </button>

                                {/* Download Button */}
                                <button
                                    onClick={handleExportZip}
                                    disabled={selectedIds.length === 0}
                                    className={`
                                        flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all duration-200
                                        ${selectedIds.length === 0
                                            ? 'bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed shadow-none'
                                            : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25 active:scale-95'
                                        }
                                    `}
                                >
                                    <Download className="w-4 h-4" />
                                    <span>
                                        {lang === 'en' ? 'Download ZIP' : '打包下载 ZIP'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
