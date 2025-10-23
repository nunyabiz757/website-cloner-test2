export interface OptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'original';
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill';
  };
  progressive?: boolean;
  stripMetadata?: boolean;
  generateResponsive?: boolean;
  convertToModernFormats?: boolean;
  lazyLoad?: boolean;
}

export interface ImageResult {
  original: {
    url: string;
    size: number;
    format: string;
    width: number;
    height: number;
  };
  optimized: {
    data: Buffer;
    size: number;
    format: string;
    width: number;
    height: number;
    base64?: string;
  };
  webp?: {
    data: Buffer;
    size: number;
    base64?: string;
  };
  avif?: {
    data: Buffer;
    size: number;
    base64?: string;
  };
  responsive?: Array<{
    width: number;
    data: Buffer;
    size: number;
  }>;
  savings: {
    bytes: number;
    percentage: number;
  };
}

export interface Asset {
  url: string;
  type: 'image' | 'css' | 'js' | 'font' | 'video' | 'other';
  size: number;
  compressedSize?: number;
  optimizationPotential: number;
  issues: string[];
  recommendations: string[];
}

export interface OptimizationResult {
  issueId: string;
  success: boolean;
  changes: OptimizationChange[];
  error?: string;
}

export interface OptimizationChange {
  type: 'add' | 'modify' | 'remove';
  file: string;
  description: string;
  bytesSaved?: number;
}

export interface PerformanceFix {
  id: string;
  name: string;
  description: string;
  category: 'images' | 'css' | 'js' | 'html' | 'fonts' | 'caching' | 'network';
  impact: 'low' | 'medium' | 'high' | 'critical';
  risk: 'safe' | 'moderate' | 'aggressive';
  estimatedImprovement: string;
  dependencies: string[];
  conflicts: string[];
  enabled: boolean;
  applied: boolean;
  canRollback: boolean;
}

export interface FixSession {
  sessionId: string;
  mode: 'live' | 'test';
  appliedFixes: FixApplicationResult[];
  availableFixes: PerformanceFix[];
  currentState: any;
  originalState: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface FixApplicationResult {
  fixId: string;
  success: boolean;
  applied: boolean;
  beforeState: any;
  afterState: any;
  improvements: Array<{
    metric: string;
    before: number;
    after: number;
    improvement: string;
  }>;
  warnings: string[];
  errors: string[];
  rollbackData?: any;
}

export interface PerformanceMetricsEstimate {
  fcp: number;
  lcp: number;
  cls: number;
  tbt: number;
  tti: number;
  totalSize: number;
  totalRequests: number;
  timestamp: string;
}

export interface AuditResult {
  summary: {
    overallScore: number;
    performanceScore: number;
    optimizationScore: number;
    securityScore: number;
    totalIssues: number;
    criticalIssues: number;
  };
  assets: Asset[];
  metrics: PerformanceMetricsEstimate;
  recommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    impact: string;
    effort: 'easy' | 'medium' | 'hard';
  }>;
  executionTime: number;
}
