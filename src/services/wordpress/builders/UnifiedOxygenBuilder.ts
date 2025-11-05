import type { WordPressBlock } from '../../../types/wordpress';
import type { PageData, ElementData } from '../../parsers/PlaywrightParserService';
import { BaseUnifiedBuilder, BuilderOutput } from './BaseUnifiedBuilder';

interface OxygenComponent {
  id: number;
  name: string;
  options?: Record<string, any>;
  children?: OxygenComponent[];
}

/**
 * Unified Oxygen Builder
 *
 * Oxygen uses JSON format for page building.
 * Components: ct-section, heading, text_block, image, button, video, etc.
 *
 * Format: JSON
 */
export class UnifiedOxygenBuilder extends BaseUnifiedBuilder {
  private nextId = 1;

  /**
   * Convert from native WordPress blocks (BEST method)
   */
  protected async convertFromNativeBlocks(
    blocks: WordPressBlock[]
  ): Promise<BuilderOutput> {
    console.log('✨ Converting from native blocks (Oxygen format)');

    this.nextId = 1; // Reset ID counter
    const components: OxygenComponent[] = [];

    for (const block of blocks) {
      const component = this.blockToComponent(block);
      if (component) components.push(component);
    }

    return {
      format: 'json',
      content: {
        version: '3.0',
        components: components,
      },
      metadata: {
        widgetCount: this.countComponents(components),
        sectionCount: components.length,
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
    console.log('🔍 Converting from Playwright data (Oxygen format)');

    this.nextId = 1; // Reset ID counter
    const visibleElements = this.filterVisibleElements(pageData.elements);
    const components: OxygenComponent[] = [];

    for (const element of visibleElements) {
      const component = this.elementToComponent(element);
      if (component) components.push(component);
    }

    return {
      format: 'json',
      content: {
        version: '3.0',
        components: components,
      },
      metadata: {
        widgetCount: components.length,
        sectionCount: components.length,
        conversionMethod: 'playwright',
      },
    };
  }

  /**
   * Convert WordPress block to Oxygen component
   */
  private blockToComponent(block: WordPressBlock): OxygenComponent | null {
    const blockType = this.getBlockFullName(block);

    switch (blockType) {
      case 'core:heading': {
        const text = this.stripHTML(block.innerHTML);
        const level = block.attributes?.level || 2;
        const textAlign = this.getAlignment(block);
        const textColor = this.parseColor(block.attributes?.textColor || '');

        return {
          id: this.nextId++,
          name: 'heading',
          options: {
            tag: `h${level}`,
            ct_content: text,
            text_align: textAlign,
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
          id: this.nextId++,
          name: 'text_block',
          options: {
            ct_content: text,
            text_align: textAlign,
            color: textColor || undefined,
          },
        };
      }

      case 'core:image': {
        const src = this.extractImageSrc(block.innerHTML);
        if (!src) return null;

        const alt = block.attributes?.alt || '';

        return {
          id: this.nextId++,
          name: 'image',
          options: {
            src: src,
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
          id: this.nextId++,
          name: 'ct_link_button',
          options: {
            url: url,
            ct_content: text,
            background_color: backgroundColor || undefined,
            color: textColor || undefined,
          },
        };
      }

      case 'core:video':
      case 'core:embed': {
        const url = block.attributes?.url || this.extractImageSrc(block.innerHTML);
        if (!url) return null;

        return {
          id: this.nextId++,
          name: 'video',
          options: {
            video_url: url,
          },
        };
      }

      case 'core:columns': {
        // Create section with columns
        const children: OxygenComponent[] = [];

        if (block.innerBlocks) {
          for (const col of block.innerBlocks) {
            const colComponents = col.innerBlocks
              ?.map((innerBlock) => this.blockToComponent(innerBlock))
              .filter((c) => c !== null) as OxygenComponent[] || [];

            if (colComponents.length > 0) {
              children.push({
                id: this.nextId++,
                name: 'ct-div-block',
                children: colComponents,
              });
            }
          }
        }

        return {
          id: this.nextId++,
          name: 'ct-section',
          options: {
            display: 'flex',
            flex_direction: 'row',
          },
          children: children,
        };
      }

      default: {
        if (block.innerHTML) {
          return {
            id: this.nextId++,
            name: 'text_block',
            options: {
              ct_content: this.stripHTML(block.innerHTML),
            },
          };
        }
        return null;
      }
    }
  }

  /**
   * Convert Playwright element to Oxygen component
   */
  private elementToComponent(element: ElementData): OxygenComponent | null {
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
          id: this.nextId++,
          name: 'heading',
          options: {
            tag: `h${level}`,
            ct_content: text,
            text_align: textAlign,
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
          id: this.nextId++,
          name: 'text_block',
          options: {
            ct_content: text,
            text_align: textAlign,
            color: textColor || undefined,
          },
        };
      }

      case 'img': {
        const src = element.attributes?.src;
        if (!src) return null;

        const alt = element.attributes?.alt || '';

        return {
          id: this.nextId++,
          name: 'image',
          options: {
            src: src,
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
          id: this.nextId++,
          name: 'ct_link_button',
          options: {
            url: url,
            ct_content: text,
            background_color: backgroundColor || undefined,
            color: textColor || undefined,
          },
        };
      }

      case 'video':
      case 'iframe': {
        const src = element.attributes?.src;
        if (!src) return null;

        return {
          id: this.nextId++,
          name: 'video',
          options: {
            video_url: src,
          },
        };
      }

      default:
        return null;
    }
  }

  /**
   * Count total components recursively
   */
  private countComponents(components: OxygenComponent[]): number {
    let count = components.length;
    for (const comp of components) {
      if (comp.children) {
        count += this.countComponents(comp.children);
      }
    }
    return count;
  }
}

/**
 * Export singleton instance
 */
export const unifiedOxygenBuilder = new UnifiedOxygenBuilder();
