
export interface ProcessedPage {
  originalUrl: string;
  processedUrl: string | null;
  pageIndex: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  width: number;
  height: number;
  aspectRatio: number; // width / height
  resolution?: '2K' | '4K'; // Track which resolution was used
  selected: boolean;
}

export interface ProcessingStats {
  total: number;
  completed: number;
  failed: number;
  startTime: number;
}

// Augment window for AI Studio key selection
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    pdfjsLib: any;
  }
}

export interface QuotaInfo {
  total: number;
  remaining: number;
}
