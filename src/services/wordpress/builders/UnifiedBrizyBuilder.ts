import type { WordPressBlock } from '../../../types/wordpress';
import type { PageData, ElementData } from '../../parsers/PlaywrightParserService';
import { BaseUnifiedBuilder, BuilderOutput } from './BaseUnifiedBuilder';

interface BrizyElement {
  type: string;
  value: Record<string, any>;
}

/**
 * Unified Brizy Builder
 *
 * Brizy uses JSON format for page building.
 * Elements: Text, Image, Button, Video, etc.
 *
 * Format: JSON
 */
export class UnifiedBrizyBuilder extends BaseUnifiedBuilder {
  /**
   * Convert from native WordPress blocks (BEST method)
   */
  protected async convertFromNativeBlocks(
    blocks: WordPressBlock[]
  ): Promise<BuilderOutput> {
    console.log('✨ Converting from native blocks (Brizy format)');

    const elements: BrizyElement[] = [];

    for (const block of blocks) {
      const element = this.blockToElement(block);
      if (element) elements.push(element);
    }

    return {
      format: 'json',
      content: {
        version: 1,
        items: elements,
      },
      metadata: {
        widgetCount: elements.length,
        sectionCount: elements.length,
        conversionMethod: 'native',
      },
    };
  }

  /**
   * Convert from Playwright page data (FALLBACK method)
   */
  protected async convertFromPlaywrightData(
    pageData: PageData
  ): Promise<BuilderOutput> {
    console.log('🔍 Converting from Playwright data (Brizy format)');

    const visibleElements = this.filterVisibleElements(pageData.elements);
    const brizyElements: BrizyElement[] = [];

    for (const element of visibleElements) {
      const brizyElement = this.playwrightElementToBrizy(element);
      if (brizyElement) brizyElements.push(brizyElement);
    }

    return {
      format: 'json',
      content: {
        version: 1,
        items: brizyElements,
      },
      metadata: {
        widgetCount: brizyElements.length,
        sectionCount: brizyElements.length,
        conversionMethod: 'playwright',
      },
    };
  }

  /**
   * Convert WordPress block to Brizy element
   */
  private blockToElement(block: WordPressBlock): BrizyElement | null {
    const blockType = this.getBlockFullName(block);

    switch (blockType) {
      case 'core:heading': {
        const text = this.stripHTML(block.innerHTML);
        const level = block.attributes?.level || 2;
        const textColor = this.parseColor(block.attributes?.textColor || '');

        return {
          type: 'Text',
          value: {
            text: `<h${level}>${this.escapeHTML(text)}</h${level}>`,
            colorHex: textColor || '#000000',
          },
        };
      }

      case 'core:paragraph': {
        const text = this.stripHTML(block.innerHTML);
        if (!text) return null;

        const textColor = this.parseColor(block.attributes?.textColor || '');

        return {
          type: 'Text',
          value: {
            text: `<p>${this.escapeHTML(text)}</p>`,
            colorHex: textColor || '#000000',
          },
        };
      }

      case 'core:image': {
        const src = this.extractImageSrc(block.innerHTML);
        if (!src) return null;

        return {
          type: 'Image',
          value: {
            imageSrc: src,
            imageFileName: src.split('/').pop() || 'image.jpg',
          },
        };
      }

      case 'core:button':
      case 'core:buttons': {
        const text = this.stripHTML(block.innerHTML);
        const url = this.extractLinkHref(block.innerHTML) || '#';
        const backgroundColor = this.parseColor(block.attributes?.backgroundColor || '');
        const textColor = this.parseColor(block.attributes?.textColor || '');

        return {
          type: 'Button',
          value: {
            text: text,
            linkExternal: url,
            bgColorHex: backgroundColor || '#3dbde7',
            colorHex: textColor || '#ffffff',
          },
        };
      }

      case 'core:video':
      case 'core:embed': {
        const url = block.attributes?.url || this.extractImageSrc(block.innerHTML);
        if (!url) return null;

        return {
          type: 'Video',
          value: {
            videoSrc: url,
            videoType: url.includes('youtube') ? 'youtube' : url.includes('vimeo') ? 'vimeo' : 'url',
          },
        };
      }

      default: {
        if (block.innerHTML) {
          return {
            type: 'Text',
            value: {
              text: `<p>${this.stripHTML(block.innerHTML)}</p>`,
            },
          };
        }
        return null;
      }
    }
  }

  /**
   * Convert Playwright element to Brizy element
   */
  private playwrightElementToBrizy(element: ElementData): BrizyElement | null {
    const tag = element.tag.toLowerCase();

    switch (tag) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6': {
        const level = parseInt(tag.substring(1));
        const text = this.stripHTML(element.text);
        const textColor = this.parseColor(element.styles.color || '');

        return {
          type: 'Text',
          value: {
            text: `<h${level}>${this.escapeHTML(text)}</h${level}>`,
            colorHex: textColor || '#000000',
          },
        };
      }

      case 'p': {
        const text = this.stripHTML(element.text);
        if (!text) return null;

        const textColor = this.parseColor(element.styles.color || '');

        return {
          type: 'Text',
          value: {
            text: `<p>${this.escapeHTML(text)}</p>`,
            colorHex: textColor || '#000000',
          },
        };
      }

      case 'img': {
        const src = element.attributes?.src;
        if (!src) return null;

        return {
          type: 'Image',
          value: {
            imageSrc: src,
            imageFileName: src.split('/').pop() || 'image.jpg',
          },
        };
      }

      case 'a':
      case 'button': {
        const text = this.stripHTML(element.text);
        const url = element.attributes?.href || '#';
        const backgroundColor = this.parseColor(element.styles.backgroundColor || '');
        const textColor = this.parseColor(element.styles.color || '');

        return {
          type: 'Button',
          value: {
            text: text,
            linkExternal: url,
            bgColorHex: backgroundColor || '#3dbde7',
            colorHex: textColor || '#ffffff',
          },
        };
      }

      case 'video':
      case 'iframe': {
        const src = element.attributes?.src;
        if (!src) return null;

        return {
          type: 'Video',
          value: {
            videoSrc: src,
            videoType: src.includes('youtube') ? 'youtube' : src.includes('vimeo') ? 'vimeo' : 'url',
          },
        };
      }

      default:
        return null;
    }
  }
}

/**
 * Export singleton instance
 */
export const unifiedBrizyBuilder = new UnifiedBrizyBuilder();
