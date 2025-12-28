import React from 'react';
import { X } from 'lucide-react';

interface ZoomModalProps {
    zoomedImage: string | null;
    onClose: () => void;
}

export const ZoomModal: React.FC<ZoomModalProps> = ({ zoomedImage, onClose }) => {
    if (!zoomedImage) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300" onClick={onClose}>
            <button className="absolute top-6 right-6 p-3 bg-black/50 hover:bg-zinc-800 text-white/70 hover:text-white rounded-full backdrop-blur-md border border-white/10 transition-all z-[101] group shadow-xl">
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
            <img
                src={zoomedImage}
                alt="Zoomed"
                className="max-w-[95vw] max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300 cursor-default ring-1 ring-white/10"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};
