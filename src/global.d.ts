export { };

declare global {
    interface Window {
        aistudio?: {
            hasSelectedApiKey: () => Promise<boolean>;
            openSelectKey: () => Promise<void>;
        };
        pdfjsLib: any;
    }
}
