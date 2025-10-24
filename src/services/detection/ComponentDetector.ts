import * as cheerio from 'cheerio';
import { NavigationDetector, NavigationComponent } from '../NavigationDetector';

export interface DetectedComponent {
  id: string;
  type: string; // 'hero', 'cta', 'button', etc.
  builder?: string; // 'elementor', 'divi', etc.
  html: string;
  metadata: {
    position: number;
    confidence: number; // 0-1
    patterns: string[];
    attributes: Record<string, any>;
  };
}

export interface DetectionResult {
  components: DetectedComponent[];
  builder: string | null;
  confidence: number;
  stats: {
    totalComponents: number;
    byType: Record<string, number>;
    byBuilder: Record<string, number>;
  };
  navigation?: NavigationComponent[];
}

export class ComponentDetector {
  private navigationDetector = new NavigationDetector();

  private builderPatterns = {
    elementor: ['.elementor-element', '.elementor-widget', '[data-element_type]'],
    divi: ['.et_pb_module', '.et_pb_section', '.et_pb_row'],
    beaverBuilder: ['.fl-module', '.fl-row', '.fl-col'],
    wpBakery: ['.vc_element', '.vc_row', '.wpb_wrapper'],
    gutenberg: ['.wp-block', '[class*="wp-block-"]'],
    oxygen: ['[class^="ct-"]', '[class*="oxy-"]'],
    bricks: ['[data-block-id]', '[class*="brxe-"]'],
  };

  private widgetTypes = {
    elementor: {
      heading: '.elementor-widget-heading',
      text: '.elementor-widget-text-editor',
      button: '.elementor-widget-button',
      image: '.elementor-widget-image',
      video: '.elementor-widget-video',
      divider: '.elementor-widget-divider',
      spacer: '.elementor-widget-spacer',
      icon: '.elementor-widget-icon',
      iconBox: '.elementor-widget-icon-box',
      counter: '.elementor-widget-counter',
    },
    divi: {
      text: '.et_pb_text',
      button: '.et_pb_button',
      image: '.et_pb_image',
      video: '.et_pb_video',
      blurb: '.et_pb_blurb',
      cta: '.et_pb_cta',
      contact: '.et_pb_contact_form',
      slider: '.et_pb_slider',
      gallery: '.et_pb_gallery',
      testimonial: '.et_pb_testimonial',
    },
  };

  private semanticPatterns = [
    { type: 'hero', selectors: ['.hero-section', 'header.hero', '[class*="hero"]', '.banner'] },
    { type: 'cta', selectors: ['.cta', '[class*="call-to-action"]', '.action-section'] },
    { type: 'features', selectors: ['.features', '[class*="feature"]', '.benefits'] },
    { type: 'testimonials', selectors: ['.testimonials', '[class*="testimonial"]', '.reviews'] },
    { type: 'pricing', selectors: ['.pricing', '[class*="price"]', '.plans'] },
    { type: 'team', selectors: ['.team', '[class*="team-member"]', '.staff'] },
    { type: 'contact', selectors: ['.contact', '[class*="contact-form"]', '.get-in-touch'] },
    { type: 'footer', selectors: ['footer', '.footer', '[role="contentinfo"]'] },
  ];

  public detect(html: string): DetectionResult {
    const $ = cheerio.load(html);
    const components: DetectedComponent[] = [];

    // 1. Detect builder first
    const builder = this.detectBuilder($);

    // 2. Detect builder-specific components if builder found
    if (builder) {
      const builderComponents = this.detectBuilderComponents($, builder);
      components.push(...builderComponents);
    }

    // 3. Detect semantic components (fallback)
    const semanticComponents = this.detectSemanticComponents($);
    components.push(...semanticComponents);

    // 4. Calculate stats
    const stats = this.calculateStats(components);

    return {
      components,
      builder,
      confidence: builder ? 0.9 : 0.5,
      stats,
    };
  }

  private detectBuilder($: cheerio.CheerioAPI): string | null {
    // Check for builder indicators in priority order
    for (const [builder, patterns] of Object.entries(this.builderPatterns)) {
      for (const pattern of patterns) {
        if ($(pattern).length > 0) {
          return builder;
        }
      }
    }
    return null;
  }

  private detectBuilderComponents($: cheerio.CheerioAPI, builder: string): DetectedComponent[] {
    const components: DetectedComponent[] = [];

    if (builder === 'elementor') {
      // Detect Elementor widgets
      $('.elementor-widget').each((index, element) => {
        const $el = $(element);
        const elementType = $el.attr('data-element_type') || 'unknown';
        const widgetType = elementType.replace('widget.', '');

        components.push({
          id: $el.attr('data-id') || `elementor-${index}`,
          type: widgetType,
          builder: 'elementor',
          html: $.html(element),
          metadata: {
            position: index,
            confidence: 0.95,
            patterns: ['elementor-widget', elementType],
            attributes: {
              elementType: $el.attr('data-element_type'),
              widgetType: $el.attr('data-widget_type'),
              settings: $el.attr('data-settings'),
            },
          },
        });
      });
    } else if (builder === 'divi') {
      // Detect Divi modules
      $('[class*="et_pb_"]').each((index, element) => {
        const $el = $(element);
        const classList = $el.attr('class') || '';
        const moduleMatch = classList.match(/et_pb_(\w+)/);
        const moduleType = moduleMatch ? moduleMatch[1] : 'unknown';

        components.push({
          id: `divi-${index}`,
          type: moduleType,
          builder: 'divi',
          html: $.html(element),
          metadata: {
            position: index,
            confidence: 0.9,
            patterns: ['et_pb_module', `et_pb_${moduleType}`],
            attributes: {
              classes: classList,
            },
          },
        });
      });
    } else if (builder === 'beaverBuilder') {
      // Detect Beaver Builder modules
      $('.fl-module').each((index, element) => {
        const $el = $(element);
        const classList = $el.attr('class') || '';
        const moduleMatch = classList.match(/fl-module-(\w+)/);
        const moduleType = moduleMatch ? moduleMatch[1] : 'unknown';

        components.push({
          id: `beaver-${index}`,
          type: moduleType,
          builder: 'beaverBuilder',
          html: $.html(element),
          metadata: {
            position: index,
            confidence: 0.9,
            patterns: ['fl-module', `fl-module-${moduleType}`],
            attributes: {
              classes: classList,
            },
          },
        });
      });
    } else if (builder === 'wpBakery') {
      // Detect WPBakery elements
      $('.vc_element').each((index, element) => {
        const $el = $(element);
        const classList = $el.attr('class') || '';
        const elementMatch = classList.match(/vc_(\w+)/);
        const elementType = elementMatch ? elementMatch[1] : 'unknown';

        components.push({
          id: `wpbakery-${index}`,
          type: elementType,
          builder: 'wpBakery',
          html: $.html(element),
          metadata: {
            position: index,
            confidence: 0.9,
            patterns: ['vc_element', `vc_${elementType}`],
            attributes: {
              classes: classList,
            },
          },
        });
      });
    } else if (builder === 'gutenberg') {
      // Detect Gutenberg blocks
      $('[class*="wp-block-"]').each((index, element) => {
        const $el = $(element);
        const classList = $el.attr('class') || '';
        const blockMatch = classList.match(/wp-block-(\S+)/);
        const blockType = blockMatch ? blockMatch[1] : 'unknown';

        components.push({
          id: `gutenberg-${index}`,
          type: blockType,
          builder: 'gutenberg',
          html: $.html(element),
          metadata: {
            position: index,
            confidence: 0.95,
            patterns: ['wp-block', `wp-block-${blockType}`],
            attributes: {
              classes: classList,
            },
          },
        });
      });
    } else if (builder === 'oxygen') {
      // Detect Oxygen elements
      $('[class^="ct-"], [class*="oxy-"]').each((index, element) => {
        const $el = $(element);
        const classList = $el.attr('class') || '';
        const elementMatch = classList.match(/(?:ct-|oxy-)(\w+)/);
        const elementType = elementMatch ? elementMatch[1] : 'unknown';

        components.push({
          id: `oxygen-${index}`,
          type: elementType,
          builder: 'oxygen',
          html: $.html(element),
          metadata: {
            position: index,
            confidence: 0.9,
            patterns: ['oxygen-element', elementType],
            attributes: {
              classes: classList,
            },
          },
        });
      });
    } else if (builder === 'bricks') {
      // Detect Bricks elements
      $('[data-block-id]').each((index, element) => {
        const $el = $(element);
        const blockId = $el.attr('data-block-id') || '';
        const classList = $el.attr('class') || '';
        const elementMatch = classList.match(/brxe-(\w+)/);
        const elementType = elementMatch ? elementMatch[1] : 'unknown';

        components.push({
          id: blockId || `bricks-${index}`,
          type: elementType,
          builder: 'bricks',
          html: $.html(element),
          metadata: {
            position: index,
            confidence: 0.9,
            patterns: ['bricks-element', `brxe-${elementType}`],
            attributes: {
              blockId,
              classes: classList,
            },
          },
        });
      });
    }

    return components;
  }

  private detectSemanticComponents($: cheerio.CheerioAPI): DetectedComponent[] {
    const components: DetectedComponent[] = [];

    for (const pattern of this.semanticPatterns) {
      for (const selector of pattern.selectors) {
        $(selector).each((index, element) => {
          const $el = $(element);
          const html = $.html(element);

          // Skip if already detected by builder
          if (html.includes('elementor') || html.includes('et_pb_') || html.includes('fl-module')) {
            return;
          }

          components.push({
            id: `semantic-${pattern.type}-${index}`,
            type: pattern.type,
            html,
            metadata: {
              position: index,
              confidence: 0.6,
              patterns: [selector],
              attributes: {
                tag: element.tagName,
                classes: $el.attr('class') || '',
              },
            },
          });
        });
      }
    }

    return components;
  }

  private calculateStats(components: DetectedComponent[]): {
    totalComponents: number;
    byType: Record<string, number>;
    byBuilder: Record<string, number>;
  } {
    const byType: Record<string, number> = {};
    const byBuilder: Record<string, number> = {};

    for (const component of components) {
      // Count by type
      byType[component.type] = (byType[component.type] || 0) + 1;

      // Count by builder
      if (component.builder) {
        byBuilder[component.builder] = (byBuilder[component.builder] || 0) + 1;
      } else {
        byBuilder['semantic'] = (byBuilder['semantic'] || 0) + 1;
      }
    }

    return {
      totalComponents: components.length,
      byType,
      byBuilder,
    };
  }

  // Helper methods for filtering and querying
  public filterByType(components: DetectedComponent[], type: string): DetectedComponent[] {
    return components.filter(c => c.type === type);
  }

  public filterByBuilder(components: DetectedComponent[], builder: string): DetectedComponent[] {
    return components.filter(c => c.builder === builder);
  }

  public filterByConfidence(components: DetectedComponent[], minConfidence: number): DetectedComponent[] {
    return components.filter(c => c.metadata.confidence >= minConfidence);
  }

  public getComponentsByPattern(components: DetectedComponent[], pattern: string): DetectedComponent[] {
    return components.filter(c => c.metadata.patterns.some(p => p.includes(pattern)));
  }
}
