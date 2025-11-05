import type { WordPressBlock } from '../../../types/wordpress';
import type { PageData, ElementData } from '../../parsers/PlaywrightParserService';
import { BaseUnifiedBuilder, BuilderOutput } from './BaseUnifiedBuilder';

/**
 * Unified Divi Builder
 *
 * Divi uses shortcode format for page building.
 * Structure: [et_pb_section][et_pb_row][et_pb_column][et_pb_text]Content[/et_pb_text][/et_pb_column][/et_pb_row][/et_pb_section]
 *
 * Format: Shortcode
 * Main modules: text, image, blurb, button, video, slider, gallery, etc.
 */
export class UnifiedDiviBuilder extends BaseUnifiedBuilder {
  /**
   * Convert from native WordPress blocks (BEST method)
   */
  protected async convertFromNativeBlocks(
    blocks: WordPressBlock[]
  ): Promise<BuilderOutput> {
    console.log('✨ Converting from native blocks (Divi format)');

    const sections: string[] = [];

    for (const block of blocks) {
      const section = this.blockToSection(block);
      if (section) sections.push(section);
    }

    return {
      format: 'shortcode',
      content: sections.join('\n\n'),
      metadata: {
        widgetCount: this.countModules(sections.join('')),
        sectionCount: sections.length,
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
    console.log('🔍 Converting from Playwright data (Divi format)');

    const visibleElements = this.filterVisibleElements(pageData.elements);
    const sections: string[] = [];

    // Group elements into sections (roughly every 5 elements)
    for (let i = 0; i < visibleElements.length; i += 5) {
      const sectionElements = visibleElements.slice(i, i + 5);
      const modules = sectionElements
        .map((el) => this.elementToModule(el))
        .filter((m) => m !== null)
        .join('\n');

      if (modules) {
        const section = this.wrapInSection(modules);
        sections.push(section);
      }
    }

    return {
      format: 'shortcode',
      content: sections.join('\n\n'),
      metadata: {
        widgetCount: this.countModules(sections.join('')),
        sectionCount: sections.length,
        conversionMethod: 'playwright',
      },
    };
  }

  /**
   * Convert WordPress block to Divi section
   */
  private blockToSection(block: WordPressBlock): string | null {
    const blockType = this.getBlockFullName(block);

    // Handle columns (create multi-column row)
    if (blockType === 'core:columns' && block.innerBlocks) {
      const columns = block.innerBlocks.map((col) => {
        const modules = col.innerBlocks
          ?.map((innerBlock) => this.blockToModule(innerBlock))
          .filter((m) => m !== null)
          .join('\n') || '';

        return `[et_pb_column type="4_4" _builder_version="4.0.0"]${modules}[/et_pb_column]`;
      }).join('\n');

      return `[et_pb_section fb_built="1" _builder_version="4.0.0"][et_pb_row _builder_version="4.0.0"]\n${columns}\n[/et_pb_row][/et_pb_section]`;
    }

    // Handle group/cover (single section)
    if ((blockType === 'core:group' || blockType === 'core:cover') && block.innerBlocks) {
      const modules = block.innerBlocks
        .map((innerBlock) => this.blockToModule(innerBlock))
        .filter((m) => m !== null)
        .join('\n');

      return this.wrapInSection(modules);
    }

    // Regular blocks - convert to module and wrap in section
    const module = this.blockToModule(block);
    if (!module) return null;

    return this.wrapInSection(module);
  }

  /**
   * Convert WordPress block to Divi module
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
          '_builder_version="4.0.0"',
          `text_align="${textAlign}"`,
        ];

        if (textColor) {
          attrs.push(`text_color="${textColor}"`);
        }

        return `[et_pb_text ${attrs.join(' ')}]<h${level}>${this.escapeHTML(text)}</h${level}>[/et_pb_text]`;
      }

      case 'core:paragraph': {
        const text = this.stripHTML(block.innerHTML);
        if (!text) return null;

        const textAlign = this.getAlignment(block);
        const textColor = this.parseColor(block.attributes?.textColor || '');
        const backgroundColor = this.parseColor(block.attributes?.backgroundColor || '');

        const attrs: string[] = [
          '_builder_version="4.0.0"',
          `text_align="${textAlign}"`,
        ];

        if (textColor) attrs.push(`text_color="${textColor}"`);
        if (backgroundColor) attrs.push(`background_color="${backgroundColor}"`);

        return `[et_pb_text ${attrs.join(' ')}]<p>${this.escapeHTML(text)}</p>[/et_pb_text]`;
      }

      case 'core:image': {
        const src = this.extractImageSrc(block.innerHTML);
        if (!src) return null;

        const alt = block.attributes?.alt || '';
        const align = this.getAlignment(block);

        const attrs: string[] = [
          `src="${src}"`,
          `alt="${this.escapeHTML(alt)}"`,
          `align="${align}"`,
          '_builder_version="4.0.0"',
        ];

        return `[et_pb_image ${attrs.join(' ')} /]`;
      }

      case 'core:button':
      case 'core:buttons': {
        const text = this.stripHTML(block.innerHTML);
        const url = this.extractLinkHref(block.innerHTML) || '#';
        const backgroundColor = this.parseColor(block.attributes?.backgroundColor || '');
        const textColor = this.parseColor(block.attributes?.textColor || '');

        const attrs: string[] = [
          `button_url="${url}"`,
          `button_text="${this.escapeHTML(text)}"`,
          '_builder_version="4.0.0"',
        ];

        if (backgroundColor) attrs.push(`button_bg_color="${backgroundColor}"`);
        if (textColor) attrs.push(`button_text_color="${textColor}"`);

        return `[et_pb_button ${attrs.join(' ')} /]`;
      }

      case 'core:list': {
        const listHTML = block.innerHTML;
        return `[et_pb_text _builder_version="4.0.0"]${listHTML}[/et_pb_text]`;
      }

      case 'core:quote': {
        const text = this.stripHTML(block.innerHTML);
        return `[et_pb_text _builder_version="4.0.0"]<blockquote>${this.escapeHTML(text)}</blockquote>[/et_pb_text]`;
      }

      case 'core:video': {
        const src = this.extractImageSrc(block.innerHTML); // video src extraction
        if (!src) return null;

        return `[et_pb_video src="${src}" _builder_version="4.0.0" /]`;
      }

      case 'core:embed': {
        const url = block.attributes?.url || '';
        if (!url) return null;

        // Divi has specific video module for embeds
        return `[et_pb_video src="${url}" _builder_version="4.0.0" /]`;
      }

      case 'core:separator':
        return `[et_pb_divider _builder_version="4.0.0" /]`;

      default: {
        // Fallback: wrap any HTML in text module
        if (block.innerHTML) {
          return `[et_pb_text _builder_version="4.0.0"]${block.innerHTML}[/et_pb_text]`;
        }
        return null;
      }
    }
  }

  /**
   * Convert Playwright element to Divi module
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
          '_builder_version="4.0.0"',
          `text_align="${textAlign}"`,
        ];

        if (textColor) attrs.push(`text_color="${textColor}"`);

        return `[et_pb_text ${attrs.join(' ')}]<h${level}>${this.escapeHTML(text)}</h${level}>[/et_pb_text]`;
      }

      case 'p': {
        const text = this.stripHTML(element.text);
        if (!text) return null;

        const textAlign = element.styles.textAlign || 'left';
        const textColor = this.parseColor(element.styles.color || '');
        const backgroundColor = this.parseColor(element.styles.backgroundColor || '');

        const attrs: string[] = [
          '_builder_version="4.0.0"',
          `text_align="${textAlign}"`,
        ];

        if (textColor) attrs.push(`text_color="${textColor}"`);
        if (backgroundColor) attrs.push(`background_color="${backgroundColor}"`);

        return `[et_pb_text ${attrs.join(' ')}]<p>${this.escapeHTML(text)}</p>[/et_pb_text]`;
      }

      case 'img': {
        const src = element.attributes?.src;
        if (!src) return null;

        const alt = element.attributes?.alt || '';
        const align = element.styles.textAlign || 'center';

        const attrs: string[] = [
          `src="${src}"`,
          `alt="${this.escapeHTML(alt)}"`,
          `align="${align}"`,
          '_builder_version="4.0.0"',
        ];

        return `[et_pb_image ${attrs.join(' ')} /]`;
      }

      case 'a':
      case 'button': {
        const text = this.stripHTML(element.text);
        const url = element.attributes?.href || '#';
        const backgroundColor = this.parseColor(element.styles.backgroundColor || '');
        const textColor = this.parseColor(element.styles.color || '');

        const attrs: string[] = [
          `button_url="${url}"`,
          `button_text="${this.escapeHTML(text)}"`,
          '_builder_version="4.0.0"',
        ];

        if (backgroundColor) attrs.push(`button_bg_color="${backgroundColor}"`);
        if (textColor) attrs.push(`button_text_color="${textColor}"`);

        return `[et_pb_button ${attrs.join(' ')} /]`;
      }

      case 'video': {
        const src = element.attributes?.src;
        if (!src) return null;

        return `[et_pb_video src="${src}" _builder_version="4.0.0" /]`;
      }

      case 'iframe': {
        const src = element.attributes?.src;
        if (!src) return null;

        // YouTube/Vimeo embeds
        if (src.includes('youtube.com') || src.includes('youtu.be') || src.includes('vimeo.com')) {
          return `[et_pb_video src="${src}" _builder_version="4.0.0" /]`;
        }

        return null;
      }

      default:
        return null;
    }
  }

  /**
   * Wrap modules in Divi section/row/column structure
   */
  private wrapInSection(modules: string): string {
    return `[et_pb_section fb_built="1" _builder_version="4.0.0"][et_pb_row _builder_version="4.0.0"][et_pb_column type="4_4" _builder_version="4.0.0"]\n${modules}\n[/et_pb_column][/et_pb_row][/et_pb_section]`;
  }

  /**
   * Count Divi modules in shortcode
   */
  private countModules(shortcode: string): number {
    const modulePattern = /\[et_pb_(text|image|button|video|blurb|slider|gallery|divider)/g;
    const matches = shortcode.match(modulePattern);
    return matches ? matches.length : 0;
  }
}

/**
 * Export singleton instance
 */
export const unifiedDiviBuilder = new UnifiedDiviBuilder();
