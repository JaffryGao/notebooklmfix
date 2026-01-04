import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Loader2,
  ArrowRight,
  Zap,
  AlertCircle
} from 'lucide-react';
import { Testimonial } from './components/ui/Testimonial';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useFileHandler } from './hooks/useFileHandler';
import { useImageProcessing } from './hooks/useImageProcessing';
import { generatePdf, generatePptx, generateZip } from './services/pdfService';

// Components
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ActionBar } from './components/viewer/ActionBar';
import { ImageGrid } from './components/viewer/ImageGrid';
import { CompletionBanner } from './components/ui/CompletionBanner';
import { Toast } from './components/ui/Toast';
import { ComparisonModal } from './components/modals/ComparisonModal';
import { ZoomModal } from './components/modals/ZoomModal';
import { ApiKeyModal } from './components/modals/ApiKeyModal';
import { ArchiveModal } from './components/modals/ArchiveModal';
import { LegalModal } from './components/modals/LegalModal';
import { AmbientBackground } from './components/ui/AmbientBackground';

// Types & Assets
import { ProcessedPage } from './types';
import png4 from './assets/png4.png';
import png5 from './assets/png5.png';
import { autoPruneArchives } from './db/archive';

// ================= Dictionary =================

import { TRANSLATIONS, Language } from './i18n/translations';

type Theme = 'dark' | 'light';

const App: React.FC = () => {
  // --- Hooks ---
  const {
    pages,
    setPages, // Exposed for external manipulation
    isExtracting: isParsing, // Aliased to match UI
    handleFileUpload,
    handleDownloadZip,
    handleDownloadSingleImage
  } = useFileHandler();

  const {
    keyAuthorized,
    authMode,
    quota,
    setQuota,
    handleSaveLocalKey,
    handleSelectKey,
    verifyKey
  } = useAuth();

  const {
    isProcessing,
    isStopped,
    isStopping,
    currentProcessingIndex,
    resolution,
    setResolution,
    resolutionLocked,
    setResolutionLocked, // Needed for reset
    showCompletionBanner,
    setShowCompletionBanner,
    showStoppingToast,
    showErrorToast,
    errorToastMessage,
    startProcessing,
    stopProcessing
  } = useImageProcessing({
    pages,
    setPages, // Passing setPages to allow updating status/url
    quota,
    setQuota,
    authMode,
    keyAuthorized,
    verifyKey,
    handleSelectKey
  });

  // --- UI State ---
  const [lang, setLang] = useState<Language>('cn');
  const [theme, setTheme] = useState<Theme>('dark');
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalInitialTab, setLegalInitialTab] = useState<'privacy' | 'terms'>('privacy');
  const [uploadMode, setUploadMode] = useState<'pdf' | 'image'>('pdf');
  const [showUploadWarning, setShowUploadWarning] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false); // Track if user downloaded

  // Export State
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingPptx, setIsExportingPptx] = useState(false);

  // Constants
  const t = TRANSLATIONS[lang];

  // --- Init Effects ---
  useEffect(() => {
    // Prune old archives on mount
    autoPruneArchives();
  }, []);

  // --- Theme Sync ---
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // --- Helper Functions ---
  const toggleTheme = (event: React.MouseEvent) => {
    // @ts-ignore
    if (!document.startViewTransition) {
      setTheme(prev => prev === 'dark' ? 'light' : 'dark');
      return;
    }
    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    // @ts-ignore
    const transition = document.startViewTransition(() => {
      setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    });
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
        { duration: 500, easing: 'ease-in', pseudoElement: '::view-transition-new(root)' }
      );
    });
  };

  const toggleLanguage = () => setLang(prev => prev === 'en' ? 'cn' : 'en');

  const onReset = () => {
    setPages([]);
    setHasDownloaded(false);
    setShowCompletionBanner(false);
    setShowUploadWarning(false);
  };

  // --- Export Wrappers ---
  const doExportPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    await new Promise(r => setTimeout(r, 50));
    try {
      const completedPages = pages.filter(p => p.status === 'completed');
      generatePdf(completedPages);
      setHasDownloaded(true);
    } catch (error) {
      console.error("Export PDF failed", error);
      alert("Failed to export PDF");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const doExportPptx = async () => {
    if (isExportingPptx) return;
    setIsExportingPptx(true);
    await new Promise(r => setTimeout(r, 50));
    try {
      const completedPages = pages.filter(p => p.status === 'completed');
      await generatePptx(completedPages);
      setHasDownloaded(true);
    } catch (error) {
      console.error("Export PPTX failed", error);
      alert("Failed to export PPTX");
    } finally {
      setIsExportingPptx(false);
    }
  };

  const doDownloadZip = async () => {
    try {
      const completedPages = pages.filter(p => p.status === 'completed');
      await generateZip(completedPages); // Use the service directly
      setHasDownloaded(true);
    } catch (error) {
      console.error("ZIP Error", error);
      alert("Failed to generate ZIP");
    }
  }

  // --- Upload Wrapper to handle Checks ---
  // We need to attach this to the input change event
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!keyAuthorized) {
      setIsKeyModalOpen(true);
      e.target.value = '';
      return;
    }
    // Check mode
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') setUploadMode('pdf');
      else if (file.type.startsWith('image/')) setUploadMode('image');
    }

    // Reset Logic before processing
    setShowCompletionBanner(false);
    setHasDownloaded(false);

    // Call hook
    handleFileUpload(e);
  };

  const handleUploadNewClick = () => {
    const completedCount = pages.filter(p => p.status === 'completed').length;

    if (showUploadWarning) {
      setShowUploadWarning(false);
      triggerUpload();
      return;
    }
    if (completedCount > 0 && !hasDownloaded) {
      setShowUploadWarning(true);
      setTimeout(() => setShowUploadWarning(false), 5000);
      return;
    }
    triggerUpload();
  };

  const triggerUpload = () => {
    const input = document.getElementById('pdf-upload-global') as HTMLInputElement;
    if (input) {
      input.value = '';
      input.click();
    }
  };

  // --- Selection Logic ---
  const toggleSelection = (index: number) => {
    if (isProcessing) return;
    setPages(prev => prev.map((p, i) => i === index ? { ...p, selected: !p.selected } : p));
  };
  const selectAll = () => {
    if (isProcessing) return;
    setPages(prev => prev.map(p => ({ ...p, selected: true })));
  };
  const deselectAll = () => {
    if (isProcessing) return;
    setPages(prev => prev.map(p => ({ ...p, selected: false })));
  };

  const completedCount = pages.filter(p => p.status === 'completed').length;
  const progress = pages.length > 0 ? (completedCount / pages.length) * 100 : 0;
  const isAllComplete = pages.length > 0 && completedCount === pages.length;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-body transition-colors duration-0 overflow-x-hidden relative">

      {/* Global Hidden File Input */}
      <input
        type="file"
        multiple
        accept="application/pdf, image/png, image/jpeg, image/jpg, image/webp"
        onChange={onFileChange}
        className="hidden"
        id="pdf-upload-global"
        disabled={isParsing}
      />

      <AmbientBackground />

      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Static Blobs (kept) */}
        <div className="hidden dark:block absolute top-[-15%] left-[10%] w-[50%] h-[500px] bg-indigo-900/20 blur-[120px] rounded-full mix-blend-screen animate-pulse"></div>
        <div className="hidden dark:block absolute bottom-[-10%] right-[5%] w-[45%] h-[500px] bg-purple-900/15 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/80 dark:to-zinc-950/80"></div>
      </div>

      <Header
        t={t}
        lang={lang}
        theme={theme}
        keyAuthorized={keyAuthorized}
        quota={quota}
        toggleTheme={toggleTheme}
        toggleLanguage={toggleLanguage}
        handleSelectKey={() => setIsKeyModalOpen(true)} // Changed to just open modal
        openKeyModal={() => setIsKeyModalOpen(true)}
        onReset={onReset}
        onOpenArchive={() => setIsArchiveModalOpen(true)}
      />

      <main className="relative z-10 flex-1 max-w-5xl mx-auto px-6 py-12 w-full flex flex-col gap-8">

        {/* Empty State / Upload Area */}
        {pages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-10 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-heading mb-6 text-zinc-900 dark:text-white">
                {lang === 'en' ? 'Reimagine your ' : '重塑您的 '}
                <span className="italic">NotebookLM</span>
                {lang === 'en' ? ' documents.' : ' 文档。'}
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl mx-auto">
                {t.description}
              </p>
            </div>

            {!keyAuthorized && (
              <div className="w-full max-w-xl mb-8 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-start gap-4 shadow-sm animate-in slide-in-from-bottom-2">
                <div className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-1">{t.keyGuideTitle}</h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed mb-3">
                    {t.keyGuideDesc}
                  </p>
                  <button
                    onClick={() => setIsKeyModalOpen(true)}
                    className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {t.connectBtn} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            <div className="w-full max-w-xl">
              <label
                htmlFor="pdf-upload-global"
                className={`group relative flex flex-col items-center justify-center p-16 w-full border border-dashed rounded-3xl transition-all cursor-pointer backdrop-blur-sm shadow-sm overflow-hidden ${keyAuthorized
                  ? "border-zinc-300 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 hover:border-indigo-500/50 dark:hover:border-indigo-400/50"
                  : "border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/5 opacity-80"
                  }`}
              >
                {keyAuthorized && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-500"></div>
                )}
                {isParsing ? (
                  <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
                ) : (
                  <div className="relative">
                    <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Upload className="relative w-12 h-12 text-zinc-400 group-hover:text-indigo-500 transition-colors mb-6 duration-300" />
                  </div>
                )}
                <h3 className="text-xl font-medium text-zinc-900 dark:text-white mb-2 relative z-10">
                  {isParsing ? t.extracting : t.uploadTitle}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center relative z-10 max-w-xs">
                  {t.uploadDesc}
                </p>
              </label>
            </div>

            {/* Comparison Demo Section */}
            <div className="w-full max-w-4xl mx-auto mt-24 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <div className="flex flex-col md:flex-row gap-8 md:gap-12 justify-center items-center">

                {/* Before */}
                <div className="relative group cursor-zoom-in w-full md:w-[45%] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-white/10 bg-black" onClick={() => setZoomedImage(png4)}>
                  <div className="absolute top-4 left-4 bg-black/60 text-white/90 text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-md z-20 border border-white/10 shadow-lg tracking-wide uppercase">
                    {lang === 'en' ? 'Original' : '修复前'}
                  </div>
                  <img src={png4} alt="Original" className="w-full h-full object-cover opacity-60 hover:opacity-80 hover:scale-105 transition-all duration-700" />
                </div>

                <ArrowRight className="w-5 h-5 text-zinc-300/50 dark:text-zinc-700 p-0.5 border border-zinc-300/30 dark:border-white/10 rounded-full rotate-90 md:rotate-0" />

                {/* After */}
                <div className="relative group cursor-zoom-in w-full md:w-[45%] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-indigo-500/20 dark:border-indigo-400/20 ring-1 ring-indigo-500/20 dark:ring-indigo-400/10 bg-black" onClick={() => setZoomedImage(png5)}>
                  <div className="absolute top-4 left-4 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-md z-20 shadow-lg shadow-indigo-500/20 tracking-wide uppercase">
                    {lang === 'en' ? 'Pro RESTORED' : 'PRO 修复后'}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur text-white/90 text-[9px] font-mono px-2 py-1 rounded border border-white/10">
                    4K Ultra HD
                  </div>
                  <img src={png5} alt="Restored" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />

                  {/* Sheen Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-indigo-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Social Proof (Testimonial) */}
            <div className="mt-8 mb-12">
              <Testimonial lang={lang} />
            </div>
          </div>
        )}

        <ActionBar
          t={t}
          lang={lang}
          pages={pages}
          completedCount={completedCount}
          progress={progress}
          isAllComplete={isAllComplete}
          resolution={resolution}
          setResolution={setResolution}
          resolutionLocked={resolutionLocked}
          authMode={authMode}
          keyAuthorized={keyAuthorized}
          setIsKeyModalOpen={setIsKeyModalOpen}
          isProcessing={isProcessing}
          isStopping={isStopping}
          isStopped={isStopped}
          startProcessing={startProcessing}
          stopProcessing={stopProcessing}
          handleExportPdf={doExportPdf}
          isExportingPdf={isExportingPdf}
          handleExportPptx={doExportPptx}
          isExportingPptx={isExportingPptx}
          handleDownloadZip={doDownloadZip}
          uploadMode={uploadMode}
        />

        <ImageGrid
          pages={pages}
          isProcessing={isProcessing}
          completedCount={completedCount}
          t={t}
          lang={lang}
          selectAll={selectAll}
          deselectAll={deselectAll}
          toggleSelection={toggleSelection}
          setViewingIndex={setViewingIndex}
          handleDownloadSingleImage={handleDownloadSingleImage}
          currentProcessingIndex={currentProcessingIndex}
          resolution={resolution}
        />

      </main>

      {/* Disclaimer Section - Restored as requested */}
      <div className="max-w-3xl mx-auto px-6 mb-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
        <div className="relative group overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-transparent to-red-500/5 dark:from-amber-500/10 dark:to-red-500/10 p-5">
          {/* Red-Gold Border Effect */}
          <div className="absolute inset-0 border-l-4 border-l-amber-500/80 pointer-events-none"></div>

          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                {t.disclaimerTitle}
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed text-justify">
                {t.disclaimerText}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer t={t} onOpenLegal={(tab) => {
        setLegalInitialTab(tab);
        setIsLegalModalOpen(true);
      }} />

      <CompletionBanner
        show={showCompletionBanner}
        isStopped={isStopped}
        t={t}
        lang={lang}
        completedCount={completedCount}
        handleExportPdf={doExportPdf}
        isExportingPdf={isExportingPdf}
        handleExportPptx={doExportPptx}
        isExportingPptx={isExportingPptx}
        handleDownloadZip={doDownloadZip}
        uploadMode={uploadMode}
        onUploadClick={handleUploadNewClick}
        showUploadWarning={showUploadWarning}
        onClose={() => setShowCompletionBanner(false)}
      />

      <Toast show={showStoppingToast} message={lang === 'en' ? 'Stopping after this page...' : '本页完成后停止...'} />
      <Toast show={showErrorToast} message={errorToastMessage} />

      <ComparisonModal
        viewingIndex={viewingIndex}
        pages={pages}
        onClose={() => setViewingIndex(null)}
        onNavigate={setViewingIndex}
        t={t}
        lang={lang}
      />

      <ZoomModal zoomedImage={zoomedImage} onClose={() => setZoomedImage(null)} />

      <ArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        lang={lang}
      />

      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onSave={(key, newQuota) => {
          handleSaveLocalKey(key, newQuota);
          setIsKeyModalOpen(false);
        }}
        lang={lang}
      />

      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        lang={lang}
        initialTab={legalInitialTab}
      />

    </div>
  );
};

export default App;