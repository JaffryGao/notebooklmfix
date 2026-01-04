import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

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

const CARD_WIDTH = 300;
const GAP = 20;

const PlatformBadge: React.FC<{ platform: Review['platform'] }> = ({ platform }) => {
    const config = {
        wechat: { bg: 'bg-[#07C160]/10', text: 'text-[#07C160]', label: '微信' },
        xiaohongshu: { bg: 'bg-red-500/10', text: 'text-red-500', label: '小红书' },
        jike: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', label: '即刻' },
        twitter: { bg: 'bg-sky-500/10', text: 'text-sky-500', label: 'X' }
    };
    const c = config[platform];
    return (
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
            {c.label}
        </span>
    );
};

// Single review card component
const ReviewCard: React.FC<{ review: Review; lang: 'en' | 'cn' }> = ({ review, lang }) => (
    <div
        className="flex-shrink-0 p-5 bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200/80 dark:border-white/10 shadow-sm"
        style={{ width: CARD_WIDTH }}
    >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center text-lg ring-2 ring-white dark:ring-zinc-800 shadow-sm">
                    {review.avatar}
                </div>
                <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{review.name}</p>
                    {review.role && <p className="text-xs text-zinc-500 dark:text-zinc-400">{review.role}</p>}
                </div>
            </div>
            <PlatformBadge platform={review.platform} />
        </div>

        {/* Content */}
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            "{lang === 'en' ? review.contentEn : review.content}"
        </p>
    </div>
);

export const Testimonial: React.FC<TestimonialProps> = ({ lang }) => {
    const [imagesFixed, setImagesFixed] = useState(2849);
    const [isPaused, setIsPaused] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);

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

    // 每个卡片的总宽度（包括间距）
    const itemWidth = CARD_WIDTH + GAP;
    // 一轮的总宽度
    const totalWidth = itemWidth * REVIEWS.length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
        >
            {/* Section Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 rounded-full mb-4">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                        {lang === 'en' ? 'User Reviews' : '用户评价'}
                    </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-heading font-bold text-zinc-900 dark:text-white mb-2">
                    {lang === 'en' ? 'What Our Users Say' : '听听他们怎么说'}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {lang === 'en' ? 'Join 100+ users who fixed their NotebookLM exports' : '已有 100+ 用户成功修复了他们的导出图片'}
                </p>
            </div>

            {/* Infinite Marquee */}
            <div
                className="relative overflow-hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-zinc-50 via-zinc-50/80 dark:from-zinc-950 dark:via-zinc-950/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-zinc-50 via-zinc-50/80 dark:from-zinc-950 dark:via-zinc-950/80 to-transparent z-10 pointer-events-none" />

                {/* Scrolling Track with Framer Motion */}
                <motion.div
                    ref={trackRef}
                    className="flex py-2"
                    style={{ gap: GAP }}
                    animate={{
                        x: isPaused ? undefined : [0, -totalWidth]
                    }}
                    transition={{
                        x: {
                            duration: 30,
                            repeat: Infinity,
                            ease: "linear",
                            repeatType: "loop"
                        }
                    }}
                >
                    {/* 渲染 3 组卡片确保无缝 */}
                    {[...REVIEWS, ...REVIEWS, ...REVIEWS].map((review, idx) => (
                        <ReviewCard key={`${review.id}-${idx}`} review={review} lang={lang} />
                    ))}
                </motion.div>
            </div>

            {/* Social Proof Stats */}
            <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-zinc-200/50 dark:border-white/5">
                <div className="text-center">
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">{imagesFixed.toLocaleString()}</p>
                    <p className="text-xs text-zinc-500">{lang === 'en' ? 'Images Fixed' : '图片已修复'}</p>
                </div>
                <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700"></div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">98%</p>
                    <p className="text-xs text-zinc-500">{lang === 'en' ? 'Success Rate' : '成功率'}</p>
                </div>
            </div>
        </motion.div>
    );
};
