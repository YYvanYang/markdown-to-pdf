declare module 'api2pdf' {
  export interface Api2PdfOptions {
    inline?: boolean;
    filename?: string;
    [key: string]: any;
  }

  export interface Api2PdfResult {
    pdf: string;
    mbIn: number;
    mbOut: number;
    cost: number;
    success: boolean;
    responseId: string;
    error?: string;
  }

  export interface WkHtmlToPdfOptions {
    landscape?: boolean;
    pageSize?: string;
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    [key: string]: any;
  }

  export interface ChromeToPdfOptions {
    landscape?: boolean;
    scale?: number;
    displayHeaderFooter?: boolean;
    printBackground?: boolean;
    [key: string]: any;
  }

  export interface LibreOfficeOptions {
    landscape?: boolean;
    [key: string]: any;
  }

  export interface HtmlToPdfParams {
    html: string;
    fileName?: string;
    options?: WkHtmlToPdfOptions;
    inline?: boolean;
    tag?: string;
  }

  export interface UrlToPdfParams {
    url: string;
    fileName?: string;
    options?: WkHtmlToPdfOptions;
    inline?: boolean;
    tag?: string;
  }

  export interface ChromeHtmlToPdfParams {
    html: string;
    fileName?: string;
    options?: ChromeToPdfOptions;
    inline?: boolean;
    tag?: string;
  }

  export interface ChromeUrlToPdfParams {
    url: string;
    fileName?: string;
    options?: ChromeToPdfOptions;
    inline?: boolean;
    tag?: string;
  }

  export interface WkHtmlToPdf {
    convertHtml(params: HtmlToPdfParams): Promise<Api2PdfResult>;
    convertUrl(params: UrlToPdfParams): Promise<Api2PdfResult>;
  }

  export interface ChromeToPdf {
    convertHtml(params: ChromeHtmlToPdfParams): Promise<Api2PdfResult>;
    convertUrl(params: ChromeUrlToPdfParams): Promise<Api2PdfResult>;
  }

  export interface LibreOffice {
    convert(file: File | string, fileName?: string, inline?: boolean, tag?: string): Promise<Api2PdfResult>;
  }

  export interface PdfSharp {
    merge(pdfUrls: string[], fileName?: string, inline?: boolean, tag?: string): Promise<Api2PdfResult>;
  }

  export default class Api2Pdf {
    constructor(apiKey: string);
    wkHtmlToPdf: WkHtmlToPdf;
    chromeToPdf: ChromeToPdf;
    libreOffice: LibreOffice;
    pdfSharp: PdfSharp;
  }
} 