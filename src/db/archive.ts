import Dexie, { Table } from 'dexie';

export interface ArchivedImage {
    id?: number;
    createdAt: number;
    thumbnail: string; // Base64 data url for quick list view
    fullResBlob: Blob; // The actual high-res image
    width: number;
    height: number;
    sourceName?: string;
    size: number; // Size in bytes for display
}

class ArchiveDB extends Dexie {
    images!: Table<ArchivedImage, number>;

    constructor() {
        super('NotebookLM_Archive');
        this.version(1).stores({
            images: '++id, createdAt' // Primary key and index for sorting/pruning
        });
    }
}

export const db = new ArchiveDB();

// Helper: Create a small thumbnail from the full blob or original url
const compressThumbnail = async (source: Blob | string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        let url: string;

        if (typeof source === 'string') {
            url = source;
            img.crossOrigin = "Anonymous"; // Try to handle CORS if external, though usually dataURL or local
        } else {
            url = URL.createObjectURL(source);
        }

        img.onload = () => {
            if (typeof source !== 'string') {
                URL.revokeObjectURL(url);
            }
            const canvas = document.createElement('canvas');
            const maxDim = 800; // Increased to 800px for Retina display
            let w = img.width;
            let h = img.height;
            const scale = Math.min(1, maxDim / Math.max(w, h));

            canvas.width = w * scale;
            canvas.height = h * scale;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }

            // Better smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Use 0.9 quality for sharper thumbnails
            // Always use jpeg for thumbnails to keep size reasonable but high quality
            const thumbDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            resolve(thumbDataUrl);
        };
        img.onerror = (e) => {
            // Fallback if loading failed (e.g. CORS), just return placeholder or reject
            console.error("Thumbnail generation failed", e);
            reject(e);
        };
        img.src = url;
    });
};

export const saveToArchive = async (
    fullResBlob: Blob,
    width: number,
    height: number,
    sourceName?: string,
    originalUrl?: string
): Promise<number> => {
    try {
        // Prefer originalUrl for thumbnail if available (faster and matches preview)
        // Otherwise fallback to compressing the full blob
        const thumbnail = await compressThumbnail(originalUrl || fullResBlob);

        const id = await db.images.add({
            createdAt: Date.now(),
            thumbnail,
            fullResBlob,
            width,
            height,
            sourceName,
            size: fullResBlob.size
        });

        return id; // Return the new ID
    } catch (error) {
        console.error("Failed to save to archive:", error);
        throw error;
    }
};

export const autoPruneArchives = async () => {
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const threshold = Date.now() - SEVEN_DAYS_MS;

    try {
        const deletedCount = await db.images.where('createdAt').below(threshold).delete();
        if (deletedCount > 0) {
            console.log(`[Archive] Auto-pruned ${deletedCount} old images.`);
        }
    } catch (error) {
        console.error("Failed to prune archives:", error);
    }
};

export const getArchiveCount = async (): Promise<number> => {
    return await db.images.count();
};
