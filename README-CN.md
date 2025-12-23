[ English ](./README.md) | [ 简体中文 ](./README-CN.md)

# NotebookLM Fixer (修复专家)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


**NotebookLM Fixer** 是一款专为修复 [NotebookLM](https://notebooklm.google.com/) 生成的 PDF 文档而设计的智能工具。它利用 Google 最新的 **Gemini 3.0 Pro** 多模态模型，解决文档中常见的文字模糊、伪影和分辨率过低问题，实现像素级的画质重塑，并支持导出为高清晰度的 PDF 或 PPTX 演示文稿。

![App Screenshot](./assets/png1.png)
![App Screenshot](./assets/png2.png)


## ✨ 核心特性

- **🖼️ 智能超清重绘**：基于 `gemini-3-pro-image-preview` 模型，智能识别并重绘文档内容，非单纯滤镜增强。
- **🔍 像素级修复**：提供 **2K (标准)** 与 **4K (极致)** 两种分辨率选项，满足不同场景需求。
- **📝 文字精准还原**：修复文字边缘锯齿与模糊，同时保持原有排版布局不变（*注：仅修复画质，不篡改内容*）。
- **📊 多格式导出**：
  - **PDF**: 重新生成的清晰文档。
  - **PPTX**: 亦可导出PPTX格式，注意该格式的文件依然不支持编辑内容。
- **🌗 现代化交互体验**：
  - 支持 **深色/浅色模式** 切换。
  - 支持 **中/英双语** 界面。
  - **实时对比**：长按或点击即可查看修复前后的画质差异。
  - **鼠标跟随动效**：沉浸式的视觉体验。

## 🛠️ 技术栈

本项目基于现代 Web 技术构建：

- **App Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: [Google GenAI SDK](https://www.npmjs.com/package/@google/genai) (Gemini)
- **PDF Core**: [PDF.js](https://mozilla.github.io/pdf.js/) (Rendering) & [jsPDF](https://github.com/parallax/jsPDF) (Export)
- **Presentation**: [PptxGenJS](https://gitbrent.github.io/PptxGenJS/)

## 🚀 快速开始

### 前置要求

1.  **Node.js**: 建议版本 v20+。
2.  **Google Cloud API Key**: 需要开通 Gemini API 访问权限，并确保可以使用 `gemini-3-pro-image-preview` 模型。

### 安装步骤

1.  **克隆仓库**
    ```bash
    git clone https://github.com/your-username/notebooklm-fixer.git
    cd notebooklm-fixer
    ```

2.  **安装依赖**
    ```bash
    npm install
    # 或者
    pnpm install
    ```

### 配置 API Key

本项目提供灵活的 API Key 配置方式，满足不同场景需求：

#### 方案 A：本地 UI 配置 (推荐用于非开发人员)
1. 启动项目后，如果检测到未配置 Key，界面右上角会显示橙色的 "选择 API Key" 按钮。
2. 点击按钮，在弹出的窗口中输入您的 **Gemini API Key**。
    - **隐私承诺**：Key 仅加密存储在您浏览器的 `LocalStorage` 中，绝不上传至任何服务器。
3. 点击 "保存并连接"，即可开始使用。

#### 方案 B：环境变量 (推荐用于开发/部署)
在项目根目录创建 `.env.local` 文件，并添加：
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```
项目启动时会自动读取此变量，无需手动配置。

#### 方案 C：Google AI Studio / IDX 集成
如果您在 [Google Project IDX](https://idx.dev/) 环境中打开本项目，应用会自动尝试通过 `window.aistudio` 接口无感获取授权，无需任何配置。

### 运行开发服务器

```bash
npm run dev
```

打开浏览器访问 `http://localhost:5173` 即可使用。

## 📖 使用指南

1.  **上传**: 将 NotebookLM 生成的 PDF 文件拖入上传区域。
2.  **预览**: 应用会自动提取 PDF 页面。
3.  **配置**: 
    - 选择画质 (2K/4K)。
    - 确认 API Key 状态。
4.  **修复**: 点击 "开始增强 (Start Restoration)"。
5.  **导出**: 修复完成后，点击底部的 PDF 或 PPTX 按钮下载文件。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。
