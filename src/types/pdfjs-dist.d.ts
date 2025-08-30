// src/types/pdfjs-dist.d.ts
declare module 'pdfjs-dist' {
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
  
  export const version: string;
  
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }
  
  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
  }
  
  export interface TextContent {
    items: Array<{
      str: string;
      [key: string]: any;
    }>;
  }
  
  export interface PDFLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }
  
  export function getDocument(options: {
    data: ArrayBuffer | Uint8Array | string;
    [key: string]: any;
  }): PDFLoadingTask;
}
