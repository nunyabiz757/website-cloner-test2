import * as cheerio from 'cheerio';
import { NavigationComponent } from '../NavigationDetector';
import { EmbedDetector, EmbedComponent } from '../EmbedDetector';
import { InteractivePatternDetector, InteractiveComponent } from '../InteractivePatternDetector';
import { ContentPatternDetector, ContentComponent } from '../ContentPatternDetector';

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

export interface CoverageMetrics {
  totalComponents: number;
  componentTypes: string[];
  averageConfidence: number;
  coveragePercent: number;
  detectionBreakdown: {
    builder: number;
    semantic: number;
    navigation: number;
    embeds: number;
    interactive: number;
    content: number;
  };
}

export interface DetectionResult {
  components: DetectedComponent[];
  builder: string | null;
  confidence: number;
  detectionPath: 'builder-first' | 'semantic-first';
  stats: {
    totalComponents: number;
    byType: Record<string, number>;
    byBuilder: Record<string, number>;
  };
  navigation?: NavigationComponent[];
  embeds?: EmbedComponent[];
  interactive?: InteractiveComponent[];
  content?: ContentComponent[];
  coverage: CoverageMetrics;
  timestamp: Date;
}

export class ComponentDetector {
  private embedDetector = new EmbedDetector();
  private interactiveDetector = new InteractivePatternDetector();
  private contentDetector = new ContentPatternDetector();

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
    console.log('🔍 ComponentDetector: Starting hybrid detection...');
    const startTime = Date.now();
    const $ = cheerio.load(html);
    const timestamp = new Date();

    // STEP 1: Detect builder first
    console.log('🔍 Step 1: Detecting page builder...');
    const builder = this.detectBuilder($);
    console.log(`✓ Builder detected: ${builder || 'NONE'}`);

    let components: DetectedComponent[] = [];
    let navigation: NavigationComponent[] | undefined;
    let embeds: EmbedComponent[] | undefined;
    let interactive: InteractiveComponent[] | undefined;
    let content: ContentComponent[] | undefined;
    let detectionPath: 'builder-first' | 'semantic-first';

    // HYBRID DETECTION LOGIC
    if (builder) {
      // =====================================================================
      // PATH A: BUILDER-FIRST (WordPress Sites with Page Builder)
      // Target: 98% coverage with builder + critical fallbacks
      // =====================================================================
      detectionPath = 'builder-first';
      console.log('🏗️  Using BUILDER-FIRST detection path');
      console.log(`   Builder: ${builder}`);

      // A1: Detect builder-specific components
      console.log('🔍 Step A1: Detecting builder-specific components...');
      const builderComponents = this.detectBuilderComponents($, builder);
      console.log(`✓ Found ${builderComponents.length} ${builder} components`);
      components.push(...builderComponents);

      // A2: Critical fallback - Embeds (always detect even with builder)
      console.log('🔍 Step A2: Critical fallback - Embed detection...');
      embeds = this.embedDetector.detect($);
      console.log(`✓ Found ${embeds.length} embed components`);

      // Note: Navigation detection happens in browser context (via captureWithNavigation)
      // Interactive and Content patterns are skipped in builder-first path for performance

      console.log('✓ Builder-first path complete');
    } else {
      // =====================================================================
      // PATH B: SEMANTIC-FIRST (Custom HTML/CSS Sites)
      // Target: 95% coverage with full semantic detection
      // =====================================================================
      detectionPath = 'semantic-first';
      console.log('🌐 Using SEMANTIC-FIRST detection path');
      console.log('   No page builder detected - full semantic scan');

      // B1: Embed Detection (Phase 7)
      console.log('🔍 Step B1: Embed detection...');
      embeds = this.embedDetector.detect($);
      console.log(`✓ Found ${embeds.length} embed components`);

      // B2: Interactive Patterns (Phase 8)
      console.log('🔍 Step B2: Interactive pattern detection...');
      interactive = this.interactiveDetector.detect($);
      console.log(`✓ Found ${interactive.length} interactive components`);

      // B3: Content Patterns (Phase 9)
      console.log('🔍 Step B3: Content pattern detection...');
      content = this.contentDetector.detect($);
      console.log(`✓ Found ${content.length} content components`);

      // B4: Semantic Components (fallback)
      console.log('🔍 Step B4: Semantic component detection...');
      const semanticComponents = this.detectSemanticComponents($);
      console.log(`✓ Found ${semanticComponents.length} semantic components`);
      components.push(...semanticComponents);

      // Note: Navigation detection happens in browser context (via captureWithNavigation)

      console.log('✓ Semantic-first path complete');
    }

    // STEP 2: Deduplication
    console.log('🔍 Step 2: Filtering duplicates...');
    const beforeDedup = components.length;
    components = this.filterDuplicates(components);
    const afterDedup = components.length;
    console.log(`✓ Removed ${beforeDedup - afterDedup} duplicate components`);

    // STEP 3: Calculate statistics
    console.log('🔍 Step 3: Calculating statistics...');
    const stats = this.calculateStats(components);

    // STEP 4: Calculate coverage
    console.log('🔍 Step 4: Calculating coverage metrics...');
    const coverage = this.calculateCoverage(
      components,
      navigation,
      embeds,
      interactive,
      content,
      builder
    );

    const elapsedTime = Date.now() - startTime;
    console.log(`✅ Detection complete in ${elapsedTime}ms`);
    console.log('📊 Final Results:');
    console.log(`   Total Components: ${coverage.totalComponents}`);
    console.log(`   Coverage: ${coverage.coveragePercent.toFixed(1)}%`);
    console.log(`   Average Confidence: ${(coverage.averageConfidence * 100).toFixed(1)}%`);
    console.log(`   Detection Path: ${detectionPath}`);

    return {
      components,
      builder,
      confidence: builder ? 0.9 : 0.5,
      detectionPath,
      stats,
      navigation,
      embeds,
      interactive,
      content,
      coverage,
      timestamp,
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

  /**
   * HYBRID ARCHITECTURE: Filter duplicate components
   * Prevents detecting the same element twice using selector-based deduplication
   */
  private filterDuplicates(components: DetectedComponent[]): DetectedComponent[] {
    const seen = new Set<string>();
    const unique: DetectedComponent[] = [];

    for (const component of components) {
      // Create a unique key based on type + position + first 50 chars of HTML
      const htmlSnippet = component.html.substring(0, 50);
      const key = `${component.type}-${component.metadata.position}-${htmlSnippet}`;

      if (!seen.has(key)) {
        seen.add(key);
        unique.push(component);
      }
    }

    return unique;
  }

  /**
   * HYBRID ARCHITECTURE: Calculate coverage metrics
   * Computes total components, types, average confidence, and coverage percentage
   */
  private calculateCoverage(
    components: DetectedComponent[],
    navigation: NavigationComponent[] | undefined,
    embeds: EmbedComponent[] | undefined,
    interactive: InteractiveComponent[] | undefined,
    content: ContentComponent[] | undefined,
    builder: string | null
  ): CoverageMetrics {
    // Count all components
    const navCount = navigation?.length || 0;
    const embedCount = embeds?.length || 0;
    const interactiveCount = interactive?.length || 0;
    const contentCount = content?.length || 0;
    const builderCount = components.filter(c => c.builder).length;
    const semanticCount = components.filter(c => !c.builder).length;

    const totalComponents =
      builderCount +
      semanticCount +
      navCount +
      embedCount +
      interactiveCount +
      contentCount;

    // Extract unique component types
    const typeSet = new Set<string>();
    components.forEach(c => typeSet.add(c.type));
    navigation?.forEach(n => typeSet.add(n.properties.type));
    embeds?.forEach(e => typeSet.add(e.type));
    interactive?.forEach(i => typeSet.add(i.type));
    content?.forEach(c => typeSet.add(c.type));

    const componentTypes = Array.from(typeSet);

    // Calculate average confidence
    let totalConfidence = 0;
    let confidenceCount = 0;

    components.forEach(c => {
      totalConfidence += c.metadata.confidence;
      confidenceCount++;
    });

    navigation?.forEach(n => {
      totalConfidence += n.properties.confidence / 100; // Convert from percentage
      confidenceCount++;
    });

    embeds?.forEach(e => {
      totalConfidence += e.confidence / 100;
      confidenceCount++;
    });

    interactive?.forEach(i => {
      totalConfidence += i.confidence / 100;
      confidenceCount++;
    });

    content?.forEach(c => {
      totalConfidence += c.confidence / 100;
      confidenceCount++;
    });

    const averageConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;

    // Calculate coverage percentage based on detection path
    // Builder-first target: 98% (optimistic if builder detected)
    // Semantic-first target: 95% (realistic for custom sites)
    const targetCoverage = builder ? 98 : 95;

    // Calculate actual coverage as a function of:
    // 1. Number of components detected (more = better)
    // 2. Average confidence (higher = better)
    // 3. Diversity of component types (more types = better coverage)
    const componentScore = Math.min(totalComponents / 50, 1.0); // 50+ components = full score
    const confidenceScore = averageConfidence;
    const diversityScore = Math.min(componentTypes.length / 20, 1.0); // 20+ types = full score

    const coveragePercent = targetCoverage * (
      componentScore * 0.4 +
      confidenceScore * 0.4 +
      diversityScore * 0.2
    );

    return {
      totalComponents,
      componentTypes,
      averageConfidence,
      coveragePercent: Math.min(coveragePercent, 100), // Cap at 100%
      detectionBreakdown: {
        builder: builderCount,
        semantic: semanticCount,
        navigation: navCount,
        embeds: embedCount,
        interactive: interactiveCount,
        content: contentCount,
      },
    };
  }
}
