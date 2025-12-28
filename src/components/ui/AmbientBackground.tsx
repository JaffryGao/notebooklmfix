import React, { useEffect, useRef } from 'react';

export const AmbientBackground: React.FC = () => {
    const blobRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!blobRef.current) return;
            const { clientX, clientY } = e;

            // Lag effect for smoothness (optional, but css transition handles it better usually, 
            // but for instant tracking following cursor centre:)
            blobRef.current.animate({
                left: `${clientX}px`,
                top: `${clientY}px`
            }, { duration: 3000, fill: "forwards" }); // 3000ms duration for a very slow, drifting feel? Or instant? 
            // "Restrained" usually implies slow movement or subtle opacity. 
            // Let's use standard direct tracking but with a CSS blur and transition.
        };

        // Actually, for "following mouse", updating variables or direct DOM is better.
        // Let's use a simpler approach: direct update but the element has a transition.
        const updatePosition = (e: MouseEvent) => {
            if (blobRef.current) {
                // Centering the blob
                blobRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
            }
        };

        window.addEventListener('mousemove', updatePosition);
        return () => window.removeEventListener('mousemove', updatePosition);
    }, []);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* The light blob */}
            <div
                ref={blobRef}
                className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 dark:opacity-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-transform duration-75 ease-out will-change-transform top-0 left-0"
                style={{ transform: 'translate(-100%, -100%)' }} // Initial off-screen
            />

            {/* Static ambient mesh or noise could go here too if needed */}
        </div>
    );
};
