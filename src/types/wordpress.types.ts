export interface WordPressDetection {
  isWordPress: boolean;
  version: string;
  pageBuilder: 'elementor' | 'divi' | 'gutenberg' | 'wpbakery' | 'beaver' | 'vanilla' | 'unknown';
  theme: string;
  plugins: string[];
  confidence: number; // 0-100
}

export interface WordPressElement {
  id: string;
  type: string; // 'section' | 'row' | 'column' | 'widget' | 'text' | 'image' | etc.
  tagName: string;
  classes: string[];
  styles: Record<string, string>;
  computedStyles: Record<string, string>;
  attributes: Record<string, string>;
  children: WordPressElement[];
  content?: string;
  dimensions: {
    width: number;
    height: number;
    top: number;
    left: number;
  };
  hoverStyles?: Record<string, string>;
  responsiveStyles?: {
    mobile: Record<string, string>;
    tablet: Record<string, string>;
    desktop: Record<string, string>;
  };
}

export interface WordPressPage {
  url: string;
  title: string;
  detection: WordPressDetection;
  elements: WordPressElement[];
  customCSS: string[];
  inlineStyles: string[];
  mediaQueries: MediaQuery[];
  fonts: FontDefinition[];
  images: ImageAsset[];
  scripts: string[];
  meta: Record<string, string>;
}

export interface MediaQuery {
  condition: string; // '@media (max-width: 768px)'
  rules: string;
}

export interface FontDefinition {
  family: string;
  url?: string;
  weight?: string;
  style?: string;
}

export interface ImageAsset {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  isBackground: boolean;
}
