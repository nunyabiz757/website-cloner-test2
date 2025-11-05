import type { WordPressBlock } from '../../../types/wordpress';
import type { PageData, ElementData } from '../../parsers/PlaywrightParserService';
import { BaseUnifiedBuilder, BuilderOutput } from './BaseUnifiedBuilder';

/**
 * Unified Kadence Builder
 *
 * Kadence uses Gutenberg blocks with Kadence-specific enhancements.
 * Format: Gutenberg blocks (HTML comments + JSON)
 * Blocks: kadence/heading, kadence/advancedheading, kadence/text, kadence/image, kadence/button
 *
 * Format: HTML (Gutenberg-style blocks)
 */
export class UnifiedKadenceBuilder extends BaseUnifiedBuilder {
  /**
   * Convert from native WordPress blocks (BEST method)
   */
  protected async convertFromNativeBlocks(
    blocks: WordPressBlock[]
  ): Promise<BuilderOutput> {
    console.log('✨ Converting from native blocks (Kadence format)');

    const kadenceBlocks = blocks.map((block) =>
      this.blockToKadence(block)
    );

    return {
      format: 'html',
      content: kadenceBlocks.join('\n\n'),
      metadata: {
        widgetCount: blocks.length,
        sectionCount: blocks.length,
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
    console.log('🔍 Converting from Playwright data (Kadence format)');

    const visibleElements = this.filterVisibleElements(pageData.elements);
    const kadenceBlocks = visibleElements
      .map((el) => this.elementToKadence(el))
      .filter((block) => block !== null);

    return {
      format: 'html',
      content: kadenceBlocks.join('\n\n'),
      metadata: {
        widgetCount: kadenceBlocks.length,
        sectionCount: kadenceBlocks.length,
        conversionMethod: 'playwright',
      },
    };
  }

  /**
   * Convert WordPress block to Kadence block
   */
  private blockToKadence(block: WordPressBlock): string {
    const blockType = this.getBlockFullName(block);

    switch (blockType) {
      case 'core:heading': {
        const text = this.stripHTML(block.innerHTML);
        const level = block.attributes?.level || 2;
        const textAlign = this.getAlignment(block);
        const textColor = this.parseColor(block.attributes?.textColor || '');

        const attrs: any = { level };
        if (textAlign !== 'left') attrs.textAlign = textAlign;
        if (textColor) attrs.color = textColor;

        const attrsJson = JSON.stringify(attrs);
        return `<!-- wp:kadence/advancedheading ${attrsJson} -->\n<h${level} class="kt-adv-heading">${this.escapeHTML(text)}</h${level}>\n<!-- /wp:kadence/advancedheading -->`;
      }

      case 'core:paragraph': {
        const text = this.stripHTML(block.innerHTML);
        if (!text) return '';

        const textAlign = this.getAlignment(block);
        const textColor = this.parseColor(block.attributes?.textColor || '');

        const attrs: any = {};
        if (textAlign !== 'left') attrs.align = textAlign;
        if (textColor) attrs.textColor = textColor;

        const attrsJson = Object.keys(attrs).length > 0 ? ` ${JSON.stringify(attrs)}` : '';
        return `<!-- wp:paragraph${attrsJson} -->\n<p>${this.escapeHTML(text)}</p>\n<!-- /wp:paragraph -->`;
      }

      case 'core:image': {
        const src = this.extractImageSrc(block.innerHTML);
        if (!src) return '';

        const alt = block.attributes?.alt || '';
        const attrs = { url: src, alt };

        const attrsJson = JSON.stringify(attrs);
        return `<!-- wp:kadence/image ${attrsJson} -->\n<figure class="kb-image"><img src="${src}" alt="${this.escapeHTML(alt)}"/></figure>\n<!-- /wp:kadence/image -->`;
      }

      case 'core:button':
      case 'core:buttons': {
        const text = this.stripHTML(block.innerHTML);
        const url = this.extractLinkHref(block.innerHTML) || '#';
        const backgroundColor = this.parseColor(block.attributes?.backgroundColor || '');
        const textColor = this.parseColor(block.attributes?.textColor || '');

        const attrs: any = { url, text };
        if (backgroundColor) attrs.background = backgroundColor;
        if (textColor) attrs.color = textColor;

        const attrsJson = JSON.stringify(attrs);
        return `<!-- wp:kadence/advancedbtn ${attrsJson} -->\n<div class="wp-block-kadence-advancedbtn"><a class="kt-button" href="${url}">${this.escapeHTML(text)}</a></div>\n<!-- /wp:kadence/advancedbtn -->`;
      }

      default:
        // Fallback to standard paragraph
        if (block.innerHTML) {
          return `<!-- wp:paragraph -->\n<p>${this.stripHTML(block.innerHTML)}</p>\n<!-- /wp:paragraph -->`;
        }
        return '';
    }
  }

  /**
   * Convert Playwright element to Kadence block
   */
  private elementToKadence(element: ElementData): string | null {
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

        const attrs: any = { level };
        if (textAlign !== 'left') attrs.textAlign = textAlign;
        if (textColor) attrs.color = textColor;

        const attrsJson = JSON.stringify(attrs);
        return `<!-- wp:kadence/advancedheading ${attrsJson} -->\n<h${level} class="kt-adv-heading">${this.escapeHTML(text)}</h${level}>\n<!-- /wp:kadence/advancedheading -->`;
      }

      case 'p': {
        const text = this.stripHTML(element.text);
        if (!text) return null;

        return `<!-- wp:paragraph -->\n<p>${this.escapeHTML(text)}</p>\n<!-- /wp:paragraph -->`;
      }

      case 'img': {
        const src = element.attributes?.src;
        if (!src) return null;

        const alt = element.attributes?.alt || '';
        const attrs = { url: src, alt };

        const attrsJson = JSON.stringify(attrs);
        return `<!-- wp:kadence/image ${attrsJson} -->\n<figure class="kb-image"><img src="${src}" alt="${this.escapeHTML(alt)}"/></figure>\n<!-- /wp:kadence/image -->`;
      }

      case 'a':
      case 'button': {
        const text = this.stripHTML(element.text);
        const url = element.attributes?.href || '#';

        const attrs = { url, text };
        const attrsJson = JSON.stringify(attrs);
        return `<!-- wp:kadence/advancedbtn ${attrsJson} -->\n<div class="wp-block-kadence-advancedbtn"><a class="kt-button" href="${url}">${this.escapeHTML(text)}</a></div>\n<!-- /wp:kadence/advancedbtn -->`;
      }

      default:
        return null;
    }
  }
}

/**
 * Export singleton instance
 */
export const unifiedKadenceBuilder = new UnifiedKadenceBuilder();
