export interface GHLConversionResult {
  success: boolean;
  conversionScore: number; // 0-100 (pixel-perfect accuracy)
  originalUrl: string;
  ghlHTML: string;
  ghlJSON?: any; // For future API import
  assets: GHLAsset[];
  warnings: string[];
  errors: string[];
  stats: {
    elementsConverted: number;
    elementsSkipped: number;
    stylesInlined: number;
    assetsOptimized: number;
    responsiveBreakpoints: number;
    animationsPreserved: number;
  };
}

export interface GHLAsset {
  originalUrl: string;
  ghlUrl?: string; // After upload to GHL
  type: 'image' | 'font' | 'css' | 'js';
  size: number;
  optimized: boolean;
}

export interface GHLElement {
  type: 'section' | 'row' | 'column' | 'widget';
  id: string;
  classes: string[];
  inlineStyles: string;
  children: GHLElement[];
  content?: string;
  attributes: Record<string, string>;
}

export interface GHLAPICredentials {
  apiKey: string;
  locationId?: string;
}

export interface GHLAccount {
  id: string;
  name: string;
  locationId: string;
}

export interface GHLFunnel {
  id: string;
  name: string;
  pages: GHLPage[];
}

export interface GHLPage {
  id: string;
  name: string;
  url: string;
  html: string;
}

export interface GHLSettings {
  apiKey: string;
  locationId: string;
  autoImport: boolean;
  preserveAnimations: boolean;
  optimizeImages: boolean;
}

// GHL-to-GHL Cloning Types
export interface GHLLocation {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

export interface GHLWebsite {
  id: string;
  name: string;
  url: string;
  locationId: string;
  pages: GHLPage[];
}

export interface GHLCloneScope {
  type: 'single-page' | 'entire-funnel' | 'entire-website';
  sourceUrl: string;
}

export interface GHLCloneDestination {
  type: 'new-funnel' | 'existing-funnel' | 'new-website' | 'existing-website' | 'download-only';
  locationId?: string;
  funnelId?: string;
  websiteId?: string;
}

export interface GHLCustomCode {
  type: 'tracking-pixel' | 'custom-script' | 'head-code' | 'body-code' | 'footer-code';
  code: string;
  position: 'head' | 'body-start' | 'body-end';
  description?: string;
}

export interface GHLCloneResult {
  success: boolean;
  sourceUrl: string;
  cloneScope: GHLCloneScope['type'];
  destination: GHLCloneDestination;
  clonedPages: GHLPage[];
  clonedFunnels?: GHLFunnel[];
  clonedWebsites?: GHLWebsite[];
  customCodes: GHLCustomCode[];
  assets: GHLAsset[];
  warnings: string[];
  errors: string[];
  stats: {
    pagesCloned: number;
    assetsCloned: number;
    customCodesFound: number;
    totalSize: number;
  };
}
