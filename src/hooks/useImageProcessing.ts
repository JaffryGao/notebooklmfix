import { useState, useRef, useEffect } from 'react';
import { ProcessedPage, QuotaInfo } from '../types';
import { processImageWithGemini } from '../services/geminiService';
import { AuthMode } from './useAuth';
import { saveToArchive } from '../db/archive';

interface UseImageProcessingProps {
    pages: ProcessedPage[];
    setPages: React.Dispatch<React.SetStateAction<ProcessedPage[]>>;
    quota: QuotaInfo | null;
    setQuota: React.Dispatch<React.SetStateAction<QuotaInfo | null>>;
    authMode: AuthMode;
    keyAuthorized: boolean;
    verifyKey: () => Promise<boolean>;
    handleSelectKey: () => Promise<void>;
}

// Helper: Convert Base64 Data URL to Blob
const dataURLtoBlob = async (dataurl: string): Promise<Blob> => {
    const res = await fetch(dataurl);
    return await res.blob();
};

export function useImageProcessing({
    pages,
    setPages,
    setQuota,
    keyAuthorized,
    verifyKey,
    handleSelectKey,
    authMode
}: UseImageProcessingProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isStopped, setIsStopped] = useState(false);
    const [isStopping, setIsStopping] = useState(false);
    const [currentProcessingIndex, setCurrentProcessingIndex] = useState<number | null>(null);
    const [resolution, setResolution] = useState<'2K' | '4K'>('2K');
    const [resolutionLocked, setResolutionLocked] = useState(false);
    const [showCompletionBanner, setShowCompletionBanner] = useState(false);
    const [showStoppingToast, setShowStoppingToast] = useState(false);

    // New Error Toast State
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [errorToastMessage, setErrorToastMessage] = useState('');

    // Auto-switch to 4K for Passcode Mode
    useEffect(() => {
        if (authMode === 'passcode') {
            setResolution('4K');
        }
    }, [authMode]);

    const abortRef = useRef(false);

    const triggerErrorToast = (msg: string) => {
        setErrorToastMessage(msg);
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 4000);
    };

    const startProcessing = async () => {
        // 1. Auth Check
        if (!keyAuthorized) {
            const success = await verifyKey();
            if (!success) {
                await handleSelectKey();
                return;
            }
        }

        // 2. Filter Processable Pages
        const pagesToProcess = pages.filter(p => p.selected && !p.processedUrl);
        if (pagesToProcess.length === 0) {
            if (pages.some(p => !p.selected)) {
                alert("No pages selected for processing.");
            }
            return;
        }

        // 3. Set Processing State
        setIsProcessing(true);
        setIsStopped(false);
        setIsStopping(false);
        setResolutionLocked(true);
        abortRef.current = false;

        // Create a working copy
        const newPages = [...pages];

        for (let i = 0; i < newPages.length; i++) {
            // Skip if already processed OR NOT SELECTED
            if (newPages[i].processedUrl || !newPages[i].selected) continue;

            // Check for Abort Signal
            if (abortRef.current) {
                setIsStopped(true);
                break;
            }

            setCurrentProcessingIndex(i);

            // Update status to processing
            newPages[i].status = 'processing';
            newPages[i].resolution = resolution;
            setPages([...newPages]); // Trigger UI update

            try {
                const result = await processImageWithGemini(
                    newPages[i].originalUrl,
                    newPages[i].width,
                    newPages[i].height,
                    resolution
                );

                newPages[i].processedUrl = result.image;
                newPages[i].status = 'completed';

                // --- Archive Logic ---
                try {
                    const blob = await dataURLtoBlob(result.image);
                    // Use Page Index as name since we don't store filenames per page in ProcessedPage
                    await saveToArchive(blob, newPages[i].width, newPages[i].height, `Page ${newPages[i].pageIndex + 1}`, newPages[i].originalUrl);
                    // Trigger simple shake animation in Header
                    window.dispatchEvent(new Event('archive-saved'));
                } catch (archiveErr) {
                    console.error("Failed to archive image:", archiveErr);
                    // Silent fail for archive - don't stop processing
                }
                // ---------------------

                // Update Quota if returned (Access Code Mode)
                if (result.quota) {
                    setQuota(result.quota);
                }

            } catch (error) {
                console.error(`Page ${i + 1} Error:`, error);
                newPages[i].status = 'error';

                // Trigger Toast only for the first error in a batch to avoid spam
                if (!showErrorToast) {
                    triggerErrorToast('⚠️ 部分生成失败，不扣除次数 (Quota Safe)。请稍后重试。');
                }
            }

            setPages([...newPages]);
        }

        // 4. Cleanup State
        setIsProcessing(false);
        setResolutionLocked(false);
        setIsStopping(false);
        setCurrentProcessingIndex(null);

        // 5. Completion Check
        const selectedPages = newPages.filter(p => p.selected);
        const allSelectedDone = selectedPages.length > 0 && selectedPages.every(p => p.status === 'completed' || p.status === 'error');
        const hasSuccessfulPages = selectedPages.some(p => p.status === 'completed');

        // Show banner if:
        // 1. All selected pages finished (natural completion) AND at least one success
        // 2. OR Processing was manually stopped AND at least one success
        if (hasSuccessfulPages && (allSelectedDone || abortRef.current)) {
            setShowCompletionBanner(true);
        }
    };

    const stopProcessing = () => {
        abortRef.current = true;
        setIsStopping(true);
        setShowStoppingToast(true);
        setTimeout(() => setShowStoppingToast(false), 2000);
    };

    return {
        isProcessing,
        isStopped,
        isStopping,
        currentProcessingIndex,
        resolution,
        setResolution,
        resolutionLocked,
        setResolutionLocked,
        showCompletionBanner,
        setShowCompletionBanner,
        showStoppingToast,
        showErrorToast,
        errorToastMessage,
        startProcessing,
        stopProcessing
    };
}
