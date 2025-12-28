import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import { ProcessedPage } from '../types';

// Convert PDF file to array of base64 images
export const parsePdfToImages = async (file: File): Promise<ProcessedPage[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: ProcessedPage[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better input quality

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) continue;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    const dataUrl = canvas.toDataURL('image/png');

    pages.push({
      originalUrl: dataUrl,
      processedUrl: null,
      pageIndex: i,
      status: 'pending',
      width: viewport.width,
      height: viewport.height,
      aspectRatio: viewport.width / viewport.height,
      selected: true
    });
  }

  return pages;
};

// Generate final PDF - only includes pages with processedUrl
export const generatePdf = (pages: ProcessedPage[]): void => {
  if (pages.length === 0) return;

  // Filter to only completed pages that have processedUrl
  const completedPages = pages.filter(p => p.processedUrl);
  if (completedPages.length === 0) return;

  // Create PDF with first page's dimensions
  const firstPage = completedPages[0];
  const doc = new jsPDF({
    orientation: firstPage.width > firstPage.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [firstPage.width, firstPage.height]
  });

  completedPages.forEach((page, index) => {
    // For pages after the first, add a new page with THAT page's specific dimensions
    if (index > 0) {
      doc.addPage(
        [page.width, page.height],
        page.width > page.height ? 'landscape' : 'portrait'
      );
    }

    // Use processedUrl (guaranteed to exist due to filter)
    doc.addImage(
      page.processedUrl!,
      'PNG',
      0,
      0,
      page.width,
      page.height,
      undefined,
      'FAST'
    );
  });

  doc.save('upscaled_document.pdf');
};

// Generate PPTX
export const generatePptx = async (pages: ProcessedPage[]): Promise<void> => {
  if (pages.length === 0) return;

  const pptx = new PptxGenJS();

  // Define layout based on the first page roughly, though PPTX usually uses standard sizes.
  // We will force a custom layout to match the aspect ratio of the first page if possible,
  // or just center the images on a standard slide.

  // Strategy: Center image on slide maintaining aspect ratio.

  pages.forEach((page) => {
    const slide = pptx.addSlide();

    const imageToUse = page.processedUrl || page.originalUrl;

    // PptxGenJS uses inches or percentages. We'll use percentages for full coverage.
    // However, to keep aspect ratio valid if the slide doesn't match, we let PptxGenJS handle fit.

    slide.addImage({
      data: imageToUse,
      x: 0,
      y: 0,
      w: '100%',
      h: '100%',
      sizing: { type: 'contain', w: '100%', h: '100%' }
    });
  });

  await pptx.writeFile({ fileName: 'upscaled_presentation.pptx' });
};

// Generate ZIP (Images)
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const generateZip = async (pages: ProcessedPage[]): Promise<void> => {
  if (pages.length === 0) return;

  const zip = new JSZip();
  const folder = zip.folder("upscaled_images");
  if (!folder) return;

  const completedPages = pages.filter(p => p.processedUrl);
  if (completedPages.length === 0) return;

  completedPages.forEach((page) => {
    if (!page.processedUrl) return;
    // Convert Data URL to base64 string (remove prefix)
    const base64Data = page.processedUrl.split(',')[1];
    const fileName = `image_${page.pageIndex.toString().padStart(3, '0')}.png`;
    folder.file(fileName, base64Data, { base64: true });
  });

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "upscaled_images.zip");
};