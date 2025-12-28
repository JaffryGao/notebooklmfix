import { useState, useRef } from 'react';
import { ProcessedPage, QuotaInfo } from '../types';
import { processImageWithGemini } from '../services/geminiService';
import { AuthMode } from './useAuth';

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

export function useImageProcessing({
    pages,
    setPages,
    setQuota,
    keyAuthorized,
    verifyKey,
    handleSelectKey
}: UseImageProcessingProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isStopped, setIsStopped] = useState(false);
    const [isStopping, setIsStopping] = useState(false);
    const [currentProcessingIndex, setCurrentProcessingIndex] = useState<number | null>(null);
    const [resolution, setResolution] = useState<'2K' | '4K'>('2K');
    const [resolutionLocked, setResolutionLocked] = useState(false);
    const [showCompletionBanner, setShowCompletionBanner] = useState(false);
    const [showStoppingToast, setShowStoppingToast] = useState(false);

    const abortRef = useRef(false);

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

                // Update Quota if returned (Access Code Mode)
                if (result.quota) {
                    setQuota(result.quota);
                }

            } catch (error) {
                console.error(`Page ${i + 1} Error:`, error);
                newPages[i].status = 'error';
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
        startProcessing,
        stopProcessing
    };
}
