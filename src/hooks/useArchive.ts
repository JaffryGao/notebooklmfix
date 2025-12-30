import { useLiveQuery } from 'dexie-react-hooks';
import { db, ArchivedImage } from '../db/archive';
import { useCallback } from 'react';

export const useArchive = () => {
    // Live query for all images, sorted by creation time (newest first)
    const images = useLiveQuery(
        () => db.images.orderBy('createdAt').reverse().toArray(),
        []
    );

    const totalCount = useLiveQuery(() => db.images.count(), [], 0);

    const deleteItems = useCallback(async (ids: number[]) => {
        if (ids.length === 0) return;
        await db.images.bulkDelete(ids);
    }, []);

    const clearAll = useCallback(async () => {
        await db.images.clear();
    }, []);

    return {
        images,      // can be undefined while loading
        totalCount,  // 0 initially
        deleteItems,
        clearAll
    };
};
