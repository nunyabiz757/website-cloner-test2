import type {
  ComponentType,
  RecognitionPattern,
  RecognitionResult,
  ExtractedStyles,
  ElementContext,
} from '../../types/detection.types';

export class ComponentRecognizer {
  private patterns: RecognitionPattern[] = [];

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns(): void {
    this.patterns = [
      { componentType: 'button', patterns: { tagNames: ['button'] }, confidence: 95, priority: 100 },
      { componentType: 'button', patterns: { tagNames: ['a', 'div', 'span'], ariaRole: 'button' }, confidence: 90, priority: 90 },
      { componentType: 'button', patterns: { tagNames: ['a', 'div', 'span'], classKeywords: ['btn', 'button', 'cta', 'call-to-action'] }, confidence: 85, priority: 80 },
      { componentType: 'heading', patterns: { tagNames: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }, confidence: 100, priority: 100 },
      { componentType: 'image', patterns: { tagNames: ['img'] }, confidence: 100, priority: 100 },
      { componentType: 'icon-box', patterns: { tagNames: ['div'], classKeywords: ['icon-box', 'feature-box', 'service-box', 'info-box'] }, confidence: 85, priority: 90 },
      { componentType: 'card', patterns: { tagNames: ['div', 'article'], classKeywords: ['card', 'post', 'item', 'box'] }, confidence: 80, priority: 85 },
      { componentType: 'form', patterns: { tagNames: ['form'] }, confidence: 100, priority: 100 },
      { componentType: 'input', patterns: { tagNames: ['input'] }, confidence: 95, priority: 95 },
      { componentType: 'textarea', patterns: { tagNames: ['textarea'] }, confidence: 100, priority: 100 },
      { componentType: 'select', patterns: { tagNames: ['select'] }, confidence: 100, priority: 100 },
      { componentType: 'navigation', patterns: { tagNames: ['nav'] }, confidence: 95, priority: 100 },
      { componentType: 'navigation', patterns: { tagNames: ['div', 'ul'], ariaRole: 'navigation' }, confidence: 90, priority: 95 },
      { componentType: 'header', patterns: { tagNames: ['header'] }, confidence: 100, priority: 100 },
      { componentType: 'footer', patterns: { tagNames: ['footer'] }, confidence: 100, priority: 100 },
      { componentType: 'hero', patterns: { tagNames: ['div', 'section'], classKeywords: ['hero', 'jumbotron', 'banner'] }, confidence: 85, priority: 85 },
      { componentType: 'modal', patterns: { tagNames: ['div'], classKeywords: ['modal', 'dialog', 'popup'], ariaRole: 'dialog' }, confidence: 90, priority: 90 },
      { componentType: 'accordion', patterns: { tagNames: ['div', 'details'], classKeywords: ['accordion', 'collapse', 'toggle'] }, confidence: 80, priority: 80 },
      { componentType: 'tabs', patterns: { tagNames: ['div', 'ul'], classKeywords: ['tabs', 'tab-panel', 'tablist'], ariaRole: 'tablist' }, confidence: 85, priority: 85 },
      { componentType: 'carousel', patterns: { tagNames: ['div'], classKeywords: ['carousel', 'slider', 'swiper', 'slideshow'] }, confidence: 85, priority: 85 },
      { componentType: 'gallery', patterns: { tagNames: ['div', 'ul'], classKeywords: ['gallery', 'grid-gallery', 'photo-grid'] }, confidence: 80, priority: 80 },
      { componentType: 'pricing-table', patterns: { tagNames: ['div', 'table'], classKeywords: ['pricing', 'price-table', 'plan'] }, confidence: 80, priority: 85 },
      { componentType: 'testimonial', patterns: { tagNames: ['div', 'blockquote'], classKeywords: ['testimonial', 'review', 'quote'] }, confidence: 80, priority: 85 },
      { componentType: 'cta', patterns: { tagNames: ['div', 'section'], classKeywords: ['cta', 'call-to-action', 'action-box'] }, confidence: 75, priority: 80 },
      { componentType: 'video-embed', patterns: { tagNames: ['iframe', 'video'], classKeywords: ['youtube', 'vimeo', 'video'] }, confidence: 90, priority: 90 },
      { componentType: 'maps', patterns: { tagNames: ['iframe', 'div'], classKeywords: ['map', 'google-map', 'leaflet'] }, confidence: 85, priority: 85 },
      { componentType: 'social-icons', patterns: { tagNames: ['div', 'ul', 'nav'], classKeywords: ['social', 'social-icons', 'social-links'] }, confidence: 85, priority: 85 },
      { componentType: 'paragraph', patterns: { tagNames: ['p'] }, confidence: 100, priority: 90 },
      { componentType: 'text', patterns: { tagNames: ['span', 'div'] }, confidence: 50, priority: 10 },
      { componentType: 'divider', patterns: { tagNames: ['hr'] }, confidence: 100, priority: 100 },
      { componentType: 'spacer', patterns: { tagNames: ['div'], classKeywords: ['spacer', 'gap', 'separator'] }, confidence: 75, priority: 70 },

      // FILE UPLOAD PATTERNS
      { componentType: 'file-upload', patterns: { tagNames: ['input'], classKeywords: ['file'] }, confidence: 95, priority: 95 },

      // CHECKBOX & RADIO PATTERNS
      { componentType: 'checkbox', patterns: { tagNames: ['input'] }, confidence: 90, priority: 90 },
      { componentType: 'radio', patterns: { tagNames: ['input'] }, confidence: 90, priority: 90 },

      // ALERT PATTERNS
      { componentType: 'alert', patterns: { tagNames: ['div'], classKeywords: ['alert', 'notification', 'toast', 'message'], ariaRole: 'alert' }, confidence: 90, priority: 90 },
      { componentType: 'alert', patterns: { tagNames: ['div'], classKeywords: ['alert', 'notification', 'toast', 'message'] }, confidence: 85, priority: 85 },

      // TOGGLE PATTERNS
      { componentType: 'toggle', patterns: { tagNames: ['button', 'div'], classKeywords: ['toggle', 'switch'], ariaRole: 'switch' }, confidence: 90, priority: 85 },

      // FLIP-BOX PATTERNS
      { componentType: 'flip-box', patterns: { tagNames: ['div'], classKeywords: ['flip-box', 'flip-card', 'card-flip'] }, confidence: 85, priority: 80 },

      // FEATURE-BOX PATTERNS
      { componentType: 'feature-box', patterns: { tagNames: ['div'], classKeywords: ['feature', 'feature-box', 'feature-card', 'feature-item'] }, confidence: 85, priority: 85 },

      // TEAM-MEMBER PATTERNS
      { componentType: 'team-member', patterns: { tagNames: ['div', 'article'], classKeywords: ['team-member', 'team-card', 'profile-card', 'member'] }, confidence: 85, priority: 85 },

      // BLOG-CARD PATTERNS
      { componentType: 'blog-card', patterns: { tagNames: ['article', 'div'], classKeywords: ['blog-card', 'post-card', 'blog-post', 'article-card'] }, confidence: 85, priority: 85 },

      // PRODUCT-CARD PATTERNS
      { componentType: 'product-card', patterns: { tagNames: ['div', 'article'], classKeywords: ['product-card', 'product-item', 'product-box', 'shop-item'] }, confidence: 85, priority: 85 },

      // STAR-RATING PATTERNS
      { componentType: 'star-rating', patterns: { tagNames: ['div', 'span'], classKeywords: ['rating', 'star-rating', 'stars', 'review-stars'] }, confidence: 85, priority: 85 },

      // SOCIAL-FEED PATTERNS
      { componentType: 'social-feed', patterns: { tagNames: ['div'], classKeywords: ['social-feed', 'feed', 'twitter-feed', 'instagram-feed', 'facebook-feed'] }, confidence: 80, priority: 80 },

      // SOCIAL-SHARE PATTERNS
      { componentType: 'social-share', patterns: { tagNames: ['div', 'nav'], classKeywords: ['social-share', 'share-buttons', 'share-icons'] }, confidence: 85, priority: 85 },

      // BREADCRUMBS PATTERNS
      { componentType: 'breadcrumbs', patterns: { tagNames: ['nav', 'ol', 'ul'], classKeywords: ['breadcrumb', 'breadcrumbs'], ariaRole: 'navigation' }, confidence: 95, priority: 90 },
      { componentType: 'breadcrumbs', patterns: { tagNames: ['nav', 'ol', 'ul'], classKeywords: ['breadcrumb', 'breadcrumbs'] }, confidence: 90, priority: 85 },

      // PAGINATION PATTERNS
      { componentType: 'pagination', patterns: { tagNames: ['nav', 'div', 'ul'], classKeywords: ['pagination', 'pager', 'page-numbers'], ariaRole: 'navigation' }, confidence: 90, priority: 90 },
      { componentType: 'pagination', patterns: { tagNames: ['nav', 'div', 'ul'], classKeywords: ['pagination', 'pager', 'page-numbers'] }, confidence: 85, priority: 85 },

      // SEARCH-BAR PATTERNS
      { componentType: 'search-bar', patterns: { tagNames: ['form', 'div'], classKeywords: ['search', 'search-bar', 'search-form', 'search-box'], ariaRole: 'search' }, confidence: 90, priority: 90 },
      { componentType: 'search-bar', patterns: { tagNames: ['form', 'div'], classKeywords: ['search', 'search-bar', 'search-form', 'search-box'] }, confidence: 85, priority: 85 },

      // TABLE PATTERNS
      { componentType: 'table', patterns: { tagNames: ['table'] }, confidence: 100, priority: 100 },
      { componentType: 'table', patterns: { tagNames: ['div'], cssProperties: (styles) => this.looksLikeTable(styles) }, confidence: 80, priority: 75 },

      // LIST PATTERNS
      { componentType: 'list', patterns: { tagNames: ['ul', 'ol'] }, confidence: 100, priority: 95 },
      { componentType: 'list', patterns: { tagNames: ['div'], classKeywords: ['list', 'list-group', 'item-list'] }, confidence: 75, priority: 70 },

      // PROGRESS-BAR PATTERNS
      { componentType: 'progress-bar', patterns: { tagNames: ['progress'] }, confidence: 100, priority: 100 },
      { componentType: 'progress-bar', patterns: { tagNames: ['div'], classKeywords: ['progress', 'progress-bar', 'skill-bar'] }, confidence: 85, priority: 85 },

      // COUNTER PATTERNS
      { componentType: 'counter', patterns: { tagNames: ['div', 'span'], classKeywords: ['counter', 'count', 'number-counter', 'stat-counter'] }, confidence: 80, priority: 80 },

      // COUNTDOWN PATTERNS
      { componentType: 'countdown', patterns: { tagNames: ['div'], classKeywords: ['countdown', 'timer', 'countdown-timer'] }, confidence: 85, priority: 85 },

      // BLOCKQUOTE PATTERNS
      { componentType: 'blockquote', patterns: { tagNames: ['blockquote'] }, confidence: 100, priority: 100 },
      { componentType: 'blockquote', patterns: { tagNames: ['div'], classKeywords: ['quote', 'blockquote', 'pullquote'] }, confidence: 85, priority: 80 },

      // CODE-BLOCK PATTERNS
      { componentType: 'code-block', patterns: { tagNames: ['pre', 'code'] }, confidence: 100, priority: 100 },
      { componentType: 'code-block', patterns: { tagNames: ['div'], classKeywords: ['code', 'code-block', 'highlight', 'syntax'] }, confidence: 85, priority: 85 },

      // GOHIGHLEVEL (GHL) SPECIFIC PATTERNS
      { componentType: 'ghl-form', patterns: { tagNames: ['form', 'div'], classKeywords: ['ghl-form', 'gf_', 'ghl_form', 'highlevel-form'] }, confidence: 95, priority: 95 },
      { componentType: 'ghl-button', patterns: { tagNames: ['button', 'a'], classKeywords: ['ghl-button', 'ghl-btn', 'highlevel-button'] }, confidence: 90, priority: 90 },
      { componentType: 'ghl-section', patterns: { tagNames: ['section', 'div'], classKeywords: ['ghl-section', 'highlevel-section', 'ghl-block'] }, confidence: 85, priority: 85 },
      { componentType: 'ghl-custom-html', patterns: { tagNames: ['div'], classKeywords: ['ghl-custom', 'ghl-html', 'highlevel-custom'] }, confidence: 90, priority: 90 },
      { componentType: 'ghl-calendar', patterns: { tagNames: ['div', 'iframe'], classKeywords: ['ghl-calendar', 'highlevel-calendar', 'appointment-calendar'] }, confidence: 90, priority: 90 },
      { componentType: 'ghl-survey', patterns: { tagNames: ['form', 'div'], classKeywords: ['ghl-survey', 'highlevel-survey', 'ghl-questionnaire'] }, confidence: 85, priority: 85 },

      // ICON PATTERNS
      { componentType: 'icon', patterns: { tagNames: ['i', 'svg'], classKeywords: ['icon', 'fa', 'fas', 'far', 'fab'] }, confidence: 90, priority: 85 },

      // CONTAINER PATTERNS
      { componentType: 'container', patterns: { tagNames: ['div'], classKeywords: ['container', 'wrapper', 'content-wrapper'] }, confidence: 70, priority: 60 },

      // ROW PATTERNS
      { componentType: 'row', patterns: { tagNames: ['div'], classKeywords: ['row', 'grid-row'], cssProperties: (styles) => this.looksLikeFlex(styles) }, confidence: 75, priority: 65 },

      // GRID PATTERNS (Enhanced)
      { componentType: 'grid', patterns: { tagNames: ['div'], cssProperties: (styles) => this.looksLikeGrid(styles) }, confidence: 90, priority: 95 },
      { componentType: 'grid', patterns: { tagNames: ['div'], classKeywords: ['grid', 'grid-container', 'css-grid'] }, confidence: 85, priority: 85 },

      // BUTTON PATTERNS (Enhanced with CSS)
      { componentType: 'button', patterns: { tagNames: ['a', 'div', 'span'], cssProperties: (styles) => this.looksLikeButton(styles) }, confidence: 75, priority: 70 },

      // CARD PATTERNS (Enhanced with CSS)
      { componentType: 'card', patterns: { tagNames: ['div', 'article'], cssProperties: (styles) => this.looksLikeCard(styles) }, confidence: 75, priority: 75 },
    ];

    this.patterns.sort((a, b) => b.priority - a.priority);
  }

  recognizeComponent(
    element: Element,
    styles: ExtractedStyles,
    context: ElementContext
  ): RecognitionResult {
    const tagName = element.tagName.toLowerCase();
    const classes = Array.from(element.classList);
    const textContent = element.textContent?.trim() || '';
    const ariaRole = element.getAttribute('role') || undefined;

    let bestMatch: RecognitionResult | null = null;
    let highestConfidence = 0;

    for (const pattern of this.patterns) {
      const confidence = this.matchPattern(pattern, {
        tagName,
        classes,
        styles,
        textContent,
        ariaRole,
        context,
        element,
      });

      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        bestMatch = {
          componentType: pattern.componentType,
          confidence,
          matchedPatterns: [pattern.componentType],
          manualReviewNeeded: confidence < 70,
          reason: `Matched ${pattern.componentType} pattern with ${confidence}% confidence`,
        };
      }
    }

    if (bestMatch) {
      const boostedResult = this.boostConfidence(bestMatch, element, styles, context);
      return boostedResult;
    }

    return {
      componentType: 'unknown',
      confidence: 0,
      matchedPatterns: [],
      manualReviewNeeded: true,
      reason: 'No matching pattern found',
    };
  }

  private matchPattern(
    pattern: RecognitionPattern,
    data: {
      tagName: string;
      classes: string[];
      styles: ExtractedStyles;
      textContent: string;
      ariaRole?: string;
      context: ElementContext;
      element: Element;
    }
  ): number {
    let matchCount = 0;
    let totalChecks = 0;

    if (pattern.patterns.tagNames) {
      totalChecks++;
      if (pattern.patterns.tagNames.includes(data.tagName)) {
        matchCount++;
      } else {
        return 0;
      }
    }

    if (pattern.patterns.classKeywords) {
      totalChecks++;
      const hasMatchingClass = pattern.patterns.classKeywords.some(keyword =>
        data.classes.some(cls => cls.toLowerCase().includes(keyword.toLowerCase()))
      );
      if (hasMatchingClass) matchCount++;
    }

    if (pattern.patterns.cssProperties) {
      totalChecks++;
      const cssMatch = pattern.patterns.cssProperties(data.styles, data.element);
      if (cssMatch) matchCount++;
    }

    if (pattern.patterns.ariaRole) {
      totalChecks++;
      if (data.ariaRole === pattern.patterns.ariaRole) {
        matchCount++;
      }
    }

    if (totalChecks === 0) return 0;
    const matchPercentage = (matchCount / totalChecks) * 100;
    return Math.round((pattern.confidence * matchPercentage) / 100);
  }

  private boostConfidence(
    result: RecognitionResult,
    element: Element,
    styles: ExtractedStyles,
    context: ElementContext
  ): RecognitionResult {
    let boostedConfidence = result.confidence;

    if (element.tagName.toLowerCase() === result.componentType) {
      boostedConfidence += 10;
    }

    if (element.hasAttribute('role') || element.hasAttribute('aria-label')) {
      boostedConfidence += 5;
    }

    const classes = Array.from(element.classList);
    if (classes.some(c => c.includes('bootstrap') || c.includes('material') || c.includes('mui'))) {
      boostedConfidence += 5;
    }

    return {
      ...result,
      confidence: Math.min(boostedConfidence, 100),
    };
  }

  extractStyles(element: HTMLElement): ExtractedStyles {
    if (typeof window === 'undefined') return {};

    const computed = window.getComputedStyle(element);

    return {
      display: computed.display,
      position: computed.position,
      flexDirection: computed.flexDirection,
      justifyContent: computed.justifyContent,
      alignItems: computed.alignItems,
      gridTemplateColumns: computed.gridTemplateColumns,
      padding: this.parseBoxModel(computed.paddingTop, computed.paddingRight, computed.paddingBottom, computed.paddingLeft),
      margin: this.parseBoxModel(computed.marginTop, computed.marginRight, computed.marginBottom, computed.marginLeft),
      width: computed.width,
      height: computed.height,
      fontSize: computed.fontSize,
      fontFamily: computed.fontFamily,
      fontWeight: computed.fontWeight,
      lineHeight: computed.lineHeight,
      textAlign: computed.textAlign,
      color: computed.color,
      backgroundColor: computed.backgroundColor,
      backgroundImage: computed.backgroundImage !== 'none' ? computed.backgroundImage : undefined,
      borderRadius: this.parseBorderRadius(computed.borderTopLeftRadius, computed.borderTopRightRadius, computed.borderBottomRightRadius, computed.borderBottomLeftRadius),
      borderWidth: parseFloat(computed.borderWidth),
      borderColor: computed.borderColor,
      borderStyle: computed.borderStyle,
      boxShadow: computed.boxShadow !== 'none' ? computed.boxShadow : undefined,
      cursor: computed.cursor,
    };
  }

  private parseBoxModel(top: string, right: string, bottom: string, left: string) {
    return {
      top: parseFloat(top),
      right: parseFloat(right),
      bottom: parseFloat(bottom),
      left: parseFloat(left),
    };
  }

  private parseBorderRadius(topLeft: string, topRight: string, bottomRight: string, bottomLeft: string) {
    return {
      topLeft,
      topRight,
      bottomRight,
      bottomLeft,
    };
  }

  /**
   * CSS Property Matchers
   */
  private looksLikeButton(styles: ExtractedStyles): boolean {
    return (
      styles.display === 'inline-block' ||
      styles.display === 'flex' ||
      (styles.padding !== undefined && styles.padding.top > 5 && styles.padding.bottom > 5) ||
      (styles.borderRadius !== undefined && styles.backgroundColor !== undefined) ||
      styles.cursor === 'pointer'
    );
  }

  private looksLikeCard(styles: ExtractedStyles): boolean {
    return (
      styles.borderRadius !== undefined ||
      styles.boxShadow !== undefined ||
      (styles.borderWidth !== undefined && styles.borderWidth > 0)
    ) && (styles.padding !== undefined && styles.padding.top > 10);
  }

  private looksLikeTable(styles: ExtractedStyles): boolean {
    return styles.display === 'table' || styles.display === 'table-row' || styles.display === 'table-cell';
  }

  private looksLikeGrid(styles: ExtractedStyles): boolean {
    return styles.display === 'grid' || styles.gridTemplateColumns !== undefined;
  }

  private looksLikeFlex(styles: ExtractedStyles): boolean {
    return styles.display === 'flex' || styles.flexDirection !== undefined;
  }
}

export default new ComponentRecognizer();
