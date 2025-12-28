import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { ProcessedPage } from '../types';
import { parsePdfToImages, generateZip } from '../services/pdfService';

export function useFileHandler() {
    const [pages, setPages] = useState<ProcessedPage[]>([]);
    const [isExtracting, setIsExtracting] = useState(false);

    // Helper to read file as DataURL
    const readFile = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // Helper to get image dimensions
    const getImageDims = (src: string): Promise<{ width: number, height: number }> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.onerror = reject;
            img.src = src;
        });
    };

    const processImageFiles = useCallback(async (files: FileList) => {
        const newPages: ProcessedPage[] = [];
        let pageIndexOffset = pages.length; // Continue numbering

        for (let i = 0; i < files.length; i++) {
            // ... (Image logic remains same)
            const file = files[i];
            if (file.type.startsWith('image/')) {
                const src = await readFile(file);
                const { width, height } = await getImageDims(src);

                newPages.push({
                    originalUrl: src,
                    processedUrl: null,
                    pageIndex: pageIndexOffset + i + 1,
                    status: 'pending',
                    width,
                    height,
                    aspectRatio: width / height,
                    selected: true // Default Selected
                });
            }
        }
        setPages(prev => [...prev, ...newPages]);
    }, [pages.length]);

    const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Handle Image Uploads directly
        if (file.type.startsWith('image/')) {
            await processImageFiles(event.target.files!);
            event.target.value = ''; // Reset input
            return;
        }

        if (file.type !== 'application/pdf') return;

        setIsExtracting(true);
        try {
            // Use shared service
            const extractedPages = await parsePdfToImages(file);
            // Ensure selected is true if service doesn't set it (service sets it to true)
            setPages(extractedPages);
        } catch (error) {
            console.error('Error extracting PDF:', error);
            alert('Failed to extract PDF pages.');
        } finally {
            setIsExtracting(false);
            event.target.value = ''; // Reset input
        }
    }, [processImageFiles]);

    const handleDownloadZip = useCallback(async (processedPages: ProcessedPage[]) => {
        // Use shared service
        await generateZip(processedPages);
    }, []);

    const handleDownloadSingleImage = useCallback(async (page: ProcessedPage) => {
        if (page.processedUrl) {
            // Extract base64 and save
            // Or just saveAs direct URL
            // Since processedUrl is data:image/png;base64,... saveAs handles it usually
            // But let's check App.tsx original logic:
            // const link = document.createElement('a'); ... link.click();
            // Using file-saver is cleaner.
            saveAs(page.processedUrl, `page_${page.pageIndex}_fixed.png`);
        }
    }, []);

    return {
        pages,
        setPages, // Exposed for selection toggling etc.
        isExtracting,
        handleFileUpload,
        handleDownloadZip,
        handleDownloadSingleImage
    };
}
