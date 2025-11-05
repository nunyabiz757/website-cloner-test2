import type { WordPressBlock } from '../../../types/wordpress';
import type { PageData, ElementData } from '../../parsers/PlaywrightParserService';
import { BaseUnifiedBuilder, BuilderOutput } from './BaseUnifiedBuilder';

/**
 * Unified OptimizePress Builder
 *
 * OptimizePress uses shortcode format for landing pages and sales funnels.
 * Structure: [op_row][op_col][op_heading]Content[/op_heading][/op_col][/op_row]
 *
 * Format: Shortcode
 * Main elements: heading, text, image, button, video, countdown, etc.
 */
export class UnifiedOptimizePressBuilder extends BaseUnifiedBuilder {
  /**
   * Convert from native WordPress blocks (BEST method)
   */
  protected async convertFromNativeBlocks(
    blocks: WordPressBlock[]
  ): Promise<BuilderOutput> {
    console.log('✨ Converting from native blocks (OptimizePress format)');

    const rows: string[] = [];

    for (const block of blocks) {
      const row = this.blockToRow(block);
      if (row) rows.push(row);
    }

    return {
      format: 'shortcode',
      content: rows.join('\n\n'),
      metadata: {
        widgetCount: this.countElements(rows.join('')),
        sectionCount: rows.length,
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
    console.log('🔍 Converting from Playwright data (OptimizePress format)');

    const visibleElements = this.filterVisibleElements(pageData.elements);
    const rows: string[] = [];

    // Group elements into rows
    for (let i = 0; i < visibleElements.length; i += 3) {
      const rowElements = visibleElements.slice(i, i + 3);
      const elements = rowElements
        .map((el) => this.elementToShortcode(el))
        .filter((e) => e !== null)
        .join('\n');

      if (elements) {
        const row = this.wrapInRow(elements);
        rows.push(row);
      }
    }

    return {
      format: 'shortcode',
      content: rows.join('\n\n'),
      metadata: {
        widgetCount: this.countElements(rows.join('')),
        sectionCount: rows.length,
        conversionMethod: 'playwright',
      },
    };
  }

  /**
   * Convert WordPress block to OptimizePress row
   */
  private blockToRow(block: WordPressBlock): string | null {
    const blockType = this.getBlockFullName(block);

    // Handle columns
    if (blockType === 'core:columns' && block.innerBlocks) {
      const columns = block.innerBlocks.map((col) => {
        const elements = col.innerBlocks
          ?.map((innerBlock) => this.blockToShortcode(innerBlock))
          .filter((e) => e !== null)
          .join('\n') || '';

        return `[op_col width="50%"]\n${elements}\n[/op_col]`;
      }).join('\n');

      return `[op_row]\n${columns}\n[/op_row]`;
    }

    // Regular blocks
    const shortcode = this.blockToShortcode(block);
    if (!shortcode) return null;

    return this.wrapInRow(shortcode);
  }

  /**
   * Convert WordPress block to OptimizePress shortcode
   */
  private blockToShortcode(block: WordPressBlock): string | null {
    const blockType = this.getBlockFullName(block);

    switch (blockType) {
      case 'core:heading': {
        const text = this.stripHTML(block.innerHTML);
        const level = block.attributes?.level || 2;
        const textAlign = this.getAlignment(block);
        const textColor = this.parseColor(block.attributes?.textColor || '');

        const attrs: string[] = [
          `tag="h${level}"`,
          `align="${textAlign}"`,
        ];

        if (textColor) attrs.push(`color="${textColor}"`);

        return `[op_heading ${attrs.join(' ')}]${this.escapeHTML(text)}[/op_heading]`;
      }

      case 'core:paragraph': {
        const text = this.stripHTML(block.innerHTML);
        if (!text) return null;

        const textAlign = this.getAlignment(block);
        const textColor = this.parseColor(block.attributes?.textColor || '');

        const attrs: string[] = [`align="${textAlign}"`];
        if (textColor) attrs.push(`color="${textColor}"`);

        return `[op_text ${attrs.join(' ')}]${this.escapeHTML(text)}[/op_text]`;
      }

      case 'core:image': {
        const src = this.extractImageSrc(block.innerHTML);
        if (!src) return null;

        const alt = block.attributes?.alt || '';
        const align = this.getAlignment(block);

        return `[op_image src="${src}" alt="${this.escapeHTML(alt)}" align="${align}" /]`;
      }

      case 'core:button':
      case 'core:buttons': {
        const text = this.stripHTML(block.innerHTML);
        const url = this.extractLinkHref(block.innerHTML) || '#';
        const backgroundColor = this.parseColor(block.attributes?.backgroundColor || '');
        const textColor = this.parseColor(block.attributes?.textColor || '');

        const attrs: string[] = [
          `url="${url}"`,
          `text="${this.escapeHTML(text)}"`,
        ];

        if (backgroundColor) attrs.push(`bg_color="${backgroundColor}"`);
        if (textColor) attrs.push(`text_color="${textColor}"`);

        return `[op_button ${attrs.join(' ')} /]`;
      }

      case 'core:video':
      case 'core:embed': {
        const url = block.attributes?.url || this.extractImageSrc(block.innerHTML);
        if (!url) return null;

        return `[op_video url="${url}" /]`;
      }

      default: {
        if (block.innerHTML) {
          return `[op_text]${this.stripHTML(block.innerHTML)}[/op_text]`;
        }
        return null;
      }
    }
  }

  /**
   * Convert Playwright element to OptimizePress shortcode
   */
  private elementToShortcode(element: ElementData): string | null {
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

        const attrs: string[] = [
          `tag="h${level}"`,
          `align="${textAlign}"`,
        ];

        if (textColor) attrs.push(`color="${textColor}"`);

        return `[op_heading ${attrs.join(' ')}]${this.escapeHTML(text)}[/op_heading]`;
      }

      case 'p': {
        const text = this.stripHTML(element.text);
        if (!text) return null;

        const textAlign = element.styles.textAlign || 'left';
        const textColor = this.parseColor(element.styles.color || '');

        const attrs: string[] = [`align="${textAlign}"`];
        if (textColor) attrs.push(`color="${textColor}"`);

        return `[op_text ${attrs.join(' ')}]${this.escapeHTML(text)}[/op_text]`;
      }

      case 'img': {
        const src = element.attributes?.src;
        if (!src) return null;

        const alt = element.attributes?.alt || '';
        const align = element.styles.textAlign || 'center';

        return `[op_image src="${src}" alt="${this.escapeHTML(alt)}" align="${align}" /]`;
      }

      case 'a':
      case 'button': {
        const text = this.stripHTML(element.text);
        const url = element.attributes?.href || '#';
        const backgroundColor = this.parseColor(element.styles.backgroundColor || '');
        const textColor = this.parseColor(element.styles.color || '');

        const attrs: string[] = [
          `url="${url}"`,
          `text="${this.escapeHTML(text)}"`,
        ];

        if (backgroundColor) attrs.push(`bg_color="${backgroundColor}"`);
        if (textColor) attrs.push(`text_color="${textColor}"`);

        return `[op_button ${attrs.join(' ')} /]`;
      }

      case 'video':
      case 'iframe': {
        const src = element.attributes?.src;
        if (!src) return null;

        return `[op_video url="${src}" /]`;
      }

      default:
        return null;
    }
  }

  /**
   * Wrap elements in OptimizePress row/column structure
   */
  private wrapInRow(elements: string): string {
    return `[op_row]\n[op_col width="100%"]\n${elements}\n[/op_col]\n[/op_row]`;
  }

  /**
   * Count OptimizePress elements in shortcode
   */
  private countElements(shortcode: string): number {
    const elementPattern = /\[op_(heading|text|image|button|video)/g;
    const matches = shortcode.match(elementPattern);
    return matches ? matches.length : 0;
  }
}

/**
 * Export singleton instance
 */
export const unifiedOptimizePressBuilder = new UnifiedOptimizePressBuilder();
