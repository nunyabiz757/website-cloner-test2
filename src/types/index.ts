export interface CloneOptions {
  type: 'url' | 'upload';
  source: string;
  depth?: number;
  followLinks?: boolean;
  respectRobots?: boolean;
  includeAssets?: boolean;
  useBrowserAutomation?: boolean; // Enable Playwright for dynamic content
  captureResponsive?: boolean; // Enable responsive breakpoint detection (Phase 2)
  captureInteractive?: boolean; // Enable interactive state detection (Phase 3)
  captureAnimations?: boolean; // Enable animation detection (Phase 4)
  captureStyleAnalysis?: boolean; // Enable advanced style analysis (Phase 5)
  captureNavigation?: boolean; // Enable navigation detection (Phase 6)
  onProgress?: (progress: number, step: string) => void;
}

export interface CloneProject {
  id: string;
  source: string;
  type: 'url' | 'upload';
  status: 'pending' | 'cloning' | 'analyzing' | 'optimizing' | 'completed' | 'error';
  progress: number;
  currentStep: string;
  createdAt: Date;
  originalHtml?: string;
  optimizedHtml?: string;
  originalScore?: number;
  optimizedScore?: number;
  metrics?: PerformanceMetrics;
  assets?: ClonedAsset[];
  archived?: boolean;
  metadata?: WebsiteMetadata;
  detection?: any; // Component detection results
}

export interface ClonedAsset {
  type: 'image' | 'css' | 'js' | 'font' | 'other';
  originalUrl: string;
  localPath: string;
  size: number;
  optimizedSize?: number;
  content?: string;
  format?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface WebsiteMetadata {
  title: string;
  description?: string;
  favicon?: string;
  framework: string;
  responsive: boolean;
  totalSize: number;
  assetCount: number;
  pageCount: number;
  responsiveData?: {
    breakpoints: number;
    mediaQueries: number;
    responsivePercentage: number;
  };
  interactiveData?: {
    totalInteractive: number;
    withHover: number;
    withFocus: number;
    withActive: number;
    withPseudoElements: number;
  };
  animationData?: {
    totalAnimated: number;
    withAnimations: number;
    withTransitions: number;
    withTransforms: number;
    keyframes: number;
  };
  styleAnalysisData?: {
    totalColors: number;
    primaryColors: string[];
    totalFonts: number;
    elementsWithShadows: number;
    elementsWithFilters: number;
    maxZIndex: number;
  };
  navigationData?: {
    totalNavigations: number;
    byType: Record<string, number>;
    byMethod: Record<string, number>;
    components: Array<{
      selector: string;
      type: string;
      confidence: number;
      linkCount: number;
      detectionMethod: string;
    }>;
  };
}

export interface PerformanceMetrics {
  score: number;
  coreWebVitals: CoreWebVitals;
  additionalMetrics: AdditionalMetrics;
  resourceMetrics: ResourceMetrics;
  htmlSize: number;
  cssSize: number;
  jsSize: number;
  imageSize: number;
  totalSize: number;
  imageCount: number;
  externalResources: number;
  renderBlockingResources: number;
  issues: PerformanceIssue[];
  recommendations: string[];
  lighthouse?: LighthouseResults;
}

export interface LighthouseResults {
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  metrics: {
    lcp: number;
    fcp: number;
    cls: number;
    inp: number;
    tbt: number;
    speedIndex: number;
    tti: number;
    ttfb: number;
  };
  opportunities: LighthouseOpportunity[];
  diagnostics: LighthouseDiagnostic[];
}

export interface LighthouseOpportunity {
  title: string;
  description: string;
  savings: number;
  savingsMs?: number;
  impact: 'high' | 'medium' | 'low';
}

export interface LighthouseDiagnostic {
  title: string;
  description: string;
  value: string | number;
}

export interface CoreWebVitals {
  lcp: LargestContentfulPaint;
  fid?: FirstInputDelay;
  inp: InteractionToNextPaint;
  cls: CumulativeLayoutShift;
  fcp: FirstContentfulPaint;
  ttfb: TimeToFirstByte;
}

export interface LargestContentfulPaint {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  element?: string;
  renderTime?: number;
  loadTime?: number;
  size?: number;
}

export interface FirstInputDelay {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  eventType?: string;
  processingTime?: number;
}

export interface InteractionToNextPaint {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  worstInteraction?: {
    duration: number;
    target: string;
    eventType: string;
  };
  totalInteractions: number;
}

export interface CumulativeLayoutShift {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  shifts: LayoutShift[];
}

export interface LayoutShift {
  value: number;
  elements: string[];
  timestamp: number;
}

export interface FirstContentfulPaint {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  paintTiming?: number;
}

export interface TimeToFirstByte {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationStart?: number;
  responseStart?: number;
}

export interface AdditionalMetrics {
  tbt: TotalBlockingTime;
  speedIndex: SpeedIndex;
  tti: TimeToInteractive;
}

export interface TotalBlockingTime {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  longTasksCount: number;
  totalBlockingDuration: number;
}

export interface SpeedIndex {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  visualProgress?: VisualProgress[];
}

export interface VisualProgress {
  timestamp: number;
  progress: number;
}

export interface TimeToInteractive {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  firstCpuIdle?: number;
  networkIdle?: number;
}

export interface ResourceMetrics {
  resources: ResourceTiming[];
  longTasks: LongTask[];
  networkRequests: NetworkRequest[];
  totalPageSize: PageSizeBreakdown;
}

export interface ResourceTiming {
  url: string;
  type: 'script' | 'stylesheet' | 'image' | 'font' | 'document' | 'other';
  duration: number;
  size: number;
  renderBlocking: boolean;
  transferSize?: number;
  decodedSize?: number;
}

export interface LongTask {
  duration: number;
  startTime: number;
  attribution?: string;
}

export interface NetworkRequest {
  url: string;
  method: string;
  status: number;
  size: number;
  cached: boolean;
  blocking: boolean;
  duration: number;
}

export interface PageSizeBreakdown {
  total: number;
  html: number;
  css: number;
  js: number;
  images: number;
  fonts: number;
  videos: number;
  other: number;
}

export interface PerformanceIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: number;
  fix?: string;
}

export interface Optimization {
  id: string;
  name: string;
  description: string;
  category: 'html' | 'css' | 'js' | 'images' | 'performance';
  applied: boolean;
  impact: 'high' | 'medium' | 'low';
  savings?: {
    size?: number;
    requests?: number;
    score?: number;
  };
}

export interface ElementorWidget {
  id: string;
  elType: 'widget';
  widgetType: string;
  settings: Record<string, any>;
}

export interface ElementorColumn {
  id: string;
  elType: 'column';
  settings: {
    _column_size: number;
    [key: string]: any;
  };
  elements: ElementorWidget[];
}

export interface ElementorSection {
  id: string;
  elType: 'section';
  settings: {
    layout?: string;
    gap?: string;
    background_background?: string;
    background_color?: string;
    padding?: Record<string, number>;
    [key: string]: any;
  };
  elements: ElementorColumn[];
}

export interface ElementorExport {
  content: ElementorSection[];
  settings: Record<string, any>;
  metadata: {
    version: string;
    type: string;
    created: string;
  };
}

export interface WordPressBuilder {
  id: string;
  name: string;
  description: string;
  icon: string;
  popular: boolean;
  exportFormat: 'json' | 'shortcode' | 'html';
}

export interface ExportOptions {
  format: 'html' | 'wordpress-theme' | 'wordpress-builder' | 'static-site' | 'react';
  builder?: string;
  includeAssets?: boolean;
  includeSourceMaps?: boolean;
  minify?: boolean;
}

export interface ExportResult {
  downloadUrl: string;
  format: string;
  size: number;
  instructions: string;
}
