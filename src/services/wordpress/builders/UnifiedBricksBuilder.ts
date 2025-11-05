import type { WordPressBlock } from '../../../types/wordpress';
import type { PageData, ElementData } from '../../parsers/PlaywrightParserService';
import { BaseUnifiedBuilder, BuilderOutput } from './BaseUnifiedBuilder';

interface BricksElement {
  id: string;
  name: string;
  parent?: string;
  settings?: Record<string, any>;
  children?: string[];
}

/**
 * Unified Bricks Builder
 *
 * Bricks uses JSON format similar to Elementor but with Bricks-specific structure.
 * Elements: section, container, heading, text, image, button, video, etc.
 *
 * Format: JSON
 */
export class UnifiedBricksBuilder extends BaseUnifiedBuilder {
  /**
   * Convert from native WordPress blocks (BEST method)
   */
  protected async convertFromNativeBlocks(
    blocks: WordPressBlock[]
  ): Promise<BuilderOutput> {
    console.log('✨ Converting from native blocks (Bricks format)');

    const elements: BricksElement[] = [];

    for (const block of blocks) {
      const element = this.blockToElement(block);
      if (element) elements.push(element);
    }

    return {
      format: 'json',
      content: {
        version: '1.0.0',
        elements: elements,
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
    console.log('🔍 Converting from Playwright data (Bricks format)');

    const visibleElements = this.filterVisibleElements(pageData.elements);
    const bricksElements: BricksElement[] = [];

    for (const element of visibleElements) {
      const bricksElement = this.playwrightElementToBricks(element);
      if (bricksElement) bricksElements.push(bricksElement);
    }

    return {
      format: 'json',
      content: {
        version: '1.0.0',
        elements: bricksElements,
      },
      metadata: {
        widgetCount: bricksElements.length,
        sectionCount: bricksElements.length,
        conversionMethod: 'playwright',
      },
    };
  }

  /**
   * Convert WordPress block to Bricks element
   */
  private blockToElement(block: WordPressBlock): BricksElement | null {
    const blockType = this.getBlockFullName(block);

    switch (blockType) {
      case 'core:heading': {
        const text = this.stripHTML(block.innerHTML);
        const level = block.attributes?.level || 2;
        const textAlign = this.getAlignment(block);
        const textColor = this.parseColor(block.attributes?.textColor || '');

        return {
          id: this.generateId(),
          name: 'heading',
          settings: {
            tag: `h${level}`,
            text: text,
            textAlign: textAlign,
            color: textColor || undefined,
          },
        };
      }

      case 'core:paragraph': {
        const text = this.stripHTML(block.innerHTML);
        if (!text) return null;

        const textAlign = this.getAlignment(block);
        const textColor = this.parseColor(block.attributes?.textColor || '');

        return {
          id: this.generateId(),
          name: 'text',
          settings: {
            text: text,
            textAlign: textAlign,
            color: textColor || undefined,
          },
        };
      }

      case 'core:image': {
        const src = this.extractImageSrc(block.innerHTML);
        if (!src) return null;

        const alt = block.attributes?.alt || '';

        return {
          id: this.generateId(),
          name: 'image',
          settings: {
            url: src,
            alt: alt,
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
          id: this.generateId(),
          name: 'button',
          settings: {
            text: text,
            link: url,
            backgroundColor: backgroundColor || undefined,
            color: textColor || undefined,
          },
        };
      }

      case 'core:video':
      case 'core:embed': {
        const url = block.attributes?.url || this.extractImageSrc(block.innerHTML);
        if (!url) return null;

        return {
          id: this.generateId(),
          name: 'video',
          settings: {
            url: url,
          },
        };
      }

      case 'core:columns': {
        // Create container with columns
        const containerId = this.generateId();
        const children: string[] = [];

        if (block.innerBlocks) {
          for (const col of block.innerBlocks) {
            const colId = this.generateId();
            children.push(colId);
          }
        }

        return {
          id: containerId,
          name: 'container',
          settings: {
            layout: 'flex',
            direction: 'row',
          },
          children: children,
        };
      }

      default: {
        if (block.innerHTML) {
          return {
            id: this.generateId(),
            name: 'text',
            settings: {
              text: this.stripHTML(block.innerHTML),
            },
          };
        }
        return null;
      }
    }
  }

  /**
   * Convert Playwright element to Bricks element
   */
  private playwrightElementToBricks(element: ElementData): BricksElement | null {
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
        const textAlign = element.styles.textAlign || 'left';
        const textColor = this.parseColor(element.styles.color || '');

        return {
          id: this.generateId(),
          name: 'heading',
          settings: {
            tag: `h${level}`,
            text: text,
            textAlign: textAlign,
            color: textColor || undefined,
          },
        };
      }

      case 'p': {
        const text = this.stripHTML(element.text);
        if (!text) return null;

        const textAlign = element.styles.textAlign || 'left';
        const textColor = this.parseColor(element.styles.color || '');

        return {
          id: this.generateId(),
          name: 'text',
          settings: {
            text: text,
            textAlign: textAlign,
            color: textColor || undefined,
          },
        };
      }

      case 'img': {
        const src = element.attributes?.src;
        if (!src) return null;

        const alt = element.attributes?.alt || '';

        return {
          id: this.generateId(),
          name: 'image',
          settings: {
            url: src,
            alt: alt,
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
          id: this.generateId(),
          name: 'button',
          settings: {
            text: text,
            link: url,
            backgroundColor: backgroundColor || undefined,
            color: textColor || undefined,
          },
        };
      }

      case 'video':
      case 'iframe': {
        const src = element.attributes?.src;
        if (!src) return null;

        return {
          id: this.generateId(),
          name: 'video',
          settings: {
            url: src,
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
export const unifiedBricksBuilder = new UnifiedBricksBuilder();
