import { loggingService } from '../LoggingService';
import type { WordPressElement } from '../../types/wordpress.types';

export class GHLStyleConverterService {
  /**
   * Extract hover state styles from WordPress element
   */
  extractHoverStyles(element: WordPressElement): string {
    if (!element.hoverStyles || Object.keys(element.hoverStyles).length === 0) {
      return '';
    }

    const styles: string[] = [];
    for (const [prop, value] of Object.entries(element.hoverStyles)) {
      if (value && value !== 'none' && value !== 'initial') {
        styles.push(`${prop}: ${value}`);
      }
    }

    return styles.join('; ');
  }

  /**
   * Convert responsive styles to GHL-compatible media queries
   */
  convertResponsiveStyles(
    element: WordPressElement,
    elementId: string
  ): string {
    if (!element.responsiveStyles) {
      return '';
    }

    let mediaQueries = '';

    // Mobile styles (max-width: 767px)
    if (element.responsiveStyles.mobile && Object.keys(element.responsiveStyles.mobile).length > 0) {
      const mobileStyles = this.stylesToString(element.responsiveStyles.mobile);
      mediaQueries += `@media (max-width: 767px) {\n  #${elementId} {\n    ${mobileStyles}\n  }\n}\n\n`;
    }

    // Tablet styles (768px - 1024px)
    if (element.responsiveStyles.tablet && Object.keys(element.responsiveStyles.tablet).length > 0) {
      const tabletStyles = this.stylesToString(element.responsiveStyles.tablet);
      mediaQueries += `@media (min-width: 768px) and (max-width: 1024px) {\n  #${elementId} {\n    ${tabletStyles}\n  }\n}\n\n`;
    }

    // Desktop styles (min-width: 1025px)
    if (element.responsiveStyles.desktop && Object.keys(element.responsiveStyles.desktop).length > 0) {
      const desktopStyles = this.stylesToString(element.responsiveStyles.desktop);
      mediaQueries += `@media (min-width: 1025px) {\n  #${elementId} {\n    ${desktopStyles}\n  }\n}\n\n`;
    }

    return mediaQueries;
  }

  /**
   * Extract CSS animations and transitions
   */
  extractAnimations(element: WordPressElement): {
    animations: string[];
    transitions: string[];
    keyframes: string[];
  } {
    const animations: string[] = [];
    const transitions: string[] = [];
    const keyframes: string[] = [];

    const allStyles = { ...element.computedStyles, ...element.styles };

    // Extract animation property
    if (allStyles.animation && allStyles.animation !== 'none') {
      animations.push(allStyles.animation);
    }

    // Extract animation-* properties
    const animationProps = [
      'animation-name',
      'animation-duration',
      'animation-timing-function',
      'animation-delay',
      'animation-iteration-count',
      'animation-direction',
      'animation-fill-mode',
      'animation-play-state',
    ];

    for (const prop of animationProps) {
      if (allStyles[prop] && allStyles[prop] !== 'none' && allStyles[prop] !== 'normal') {
        animations.push(`${prop}: ${allStyles[prop]}`);
      }
    }

    // Extract transition property
    if (allStyles.transition && allStyles.transition !== 'none') {
      transitions.push(allStyles.transition);
    }

    // Extract transition-* properties
    const transitionProps = [
      'transition-property',
      'transition-duration',
      'transition-timing-function',
      'transition-delay',
    ];

    for (const prop of transitionProps) {
      if (allStyles[prop] && allStyles[prop] !== 'none' && allStyles[prop] !== 'all') {
        transitions.push(`${prop}: ${allStyles[prop]}`);
      }
    }

    return { animations, transitions, keyframes };
  }

  /**
   * Generate GHL-compatible hover CSS
   */
  generateHoverCSS(elementId: string, hoverStyles: string): string {
    if (!hoverStyles) return '';

    return `#${elementId}:hover {\n  ${hoverStyles}\n}\n\n`;
  }

  /**
   * Generate GHL-compatible focus CSS
   */
  generateFocusCSS(elementId: string, focusStyles: string): string {
    if (!focusStyles) return '';

    return `#${elementId}:focus {\n  ${focusStyles}\n}\n\n`;
  }

  /**
   * Generate GHL-compatible active CSS
   */
  generateActiveCSS(elementId: string, activeStyles: string): string {
    if (!activeStyles) return '';

    return `#${elementId}:active {\n  ${activeStyles}\n}\n\n`;
  }

  /**
   * Extract transform properties
   */
  extractTransforms(element: WordPressElement): string[] {
    const transforms: string[] = [];
    const allStyles = { ...element.computedStyles, ...element.styles };

    const transformProps = [
      'transform',
      'transform-origin',
      'transform-style',
      'perspective',
      'perspective-origin',
    ];

    for (const prop of transformProps) {
      if (allStyles[prop] && allStyles[prop] !== 'none') {
        transforms.push(`${prop}: ${allStyles[prop]}`);
      }
    }

    return transforms;
  }

  /**
   * Extract box shadow and text shadow
   */
  extractShadows(element: WordPressElement): {
    boxShadow?: string;
    textShadow?: string;
  } {
    const allStyles = { ...element.computedStyles, ...element.styles };

    return {
      boxShadow: allStyles['box-shadow'] !== 'none' ? allStyles['box-shadow'] : undefined,
      textShadow: allStyles['text-shadow'] !== 'none' ? allStyles['text-shadow'] : undefined,
    };
  }

  /**
   * Extract gradient backgrounds
   */
  extractGradients(element: WordPressElement): string[] {
    const gradients: string[] = [];
    const allStyles = { ...element.computedStyles, ...element.styles };

    const bgImage = allStyles['background-image'];
    if (bgImage && (bgImage.includes('gradient') || bgImage.includes('linear') || bgImage.includes('radial'))) {
      gradients.push(bgImage);
    }

    return gradients;
  }

  /**
   * Convert filter effects
   */
  extractFilters(element: WordPressElement): string[] {
    const filters: string[] = [];
    const allStyles = { ...element.computedStyles, ...element.styles };

    if (allStyles.filter && allStyles.filter !== 'none') {
      filters.push(`filter: ${allStyles.filter}`);
    }

    if (allStyles['backdrop-filter'] && allStyles['backdrop-filter'] !== 'none') {
      filters.push(`backdrop-filter: ${allStyles['backdrop-filter']}`);
    }

    return filters;
  }

  /**
   * Extract flexbox properties
   */
  extractFlexbox(element: WordPressElement): string[] {
    const flexProps: string[] = [];
    const allStyles = { ...element.computedStyles, ...element.styles };

    const flexProperties = [
      'display',
      'flex-direction',
      'flex-wrap',
      'flex-flow',
      'justify-content',
      'align-items',
      'align-content',
      'gap',
      'row-gap',
      'column-gap',
      'flex',
      'flex-grow',
      'flex-shrink',
      'flex-basis',
      'align-self',
      'order',
    ];

    for (const prop of flexProperties) {
      const value = allStyles[prop];
      if (value && value !== 'normal' && value !== 'initial') {
        // Only include if display is flex or inline-flex
        if (prop === 'display' && (value === 'flex' || value === 'inline-flex')) {
          flexProps.push(`${prop}: ${value}`);
        } else if (prop !== 'display' && allStyles.display?.includes('flex')) {
          flexProps.push(`${prop}: ${value}`);
        }
      }
    }

    return flexProps;
  }

  /**
   * Extract grid properties
   */
  extractGrid(element: WordPressElement): string[] {
    const gridProps: string[] = [];
    const allStyles = { ...element.computedStyles, ...element.styles };

    const gridProperties = [
      'display',
      'grid-template-columns',
      'grid-template-rows',
      'grid-template-areas',
      'grid-template',
      'grid-auto-columns',
      'grid-auto-rows',
      'grid-auto-flow',
      'gap',
      'grid-gap',
      'row-gap',
      'grid-row-gap',
      'column-gap',
      'grid-column-gap',
      'justify-items',
      'align-items',
      'justify-content',
      'align-content',
      'grid-column',
      'grid-row',
      'grid-area',
    ];

    for (const prop of gridProperties) {
      const value = allStyles[prop];
      if (value && value !== 'normal' && value !== 'initial') {
        // Only include if display is grid or inline-grid
        if (prop === 'display' && (value === 'grid' || value === 'inline-grid')) {
          gridProps.push(`${prop}: ${value}`);
        } else if (prop !== 'display' && allStyles.display?.includes('grid')) {
          gridProps.push(`${prop}: ${value}`);
        }
      }
    }

    return gridProps;
  }

  /**
   * Convert all advanced styles to GHL-compatible CSS
   */
  generateAdvancedCSS(element: WordPressElement, elementId: string): string {
    let css = '';

    // Hover styles
    const hoverStyles = this.extractHoverStyles(element);
    if (hoverStyles) {
      css += this.generateHoverCSS(elementId, hoverStyles);
    }

    // Responsive styles
    css += this.convertResponsiveStyles(element, elementId);

    // Animations and transitions
    const { animations, transitions } = this.extractAnimations(element);
    if (animations.length > 0 || transitions.length > 0) {
      css += `#${elementId} {\n`;
      if (animations.length > 0) {
        css += `  ${animations.join(';\n  ')};\n`;
      }
      if (transitions.length > 0) {
        css += `  ${transitions.join(';\n  ')};\n`;
      }
      css += `}\n\n`;
    }

    return css;
  }

  /**
   * Helper: Convert styles object to CSS string
   */
  private stylesToString(styles: Record<string, string>): string {
    const styleArray: string[] = [];
    for (const [prop, value] of Object.entries(styles)) {
      if (value && value !== 'none' && value !== 'initial') {
        styleArray.push(`${prop}: ${value}`);
      }
    }
    return styleArray.join(';\n    ');
  }

  /**
   * Optimize CSS for GHL (remove unnecessary properties)
   */
  optimizeCSS(css: string): string {
    // Remove duplicate properties
    const lines = css.split('\n');
    const seen = new Set<string>();
    const optimized: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!seen.has(trimmed) || trimmed.startsWith('@') || trimmed === '}' || trimmed === '{') {
        optimized.push(line);
        seen.add(trimmed);
      }
    }

    return optimized.join('\n');
  }

  /**
   * Convert color values to consistent format (hex)
   */
  normalizeColors(css: string): string {
    // Convert rgb() to hex
    let normalized = css.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, (match, r, g, b) => {
      const hex = ((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1);
      return `#${hex}`;
    });

    // Convert rgba() to hex with opacity separate
    normalized = normalized.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/g, (match, r, g, b, a) => {
      const hex = ((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1);
      return `#${hex}`;
    });

    return normalized;
  }
}

export const ghlStyleConverterService = new GHLStyleConverterService();
