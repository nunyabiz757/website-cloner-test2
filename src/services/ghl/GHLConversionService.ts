import { loggingService } from '../LoggingService';
import type { WordPressPage, WordPressElement } from '../../types/wordpress.types';
import type { GHLConversionResult, GHLElement, GHLAsset } from '../../types/ghl.types';

export class GHLConversionService {
  async convertToGHL(wpPage: WordPressPage): Promise<GHLConversionResult> {
    loggingService.info('ghl-conversion', `Starting conversion for ${wpPage.url}`);

    const warnings: string[] = [];
    const errors: string[] = [];
    const assets: GHLAsset[] = [];
    let elementsConverted = 0;
    let elementsSkipped = 0;
    let stylesInlined = 0;

    try {
      // Convert WordPress elements to GHL structure
      const ghlElements: GHLElement[] = [];

      for (const element of wpPage.elements) {
        try {
          const ghlElement = this.convertElement(element);
          ghlElements.push(ghlElement);
          elementsConverted++;
        } catch (error) {
          elementsSkipped++;
          errors.push(`Failed to convert element ${element.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Generate GHL HTML
      const ghlHTML = this.generateGHLHTML(ghlElements, wpPage);

      // Process assets
      for (const image of wpPage.images) {
        assets.push({
          originalUrl: image.src,
          type: 'image',
          size: 0, // Will be calculated when downloaded
          optimized: false,
        });
      }

      for (const font of wpPage.fonts) {
        if (font.url) {
          assets.push({
            originalUrl: font.url,
            type: 'font',
            size: 0,
            optimized: false,
          });
        }
      }

      // Calculate conversion score
      const conversionScore = this.calculateConversionScore(
        elementsConverted,
        elementsSkipped,
        errors.length,
        warnings.length
      );

      const result: GHLConversionResult = {
        success: errors.length === 0,
        conversionScore,
        originalUrl: wpPage.url,
        ghlHTML,
        assets,
        warnings,
        errors,
        stats: {
          elementsConverted,
          elementsSkipped,
          stylesInlined,
          assetsOptimized: 0,
          responsiveBreakpoints: wpPage.mediaQueries.length,
          animationsPreserved: 0,
        },
      };

      loggingService.success('ghl-conversion', `Conversion completed with score: ${conversionScore}%`);
      return result;
    } catch (error) {
      loggingService.error('ghl-conversion', 'Conversion failed', error);
      throw error;
    }
  }

  private convertElement(wpElement: WordPressElement): GHLElement {
    // Determine GHL element type based on WordPress element
    const ghlType = this.mapElementType(wpElement);

    // Inline all styles (GHL requires inline styles)
    const inlineStyles = this.inlineStyles(wpElement);

    // Convert children recursively
    const children: GHLElement[] = [];
    for (const child of wpElement.children) {
      try {
        children.push(this.convertElement(child));
      } catch (error) {
        loggingService.warning('ghl-conversion', `Skipping child element: ${error}`);
      }
    }

    // Clean attributes for GHL
    const attributes = this.cleanAttributes(wpElement.attributes);

    return {
      type: ghlType,
      id: wpElement.id.replace('wp-', 'ghl-'),
      classes: this.cleanClasses(wpElement.classes),
      inlineStyles,
      children,
      content: wpElement.content,
      attributes,
    };
  }

  private mapElementType(wpElement: WordPressElement): GHLElement['type'] {
    // Map WordPress elements to GHL types
    const tagName = wpElement.tagName.toLowerCase();
    const classes = wpElement.classes.join(' ').toLowerCase();

    // Check for sections
    if (
      wpElement.type === 'section' ||
      classes.includes('section') ||
      classes.includes('et_pb_section') ||
      classes.includes('elementor-section') ||
      classes.includes('vc_row')
    ) {
      return 'section';
    }

    // Check for rows
    if (
      wpElement.type === 'row' ||
      classes.includes('row') ||
      classes.includes('et_pb_row') ||
      classes.includes('elementor-row')
    ) {
      return 'row';
    }

    // Check for columns
    if (
      classes.includes('column') ||
      classes.includes('et_pb_column') ||
      classes.includes('elementor-column') ||
      classes.includes('vc_col')
    ) {
      return 'column';
    }

    // Everything else is a widget
    return 'widget';
  }

  private inlineStyles(wpElement: WordPressElement): string {
    const styles: string[] = [];

    // Merge inline styles and computed styles
    const allStyles = {
      ...wpElement.computedStyles,
      ...wpElement.styles,
    };

    // Important CSS properties for pixel-perfect conversion
    const importantProps = [
      'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height',
      'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
      'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'background', 'background-color', 'background-image', 'background-size', 'background-position',
      'color', 'font-size', 'font-family', 'font-weight', 'font-style', 'line-height',
      'text-align', 'text-decoration', 'text-transform',
      'border', 'border-radius', 'border-width', 'border-color', 'border-style',
      'box-shadow', 'text-shadow',
      'display', 'position', 'top', 'right', 'bottom', 'left', 'z-index',
      'flex', 'flex-direction', 'justify-content', 'align-items', 'gap',
      'grid', 'grid-template-columns', 'grid-template-rows', 'grid-gap',
      'transform', 'transition', 'animation',
      'opacity', 'overflow', 'cursor',
    ];

    for (const prop of importantProps) {
      const value = allStyles[prop];
      if (value && value !== 'none' && value !== 'initial' && value !== 'inherit') {
        // Skip default values
        if (this.isDefaultValue(prop, value)) continue;

        styles.push(`${prop}: ${value}`);
      }
    }

    return styles.join('; ');
  }

  private isDefaultValue(prop: string, value: string): boolean {
    const defaults: Record<string, string[]> = {
      'margin': ['0px', '0', 'auto'],
      'padding': ['0px', '0'],
      'border': ['none', '0px'],
      'background': ['none', 'transparent', 'rgba(0, 0, 0, 0)'],
      'color': ['rgb(0, 0, 0)', '#000', '#000000'],
      'font-size': ['16px', '1rem'],
      'font-weight': ['400', 'normal'],
      'line-height': ['normal', '1.5'],
      'text-align': ['start', 'left'],
      'display': ['block', 'inline'],
    };

    return defaults[prop]?.includes(value) || false;
  }

  private cleanClasses(classes: string[]): string[] {
    // Remove WordPress-specific classes
    const wpClasses = [
      'wp-',
      'wordpress-',
      'et_pb_',
      'et-',
      'elementor-',
      'vc_',
      'wpb_',
      'fl-',
    ];

    return classes.filter(cls => {
      return !wpClasses.some(wpClass => cls.startsWith(wpClass));
    });
  }

  private cleanAttributes(attributes: Record<string, string>): Record<string, string> {
    const cleaned: Record<string, string> = {};

    // Remove WordPress-specific attributes
    const wpAttrs = ['data-elementor', 'data-et-', 'data-vc', 'data-wpb'];

    for (const [key, value] of Object.entries(attributes)) {
      if (!wpAttrs.some(wpAttr => key.startsWith(wpAttr))) {
        cleaned[key] = value;
      }
    }

    return cleaned;
  }

  private generateGHLHTML(elements: GHLElement[], wpPage: WordPressPage): string {
    let html = '';

    // Add GHL wrapper comment
    html += '<!-- GHL-Converted from WordPress -->\n';
    html += `<!-- Original URL: ${wpPage.url} -->\n`;
    html += `<!-- Page Builder: ${wpPage.detection.pageBuilder} -->\n\n`;

    // Add custom CSS if any
    if (wpPage.customCSS.length > 0) {
      html += '<style>\n';
      html += wpPage.customCSS.join('\n\n');
      html += '\n</style>\n\n';
    }

    // Add GHL wrapper
    html += '<div class="ghl-wrapper" style="max-width: 100%; margin: 0 auto;">\n';

    // Convert elements to HTML
    for (const element of elements) {
      html += this.elementToHTML(element, 1);
    }

    html += '</div>\n\n';

    // Add responsive styles
    if (wpPage.mediaQueries.length > 0) {
      html += '<style>\n';
      html += '/* Responsive Styles */\n';
      for (const mq of wpPage.mediaQueries) {
        html += `${mq.condition} {\n${mq.rules}\n}\n\n`;
      }
      html += '</style>';
    }

    return html;
  }

  private elementToHTML(element: GHLElement, indent: number = 0): string {
    const indentation = '  '.repeat(indent);
    let html = '';

    // Determine tag name based on type
    let tagName = 'div';
    if (element.type === 'section') tagName = 'section';
    if (element.type === 'row') tagName = 'div';
    if (element.type === 'column') tagName = 'div';

    // Build opening tag
    html += `${indentation}<${tagName}`;

    // Add ID
    if (element.id) {
      html += ` id="${element.id}"`;
    }

    // Add classes
    if (element.classes.length > 0) {
      html += ` class="ghl-${element.type} ${element.classes.join(' ')}"`;
    } else {
      html += ` class="ghl-${element.type}"`;
    }

    // Add inline styles
    if (element.inlineStyles) {
      html += ` style="${element.inlineStyles}"`;
    }

    // Add other attributes
    for (const [key, value] of Object.entries(element.attributes)) {
      if (key !== 'class' && key !== 'style' && key !== 'id') {
        html += ` ${key}="${value}"`;
      }
    }

    html += '>\n';

    // Add content or children
    if (element.content && element.children.length === 0) {
      html += `${indentation}  ${element.content}\n`;
    } else if (element.children.length > 0) {
      for (const child of element.children) {
        html += this.elementToHTML(child, indent + 1);
      }
    }

    // Closing tag
    html += `${indentation}</${tagName}>\n`;

    return html;
  }

  private calculateConversionScore(
    converted: number,
    skipped: number,
    errors: number,
    warnings: number
  ): number {
    const total = converted + skipped;
    if (total === 0) return 0;

    // Base score from conversion success rate
    const conversionRate = converted / total;
    let score = conversionRate * 100;

    // Deduct points for errors and warnings
    score -= errors * 5;
    score -= warnings * 2;

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  }
}

export const ghlConversionService = new GHLConversionService();
