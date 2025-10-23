export type PageBuilder =
  | 'plugin-free'
  | 'elementor'
  | 'gutenberg'
  | 'divi'
  | 'beaver-builder'
  | 'bricks'
  | 'oxygen'
  | 'kadence'
  | 'brizy'
  | 'optimizepress'
  | 'crocoblock';

export interface WordPressExportOptions {
  html: string;
  css: string[];
  js: string[];
  images: string[];
  fonts?: string[];
  assets?: Map<string, Buffer>;

  targetBuilder: PageBuilder;

  themeName?: string;
  themeAuthor?: string;
  themeDescription?: string;
  themeVersion?: string;

  pluginFree?: boolean;
  verifyPluginFree?: boolean;
  eliminateDependencies?: boolean;
  embedAssets?: boolean;
  validateBudget?: boolean;
  budgetOverride?: boolean;

  assetEmbeddingOptions?: {
    inlineThreshold?: number;
    imageThreshold?: number;
    enableBase64?: boolean;
    enableInlineSVG?: boolean;
    uploadToWordPress?: boolean;
  };

  customBudget?: PerformanceBudget;
}

export interface WordPressExportResult {
  success: boolean;
  exportId: string;
  zipPath: string;
  zipBlob?: Blob;
  files: {
    php: string[];
    css: string[];
    js: string[];
    images: string[];
    templates?: string[];
  };
  instructions: string;
  verificationReport?: VerificationReport;
  eliminationResults?: EliminationResult;
  embeddingResult?: EmbeddingResult;
  budgetValidation?: BudgetValidationResult;
  metadata: {
    builder: PageBuilder;
    createdAt: string;
    totalSize: number;
    fileCount: number;
  };
}

export interface VerificationReport {
  isPluginFree: boolean;
  score: number;
  summary: {
    totalChecks: number;
    passed: number;
    warnings: number;
    critical: number;
  };
  dependencies: DependencyCheck[];
  fileAnalysis: {
    php: FileAnalysisResult[];
    html: FileAnalysisResult[];
    css: FileAnalysisResult[];
    js: FileAnalysisResult[];
  };
  recommendations: string[];
  timestamp: Date;
}

export interface DependencyCheck {
  type: 'plugin' | 'theme' | 'external-script' | 'shortcode';
  name: string;
  detected: boolean;
  location: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
}

export interface FileAnalysisResult {
  filePath: string;
  size: number;
  dependencies: string[];
  pluginReferences: string[];
  isClean: boolean;
}

export interface EliminationResult {
  success: boolean;
  removed: string[];
  converted: string[];
  warnings: string[];
  originalSize: number;
  newSize: number;
  cleanedContent: string;
}

export interface EmbeddingResult {
  success: boolean;
  html: string;
  stats: {
    totalAssets: number;
    inlinedAssets: number;
    base64Assets: number;
    wordPressAssets: number;
    externalAssets: number;
    originalSize: number;
    processedSize: number;
    sizeIncrease: number;
  };
  decisions: AssetDecision[];
  recommendations: string[];
}

export interface AssetDecision {
  path: string;
  size: number;
  sizeFormatted: string;
  decision: 'inline' | 'wordpress' | 'external';
  reason: string;
  method?: 'base64' | 'raw';
}

export interface PerformanceBudget {
  html: {
    maxSize: number;
    maxLineLength?: number;
  };
  css: {
    maxSizePerFile: number;
    maxTotalSize: number;
  };
  js: {
    maxSizePerFile: number;
    maxTotalSize: number;
  };
  images: {
    maxSizePerImage: number;
    maxTotalSize: number;
  };
  page: {
    maxTotalSize: number;
    maxRequests?: number;
  };
  allowOverride: boolean;
}

export interface BudgetValidationResult {
  canExport: boolean;
  requiresOverride: boolean;
  summary: {
    totalChecks: number;
    passed: number;
    violations: number;
    totalViolations: number;
  };
  violations: BudgetViolation[];
  passed: BudgetCheck[];
}

export interface BudgetViolation {
  category: string;
  item: string;
  current: number;
  budget: number;
  exceeded: number;
  percentage: number;
  severity: 'critical' | 'warning';
  recommendation: string;
}

export interface BudgetCheck {
  category: string;
  current: number;
  budget: number;
  status: 'pass';
}

export interface ElementorElement {
  id: string;
  elType: 'section' | 'column' | 'widget';
  widgetType?: string;
  settings: Record<string, any>;
  elements?: ElementorElement[];
}

export interface GutenbergBlock {
  blockName: string;
  attrs: Record<string, any>;
  innerBlocks?: GutenbergBlock[];
  innerHTML: string;
}
