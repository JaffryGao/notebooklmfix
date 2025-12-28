export type Language = 'en' | 'cn';

type TranslationKeys = {
    // App General
    title: string;
    subtitle: string;
    description: string;
    selectKey: string;
    apiKeyActive: string;
    uploadTitle: string;
    uploadDesc: string;
    extracting: string;
    pages: string;
    start: string;
    exportPdf: string;
    exportPptx: string;
    restored: string;
    failed: string;
    enhancing: string;
    holdToView: string;
    clickToView: string;
    page: string;
    keyGuideTitle: string;
    keyGuideDesc: string;
    connectBtn: string;
    res2k: string;
    res4k: string;
    highCost: string;
    enhancingTo: string;
    selectAll: string;
    deselectAll: string;
    allDone: string;
    downloadNow: string;
    compareModalTitle: string;
    original: string;
    processed: string;
    close: string;
    stop: string;
    stopping: string;
    continue: string;
    stopped: string;
    uploadNew: string;

    // ApiKeyModal
    keyModalTitle: string;
    keyModalDesc: string;
    keyInputPlaceholder: string;
    invalidCode: string;
    networkError: string;
    verifying: string;
    save: string;
    getKey: string;
    googleTitle: string;
    googleDesc1: string;
    googleDesc2: string;
    passcodeTitle: string;
    passcodeDesc1: string;
    passcodeDesc2: string;
    contactMe: string;
    wechat: string;
    tip: string;

    // Footer
    copyright: string;
    builtBy: string;
    rights: string;
    privacy: string;
    terms: string;
};

export const TRANSLATIONS: Record<Language, TranslationKeys> = {
    en: {
        // App
        title: "NotebookLM Fixer",
        subtitle: "Slide & Infographic Restoration Expert",
        description: "Specifically designed to fix blurry text and artifacts in NotebookLM generated PDFs and Infographics. Restore clarity and convert to PPTX.",
        selectKey: "Select Billing Project",
        apiKeyActive: "API Key Active",
        uploadTitle: "Upload PDF Document",
        uploadDesc: "Drag and drop your NotebookLM generated PDF. We will reconstruct every page using AI with pixel-perfect clarity.",
        extracting: "Extracting Pages...",
        pages: "Pages",
        start: "Start Restoration",
        exportPdf: "Export PDF",
        exportPptx: "Export PPTX",
        restored: "Restored",
        failed: "Failed",
        enhancing: "Enhancing...",
        holdToView: "Hold to compare",
        clickToView: "Click to compare",
        page: "Page",
        keyGuideTitle: "API Key Required",
        keyGuideDesc: "To process high-resolution images with Nano Banana Pro, you must select a Google Cloud project associated with billing.",
        connectBtn: "Connect API Key",
        res2k: "2K",
        res4k: "4K",
        highCost: "Uses more tokens",
        enhancingTo: "AI Repairing",
        selectAll: "Select All",
        deselectAll: "Deselect All",
        allDone: "All pages restored successfully!",
        downloadNow: "Download your files now",
        compareModalTitle: "Image Comparison",
        original: "Original",
        processed: "Restored",
        close: "Close",
        stop: "Stop",
        stopping: "Stopping...",
        continue: "Continue",
        stopped: "Processing paused",
        uploadNew: "Upload New File",

        // ApiKeyModal
        keyModalTitle: 'Configure API',
        keyModalDesc: 'Enter Key or Passcode to start',
        keyInputPlaceholder: 'Enter sk-xxxx (Key) or Passcode...',
        invalidCode: 'Invalid Passcode',
        networkError: 'Network Error',
        verifying: 'Verifying...',
        save: 'Confirm & Save',
        getKey: 'GET KEY / PASSCODE',
        googleTitle: 'Google AI Studio',
        googleDesc1: 'Requires Credit Card',
        googleDesc2: '* VPN Required · 2K Only',
        passcodeTitle: 'Buy Passcode',
        passcodeDesc1: 'No VPN · Direct Connect',
        passcodeDesc2: '* Unlocks 4K Ultra',
        contactMe: 'Contact to buy:',
        wechat: '微信',
        tip: '* For 4K Upscaling & Text Repair, please purchase a Passcode from the author.',

        // Footer
        copyright: "© 2026 NotebookLM Fixer.",
        builtBy: "Designed & Built by 懊侬 AoNong.",
        rights: "All rights reserved.",
        privacy: "Privacy Policy",
        terms: "Terms of Service"
    },
    cn: {
        // App
        title: "NotebookLM Fixer",
        subtitle: "幻灯片 & 信息图修复专家",
        description: "专为修复 NotebookLM 生成文档与信息图中的文字模糊与伪影问题而设计。一键还原清晰画质，支持导出 PDF 与 PPTX。",
        selectKey: "选择计费项目",
        apiKeyActive: "API 密钥已激活",
        uploadTitle: "上传文档或图片",
        uploadDesc: "支持 PDF 文档或各类图片 (如 NotebookLM 生成的信息图)。AI 智能增强，一键还原清晰画质。",
        extracting: "正在提取页面...",
        pages: "页面",
        start: "开始增强",
        exportPdf: "导出 PDF",
        exportPptx: "导出 PPTX",
        restored: "已修复",
        failed: "失败",
        enhancing: "正在增强...",
        holdToView: "长按对比原图",
        clickToView: "点击查看大图对比",
        page: "页",
        keyGuideTitle: "需配置 API 密钥",
        keyGuideDesc: "为了使用 Nano Banana Pro 处理高分辨率图像，您需要选择一个关联了计费的 Google Cloud 项目。",
        connectBtn: "连接 API 密钥",
        res2k: "2K (快速)",
        res4k: "4K (极致)",
        highCost: "消耗更多 Token",
        enhancingTo: "AI 正在修复",
        selectAll: "全选",
        deselectAll: "取消全选",
        allDone: "所有页面修复完成！",
        downloadNow: "立即下载您的文件",
        compareModalTitle: "画质对比",
        original: "原图",
        processed: "修复后",
        close: "关闭",
        stop: "停止处理",
        stopping: "正在停止...",
        continue: "继续处理",
        stopped: "处理已暂停",
        uploadNew: "上传新文件",

        // ApiKeyModal
        keyModalTitle: '配置 API',
        keyModalDesc: '输入密钥或口令以开始增强',
        keyInputPlaceholder: '输入 sk-xxxx (Key) 或 口令...',
        invalidCode: '无效的口令 (Invalid Passcode)',
        networkError: '验证失败，请检查网络',
        verifying: '验证中...',
        save: '确认并保存',
        getKey: '获取密钥 / 口令',
        googleTitle: 'Google AI Studio',
        googleDesc1: '需绑定实体信用卡 (Credit Card)',
        googleDesc2: '* 需 VPN · 仅支持 2K',
        passcodeTitle: '购买口令 (Passcode)',
        passcodeDesc1: '免 VPN · 国内直连 · 即开即用',
        passcodeDesc2: '* 解锁极致 4K',
        contactMe: '联系购买:',
        wechat: '微信',
        tip: '* 4K 高清修复以及文字修复，请联系作者购买口令。',

        // Footer
        copyright: "© 2026 NotebookLM Fixer.",
        builtBy: "由 懊侬 AoNong 设计与开发。",
        rights: "保留所有权利。",
        privacy: "隐私政策",
        terms: "服务条款"
    }
};
