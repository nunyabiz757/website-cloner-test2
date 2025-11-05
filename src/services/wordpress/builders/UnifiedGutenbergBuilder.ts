import type { WordPressBlock } from '../../../types/wordpress';
import type { PageData, ElementData } from '../../parsers/PlaywrightParserService';
import { BaseUnifiedBuilder, BuilderOutput } from './BaseUnifiedBuilder';

/**
 * Unified Gutenberg Builder
 *
 * Gutenberg is the native WordPress block editor, so this builder
 * primarily passes through native blocks with minimal formatting.
 *
 * Format: Gutenberg blocks (HTML comments + JSON)
 * Example: <!-- wp:heading {"level":2} --><h2>Title</h2><!-- /wp:heading -->
 */
export class UnifiedGutenbergBuilder extends BaseUnifiedBuilder {
  /**
   * Convert from native WordPress blocks (BEST method)
   * Gutenberg uses native blocks, so just format them properly
   */
  protected async convertFromNativeBlocks(
    blocks: WordPressBlock[]
  ): Promise<BuilderOutput> {
    console.log('✨ Converting from native blocks (Gutenberg format)');

    const gutenbergBlocks = blocks.map((block) =>
      this.blockToGutenberg(block)
    );

    return {
      format: 'html',
      content: gutenbergBlocks.join('\n\n'),
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
    console.log('🔍 Converting from Playwright data (Gutenberg format)');

    const visibleElements = this.filterVisibleElements(pageData.elements);
    const gutenbergBlocks = visibleElements
      .map((el) => this.elementToGutenberg(el))
      .filter((block) => block !== null);

    return {
      format: 'html',
      content: gutenbergBlocks.join('\n\n'),
      metadata: {
        widgetCount: gutenbergBlocks.length,
        sectionCount: gutenbergBlocks.length,
        conversionMethod: 'playwright',
      },
    };
  }

  /**
   * Convert WordPress block to Gutenberg format
   * Format: <!-- wp:blockname {"attributes"} -->content<!-- /wp:blockname -->
   */
  private blockToGutenberg(block: WordPressBlock): string {
    const blockType = this.getBlockFullName(block);
    const blockName = blockType.replace(':', '/'); // core:heading → core/heading

    // Serialize attributes to JSON
    const attrs = block.attributes && Object.keys(block.attributes).length > 0
      ? ` ${JSON.stringify(block.attributes)}`
      : '';

    // Get inner content (HTML)
    const content = block.innerHTML || '';

    // Self-closing blocks (no content)
    if (!content && this.isSelfClosingBlock(blockType)) {
      return `<!-- wp:${blockName}${attrs} /-->`;
    }

    // Handle nested blocks (columns, group, etc.)
    if (block.innerBlocks && block.innerBlocks.length > 0) {
      const innerContent = block.innerBlocks
        .map((innerBlock) => this.blockToGutenberg(innerBlock))
        .join('\n');

      return `<!-- wp:${blockName}${attrs} -->\n${content}\n${innerContent}\n<!-- /wp:${blockName} -->`;
    }

    // Standard block with content
    return `<!-- wp:${blockName}${attrs} -->\n${content}\n<!-- /wp:${blockName} -->`;
  }

  /**
   * Convert Playwright element to Gutenberg format
   */
  private elementToGutenberg(element: ElementData): string | null {
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
        const attrs: any = { level };

        // Extract alignment from styles
        if (element.styles.textAlign && element.styles.textAlign !== 'left') {
          attrs.textAlign = element.styles.textAlign;
        }

        // Extract color
        if (element.styles.color) {
          const color = this.parseColor(element.styles.color);
          if (color) attrs.textColor = color;
        }

        const attrsJson = JSON.stringify(attrs);
        return `<!-- wp:heading ${attrsJson} -->\n<${tag}>${this.escapeHTML(text)}</${tag}>\n<!-- /wp:heading -->`;
      }

      case 'p': {
        const text = this.stripHTML(element.text);
        if (!text) return null;

        const attrs: any = {};

        // Extract alignment
        if (element.styles.textAlign && element.styles.textAlign !== 'left') {
          attrs.align = element.styles.textAlign;
        }

        // Extract color
        if (element.styles.color) {
          const color = this.parseColor(element.styles.color);
          if (color) attrs.textColor = color;
        }

        // Extract font size
        if (element.styles.fontSize) {
          attrs.fontSize = element.styles.fontSize;
        }

        const attrsJson = Object.keys(attrs).length > 0 ? ` ${JSON.stringify(attrs)}` : '';
        return `<!-- wp:paragraph${attrsJson} -->\n<p>${this.escapeHTML(text)}</p>\n<!-- /wp:paragraph -->`;
      }

      case 'img': {
        const src = element.attributes?.src;
        if (!src) return null;

        const alt = element.attributes?.alt || '';
        const attrs: any = { url: src };

        if (alt) attrs.alt = alt;

        // Extract alignment from parent or element
        if (element.styles.textAlign) {
          attrs.align = element.styles.textAlign;
        }

        const attrsJson = JSON.stringify(attrs);
        return `<!-- wp:image ${attrsJson} -->\n<figure class="wp-block-image"><img src="${src}" alt="${this.escapeHTML(alt)}"/></figure>\n<!-- /wp:image -->`;
      }

      case 'a':
      case 'button': {
        const text = this.stripHTML(element.text);
        const href = element.attributes?.href || '#';

        const attrs: any = { url: href };

        // Extract background color for button
        if (element.styles.backgroundColor) {
          const bgColor = this.parseColor(element.styles.backgroundColor);
          if (bgColor) attrs.backgroundColor = bgColor;
        }

        // Extract text color
        if (element.styles.color) {
          const textColor = this.parseColor(element.styles.color);
          if (textColor) attrs.textColor = textColor;
        }

        const attrsJson = JSON.stringify(attrs);
        return `<!-- wp:button ${attrsJson} -->\n<div class="wp-block-button"><a class="wp-block-button__link" href="${href}">${this.escapeHTML(text)}</a></div>\n<!-- /wp:button -->`;
      }

      case 'ul':
      case 'ol': {
        const listType = tag === 'ul' ? 'ul' : 'ol';
        const listHTML = element.text; // Contains full list HTML

        return `<!-- wp:list -->\n<${listType}>${listHTML}</${listType}>\n<!-- /wp:list -->`;
      }

      case 'blockquote': {
        const text = this.stripHTML(element.text);
        return `<!-- wp:quote -->\n<blockquote class="wp-block-quote"><p>${this.escapeHTML(text)}</p></blockquote>\n<!-- /wp:quote -->`;
      }

      case 'video': {
        const src = element.attributes?.src;
        if (!src) return null;

        const attrs = { src };
        const attrsJson = JSON.stringify(attrs);

        return `<!-- wp:video ${attrsJson} -->\n<figure class="wp-block-video"><video controls src="${src}"></video></figure>\n<!-- /wp:video -->`;
      }

      case 'iframe': {
        const src = element.attributes?.src;
        if (!src) return null;

        // Detect YouTube/Vimeo embeds
        if (src.includes('youtube.com') || src.includes('youtu.be')) {
          const attrs = { url: src, type: 'video', providerNameSlug: 'youtube' };
          const attrsJson = JSON.stringify(attrs);
          return `<!-- wp:embed ${attrsJson} -->\n<figure class="wp-block-embed"><div class="wp-block-embed__wrapper">${src}</div></figure>\n<!-- /wp:embed -->`;
        } else if (src.includes('vimeo.com')) {
          const attrs = { url: src, type: 'video', providerNameSlug: 'vimeo' };
          const attrsJson = JSON.stringify(attrs);
          return `<!-- wp:embed ${attrsJson} -->\n<figure class="wp-block-embed"><div class="wp-block-embed__wrapper">${src}</div></figure>\n<!-- /wp:embed -->`;
        }

        return null;
      }

      default:
        return null;
    }
  }

  /**
   * Check if block is self-closing (no inner content)
   */
  private isSelfClosingBlock(blockType: string): boolean {
    const selfClosing = [
      'core:separator',
      'core:spacer',
      'core:more',
      'core:nextpage',
    ];

    return selfClosing.includes(blockType);
  }
}

/**
 * Export singleton instance
 */
export const unifiedGutenbergBuilder = new UnifiedGutenbergBuilder();
