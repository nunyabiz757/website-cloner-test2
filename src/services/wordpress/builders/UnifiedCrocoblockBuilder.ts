import type { WordPressBlock } from '../../../types/wordpress';
import type { PageData, ElementData } from '../../parsers/PlaywrightParserService';
import { BaseUnifiedBuilder, BuilderOutput } from './BaseUnifiedBuilder';

interface CrocoblockWidget {
  id: string;
  widgetType: string;
  settings: Record<string, any>;
}

/**
 * Unified Crocoblock (JetEngine) Builder
 *
 * Crocoblock/JetEngine uses JSON format similar to Elementor but with
 * dynamic content capabilities and custom post types.
 *
 * Format: JSON
 * Widgets: heading, text-editor, image, button, video, dynamic-field, etc.
 */
export class UnifiedCrocoblockBuilder extends BaseUnifiedBuilder {
  /**
   * Convert from native WordPress blocks (BEST method)
   */
  protected async convertFromNativeBlocks(
    blocks: WordPressBlock[]
  ): Promise<BuilderOutput> {
    console.log('✨ Converting from native blocks (Crocoblock/JetEngine format)');

    const widgets: CrocoblockWidget[] = [];

    for (const block of blocks) {
      const widget = this.blockToWidget(block);
      if (widget) widgets.push(widget);
    }

    return {
      format: 'json',
      content: {
        version: '1.0.0',
        type: 'jet-engine-template',
        content: widgets,
      },
      metadata: {
        widgetCount: widgets.length,
        sectionCount: widgets.length,
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
    console.log('🔍 Converting from Playwright data (Crocoblock/JetEngine format)');

    const visibleElements = this.filterVisibleElements(pageData.elements);
    const widgets: CrocoblockWidget[] = [];

    for (const element of visibleElements) {
      const widget = this.elementToWidget(element);
      if (widget) widgets.push(widget);
    }

    return {
      format: 'json',
      content: {
        version: '1.0.0',
        type: 'jet-engine-template',
        content: widgets,
      },
      metadata: {
        widgetCount: widgets.length,
        sectionCount: widgets.length,
        conversionMethod: 'playwright',
      },
    };
  }

  /**
   * Convert WordPress block to Crocoblock widget
   */
  private blockToWidget(block: WordPressBlock): CrocoblockWidget | null {
    const blockType = this.getBlockFullName(block);

    switch (blockType) {
      case 'core:heading': {
        const text = this.stripHTML(block.innerHTML);
        const level = block.attributes?.level || 2;
        const textAlign = this.getAlignment(block);
        const textColor = this.parseColor(block.attributes?.textColor || '');

        return {
          id: this.generateId(),
          widgetType: 'heading',
          settings: {
            title: text,
            size: `h${level}`,
            align: textAlign,
            title_color: textColor || '',
            __dynamic__: {}, // Crocoblock dynamic fields
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
          widgetType: 'text-editor',
          settings: {
            editor: text,
            text_align: textAlign,
            text_color: textColor || '',
          },
        };
      }

      case 'core:image': {
        const src = this.extractImageSrc(block.innerHTML);
        if (!src) return null;

        const alt = block.attributes?.alt || '';

        return {
          id: this.generateId(),
          widgetType: 'image',
          settings: {
            image: {
              url: src,
              alt: alt,
            },
            link_to: 'none',
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
          widgetType: 'button',
          settings: {
            text: text,
            link: {
              url: url,
              is_external: false,
              nofollow: false,
            },
            button_background_color: backgroundColor || '',
            button_text_color: textColor || '',
          },
        };
      }

      case 'core:video':
      case 'core:embed': {
        const url = block.attributes?.url || this.extractImageSrc(block.innerHTML);
        if (!url) return null;

        // Detect video type
        let videoType = 'hosted';
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          videoType = 'youtube';
        } else if (url.includes('vimeo.com')) {
          videoType = 'vimeo';
        }

        return {
          id: this.generateId(),
          widgetType: 'video',
          settings: {
            video_type: videoType,
            [videoType === 'hosted' ? 'hosted_url' : `${videoType}_url`]: url,
          },
        };
      }

      case 'core:columns': {
        // Create section with columns
        const columnWidgets = block.innerBlocks?.map((col) => {
          const innerWidgets = col.innerBlocks
            ?.map((innerBlock) => this.blockToWidget(innerBlock))
            .filter((w) => w !== null) || [];

          return {
            id: this.generateId(),
            widgetType: 'column',
            settings: {
              _column_size: Math.floor(100 / (block.innerBlocks?.length || 1)),
            },
            elements: innerWidgets,
          };
        }) || [];

        return {
          id: this.generateId(),
          widgetType: 'section',
          settings: {
            layout: 'boxed',
          },
          elements: columnWidgets,
        } as any; // Extended structure for sections
      }

      default: {
        if (block.innerHTML) {
          return {
            id: this.generateId(),
            widgetType: 'text-editor',
            settings: {
              editor: this.stripHTML(block.innerHTML),
            },
          };
        }
        return null;
      }
    }
  }

  /**
   * Convert Playwright element to Crocoblock widget
   */
  private elementToWidget(element: ElementData): CrocoblockWidget | null {
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
          widgetType: 'heading',
          settings: {
            title: text,
            size: `h${level}`,
            align: textAlign,
            title_color: textColor || '',
            __dynamic__: {},
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
          widgetType: 'text-editor',
          settings: {
            editor: text,
            text_align: textAlign,
            text_color: textColor || '',
          },
        };
      }

      case 'img': {
        const src = element.attributes?.src;
        if (!src) return null;

        const alt = element.attributes?.alt || '';

        return {
          id: this.generateId(),
          widgetType: 'image',
          settings: {
            image: {
              url: src,
              alt: alt,
            },
            link_to: 'none',
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
          widgetType: 'button',
          settings: {
            text: text,
            link: {
              url: url,
              is_external: false,
              nofollow: false,
            },
            button_background_color: backgroundColor || '',
            button_text_color: textColor || '',
          },
        };
      }

      case 'video':
      case 'iframe': {
        const src = element.attributes?.src;
        if (!src) return null;

        let videoType = 'hosted';
        if (src.includes('youtube.com') || src.includes('youtu.be')) {
          videoType = 'youtube';
        } else if (src.includes('vimeo.com')) {
          videoType = 'vimeo';
        }

        return {
          id: this.generateId(),
          widgetType: 'video',
          settings: {
            video_type: videoType,
            [videoType === 'hosted' ? 'hosted_url' : `${videoType}_url`]: src,
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
export const unifiedCrocoblockBuilder = new UnifiedCrocoblockBuilder();
