export interface Framework {
  name: string;
  version?: string;
  confidence: number;
  indicators: string[];
}

export interface FrameworkAnalysis {
  frameworks: Framework[];
  cssFrameworks: string[];
  libraries: string[];
  recommendations: string[];
}

export type ComponentType =
  // Layout
  | 'header' | 'footer' | 'hero' | 'navigation' | 'sidebar'
  | 'card' | 'grid' | 'row' | 'container'
  // Form
  | 'form' | 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file-upload'
  // Interactive
  | 'modal' | 'accordion' | 'tabs' | 'toggle' | 'carousel' | 'gallery'
  | 'alert' | 'flip-box'
  // Content
  | 'icon-box' | 'star-rating' | 'pricing-table' | 'testimonial' | 'cta'
  | 'feature-box' | 'team-member' | 'blog-card' | 'product-card'
  // Media
  | 'video-embed' | 'maps' | 'social-feed'
  // Navigation
  | 'breadcrumbs' | 'pagination' | 'search-bar'
  // Data
  | 'table' | 'list' | 'progress-bar' | 'counter' | 'countdown'
  // Text
  | 'blockquote' | 'code-block'
  // Social
  | 'social-icons' | 'social-share'
  // Basic
  | 'button' | 'heading' | 'text' | 'paragraph' | 'image' | 'icon'
  | 'spacer' | 'divider'
  | 'unknown';

export interface RecognitionPattern {
  componentType: ComponentType;
  patterns: {
    tagNames?: string[];
    classKeywords?: string[];
    ariaRole?: string;
    cssProperties?: (styles: ExtractedStyles, element: any) => boolean;
    contextRequired?: {
      insideForm?: boolean;
      hasIcon?: boolean;
    };
  };
  confidence: number;
  priority: number;
}

export interface ExtractedStyles {
  display?: string;
  position?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gridTemplateColumns?: string;
  padding?: { top: number; right: number; bottom: number; left: number };
  margin?: { top: number; right: number; bottom: number; left: number };
  width?: string;
  height?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  lineHeight?: string;
  textAlign?: string;
  color?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  borderRadius?: { topLeft: string; topRight: string; bottomRight: string; bottomLeft: string };
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: string;
  boxShadow?: string;
  cursor?: string;
}

export interface ElementContext {
  depth: number;
  parentType?: ComponentType;
  isInsideForm: boolean;
  siblings: number;
}

export interface RecognitionResult {
  componentType: ComponentType;
  confidence: number;
  matchedPatterns: string[];
  manualReviewNeeded: boolean;
  reason: string;
}

export interface RecognizedComponent {
  componentType: ComponentType;
  element: {
    tagName: string;
    classes: string[];
    styles: ExtractedStyles;
    textContent?: string;
    innerHTML?: string;
  };
  props: Record<string, any>;
  confidence: number;
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
    _column_size?: number;
    padding?: { top: number; right: number; bottom: number; left: number; unit: string };
  };
  elements: ElementorWidget[];
}

export interface ElementorSection {
  id: string;
  elType: 'section';
  settings: {
    layout?: 'boxed' | 'full_width';
    gap?: 'default' | 'no' | 'narrow';
    background_color?: string;
    padding?: { top: number; right: number; bottom: number; left: number; unit: string };
  };
  elements: ElementorColumn[];
}

export interface ElementorExport {
  version: string;
  title: string;
  type: 'page' | 'post';
  content: ElementorSection[];
}

export interface GutenbergBlock {
  blockName: string;
  attrs: Record<string, any>;
  innerBlocks?: GutenbergBlock[];
  innerHTML?: string;
}

export interface GutenbergExport {
  title: string;
  content: string;
  blocks: GutenbergBlock[];
}

export interface DetectionResult {
  frameworks: FrameworkAnalysis;
  components: RecognizedComponent[];
  totalComponents: number;
  recommendations: string[];
}
