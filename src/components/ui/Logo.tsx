import React from 'react';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-16 h-16'
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-8 h-8'
    };

    return (
        <div className={`relative group ${sizeClasses[size]} ${className}`}>
            {/* Outer Glow (Ambient) */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500/40 to-purple-500/40 rounded-xl blur-lg opacity-40 group-hover:opacity-75 transition-opacity duration-500 animate-pulse"></div>

            {/* Glass Container */}
            <div className="relative h-full w-full bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-xl shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] dark:shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden">

                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>

                {/* The Symbol: Abstract 'N' + Spark */}
                <div className="relative z-10">
                    {/* Main diamond/spark shape */}
                    <svg
                        viewBox="0 0 24 24"
                        className={`${iconSizes[size]} text-indigo-600 dark:text-indigo-300 drop-shadow-[0_0_10px_rgba(99,102,241,0.6)]`}
                        fill="currentColor"
                    >
                        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                    </svg>

                </div>
            </div>
        </div>
    );
};
