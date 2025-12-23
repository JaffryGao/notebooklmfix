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
      aspectRatio: viewport.width / viewport.height
    });
  }

  return pages;
};

// Generate final PDF
export const generatePdf = (pages: ProcessedPage[]): void => {
  if (pages.length === 0) return;

  const doc = new jsPDF({
    orientation: pages[0].width > pages[0].height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [pages[0].width, pages[0].height] // Initial format based on first page
  });

  pages.forEach((page, index) => {
    if (index > 0) {
      doc.addPage([page.width, page.height], page.width > page.height ? 'landscape' : 'portrait');
    }

    const imageToUse = page.processedUrl || page.originalUrl;
    
    // We add the image to fill the page
    doc.addImage(
      imageToUse, 
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