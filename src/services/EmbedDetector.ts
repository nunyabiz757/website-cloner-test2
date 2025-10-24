import type { CheerioAPI, Cheerio, Element } from 'cheerio';

/**
 * Embed Detection Strategy:
 * - Iframe URL pattern matching for maps and videos
 * - Widget class/attribute detection for social embeds
 * - Confidence scoring based on URL certainty
 * - Metadata extraction (dimensions, provider, embed ID)
 * - Generic iframe fallback for unknown embeds
 */

// ============================================================================
// TYPES
// ============================================================================

export interface EmbedComponent {
  type: 'google-maps-embed' | 'youtube-embed' | 'vimeo-embed' | 'twitter-embed' | 'instagram-embed' | 'facebook-embed' | 'generic-embed';
  tag: string;
  selector: string;
  classes: string[];
  confidence: number;
  detectionMethod: 'iframe-url' | 'widget-class' | 'generic';
  properties: EmbedProperties;
}

export interface EmbedProperties {
  provider: 'Google Maps' | 'YouTube' | 'Vimeo' | 'Twitter' | 'Instagram' | 'Facebook' | 'Unknown';
  src: string;
  embedId?: string;
  width?: string;
  height?: string;
  aspectRatio?: string;
  isResponsive: boolean;
  allowFullscreen?: boolean;
  title?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const EMBED_PATTERNS = {
  googleMaps: [
    /google\.com\/maps\/embed/i,
    /maps\.google\.com\/maps/i
  ],
  youtube: [
    /youtube\.com\/embed/i,
    /youtube-nocookie\.com\/embed/i,
    /youtu\.be/i
  ],
  vimeo: [
    /vimeo\.com\/video/i,
    /player\.vimeo\.com/i
  ],
  twitter: {
    iframe: /platform\.twitter\.com\/embed/i,
    widget: ['twitter-tweet', 'twitter-timeline']
  },
  instagram: {
    iframe: /instagram\.com\/embed/i,
    widget: ['instagram-media']
  },
  facebook: {
    iframe: /facebook\.com\/plugins/i,
    widget: ['fb-post', 'fb-video', 'fb-page']
  }
};

const MIN_CONFIDENCE = 70;

// ============================================================================
// MAIN DETECTOR CLASS
// ============================================================================

export class EmbedDetector {
  /**
   * Main detection entry point
   * Detects all embed types in priority order
   */
  detect($: CheerioAPI): EmbedComponent[] {
    const components: EmbedComponent[] = [];

    // LEVEL 1: Google Maps embeds (highest value)
    this.detectGoogleMaps($, components);

    // LEVEL 2: Video embeds (YouTube, Vimeo)
    this.detectVideoEmbeds($, components);

    // LEVEL 3: Social media embeds
    this.detectSocialEmbeds($, components);

    // LEVEL 4: Generic iframes (fallback)
    this.detectGenericIframes($, components);

    return components;
  }

  // ==========================================================================
  // DETECTION METHODS
  // ==========================================================================

  private detectGoogleMaps($: CheerioAPI, components: EmbedComponent[]): void {
    $('iframe').each((_, el) => {
      const $iframe = $(el);
      const src = $iframe.attr('src') || '';

      if (this.matchesPattern(src, EMBED_PATTERNS.googleMaps)) {
        components.push(this.createEmbedComponent(
          $iframe,
          'google-maps-embed',
          'Google Maps',
          100,
          'iframe-url'
        ));
      }
    });
  }

  private detectVideoEmbeds($: CheerioAPI, components: EmbedComponent[]): void {
    $('iframe').each((_, el) => {
      const $iframe = $(el);
      const src = $iframe.attr('src') || '';

      // YouTube
      if (this.matchesPattern(src, EMBED_PATTERNS.youtube)) {
        const embedId = this.extractYouTubeId(src);
        components.push(this.createEmbedComponent(
          $iframe,
          'youtube-embed',
          'YouTube',
          100,
          'iframe-url',
          embedId
        ));
        return; // Stop checking other patterns
      }

      // Vimeo
      if (this.matchesPattern(src, EMBED_PATTERNS.vimeo)) {
        const embedId = this.extractVimeoId(src);
        components.push(this.createEmbedComponent(
          $iframe,
          'vimeo-embed',
          'Vimeo',
          100,
          'iframe-url',
          embedId
        ));
      }
    });
  }

  private detectSocialEmbeds($: CheerioAPI, components: EmbedComponent[]): void {
    // Twitter embeds
    this.detectTwitterEmbeds($, components);

    // Instagram embeds
    this.detectInstagramEmbeds($, components);

    // Facebook embeds
    this.detectFacebookEmbeds($, components);
  }

  private detectTwitterEmbeds($: CheerioAPI, components: EmbedComponent[]): void {
    // Method 1: Twitter iframe
    $('iframe').each((_, el) => {
      const $iframe = $(el);
      const src = $iframe.attr('src') || '';

      if (EMBED_PATTERNS.twitter.iframe.test(src)) {
        components.push(this.createEmbedComponent(
          $iframe,
          'twitter-embed',
          'Twitter',
          100,
          'iframe-url'
        ));
      }
    });

    // Method 2: Twitter widget (blockquote)
    EMBED_PATTERNS.twitter.widget.forEach(className => {
      $(`.${className}, [class*="${className}"]`).each((_, el) => {
        const $widget = $(el);
        components.push({
          type: 'twitter-embed',
          tag: el.tagName.toLowerCase(),
          selector: this.generateSelector($widget),
          classes: this.getClasses($widget),
          confidence: 95,
          detectionMethod: 'widget-class',
          properties: {
            provider: 'Twitter',
            src: $widget.find('a').attr('href') || '',
            isResponsive: true
          }
        });
      });
    });
  }

  private detectInstagramEmbeds($: CheerioAPI, components: EmbedComponent[]): void {
    // Method 1: Instagram iframe
    $('iframe').each((_, el) => {
      const $iframe = $(el);
      const src = $iframe.attr('src') || '';

      if (EMBED_PATTERNS.instagram.iframe.test(src)) {
        components.push(this.createEmbedComponent(
          $iframe,
          'instagram-embed',
          'Instagram',
          100,
          'iframe-url'
        ));
      }
    });

    // Method 2: Instagram widget (blockquote)
    EMBED_PATTERNS.instagram.widget.forEach(className => {
      $(`.${className}, [class*="${className}"]`).each((_, el) => {
        const $widget = $(el);
        components.push({
          type: 'instagram-embed',
          tag: el.tagName.toLowerCase(),
          selector: this.generateSelector($widget),
          classes: this.getClasses($widget),
          confidence: 95,
          detectionMethod: 'widget-class',
          properties: {
            provider: 'Instagram',
            src: $widget.attr('data-instgrm-permalink') || '',
            isResponsive: true
          }
        });
      });
    });
  }

  private detectFacebookEmbeds($: CheerioAPI, components: EmbedComponent[]): void {
    // Method 1: Facebook iframe
    $('iframe').each((_, el) => {
      const $iframe = $(el);
      const src = $iframe.attr('src') || '';

      if (EMBED_PATTERNS.facebook.iframe.test(src)) {
        components.push(this.createEmbedComponent(
          $iframe,
          'facebook-embed',
          'Facebook',
          100,
          'iframe-url'
        ));
      }
    });

    // Method 2: Facebook widgets
    EMBED_PATTERNS.facebook.widget.forEach(className => {
      $(`.${className}, [class*="${className}"]`).each((_, el) => {
        const $widget = $(el);
        components.push({
          type: 'facebook-embed',
          tag: el.tagName.toLowerCase(),
          selector: this.generateSelector($widget),
          classes: this.getClasses($widget),
          confidence: 95,
          detectionMethod: 'widget-class',
          properties: {
            provider: 'Facebook',
            src: $widget.attr('data-href') || '',
            isResponsive: true
          }
        });
      });
    });
  }

  private detectGenericIframes($: CheerioAPI, components: EmbedComponent[]): void {
    const detectedSrcs = new Set(components.map(c => c.properties.src));

    $('iframe').each((_, el) => {
      const $iframe = $(el);
      const src = $iframe.attr('src') || '';

      // Skip if already detected by specific patterns
      if (detectedSrcs.has(src)) return;

      // Skip empty iframes
      if (!src || src === 'about:blank') return;

      // Detect as generic embed
      components.push(this.createEmbedComponent(
        $iframe,
        'generic-embed',
        'Unknown',
        70,
        'generic'
      ));
    });
  }

  // ==========================================================================
  // COMPONENT CREATION
  // ==========================================================================

  private createEmbedComponent(
    $iframe: Cheerio<Element>,
    type: EmbedComponent['type'],
    provider: EmbedProperties['provider'],
    confidence: number,
    method: EmbedComponent['detectionMethod'],
    embedId?: string
  ): EmbedComponent {
    const src = $iframe.attr('src') || '';
    const width = $iframe.attr('width') || '';
    const height = $iframe.attr('height') || '';
    const allowFullscreen = $iframe.attr('allowfullscreen') !== undefined;
    const title = $iframe.attr('title') || '';

    // Calculate aspect ratio
    const aspectRatio = this.calculateAspectRatio(width, height);

    // Detect if responsive (no fixed dimensions)
    const isResponsive = !width || !height || width.includes('%');

    return {
      type,
      tag: 'iframe',
      selector: this.generateSelector($iframe),
      classes: this.getClasses($iframe),
      confidence,
      detectionMethod: method,
      properties: {
        provider,
        src,
        embedId,
        width: width || undefined,
        height: height || undefined,
        aspectRatio,
        isResponsive,
        allowFullscreen,
        title: title || undefined
      }
    };
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private matchesPattern(src: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(src));
  }

  private extractYouTubeId(src: string): string | undefined {
    // Extract ID from: youtube.com/embed/VIDEO_ID or youtu.be/VIDEO_ID
    const match = src.match(/(?:embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : undefined;
  }

  private extractVimeoId(src: string): string | undefined {
    // Extract ID from: vimeo.com/video/VIDEO_ID
    const match = src.match(/vimeo\.com\/video\/(\d+)/);
    return match ? match[1] : undefined;
  }

  private calculateAspectRatio(width: string, height: string): string | undefined {
    if (!width || !height) return undefined;

    const w = parseInt(width, 10);
    const h = parseInt(height, 10);

    if (isNaN(w) || isNaN(h) || h === 0) return undefined;

    // Common aspect ratios
    const ratio = w / h;
    if (Math.abs(ratio - 16/9) < 0.1) return '16:9';
    if (Math.abs(ratio - 4/3) < 0.1) return '4:3';
    if (Math.abs(ratio - 1) < 0.1) return '1:1';

    return `${w}:${h}`;
  }

  private generateSelector($el: Cheerio<Element>): string {
    const el = $el[0];
    if (!el) return '';

    const tag = el.tagName.toLowerCase();
    const id = $el.attr('id');
    const classes = this.getClasses($el);

    if (id) return `${tag}#${id}`;
    if (classes.length > 0) return `${tag}.${classes[0]}`;

    // Fallback: use src attribute
    const src = $el.attr('src');
    if (src) {
      const domain = this.extractDomain(src);
      return `${tag}[src*="${domain}"]`;
    }

    const index = $el.index();
    return `${tag}:nth-child(${index + 1})`;
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url.split('/')[2] || '';
    }
  }

  private getClasses($el: Cheerio<Element>): string[] {
    const classAttr = $el.attr('class');
    if (!classAttr) return [];
    return classAttr.split(/\s+/).filter(c => c.length > 0);
  }
}
