import React, { useState } from 'react';
import { X, ShieldCheck, FileText, ExternalLink } from 'lucide-react';

interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: 'en' | 'cn';
    initialTab?: 'privacy' | 'terms';
}

// 法律文档内容
const LEGAL_CONTENT = {
    cn: {
        privacyTitle: '隐私政策',
        termsTitle: '服务条款',
        lastUpdated: '最后更新：2026年1月4日',
        privacy: {
            intro: 'NotebookLM Fixer（以下简称"本服务"）尊重并保护您的隐私。本隐私政策旨在说明我们如何收集、使用和保护您的信息。',
            sections: [
                {
                    title: '1. 数据收集',
                    content: `**我们不收集您的个人身份信息。**

• **上传的文件**：您上传的 PDF 或图片仅在浏览器本地处理或发送至 AI 模型进行增强，处理完成后立即删除，**不会存储在我们的服务器上**。
• **API Key / 口令**：您输入的 API Key 或口令仅保存在您的浏览器本地存储 (LocalStorage) 中，**绝不会上传至任何服务器**。
• **生成的图片**："本地档案盒"功能将图片存储在浏览器的 IndexedDB 中，数据完全由您本地控制。`
                },
                {
                    title: '2. 数据使用',
                    content: `• 您的图片数据仅用于通过 Google Gemini API 或我们的代理服务器进行 AI 增强处理。
• 我们**不会**将您的数据用于训练模型、广告投放或任何其他商业目的。
• 口令模式下，您的口令仅用于验证使用次数，不会关联任何个人身份信息。`
                },
                {
                    title: '3. 第三方服务',
                    content: `本服务使用以下第三方服务：
• **Google Gemini API**：用于图像处理（受 Google 隐私政策约束）
• **Cloudflare R2**：用于临时存储超大图片（签名 URL，24小时后自动删除）
• **Vercel**：托管服务（受 Vercel 隐私政策约束）

我们建议您阅读上述第三方服务的隐私政策。`
                },
                {
                    title: '4. 数据安全',
                    content: `• 所有 API 通信均通过 HTTPS 加密传输。
• 我们不存储任何用户数据，因此不存在数据泄露风险。
• 代理服务器仅作为中转，不记录任何请求内容。`
                },
                {
                    title: '5. 联系我们',
                    content: `如对隐私政策有任何疑问，请通过以下方式联系：
• 微信：JaffryD
• GitHub：github.com/JaffryGao`
                }
            ]
        },
        terms: {
            intro: '使用 NotebookLM Fixer（以下简称"本服务"）即表示您同意以下条款。请在使用前仔细阅读。',
            sections: [
                {
                    title: '1. 服务描述',
                    content: `本服务是一款 AI 驱动的图像增强工具，旨在修复 NotebookLM 生成的 PDF 和图片中的模糊文字与低画质问题。

**重要说明**：
• AI 修复并非 100% 完美，对于原图中极小、极其模糊或辨识度极低的文字，可能存在修复失败或"幻觉"（AI 猜测错误）的情况。
• 本服务**不提供内容准确性保证**，请用户自行校对修复后的内容。`
                },
                {
                    title: '2. 用户责任',
                    content: `• 您承诺上传的内容不违反任何法律法规，不包含非法、侵权或不当内容。
• 您对使用本服务处理的所有内容及其后果承担全部责任。
• 您不得滥用本服务进行任何恶意活动，包括但不限于：DDoS 攻击、API 滥用、逆向工程等。`
                },
                {
                    title: '3. 计费与退款',
                    content: `**口令模式计费规则**：
• **成功扣费**：仅当图片修复成功并成功送达前端时扣除次数。
• **自动退款**：若因网络问题、AI 报错或服务器故障导致修复失败，系统将**自动回滚**，不消耗您的次数。
• **不退款情形**：因用户自身操作不当（如上传无效文件、中途刷新页面）导致的失败，已扣次数不予退还。

**API Key 模式**：使用您自己的 API Key 时，Token 消耗由 Google 计费，与本服务无关。`
                },
                {
                    title: '4. 免责声明',
                    content: `• 本服务以"现状"(AS IS) 提供，不提供任何明示或暗示的保证。
• 对于因使用本服务造成的任何直接或间接损失，我们不承担责任。
• 由于依赖第三方 API（Google Gemini），服务可用性可能受到影响，我们不保证 100% 的可用性。`
                },
                {
                    title: '5. 知识产权',
                    content: `• 本服务的代码、设计、界面及相关资产受版权保护。
• 您上传的内容的知识产权归您所有，我们不主张任何权利。
• 经 AI 增强后生成的图片版权归原始内容所有者所有。`
                },
                {
                    title: '6. 条款变更',
                    content: `我们保留随时修改本条款的权利。重大变更将通过网站公告或更新日期通知用户。继续使用本服务即表示您接受更新后的条款。`
                }
            ]
        }
    },
    en: {
        privacyTitle: 'Privacy Policy',
        termsTitle: 'Terms of Service',
        lastUpdated: 'Last Updated: January 4, 2026',
        privacy: {
            intro: 'NotebookLM Fixer ("the Service") respects and protects your privacy. This Privacy Policy explains how we collect, use, and protect your information.',
            sections: [
                {
                    title: '1. Data Collection',
                    content: `**We do not collect any personally identifiable information.**

• **Uploaded Files**: PDF or images you upload are processed locally in your browser or sent to the AI model for enhancement. They are deleted immediately after processing and **are not stored on our servers**.
• **API Key / Passcode**: Your API Key or passcode is stored only in your browser's LocalStorage and **is never uploaded to any server**.
• **Generated Images**: The "Local Archive" feature stores images in your browser's IndexedDB. Data is fully controlled locally by you.`
                },
                {
                    title: '2. Data Usage',
                    content: `• Your image data is used solely for AI enhancement via the Google Gemini API or our proxy server.
• We **do not** use your data for model training, advertising, or any other commercial purposes.
• In Passcode mode, your passcode is only used to verify usage count and is not linked to any personal identity.`
                },
                {
                    title: '3. Third-Party Services',
                    content: `This service uses the following third-party services:
• **Google Gemini API**: For image processing (subject to Google's Privacy Policy)
• **Cloudflare R2**: For temporary storage of large images (signed URLs, auto-deleted after 24 hours)
• **Vercel**: Hosting service (subject to Vercel's Privacy Policy)

We recommend reviewing the privacy policies of these third-party services.`
                },
                {
                    title: '4. Data Security',
                    content: `• All API communications are encrypted via HTTPS.
• We do not store any user data, eliminating data breach risks.
• The proxy server acts only as a relay and does not log any request content.`
                },
                {
                    title: '5. Contact Us',
                    content: `For any privacy-related questions, please contact:
• WeChat: JaffryD
• GitHub: github.com/JaffryGao`
                }
            ]
        },
        terms: {
            intro: 'By using NotebookLM Fixer ("the Service"), you agree to the following terms. Please read carefully before use.',
            sections: [
                {
                    title: '1. Service Description',
                    content: `This Service is an AI-powered image enhancement tool designed to fix blurry text and low-quality images in PDFs and images generated by NotebookLM.

**Important Notes**:
• AI restoration is not 100% perfect. For extremely small, blurry, or illegible text in the original image, restoration may fail or produce "hallucinations" (incorrect AI guesses).
• This Service **does not guarantee content accuracy**. Users are responsible for proofreading restored content.`
                },
                {
                    title: '2. User Responsibilities',
                    content: `• You agree that uploaded content does not violate any laws and does not contain illegal, infringing, or inappropriate material.
• You are fully responsible for all content processed using this Service and its consequences.
• You shall not misuse this Service for malicious activities, including but not limited to: DDoS attacks, API abuse, reverse engineering, etc.`
                },
                {
                    title: '3. Billing & Refunds',
                    content: `**Passcode Mode Billing**:
• **Deduction**: Quota is deducted only when image restoration succeeds and is successfully delivered to the frontend.
• **Auto-Refund**: If restoration fails due to network issues, AI errors, or server faults, the system will **automatically rollback**. Your quota will not be consumed.
• **Non-Refundable**: Failures due to user error (e.g., uploading invalid files, refreshing mid-process) are non-refundable.

**API Key Mode**: When using your own API Key, token consumption is billed by Google and is unrelated to this Service.`
                },
                {
                    title: '4. Disclaimer',
                    content: `• This Service is provided "AS IS" without any warranties, express or implied.
• We are not liable for any direct or indirect damages resulting from using this Service.
• Service availability may be affected by third-party APIs (Google Gemini). We do not guarantee 100% uptime.`
                },
                {
                    title: '5. Intellectual Property',
                    content: `• The code, design, interface, and related assets of this Service are protected by copyright.
• The intellectual property of content you upload remains yours. We claim no rights to it.
• Copyright of AI-enhanced images belongs to the original content owner.`
                },
                {
                    title: '6. Changes to Terms',
                    content: `We reserve the right to modify these terms at any time. Significant changes will be communicated via website announcement or updated date. Continued use of the Service constitutes acceptance of the updated terms.`
                }
            ]
        }
    }
};

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, lang, initialTab = 'privacy' }) => {
    const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

    const t = LEGAL_CONTENT[lang];
    const currentContent = activeTab === 'privacy' ? t.privacy : t.terms;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col">

                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/5 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                            {activeTab === 'privacy' ? (
                                <ShieldCheck className="w-5 h-5" />
                            ) : (
                                <FileText className="w-5 h-5" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-heading font-bold text-zinc-900 dark:text-white leading-none">
                                {activeTab === 'privacy' ? t.privacyTitle : t.termsTitle}
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                {t.lastUpdated}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="px-6 pt-4 shrink-0">
                    <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-white/5 rounded-xl">
                        <button
                            onClick={() => setActiveTab('privacy')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'privacy'
                                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                                }`}
                        >
                            <ShieldCheck className="w-4 h-4" />
                            {t.privacyTitle}
                        </button>
                        <button
                            onClick={() => setActiveTab('terms')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'terms'
                                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            {t.termsTitle}
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Intro */}
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {currentContent.intro}
                    </p>

                    {/* Sections */}
                    {currentContent.sections.map((section, index) => (
                        <div key={index} className="space-y-3">
                            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                                {section.title}
                            </h4>
                            <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap prose prose-sm dark:prose-invert prose-strong:text-zinc-800 dark:prose-strong:text-zinc-200 max-w-none">
                                {/* 简单渲染 markdown 加粗语法 */}
                                {section.content.split(/(\*\*.*?\*\*)/).map((part, i) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                        return (
                                            <strong key={i} className="text-zinc-800 dark:text-zinc-200 font-semibold">
                                                {part.slice(2, -2)}
                                            </strong>
                                        );
                                    }
                                    return <span key={i}>{part}</span>;
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Footer Note */}
                    <div className="pt-4 border-t border-zinc-100 dark:border-white/5">
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
                            {lang === 'cn'
                                ? '如有任何疑问，请通过上述联系方式与我们取得联系。'
                                : 'If you have any questions, please contact us using the information above.'
                            }
                        </p>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="px-6 py-4 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/5 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[0px] transition-all"
                    >
                        {lang === 'cn' ? '我已阅读并理解' : 'I Understand'}
                    </button>
                </div>
            </div>
        </div>
    );
};
