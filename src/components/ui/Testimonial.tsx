import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TestimonialProps {
    lang: 'en' | 'cn';
}

export const Testimonial: React.FC<TestimonialProps> = ({ lang }) => {
    // Official WeChat Icon SVG (Matching Modal)
    const WeChatOfficialIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047.245.245 0 0 0 .241-.245c0-.06-.024-.12-.04-.177l-.327-1.233a.49.49 0 0 1 .177-.554C23.013 18.138 24 16.39 24 14.466c0-3.372-2.93-5.608-7.062-5.608zm-2.32 2.935c.535 0 .969.44.969.983a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.983.97-.983zm4.638 0c.535 0 .969.44.969.983a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.983.97-.983z" />
        </svg>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-xl mx-auto px-4"
        >
            <div className="flex flex-col items-center text-center">

                {/* Quote Text */}
                <p className="text-xl md:text-2xl font-heading font-medium text-zinc-900 dark:text-white leading-tight md:leading-snug mb-8 max-w-lg tracking-tight">
                    {lang === 'en'
                        ? '"The results are exceptionally good. If everything goes smoothly, I\'ll definitely place more orders."'
                        : '“效果特别好的，如果没问题的话后面还会下单”'
                    }
                </p>

                {/* Info Block (Avatar + Label) */}
                <div className="flex flex-col items-center gap-2">
                    {/* WeChat Logo as Avatar */}
                    <div className="w-10 h-10 rounded-full bg-[#07C160] flex items-center justify-center shadow-lg shadow-[#07C160]/20 ring-4 ring-white dark:ring-zinc-950">
                        <WeChatOfficialIcon />
                    </div>

                    {/* Simple Label */}
                    <div className="flex items-center gap-1.5 opacity-60 mt-1">
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium tracking-wide">
                            {lang === 'en' ? 'Real User Feedback' : '真实用户反馈'}
                        </span>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};
