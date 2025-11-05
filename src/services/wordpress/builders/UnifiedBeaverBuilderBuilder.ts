import type { WordPressBlock } from '../../../types/wordpress';
import type { PageData, ElementData } from '../../parsers/PlaywrightParserService';
import { BaseUnifiedBuilder, BuilderOutput } from './BaseUnifiedBuilder';

/**
 * Unified Beaver Builder
 *
 * Beaver Builder uses shortcode format for page building.
 * Structure: [fl_builder_insert_layout slug="layout-name"]
 *            [fl_row][fl_col][fl_module type="heading"]Content[/fl_module][/fl_col][/fl_row]
 *
 * Format: Shortcode
 * Main modules: heading, html, rich-text, photo, button, video, etc.
 */
export class UnifiedBeaverBuilderBuilder extends BaseUnifiedBuilder {
  /**
   * Convert from native WordPress blocks (BEST method)
   */
  protected async convertFromNativeBlocks(
    blocks: WordPressBlock[]
  ): Promise<BuilderOutput> {
    console.log('✨ Converting from native blocks (Beaver Builder format)');

    const rows: string[] = [];

    for (const block of blocks) {
      const row = this.blockToRow(block);
      if (row) rows.push(row);
    }

    return {
      format: 'shortcode',
      content: rows.join('\n\n'),
      metadata: {
        widgetCount: this.countModules(rows.join('')),
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
    console.log('🔍 Converting from Playwright data (Beaver Builder format)');

    const visibleElements = this.filterVisibleElements(pageData.elements);
    const rows: string[] = [];

    // Group elements into rows (roughly every 3-4 elements)
    for (let i = 0; i < visibleElements.length; i += 4) {
      const rowElements = visibleElements.slice(i, i + 4);
      const modules = rowElements
        .map((el) => this.elementToModule(el))
        .filter((m) => m !== null)
        .join('\n');

      if (modules) {
        const row = this.wrapInRow(modules);
        rows.push(row);
      }
    }

    return {
      format: 'shortcode',
      content: rows.join('\n\n'),
      metadata: {
        widgetCount: this.countModules(rows.join('')),
        sectionCount: rows.length,
        conversionMethod: 'playwright',
      },
    };
  }

  /**
   * Convert WordPress block to Beaver Builder row
   */
  private blockToRow(block: WordPressBlock): string | null {
    const blockType = this.getBlockFullName(block);

    // Handle columns (create multi-column row)
    if (blockType === 'core:columns' && block.innerBlocks) {
      const columns = block.innerBlocks.map((col) => {
        const modules = col.innerBlocks
          ?.map((innerBlock) => this.blockToModule(innerBlock))
          .filter((m) => m !== null)
          .join('\n') || '';

        return `[fl_col]\n${modules}\n[/fl_col]`;
      }).join('\n');

      return `[fl_row]\n${columns}\n[/fl_row]`;
    }

    // Handle group (single column row)
    if ((blockType === 'core:group' || blockType === 'core:cover') && block.innerBlocks) {
      const modules = block.innerBlocks
        .map((innerBlock) => this.blockToModule(innerBlock))
        .filter((m) => m !== null)
        .join('\n');

      return this.wrapInRow(modules);
    }

    // Regular blocks - convert to module and wrap in row
    const module = this.blockToModule(block);
    if (!module) return null;

    return this.wrapInRow(module);
  }

  /**
   * Convert WordPress block to Beaver Builder module
   */
  private blockToModule(block: WordPressBlock): string | null {
    const blockType = this.getBlockFullName(block);

    switch (blockType) {
      case 'core:heading': {
        const text = this.stripHTML(block.innerHTML);
        const level = block.attributes?.level || 2;
        const textAlign = this.getAlignment(block);
        const textColor = this.parseColor(block.attributes?.textColor || '');

        const attrs: string[] = [
          'type="heading"',
          `tag="h${level}"`,
          `align="${textAlign}"`,
        ];

        if (textColor) {
          attrs.push(`color="${textColor}"`);
        }

        return `[fl_module ${attrs.join(' ')}]${this.escapeHTML(text)}[/fl_module]`;
      }

      case 'core:paragraph': {
        const text = this.stripHTML(block.innerHTML);
        if (!text) return null;

        const textAlign = this.getAlignment(block);
        const textColor = this.parseColor(block.attributes?.textColor || '');

        const attrs: string[] = [
          'type="rich-text"',
          `align="${textAlign}"`,
        ];

        if (textColor) attrs.push(`color="${textColor}"`);

        return `[fl_module ${attrs.join(' ')}]<p>${this.escapeHTML(text)}</p>[/fl_module]`;
      }

      case 'core:image': {
        const src = this.extractImageSrc(block.innerHTML);
        if (!src) return null;

        const alt = block.attributes?.alt || '';
        const align = this.getAlignment(block);

        const attrs: string[] = [
          'type="photo"',
          `src="${src}"`,
          `alt="${this.escapeHTML(alt)}"`,
          `align="${align}"`,
        ];

        return `[fl_module ${attrs.join(' ')} /]`;
      }

      case 'core:button':
      case 'core:buttons': {
        const text = this.stripHTML(block.innerHTML);
        const url = this.extractLinkHref(block.innerHTML) || '#';
        const backgroundColor = this.parseColor(block.attributes?.backgroundColor || '');
        const textColor = this.parseColor(block.attributes?.textColor || '');

        const attrs: string[] = [
          'type="button"',
          `link="${url}"`,
          `text="${this.escapeHTML(text)}"`,
        ];

        if (backgroundColor) attrs.push(`bg_color="${backgroundColor}"`);
        if (textColor) attrs.push(`text_color="${textColor}"`);

        return `[fl_module ${attrs.join(' ')} /]`;
      }

      case 'core:list': {
        const listHTML = block.innerHTML;
        return `[fl_module type="html"]${listHTML}[/fl_module]`;
      }

      case 'core:quote': {
        const text = this.stripHTML(block.innerHTML);
        return `[fl_module type="html"]<blockquote>${this.escapeHTML(text)}</blockquote>[/fl_module]`;
      }

      case 'core:video': {
        const src = this.extractImageSrc(block.innerHTML); // video src
        if (!src) return null;

        return `[fl_module type="video" video_type="html5" video="${src}" /]`;
      }

      case 'core:embed': {
        const url = block.attributes?.url || '';
        if (!url) return null;

        // Detect video type
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          return `[fl_module type="video" video_type="youtube" video="${url}" /]`;
        } else if (url.includes('vimeo.com')) {
          return `[fl_module type="video" video_type="vimeo" video="${url}" /]`;
        }

        return `[fl_module type="html"]<iframe src="${url}"></iframe>[/fl_module]`;
      }

      case 'core:separator':
        return `[fl_module type="separator" /]`;

      default: {
        // Fallback: wrap any HTML in html module
        if (block.innerHTML) {
          return `[fl_module type="html"]${block.innerHTML}[/fl_module]`;
        }
        return null;
      }
    }
  }

  /**
   * Convert Playwright element to Beaver Builder module
   */
  private elementToModule(element: ElementData): string | null {
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
          'type="heading"',
          `tag="h${level}"`,
          `align="${textAlign}"`,
        ];

        if (textColor) attrs.push(`color="${textColor}"`);

        return `[fl_module ${attrs.join(' ')}]${this.escapeHTML(text)}[/fl_module]`;
      }

      case 'p': {
        const text = this.stripHTML(element.text);
        if (!text) return null;

        const textAlign = element.styles.textAlign || 'left';
        const textColor = this.parseColor(element.styles.color || '');

        const attrs: string[] = [
          'type="rich-text"',
          `align="${textAlign}"`,
        ];

        if (textColor) attrs.push(`color="${textColor}"`);

        return `[fl_module ${attrs.join(' ')}]<p>${this.escapeHTML(text)}</p>[/fl_module]`;
      }

      case 'img': {
        const src = element.attributes?.src;
        if (!src) return null;

        const alt = element.attributes?.alt || '';
        const align = element.styles.textAlign || 'center';

        const attrs: string[] = [
          'type="photo"',
          `src="${src}"`,
          `alt="${this.escapeHTML(alt)}"`,
          `align="${align}"`,
        ];

        return `[fl_module ${attrs.join(' ')} /]`;
      }

      case 'a':
      case 'button': {
        const text = this.stripHTML(element.text);
        const url = element.attributes?.href || '#';
        const backgroundColor = this.parseColor(element.styles.backgroundColor || '');
        const textColor = this.parseColor(element.styles.color || '');

        const attrs: string[] = [
          'type="button"',
          `link="${url}"`,
          `text="${this.escapeHTML(text)}"`,
        ];

        if (backgroundColor) attrs.push(`bg_color="${backgroundColor}"`);
        if (textColor) attrs.push(`text_color="${textColor}"`);

        return `[fl_module ${attrs.join(' ')} /]`;
      }

      case 'video': {
        const src = element.attributes?.src;
        if (!src) return null;

        return `[fl_module type="video" video_type="html5" video="${src}" /]`;
      }

      case 'iframe': {
        const src = element.attributes?.src;
        if (!src) return null;

        if (src.includes('youtube.com') || src.includes('youtu.be')) {
          return `[fl_module type="video" video_type="youtube" video="${src}" /]`;
        } else if (src.includes('vimeo.com')) {
          return `[fl_module type="video" video_type="vimeo" video="${src}" /]`;
        }

        return null;
      }

      default:
        return null;
    }
  }

  /**
   * Wrap modules in Beaver Builder row/column structure
   */
  private wrapInRow(modules: string): string {
    return `[fl_row]\n[fl_col]\n${modules}\n[/fl_col]\n[/fl_row]`;
  }

  /**
   * Count Beaver Builder modules in shortcode
   */
  private countModules(shortcode: string): number {
    const modulePattern = /\[fl_module/g;
    const matches = shortcode.match(modulePattern);
    return matches ? matches.length : 0;
  }
}

/**
 * Export singleton instance
 */
export const unifiedBeaverBuilderBuilder = new UnifiedBeaverBuilderBuilder();
