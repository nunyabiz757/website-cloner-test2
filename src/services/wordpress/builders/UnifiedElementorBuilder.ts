import type { WordPressBlock } from '../../../types/wordpress';
import type { PageData, ElementData } from '../../parsers/PlaywrightParserService';
import { BaseUnifiedBuilder, BuilderInput, BuilderOutput } from './BaseUnifiedBuilder';

interface ElementorElement {
  id: string;
  elType: 'section' | 'column' | 'widget';
  settings?: any;
  elements?: ElementorElement[];
  widgetType?: string;
}

/**
 * Unified Elementor Builder
 *
 * Converts WordPress content to Elementor format using:
 * 1. Native WordPress blocks (REST API) - Perfect conversion
 * 2. Playwright page data (browser) - Enhanced with computed styles
 *
 * Replaces the old Cheerio-based ElementorBuilder completely.
 */
export class UnifiedElementorBuilder extends BaseUnifiedBuilder {
  /**
   * Convert from native WordPress blocks (PERFECT conversion!)
   */
  protected async convertFromNativeBlocks(
    blocks: WordPressBlock[]
  ): Promise<BuilderOutput> {
    console.log('✨ Converting from native blocks (perfect mapping!)');

    const sections: ElementorElement[] = [];
    let widgetCount = 0;

    for (const block of blocks) {
      const section = this.blockToSection(block);
      if (section) {
        sections.push(section);
        widgetCount += this.countWidgets(section);
      }
    }

    return {
      format: 'json',
      content: {
        version: '3.0.0',
        title: 'Imported Template',
        type: 'page',
        content: sections,
      },
      metadata: {
        widgetCount,
        sectionCount: sections.length,
        conversionMethod: 'native',
      },
    };
  }

  /**
   * Convert single block to Elementor section
   */
  private blockToSection(block: WordPressBlock): ElementorElement | null {
    const blockType = this.getBlockFullName(block);

    // Handle common block types
    const widget = this.blockToWidget(block);
    if (!widget) return null;

    // Wrap widget in section > column structure
    return {
      id: this.generateId(),
      elType: 'section',
      settings: {
        layout: 'boxed',
        backgroundColor: block.attributes?.backgroundColor || '',
        padding: block.attributes?.style?.spacing?.padding || {},
      },
      elements: [
        {
          id: this.generateId(),
          elType: 'column',
          settings: { _column_size: 100 },
          elements: [widget],
        },
      ],
    };
  }

  /**
   * Convert block to Elementor widget
   */
  private blockToWidget(block: WordPressBlock): ElementorElement | null {
    const blockType = this.getBlockFullName(block);

    switch (blockType) {
      case 'core:heading':
        return {
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'heading',
          settings: {
            title: this.stripHTML(block.innerHTML),
            header_size: `h${block.attributes?.level || 2}`,
            align: this.getAlignment(block),
            title_color: this.parseColor(block.attributes?.textColor || ''),
            typography_font_size: block.attributes?.fontSize ? {
              size: parseInt(block.attributes.fontSize) || 16
            } : undefined,
          },
        };

      case 'core:paragraph':
        return {
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'text-editor',
          settings: {
            editor: block.innerHTML,
            text_color: this.parseColor(block.attributes?.textColor || ''),
            align: this.getAlignment(block),
          },
        };

      case 'core:image':
        return {
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'image',
          settings: {
            image: {
              url: block.attributes?.url || this.extractImageSrc(block.innerHTML) || '',
              id: block.attributes?.id,
            },
            image_size: block.attributes?.sizeSlug || 'full',
            caption: block.attributes?.caption || '',
            align: this.getAlignment(block),
            width: block.attributes?.width ? { size: block.attributes.width } : undefined,
            height: block.attributes?.height ? { size: block.attributes.height } : undefined,
          },
        };

      case 'core:button':
      case 'core:buttons':
        const buttonText = this.stripHTML(block.innerHTML);
        const buttonHref = this.extractLinkHref(block.innerHTML) || '#';

        return {
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'button',
          settings: {
            text: buttonText,
            link: { url: buttonHref },
            align: this.getAlignment(block),
            button_type: block.attributes?.className?.includes('is-style-outline') ? 'outline' : 'solid',
          },
        };

      case 'core:list':
        return {
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'text-editor',
          settings: {
            editor: block.innerHTML,
          },
        };

      case 'core:quote':
        return {
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'text-editor',
          settings: {
            editor: `<blockquote>${block.innerHTML}</blockquote>`,
          },
        };

      case 'core:video':
      case 'core:embed':
        const videoUrl = block.attributes?.url || block.attributes?.src || '';
        const isYouTube = videoUrl.includes('youtube') || videoUrl.includes('youtu.be');
        const isVimeo = videoUrl.includes('vimeo');

        return {
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'video',
          settings: {
            video_type: isYouTube ? 'youtube' : isVimeo ? 'vimeo' : 'hosted',
            youtube_url: isYouTube ? videoUrl : '',
            vimeo_url: isVimeo ? videoUrl : '',
            hosted_url: !isYouTube && !isVimeo ? videoUrl : '',
            controls: block.attributes?.controls !== false,
            autoplay: block.attributes?.autoplay || false,
          },
        };

      case 'core:columns':
        // Handle columns specially - return section with multiple columns
        return null; // Will be handled by blockToSection

      case 'core:group':
      case 'core:cover':
        // Container blocks - convert inner blocks
        const innerWidgets = block.innerBlocks?.map(b => this.blockToWidget(b)).filter(Boolean) || [];
        return innerWidgets[0] || null; // Return first inner widget

      default:
        console.warn(`Unknown block type: ${blockType}, using text-editor fallback`);
        return {
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'text-editor',
          settings: {
            editor: block.innerHTML || this.stripHTML(block.innerHTML) || '',
          },
        };
    }
  }

  /**
   * Convert from Playwright page data (FALLBACK with computed styles)
   */
  protected async convertFromPlaywrightData(
    pageData: PageData
  ): Promise<BuilderOutput> {
    console.log('🔍 Converting from Playwright data (enhanced with styles)');

    const visibleElements = this.filterVisibleElements(pageData.elements);
    const grouped = this.groupElementsByTag(visibleElements);

    const sections: ElementorElement[] = [];

    // Create sections from major elements
    const sectionElements = [
      ...( grouped.section || []),
      ...(grouped.div || []).filter(el =>
        el.classes.includes('section') ||
        el.classes.includes('container') ||
        el.position.height > 200
      ),
    ];

    for (const sectionEl of sectionElements.slice(0, 20)) { // Limit to 20 sections
      const section = this.elementToSection(sectionEl, pageData.elements);
      if (section) {
        sections.push(section);
      }
    }

    // If no sections found, create from all elements
    if (sections.length === 0) {
      sections.push(this.createDefaultSection(pageData.elements));
    }

    const widgetCount = sections.reduce((sum, s) => sum + this.countWidgets(s), 0);

    return {
      format: 'json',
      content: {
        version: '3.0.0',
        title: pageData.title || 'Imported Template',
        type: 'page',
        content: sections,
      },
      metadata: {
        widgetCount,
        sectionCount: sections.length,
        conversionMethod: 'playwright',
      },
    };
  }

  /**
   * Convert Playwright element to Elementor section
   */
  private elementToSection(element: ElementData, allElements: ElementData[]): ElementorElement | null {
    const children = allElements.filter(el =>
      el.position.y >= element.position.y &&
      el.position.y < element.position.y + element.position.height &&
      el !== element
    );

    const widgets = children
      .slice(0, 10) // Limit widgets per section
      .map(el => this.playwrightElementToWidget(el))
      .filter(Boolean);

    if (widgets.length === 0) return null;

    return {
      id: this.generateId(),
      elType: 'section',
      settings: {
        layout: 'boxed',
        background_color: this.parseColor(element.styles.backgroundColor),
        padding: this.parsePadding(element.styles.padding),
      },
      elements: [
        {
          id: this.generateId(),
          elType: 'column',
          settings: { _column_size: 100 },
          elements: widgets as ElementorElement[],
        },
      ],
    };
  }

  /**
   * Convert Playwright element to Elementor widget
   */
  private playwrightElementToWidget(element: ElementData): ElementorElement | null {
    switch (element.tag) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return {
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'heading',
          settings: {
            title: element.text,
            header_size: element.tag,
            title_color: this.parseColor(element.styles.color),
            align: element.styles.textAlign || 'left',
            typography_font_size: {
              size: parseInt(element.styles.fontSize) || 16,
            },
          },
        };

      case 'p':
        return {
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'text-editor',
          settings: {
            editor: element.text,
            text_color: this.parseColor(element.styles.color),
          },
        };

      case 'img':
        const imgSrc = element.attributes?.src || '';
        return {
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'image',
          settings: {
            image: { url: imgSrc },
            caption: element.attributes?.alt || '',
            width: { size: element.position.width },
            height: { size: element.position.height },
          },
        };

      case 'button':
      case 'a':
        if (element.classes.includes('button') || element.classes.includes('btn') || element.tag === 'button') {
          return {
            id: this.generateId(),
            elType: 'widget',
            widgetType: 'button',
            settings: {
              text: element.text,
              link: { url: element.attributes?.href || '#' },
              button_background_color: this.parseColor(element.styles.backgroundColor),
              button_text_color: this.parseColor(element.styles.color),
              border_radius: {
                size: parseInt(element.styles.borderRadius) || 0,
              },
            },
          };
        }
        return null;

      default:
        return null;
    }
  }

  /**
   * Create default section from all elements
   */
  private createDefaultSection(elements: ElementData[]): ElementorElement {
    const visibleElements = this.filterVisibleElements(elements).slice(0, 20);
    const widgets = visibleElements
      .map(el => this.playwrightElementToWidget(el))
      .filter(Boolean);

    return {
      id: this.generateId(),
      elType: 'section',
      settings: { layout: 'boxed' },
      elements: [
        {
          id: this.generateId(),
          elType: 'column',
          settings: { _column_size: 100 },
          elements: widgets as ElementorElement[],
        },
      ],
    };
  }

  /**
   * Count total widgets in structure
   */
  private countWidgets(element: ElementorElement): number {
    let count = element.elType === 'widget' ? 1 : 0;

    if (element.elements) {
      count += element.elements.reduce((sum, el) => sum + this.countWidgets(el), 0);
    }

    return count;
  }
}

/**
 * Export singleton instance
 */
export const unifiedElementorBuilder = new UnifiedElementorBuilder();
