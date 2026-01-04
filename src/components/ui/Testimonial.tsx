import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Quote } from 'lucide-react';

interface TestimonialProps {
    lang: 'en' | 'cn';
}

interface Review {
    id: number;
    name: string;
    role: string;
    avatar: string;
    content: string;
    contentEn: string;
    platform: 'wechat' | 'xiaohongshu' | 'jike' | 'twitter';
}

const REVIEWS: Review[] = [
    {
        id: 1,
        name: '羽',
        role: '',
        avatar: '🪶',
        content: '效果特别好的，如果没问题的话后面还会下单',
        contentEn: 'The results are great. Will definitely order more if everything goes smoothly.',
        platform: 'wechat'
    },
    {
        id: 2,
        name: '林**',
        role: '产品经理',
        avatar: '🌸',
        content: '4K 效果太明显了，直接能放 PPT 汇报',
        contentEn: '4K quality is amazing, perfect for executive presentations.',
        platform: 'wechat'
    },
    {
        id: 3,
        name: '张*学',
        role: '大学生',
        avatar: '📚',
        content: '答辩前一晚发现图全糊了，这工具救我一命！20 张图 10 分钟搞定',
        contentEn: 'Saved my thesis defense! Fixed 20 blurry images in 10 minutes.',
        platform: 'xiaohongshu'
    },
    {
        id: 4,
        name: 'A***x',
        role: '设计师',
        avatar: '🎨',
        content: '清晰度拉满，色彩还原也很准',
        contentEn: 'Crystal clear, color accuracy is spot on.',
        platform: 'twitter'
    },
    {
        id: 5,
        name: '陈*师',
        role: '老师',
        avatar: '👨‍🏫',
        content: '做学习资料终于不用忍受糊图了，感谢！',
        contentEn: 'Finally no more blurry images for study materials. Thanks!',
        platform: 'wechat'
    },
    {
        id: 6,
        name: '小*',
        role: '博主',
        avatar: '✨',
        content: '批量处理太方便了，省超多时间',
        contentEn: 'Batch processing is so convenient, saves tons of time.',
        platform: 'xiaohongshu'
    },
    {
        id: 7,
        name: 'K***n',
        role: '程序员',
        avatar: '💻',
        content: '终于有人做了！开源项目 respect 👏',
        contentEn: 'Finally someone built this! Open source, respect 👏',
        platform: 'jike'
    },
    {
        id: 8,
        name: '王*',
        role: '运营',
        avatar: '📊',
        content: '导出图清清楚楚，领导都夸报告质量提升了',
        contentEn: 'Exports are crystal clear now, boss praised the improved report quality.',
        platform: 'wechat'
    },
    {
        id: 9,
        name: '李**',
        role: '销售',
        avatar: '💼',
        content: '给客户做方案再也不尴尬了',
        contentEn: 'No more embarrassing blurry images in client proposals.',
        platform: 'xiaohongshu'
    }
];

const CARD_WIDTH = 320;
const GAP = 24;

const PlatformBadge: React.FC<{ platform: Review['platform'] }> = ({ platform }) => {
    const config = {
        wechat: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: '微信' },
        xiaohongshu: { bg: 'bg-rose-500/10', text: 'text-rose-500', label: '小红书' },
        jike: { bg: 'bg-amber-500/10', text: 'text-amber-500', label: '即刻' },
        twitter: { bg: 'bg-sky-500/10', text: 'text-sky-500', label: 'X' }
    };
    const c = config[platform];
    return (
        <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${c.bg} ${c.text} tracking-wide`}>
            {c.label}
        </span>
    );
};

// Premium review card with glassmorphism effect
const ReviewCard: React.FC<{ review: Review; lang: 'en' | 'cn' }> = ({ review, lang }) => (
    <div
        className="flex-shrink-0 p-6 rounded-3xl backdrop-blur-sm border transition-all duration-300
                   bg-gradient-to-br from-white/80 to-white/40 border-zinc-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)]
                   dark:from-zinc-900/80 dark:to-zinc-900/40 dark:border-white/10 dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]
                   hover:shadow-[0_12px_48px_rgba(99,102,241,0.12)] dark:hover:shadow-[0_12px_48px_rgba(99,102,241,0.2)]
                   hover:border-indigo-200 dark:hover:border-indigo-500/30"
        style={{ width: CARD_WIDTH }}
    >
        {/* Quote Icon */}
        <Quote className="w-6 h-6 text-indigo-400/40 dark:text-indigo-400/30 mb-3" />

        {/* Content */}
        <p className="text-[15px] text-zinc-700 dark:text-zinc-200 leading-relaxed mb-5 font-medium">
            {lang === 'en' ? review.contentEn : review.content}
        </p>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-700 to-transparent mb-4" />

        {/* Footer: Avatar + Name + Platform */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center text-xl shadow-inner">
                    {review.avatar}
                </div>
                <div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-white">{review.name}</p>
                    {review.role && <p className="text-xs text-zinc-500 dark:text-zinc-400">{review.role}</p>}
                </div>
            </div>
            <PlatformBadge platform={review.platform} />
        </div>
    </div>
);

// CSS keyframes for smooth infinite scroll
const marqueeCSS = `
@keyframes scroll-marquee {
    from { transform: translateX(0); }
    to { transform: translateX(calc(-${CARD_WIDTH + GAP}px * ${REVIEWS.length})); }
}
.marquee-track {
    animation: scroll-marquee 60s linear infinite;
}
.marquee-track:hover {
    animation-play-state: paused;
}
`;

export const Testimonial: React.FC<TestimonialProps> = ({ lang }) => {
    const [imagesFixed, setImagesFixed] = useState(2849);

    // 获取真实统计数据
    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => {
                if (data.imagesFixed) {
                    setImagesFixed(data.imagesFixed);
                }
            })
            .catch(() => { });
    }, []);

    // 复制 3 组保证无缝
    const tripleReviews = [...REVIEWS, ...REVIEWS, ...REVIEWS];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
        >
            {/* Inject CSS */}
            <style>{marqueeCSS}</style>

            {/* Section Header */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full mb-4 border border-amber-500/20">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                        {lang === 'en' ? 'User Reviews' : '用户评价'}
                    </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-heading font-bold text-zinc-900 dark:text-white mb-3">
                    {lang === 'en' ? 'What Our Users Say' : '听听他们怎么说'}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                    {lang === 'en' ? 'Join 100+ users who fixed their NotebookLM exports' : '已有 100+ 用户成功修复了他们的导出图片'}
                </p>
            </div>

            {/* Infinite Marquee - Pure CSS (no jitter on hover) */}
            <div className="relative overflow-hidden py-2">
                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-zinc-50 via-zinc-50/90 dark:from-zinc-950 dark:via-zinc-950/90 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-zinc-50 via-zinc-50/90 dark:from-zinc-950 dark:via-zinc-950/90 to-transparent z-10 pointer-events-none" />

                {/* Scrolling Track - Pure CSS Animation */}
                <div
                    className="flex marquee-track"
                    style={{ gap: GAP, width: 'max-content' }}
                >
                    {tripleReviews.map((review, idx) => (
                        <ReviewCard key={`${review.id}-${idx}`} review={review} lang={lang} />
                    ))}
                </div>
            </div>

            {/* Social Proof Stats */}
            <div className="flex items-center justify-center gap-10 mt-10 pt-8 border-t border-zinc-200/50 dark:border-white/5">
                <div className="text-center">
                    <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{imagesFixed.toLocaleString()}</p>
                    <p className="text-xs text-zinc-500 mt-1">{lang === 'en' ? 'Images Fixed' : '图片已修复'}</p>
                </div>
                <div className="w-px h-10 bg-gradient-to-b from-transparent via-zinc-300 dark:via-zinc-600 to-transparent"></div>
                <div className="text-center">
                    <p className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">98%</p>
                    <p className="text-xs text-zinc-500 mt-1">{lang === 'en' ? 'Success Rate' : '成功率'}</p>
                </div>
            </div>
        </motion.div>
    );
};
