import type { WordPressBlock } from '../../../types/wordpress';
import type { PageData, ElementData } from '../../parsers/PlaywrightParserService';
import { BaseUnifiedBuilder, BuilderOutput } from './BaseUnifiedBuilder';

/**
 * Unified Plugin-Free Theme Builder
 *
 * Generates pure semantic HTML without any page builder dependencies.
 * Perfect for lightweight themes and maximum compatibility.
 *
 * Format: HTML (semantic, standards-compliant)
 */
export class UnifiedPluginFreeThemeBuilder extends BaseUnifiedBuilder {
  /**
   * Convert from native WordPress blocks (BEST method)
   */
  protected async convertFromNativeBlocks(
    blocks: WordPressBlock[]
  ): Promise<BuilderOutput> {
    console.log('✨ Converting from native blocks (Plugin-Free HTML)');

    const htmlBlocks = blocks.map((block) => this.blockToHTML(block));

    return {
      format: 'html',
      content: htmlBlocks.join('\n'),
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
    console.log('🔍 Converting from Playwright data (Plugin-Free HTML)');

    const visibleElements = this.filterVisibleElements(pageData.elements);
    const htmlElements = visibleElements
      .map((el) => this.elementToHTML(el))
      .filter((html) => html !== null);

    return {
      format: 'html',
      content: htmlElements.join('\n'),
      metadata: {
        widgetCount: htmlElements.length,
        sectionCount: htmlElements.length,
        conversionMethod: 'playwright',
      },
    };
  }

  /**
   * Convert WordPress block to semantic HTML
   */
  private blockToHTML(block: WordPressBlock): string {
    const blockType = this.getBlockFullName(block);

    switch (blockType) {
      case 'core:heading': {
        const text = this.stripHTML(block.innerHTML);
        const level = block.attributes?.level || 2;
        const textAlign = this.getAlignment(block);
        const textColor = this.parseColor(block.attributes?.textColor || '');

        const style: string[] = [];
        if (textAlign !== 'left') style.push(`text-align: ${textAlign}`);
        if (textColor) style.push(`color: ${textColor}`);

        const styleAttr = style.length > 0 ? ` style="${style.join('; ')}"` : '';
        return `<h${level}${styleAttr}>${this.escapeHTML(text)}</h${level}>`;
      }

      case 'core:paragraph': {
        const text = this.stripHTML(block.innerHTML);
        if (!text) return '';

        const textAlign = this.getAlignment(block);
        const textColor = this.parseColor(block.attributes?.textColor || '');
        const backgroundColor = this.parseColor(block.attributes?.backgroundColor || '');

        const style: string[] = [];
        if (textAlign !== 'left') style.push(`text-align: ${textAlign}`);
        if (textColor) style.push(`color: ${textColor}`);
        if (backgroundColor) style.push(`background-color: ${backgroundColor}`);

        const styleAttr = style.length > 0 ? ` style="${style.join('; ')}"` : '';
        return `<p${styleAttr}>${this.escapeHTML(text)}</p>`;
      }

      case 'core:image': {
        const src = this.extractImageSrc(block.innerHTML);
        if (!src) return '';

        const alt = block.attributes?.alt || '';
        const align = this.getAlignment(block);

        const style = align !== 'left' ? ` style="text-align: ${align}"` : '';
        return `<figure${style}><img src="${src}" alt="${this.escapeHTML(alt)}" /></figure>`;
      }

      case 'core:button':
      case 'core:buttons': {
        const text = this.stripHTML(block.innerHTML);
        const url = this.extractLinkHref(block.innerHTML) || '#';
        const backgroundColor = this.parseColor(block.attributes?.backgroundColor || '');
        const textColor = this.parseColor(block.attributes?.textColor || '');

        const style: string[] = [];
        if (backgroundColor) style.push(`background-color: ${backgroundColor}`);
        if (textColor) style.push(`color: ${textColor}`);
        style.push('padding: 12px 24px');
        style.push('text-decoration: none');
        style.push('display: inline-block');
        style.push('border-radius: 4px');

        const styleAttr = ` style="${style.join('; ')}"`;
        return `<a href="${url}" class="button"${styleAttr}>${this.escapeHTML(text)}</a>`;
      }

      case 'core:list': {
        return block.innerHTML; // Already proper HTML list
      }

      case 'core:quote': {
        const text = this.stripHTML(block.innerHTML);
        return `<blockquote>${this.escapeHTML(text)}</blockquote>`;
      }

      case 'core:video': {
        const src = this.extractImageSrc(block.innerHTML);
        if (!src) return '';

        return `<video controls src="${src}"></video>`;
      }

      case 'core:embed': {
        const url = block.attributes?.url || '';
        if (!url) return '';

        // Responsive iframe wrapper
        if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) {
          return `<div class="video-wrapper" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe src="${url}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allowfullscreen></iframe>
</div>`;
        }

        return `<iframe src="${url}" width="100%" height="400"></iframe>`;
      }

      case 'core:separator':
        return '<hr />';

      case 'core:columns': {
        // Responsive columns using flexbox
        if (block.innerBlocks && block.innerBlocks.length > 0) {
          const columns = block.innerBlocks
            .map((col) => {
              const content = col.innerBlocks
                ?.map((innerBlock) => this.blockToHTML(innerBlock))
                .join('\n') || '';

              return `  <div class="column" style="flex: 1; padding: 0 15px;">\n${content}\n  </div>`;
            })
            .join('\n');

          return `<div class="columns" style="display: flex; flex-wrap: wrap; margin: 0 -15px;">\n${columns}\n</div>`;
        }
        return '';
      }

      case 'core:group':
      case 'core:cover': {
        if (block.innerBlocks && block.innerBlocks.length > 0) {
          const content = block.innerBlocks
            .map((innerBlock) => this.blockToHTML(innerBlock))
            .join('\n');

          const backgroundColor = this.parseColor(block.attributes?.backgroundColor || '');
          const style = backgroundColor ? ` style="background-color: ${backgroundColor}; padding: 20px;"` : ' style="padding: 20px;"';

          return `<div class="group"${style}>\n${content}\n</div>`;
        }
        return '';
      }

      default: {
        // Fallback: return raw HTML if available
        if (block.innerHTML) {
          return block.innerHTML;
        }
        return '';
      }
    }
  }

  /**
   * Convert Playwright element to semantic HTML
   */
  private elementToHTML(element: ElementData): string | null {
    const tag = element.tag.toLowerCase();

    switch (tag) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6': {
        const text = this.stripHTML(element.text);
        const textAlign = element.styles.textAlign || '';
        const textColor = this.parseColor(element.styles.color || '');

        const style: string[] = [];
        if (textAlign && textAlign !== 'left') style.push(`text-align: ${textAlign}`);
        if (textColor) style.push(`color: ${textColor}`);

        const styleAttr = style.length > 0 ? ` style="${style.join('; ')}"` : '';
        return `<${tag}${styleAttr}>${this.escapeHTML(text)}</${tag}>`;
      }

      case 'p': {
        const text = this.stripHTML(element.text);
        if (!text) return null;

        const textAlign = element.styles.textAlign || '';
        const textColor = this.parseColor(element.styles.color || '');

        const style: string[] = [];
        if (textAlign && textAlign !== 'left') style.push(`text-align: ${textAlign}`);
        if (textColor) style.push(`color: ${textColor}`);

        const styleAttr = style.length > 0 ? ` style="${style.join('; ')}"` : '';
        return `<p${styleAttr}>${this.escapeHTML(text)}</p>`;
      }

      case 'img': {
        const src = element.attributes?.src;
        if (!src) return null;

        const alt = element.attributes?.alt || '';
        return `<img src="${src}" alt="${this.escapeHTML(alt)}" />`;
      }

      case 'a':
      case 'button': {
        const text = this.stripHTML(element.text);
        const url = element.attributes?.href || '#';
        const backgroundColor = this.parseColor(element.styles.backgroundColor || '');
        const textColor = this.parseColor(element.styles.color || '');

        const style: string[] = [];
        if (backgroundColor) style.push(`background-color: ${backgroundColor}`);
        if (textColor) style.push(`color: ${textColor}`);
        style.push('padding: 12px 24px');
        style.push('text-decoration: none');
        style.push('display: inline-block');
        style.push('border-radius: 4px');

        const styleAttr = ` style="${style.join('; ')}"`;
        return `<a href="${url}" class="button"${styleAttr}>${this.escapeHTML(text)}</a>`;
      }

      case 'video': {
        const src = element.attributes?.src;
        if (!src) return null;

        return `<video controls src="${src}"></video>`;
      }

      case 'iframe': {
        const src = element.attributes?.src;
        if (!src) return null;

        if (src.includes('youtube.com') || src.includes('youtu.be') || src.includes('vimeo.com')) {
          return `<div class="video-wrapper" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe src="${src}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allowfullscreen></iframe>
</div>`;
        }

        return `<iframe src="${src}" width="100%" height="400"></iframe>`;
      }

      default:
        return null;
    }
  }
}

/**
 * Export singleton instance
 */
export const unifiedPluginFreeThemeBuilder = new UnifiedPluginFreeThemeBuilder();
