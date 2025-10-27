import { loggingService } from '../LoggingService';
import type { WordPressPage, WordPressElement, WordPressDetection, MediaQuery, FontDefinition, ImageAsset } from '../../types/wordpress.types';

export class WordPressParserService {
  async parsePage(html: string, url: string, detection: WordPressDetection): Promise<WordPressPage> {
    loggingService.info('wp-parser', `Parsing WordPress page: ${url}`);

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Parse based on page builder
    let elements: WordPressElement[] = [];

    switch (detection.pageBuilder) {
      case 'elementor':
        elements = this.parseElementor(doc);
        break;
      case 'divi':
        elements = this.parseDivi(doc);
        break;
      case 'gutenberg':
        elements = this.parseGutenberg(doc);
        break;
      case 'wpbakery':
        elements = this.parseWPBakery(doc);
        break;
      case 'beaver':
        elements = this.parseBeaver(doc);
        break;
      default:
        elements = this.parseVanilla(doc);
    }

    // Extract custom CSS
    const customCSS = this.extractCustomCSS(doc);

    // Extract inline styles
    const inlineStyles = this.extractInlineStyles(doc);

    // Extract media queries
    const mediaQueries = this.extractMediaQueries(doc);

    // Extract fonts
    const fonts = this.extractFonts(doc);

    // Extract images
    const images = this.extractImages(doc);

    // Extract scripts
    const scripts = this.extractScripts(doc);

    // Extract meta
    const meta = this.extractMeta(doc);

    const page: WordPressPage = {
      url,
      title: doc.title,
      detection,
      elements,
      customCSS,
      inlineStyles,
      mediaQueries,
      fonts,
      images,
      scripts,
      meta,
    };

    loggingService.success('wp-parser', `Parsed ${elements.length} top-level elements`);
    return page;
  }

  private parseElementor(doc: Document): WordPressElement[] {
    const elements: WordPressElement[] = [];

    // Find Elementor sections
    const sections = doc.querySelectorAll('[data-element_type="section"], .elementor-section');

    loggingService.info('wp-parser', `Found ${sections.length} Elementor sections`);

    sections.forEach((section, index) => {
      const element = this.parseElement(section as HTMLElement, 'section', index);
      elements.push(element);
    });

    return elements;
  }

  private parseDivi(doc: Document): WordPressElement[] {
    const elements: WordPressElement[] = [];

    // Find Divi sections
    const sections = doc.querySelectorAll('.et_pb_section, .et-db');

    loggingService.info('wp-parser', `Found ${sections.length} Divi sections`);

    sections.forEach((section, index) => {
      const element = this.parseElement(section as HTMLElement, 'section', index);
      elements.push(element);
    });

    return elements;
  }

  private parseGutenberg(doc: Document): WordPressElement[] {
    const elements: WordPressElement[] = [];

    // Find Gutenberg blocks
    const blocks = doc.querySelectorAll('[class*="wp-block-"]');

    loggingService.info('wp-parser', `Found ${blocks.length} Gutenberg blocks`);

    blocks.forEach((block, index) => {
      const element = this.parseElement(block as HTMLElement, 'block', index);
      elements.push(element);
    });

    return elements;
  }

  private parseWPBakery(doc: Document): WordPressElement[] {
    const elements: WordPressElement[] = [];

    // Find WPBakery rows
    const rows = doc.querySelectorAll('.vc_row, [class*="wpb_row"]');

    loggingService.info('wp-parser', `Found ${rows.length} WPBakery rows`);

    rows.forEach((row, index) => {
      const element = this.parseElement(row as HTMLElement, 'row', index);
      elements.push(element);
    });

    return elements;
  }

  private parseBeaver(doc: Document): WordPressElement[] {
    const elements: WordPressElement[] = [];

    // Find Beaver Builder modules
    const modules = doc.querySelectorAll('.fl-module, .fl-row, [class*="fl-node"]');

    loggingService.info('wp-parser', `Found ${modules.length} Beaver Builder modules`);

    modules.forEach((module, index) => {
      const element = this.parseElement(module as HTMLElement, 'module', index);
      elements.push(element);
    });

    return elements;
  }

  private parseVanilla(doc: Document): WordPressElement[] {
    const elements: WordPressElement[] = [];

    // Parse semantic HTML structure
    const mainContent = doc.querySelector('main') ||
                       doc.querySelector('#main') ||
                       doc.querySelector('.site-main') ||
                       doc.querySelector('#content') ||
                       doc.body;

    if (mainContent) {
      // Find all direct child sections/divs
      const children = mainContent.querySelectorAll(':scope > section, :scope > div, :scope > article');

      loggingService.info('wp-parser', `Found ${children.length} vanilla WordPress elements`);

      children.forEach((child, index) => {
        const element = this.parseElement(child as HTMLElement, 'section', index);
        elements.push(element);
      });
    }

    return elements;
  }

  private parseElement(element: HTMLElement, type: string, index: number): WordPressElement {
    // Get computed styles (this won't work server-side, will need to be done in browser/extension)
    const computedStyles: Record<string, string> = {};

    // In browser context, we can get computed styles
    if (typeof window !== 'undefined' && window.getComputedStyle) {
      const computed = window.getComputedStyle(element);
      for (let i = 0; i < computed.length; i++) {
        const prop = computed[i];
        computedStyles[prop] = computed.getPropertyValue(prop);
      }
    }

    // Get inline styles
    const inlineStyles: Record<string, string> = {};
    if (element.style) {
      for (let i = 0; i < element.style.length; i++) {
        const prop = element.style[i];
        inlineStyles[prop] = element.style.getPropertyValue(prop);
      }
    }

    // Parse children recursively
    const children: WordPressElement[] = [];
    Array.from(element.children).forEach((child, childIndex) => {
      if (child instanceof HTMLElement) {
        const childElement = this.parseElement(child, 'child', childIndex);
        children.push(childElement);
      }
    });

    // Extract attributes
    const attributes: Record<string, string> = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }

    // Get dimensions (may not be accurate server-side)
    const rect = element.getBoundingClientRect ? element.getBoundingClientRect() : { width: 0, height: 0, top: 0, left: 0 };

    return {
      id: `wp-element-${type}-${index}`,
      type,
      tagName: element.tagName.toLowerCase(),
      classes: Array.from(element.classList),
      styles: inlineStyles,
      computedStyles,
      attributes,
      children,
      content: element.textContent || undefined,
      dimensions: {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      },
    };
  }

  private extractCustomCSS(doc: Document): string[] {
    const styles: string[] = [];

    doc.querySelectorAll('style').forEach(style => {
      if (style.textContent) {
        styles.push(style.textContent);
      }
    });

    loggingService.info('wp-parser', `Extracted ${styles.length} custom CSS blocks`);
    return styles;
  }

  private extractInlineStyles(doc: Document): string[] {
    const styles: string[] = [];

    doc.querySelectorAll('[style]').forEach(element => {
      const style = (element as HTMLElement).getAttribute('style');
      if (style) {
        styles.push(style);
      }
    });

    loggingService.info('wp-parser', `Extracted ${styles.length} inline styles`);
    return styles;
  }

  private extractMediaQueries(doc: Document): MediaQuery[] {
    const mediaQueries: MediaQuery[] = [];

    doc.querySelectorAll('style').forEach(style => {
      const content = style.textContent || '';
      const mqRegex = /@media[^{]+\{([\s\S]+?)\}\s*\}/g;
      let match;

      while ((match = mqRegex.exec(content)) !== null) {
        mediaQueries.push({
          condition: match[0].match(/@media[^{]+/)?.[0] || '',
          rules: match[1],
        });
      }
    });

    loggingService.info('wp-parser', `Extracted ${mediaQueries.length} media queries`);
    return mediaQueries;
  }

  private extractFonts(doc: Document): FontDefinition[] {
    const fonts: FontDefinition[] = [];
    const seen = new Set<string>();

    // Extract from link tags (Google Fonts, etc.)
    doc.querySelectorAll('link[href*="fonts"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && !seen.has(href)) {
        seen.add(href);

        // Try to extract font family from URL
        const familyMatch = href.match(/family=([^&:]+)/);
        fonts.push({
          family: familyMatch ? decodeURIComponent(familyMatch[1]) : 'Unknown',
          url: href,
        });
      }
    });

    // Extract from @font-face rules
    doc.querySelectorAll('style').forEach(style => {
      const content = style.textContent || '';
      const fontFaceRegex = /@font-face\s*\{([^}]+)\}/g;
      let match;

      while ((match = fontFaceRegex.exec(content)) !== null) {
        const rules = match[1];
        const familyMatch = rules.match(/font-family:\s*['"]?([^'";]+)/);
        const urlMatch = rules.match(/url\(['"]?([^'"()]+)/);
        const weightMatch = rules.match(/font-weight:\s*(\d+|normal|bold)/);
        const styleMatch = rules.match(/font-style:\s*(normal|italic|oblique)/);

        if (familyMatch) {
          fonts.push({
            family: familyMatch[1].trim(),
            url: urlMatch ? urlMatch[1] : undefined,
            weight: weightMatch ? weightMatch[1] : undefined,
            style: styleMatch ? styleMatch[1] : undefined,
          });
        }
      }
    });

    loggingService.info('wp-parser', `Extracted ${fonts.length} fonts`);
    return fonts;
  }

  private extractImages(doc: Document): ImageAsset[] {
    const images: ImageAsset[] = [];

    // Extract from img tags
    doc.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (src) {
        images.push({
          src,
          alt: img.getAttribute('alt') || '',
          width: img.width || undefined,
          height: img.height || undefined,
          isBackground: false,
        });
      }
    });

    // Extract background images from inline styles
    doc.querySelectorAll('[style*="background"]').forEach(element => {
      const style = (element as HTMLElement).getAttribute('style') || '';
      const bgMatch = style.match(/background(?:-image)?:\s*url\(['"]?([^'"()]+)/);
      if (bgMatch) {
        images.push({
          src: bgMatch[1],
          alt: '',
          isBackground: true,
        });
      }
    });

    loggingService.info('wp-parser', `Extracted ${images.length} images`);
    return images;
  }

  private extractScripts(doc: Document): string[] {
    const scripts: string[] = [];

    doc.querySelectorAll('script[src]').forEach(script => {
      const src = script.getAttribute('src');
      if (src) {
        scripts.push(src);
      }
    });

    loggingService.info('wp-parser', `Extracted ${scripts.length} scripts`);
    return scripts;
  }

  private extractMeta(doc: Document): Record<string, string> {
    const meta: Record<string, string> = {};

    doc.querySelectorAll('meta').forEach(metaTag => {
      const name = metaTag.getAttribute('name') || metaTag.getAttribute('property');
      const content = metaTag.getAttribute('content');

      if (name && content) {
        meta[name] = content;
      }
    });

    loggingService.info('wp-parser', `Extracted ${Object.keys(meta).length} meta tags`);
    return meta;
  }
}

export const wordPressParserService = new WordPressParserService();
