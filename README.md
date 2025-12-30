[ English ](./README-EN.md) | [ 简体中文 ](./README.md)

# NotebookLM Fixer (修复专家)


[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)



**NotebookLM Fixer** 是一款专为修复 [NotebookLM](https://notebooklm.google.com/) 生成的 PDF 文档、图片（如信息图等）而设计的智能工具。它利用最新一代 **Nano Banana Pro** 多模态模型，解决文档中常见的文字模糊、伪影和分辨率过低问题，实现像素级的画质重塑，并支持导出为高清晰度的 PDF 或 PPTX 演示文稿。

![App Screenshot](./src/assets/png1-cn.png)
![App Screenshot](./src/assets/png2-cn.png)

### 📊 修复效果对比 (Before & After)

| 🔴 修复前 (Original) | 🟢 修复后 (Restored) |
| :---: | :---: |
| ![Before](./src/assets/png4.png) | ![After](./src/assets/png5.png) |



## ✨ 核心特性

> **🚀 New in v2.2**
> - **📦 本地档案盒 (Local Archive Box)**: 自动保存您生成的高清原图。即使刷新页面，历史生成记录也不会丢失。数据存储在本地，隐私安全。
> - **⚡️ 口令次数实时同步**: 修复了口令模式下充值/消耗后次数更新延迟的问题。现在刷新页面即可秒级同步最新次数，无需手动清理缓存。
>
> **🔥 New in v2.1**
> - **图片模式 (Image Mode)**: 支持上传单张或多张图片 (PNG/JPG/WEBP)，不仅仅是 PDF。
> - **按需处理**: 支持勾选特定页面进行修复，节省额度。
> - **Access Code (口令)**: v2.1 新增**口令**模式，相比自备 API Key 模式支持更高画质且无需繁琐配置，实现高速直连。（由作者承担高昂 API 成本，需付费获取，请联系 WeChat: **JaffryGao**）
>
> | 特性 | 🔑 自备 API Key (传统模式) | 🎫 Access Code 口令 (新增模式) |
> | :--- | :--- | :--- |
> | **配置要求** | 高 (需注册 Google AI Studio 并绑定信用卡) | **极低 (开箱即用，输入口令即可)** |
> | **画质上限** | 仅支持 2K (Standard) | **支持 4K (Ultra HD)** |
> | **网络要求** | 需自备魔法/梯子 | **直连 (无需魔法)** |
> | **适用人群** | 开发者 / 技术达人 | **普通用户 / 追求极致体验者** |

- **🖼️ 智能超清重绘**: 基于 **Nano Banana Pro** 模型，智能识别并重绘文档内容，非单纯滤镜增强。

- **🔍 像素级修复**: 提供 **2K (标准)** 与 **4K (极致)** 两种分辨率选项，满足不同场景需求。
- **📝 文字精准还原**: 修复文字边缘锯齿与模糊，同时保持原有排版布局不变（*注：仅修复画质，不篡改内容*）。
- **📊 多格式导出**:
  - **PDF**: 重新生成的清晰文档。
  - **PPTX**: 亦可导出PPTX格式，注意该格式的文件依然不支持编辑内容。
  - **ZIP**: (图片模式) 一键打包下载所有高清图片。
- **🌗 现代化交互体验**:
  - 支持 **深色/浅色模式** 切换。
  - 支持 **中/英双语** 界面。
  - **实时对比**: 长按或点击即可查看修复前后的画质差异 (支持 Lightbox 缩放)。
  - **鼠标跟随动效**: 沉浸式的视觉体验。


## 🚀 立即使用 (Online Usage)
 
无需安装，点击下方链接即可直接使用：
 
**👉 [点击打开: notebooklmfix.vercel.app](https://notebooklmfix.vercel.app/)**
 
### 🔑 配置 API Key
首次打开时，点击右上角的 **"配置 API"** 按钮：
1. **方式 A (自备 Key)**: 输入您的 Google Gemini API Key (需魔法，支持 2K)。
2. **方式 B (口令)**: 输入口令 (**开箱即用**，免魔法，国内直连，支持 4K)。由作者承担高昂 API 成本，需付费获取，请联系 WeChat: JaffryGao
> **隐私承诺**: API Key 仅保存在浏览器本地，绝不会上传。
 
---
 
## 🛠️ 本地开发 (Developers Only)
如果您是开发者，希望在本地运行或修改代码：
 
### 1. 克隆与安装
```bash
git clone https://github.com/JaffryGao/notebooklm-fixer.git
cd notebooklm-fixer
npm install
npm run dev
```
 
### 2. 或者一键部署您自己的版本
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FJaffryGao%2Fnotebooklmfix)


## 📖 使用指南


1.  **上传**: 将 NotebookLM 生成的 PDF 或图片（如信息图等）文件拖入上传区域。
2.  **预览**: 应用会自动提取 PDF 页面或图片。
3.  **配置**: 
    - 选择画质 (2K/4K)。
    - 确认 API Key 状态。
4.  **修复**: 点击 "开始增强 (Start Restoration)"。
5.  **导出**: 修复完成后，点击底部的 PDF 或 PPTX 按钮下载文件。

## 🛠️ 技术栈

本项目基于现代 Web 技术构建：

- **App Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: [Google GenAI SDK](https://www.npmjs.com/package/@google/genai) (Gemini)
- **PDF Core**: [PDF.js](https://mozilla.github.io/pdf.js/) (Rendering) & [jsPDF](https://github.com/parallax/jsPDF) (Export)
- **Presentation**: [PptxGenJS](https://gitbrent.github.io/PptxGenJS/)
- **Data Store**: Vercel KV (Redis)

## ⚠️ 免责声明 & 扣费规则

> **请在使用前仔细阅读**

1.  **AI 修复局限性**: 本工具使用生成式 AI (GenAI) 进行画质重绘。虽然效果显著，但**并非 100% 完美**。对于原图中**极小、极其模糊或辨识度极低**的文字，AI 可能会出现无法识别、修复失败或“幻觉”（即猜测错误）的情况。请用户予以理解。
2.  **计费与退款**:
    *   **扣费**: 仅在图片**修复成功**并在该过程中消耗了 GPU 算力时扣除额度。
    *   **回退**: 如果因网络问题、AI 报错或服务器故障导致**修复失败**，系统将自动回滚，**不消耗您的次数**。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。
