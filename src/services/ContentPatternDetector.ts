import type { CheerioAPI, Cheerio, Element } from 'cheerio';

/**
 * Content Pattern Detection Strategy:
 * - Semantic HTML detection (article, blockquote, figure)
 * - Structural pattern matching (card layouts, grids)
 * - Class name analysis (common naming conventions)
 * - Content heuristics (presence of title, image, description)
 * - Context analysis (parent containers, sibling patterns)
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ContentComponent {
  type: 'blog-post-card' | 'product-card' | 'feature-box' | 'service-box' | 'team-member-card' | 'statistic-counter' | 'quote-testimonial';
  tag: string;
  selector: string;
  classes: string[];
  confidence: number;
  detectionMethod: 'semantic' | 'structure' | 'class' | 'heuristic';
  properties: ContentProperties;
}

export interface ContentProperties {
  // Common properties
  hasImage: boolean;
  hasTitle: boolean;
  hasDescription: boolean;

  // Blog-specific
  hasDate?: boolean;
  hasAuthor?: boolean;
  hasExcerpt?: boolean;
  hasReadMore?: boolean;

  // Product-specific
  hasPrice?: boolean;
  hasRating?: boolean;
  hasAddToCart?: boolean;
  productId?: string;

  // Feature/Service-specific
  hasIcon?: boolean;

  // Team-specific
  hasName?: boolean;
  hasRole?: boolean;
  hasSocialLinks?: boolean;

  // Statistic-specific
  number?: string;
  label?: string;
  hasAnimation?: boolean;

  // Quote-specific
  quoteText?: string;
  author?: string;
  source?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const PATTERNS = {
  blogCard: {
    semantic: ['article.card', 'article[class*="post"]', 'article[class*="blog"]'],
    classes: [
      '.blog-card',
      '.post-card',
      '[class*="blog-card"]',
      '[class*="post-card"]',
      '[class*="article-card"]'
    ],
    structure: {
      container: 'article, div, [class*="card"]',
      image: 'img, [class*="image"], [class*="thumbnail"]',
      title: 'h1, h2, h3, h4, .title, [class*="title"]',
      date: 'time, .date, [class*="date"]',
      excerpt: 'p, .excerpt, [class*="excerpt"]'
    }
  },

  productCard: {
    semantic: ['[itemtype*="Product"]', '[data-product-id]'],
    classes: [
      '.product-card',
      '.product',
      '[class*="product-card"]',
      '[class*="product-item"]'
    ],
    structure: {
      container: 'div, article, [class*="product"]',
      image: 'img, [class*="image"]',
      title: 'h1, h2, h3, h4, .title, [class*="title"], [class*="name"]',
      price: '.price, [class*="price"]',
      button: 'button, .btn, [class*="add-to-cart"]'
    }
  },

  featureBox: {
    classes: [
      '.feature-box',
      '.feature',
      '.feature-item',
      '[class*="feature-box"]',
      '[class*="feature-item"]'
    ],
    structure: {
      container: 'div, [class*="feature"]',
      icon: 'i, svg, [class*="icon"]',
      title: 'h1, h2, h3, h4, .title, [class*="title"]',
      description: 'p, .description, [class*="description"]'
    }
  },

  serviceBox: {
    classes: [
      '.service-box',
      '.service-card',
      '.service',
      '[class*="service-box"]',
      '[class*="service-card"]'
    ],
    structure: {
      container: 'div, [class*="service"]',
      icon: 'i, svg, [class*="icon"]',
      title: 'h1, h2, h3, h4, .title, [class*="title"]',
      description: 'p, .description, [class*="description"]'
    }
  },

  teamMember: {
    classes: [
      '.team-member',
      '.team-card',
      '.person-card',
      '[class*="team-member"]',
      '[class*="team-card"]'
    ],
    structure: {
      container: 'div, article, [class*="team"], [class*="member"]',
      image: 'img, [class*="photo"], [class*="image"]',
      name: 'h1, h2, h3, h4, .name, [class*="name"]',
      role: '.role, .position, [class*="role"], [class*="position"]',
      social: '[class*="social"]'
    }
  },

  statistic: {
    classes: [
      '.statistic',
      '.counter',
      '.number-box',
      '[class*="statistic"]',
      '[class*="counter"]',
      '[class*="number"]'
    ],
    structure: {
      container: 'div, [class*="stat"], [class*="counter"]',
      number: '[class*="number"], [class*="value"], [class*="count"]',
      label: '[class*="label"], [class*="title"], p, span'
    }
  },

  quote: {
    semantic: ['blockquote'],
    classes: [
      '.quote',
      '.testimonial',
      '[class*="quote"]',
      '[class*="testimonial"]'
    ],
    structure: {
      container: 'blockquote, div, [class*="quote"]',
      text: 'p, [class*="text"], [class*="content"]',
      author: 'cite, .author, [class*="author"]',
      source: '.source, [class*="source"]'
    }
  }
};

// ============================================================================
// MAIN DETECTOR CLASS
// ============================================================================

export class ContentPatternDetector {
  private detected = new Set<string>();

  /**
   * Main detection entry point
   */
  detect($: CheerioAPI): ContentComponent[] {
    const components: ContentComponent[] = [];
    this.detected.clear();

    // Detect all content pattern types
    this.detectBlogCards($, components);
    this.detectProductCards($, components);
    this.detectFeatureBoxes($, components);
    this.detectServiceBoxes($, components);
    this.detectTeamMembers($, components);
    this.detectStatistics($, components);
    this.detectQuotes($, components);

    return components;
  }

  // ==========================================================================
  // BLOG CARD DETECTION
  // ==========================================================================

  private detectBlogCards($: CheerioAPI, components: ContentComponent[]): void {
    // Semantic articles
    $(PATTERNS.blogCard.semantic.join(', ')).each((_, el) => {
      this.addBlogCardComponent($, $(el), components, 90, 'semantic');
    });

    // Class-based detection
    $(PATTERNS.blogCard.classes.join(', ')).each((_, el) => {
      const $card = $(el);
      const selector = this.generateSelector($card);

      if (!this.detected.has(selector) && this.looksLikeBlogCard($card)) {
        this.addBlogCardComponent($, $card, components, 85, 'class');
      }
    });
  }

  private addBlogCardComponent(
    $: CheerioAPI,
    $card: Cheerio<Element>,
    components: ContentComponent[],
    confidence: number,
    method: ContentComponent['detectionMethod']
  ): void {
    const selector = this.generateSelector($card);
    if (this.detected.has(selector)) return;

    const hasImage = $card.find('img').length > 0;
    const hasTitle = $card.find('h1, h2, h3, h4, .title, [class*="title"]').length > 0;
    const hasDate = $card.find('time, .date, [class*="date"]').length > 0;
    const hasAuthor = $card.find('.author, [class*="author"]').length > 0;
    const hasExcerpt = $card.find('p, .excerpt, [class*="excerpt"]').length > 0;
    const hasReadMore = $card.find('a[href], button, [class*="read-more"]').length > 0;

    components.push({
      type: 'blog-post-card',
      tag: $card[0].tagName.toLowerCase(),
      selector,
      classes: this.getClasses($card),
      confidence,
      detectionMethod: method,
      properties: {
        hasImage,
        hasTitle,
        hasDescription: hasExcerpt,
        hasDate,
        hasAuthor,
        hasExcerpt,
        hasReadMore
      }
    });

    this.detected.add(selector);
  }

  private looksLikeBlogCard($el: Cheerio<Element>): boolean {
    const hasTitle = $el.find('h1, h2, h3, h4, .title').length > 0;
    const hasDate = $el.find('time, .date').length > 0;
    const hasText = $el.find('p').length > 0;
    return hasTitle && (hasDate || hasText);
  }

  // ==========================================================================
  // PRODUCT CARD DETECTION
  // ==========================================================================

  private detectProductCards($: CheerioAPI, components: ContentComponent[]): void {
    // Semantic product markup
    $(PATTERNS.productCard.semantic.join(', ')).each((_, el) => {
      this.addProductCardComponent($, $(el), components, 95, 'semantic');
    });

    // Class-based detection
    $(PATTERNS.productCard.classes.join(', ')).each((_, el) => {
      const $card = $(el);
      const selector = this.generateSelector($card);

      if (!this.detected.has(selector) && this.looksLikeProductCard($card)) {
        this.addProductCardComponent($, $card, components, 85, 'class');
      }
    });
  }

  private addProductCardComponent(
    $: CheerioAPI,
    $card: Cheerio<Element>,
    components: ContentComponent[],
    confidence: number,
    method: ContentComponent['detectionMethod']
  ): void {
    const selector = this.generateSelector($card);
    if (this.detected.has(selector)) return;

    const hasImage = $card.find('img').length > 0;
    const hasTitle = $card.find('h1, h2, h3, h4, .title, [class*="title"]').length > 0;
    const hasPrice = $card.find('.price, [class*="price"]').length > 0;
    const hasRating = $card.find('[class*="rating"], [class*="stars"]').length > 0;
    const hasAddToCart = $card.find('button, [class*="add-to-cart"], [class*="buy"]').length > 0;
    const productId = $card.attr('data-product-id') || $card.attr('data-id');

    components.push({
      type: 'product-card',
      tag: $card[0].tagName.toLowerCase(),
      selector,
      classes: this.getClasses($card),
      confidence,
      detectionMethod: method,
      properties: {
        hasImage,
        hasTitle,
        hasDescription: $card.find('p, .description').length > 0,
        hasPrice,
        hasRating,
        hasAddToCart,
        productId
      }
    });

    this.detected.add(selector);
  }

  private looksLikeProductCard($el: Cheerio<Element>): boolean {
    const hasPrice = $el.find('.price, [class*="price"]').length > 0;
    const hasTitle = $el.find('h1, h2, h3, h4, .title').length > 0;
    const hasButton = $el.find('button, .btn').length > 0;
    return (hasPrice && hasTitle) || (hasPrice && hasButton);
  }

  // ==========================================================================
  // FEATURE BOX DETECTION
  // ==========================================================================

  private detectFeatureBoxes($: CheerioAPI, components: ContentComponent[]): void {
    $(PATTERNS.featureBox.classes.join(', ')).each((_, el) => {
      const $box = $(el);
      const selector = this.generateSelector($box);

      if (!this.detected.has(selector) && this.looksLikeFeatureBox($box)) {
        this.addFeatureBoxComponent($, $box, components, 85, 'class');
      }
    });
  }

  private addFeatureBoxComponent(
    $: CheerioAPI,
    $box: Cheerio<Element>,
    components: ContentComponent[],
    confidence: number,
    method: ContentComponent['detectionMethod']
  ): void {
    const selector = this.generateSelector($box);
    if (this.detected.has(selector)) return;

    const hasIcon = $box.find('i, svg, [class*="icon"]').length > 0;
    const hasTitle = $box.find('h1, h2, h3, h4, .title').length > 0;
    const hasDescription = $box.find('p, .description').length > 0;

    components.push({
      type: 'feature-box',
      tag: $box[0].tagName.toLowerCase(),
      selector,
      classes: this.getClasses($box),
      confidence,
      detectionMethod: method,
      properties: {
        hasImage: false,
        hasTitle,
        hasDescription,
        hasIcon
      }
    });

    this.detected.add(selector);
  }

  private looksLikeFeatureBox($el: Cheerio<Element>): boolean {
    const hasIcon = $el.find('i, svg, [class*="icon"]').length > 0;
    const hasTitle = $el.find('h1, h2, h3, h4').length > 0;
    const hasText = $el.find('p').length > 0;
    return hasIcon && hasTitle && hasText;
  }

  // ==========================================================================
  // SERVICE BOX DETECTION
  // ==========================================================================

  private detectServiceBoxes($: CheerioAPI, components: ContentComponent[]): void {
    $(PATTERNS.serviceBox.classes.join(', ')).each((_, el) => {
      const $box = $(el);
      const selector = this.generateSelector($box);

      if (!this.detected.has(selector) && this.looksLikeServiceBox($box)) {
        this.addServiceBoxComponent($, $box, components, 85, 'class');
      }
    });
  }

  private addServiceBoxComponent(
    $: CheerioAPI,
    $box: Cheerio<Element>,
    components: ContentComponent[],
    confidence: number,
    method: ContentComponent['detectionMethod']
  ): void {
    const selector = this.generateSelector($box);
    if (this.detected.has(selector)) return;

    const hasIcon = $box.find('i, svg, [class*="icon"]').length > 0;
    const hasTitle = $box.find('h1, h2, h3, h4, .title').length > 0;
    const hasDescription = $box.find('p, .description').length > 0;

    components.push({
      type: 'service-box',
      tag: $box[0].tagName.toLowerCase(),
      selector,
      classes: this.getClasses($box),
      confidence,
      detectionMethod: method,
      properties: {
        hasImage: false,
        hasTitle,
        hasDescription,
        hasIcon
      }
    });

    this.detected.add(selector);
  }

  private looksLikeServiceBox($el: Cheerio<Element>): boolean {
    return this.looksLikeFeatureBox($el); // Same structure as feature box
  }

  // ==========================================================================
  // TEAM MEMBER DETECTION
  // ==========================================================================

  private detectTeamMembers($: CheerioAPI, components: ContentComponent[]): void {
    $(PATTERNS.teamMember.classes.join(', ')).each((_, el) => {
      const $card = $(el);
      const selector = this.generateSelector($card);

      if (!this.detected.has(selector) && this.looksLikeTeamMember($card)) {
        this.addTeamMemberComponent($, $card, components, 85, 'class');
      }
    });
  }

  private addTeamMemberComponent(
    $: CheerioAPI,
    $card: Cheerio<Element>,
    components: ContentComponent[],
    confidence: number,
    method: ContentComponent['detectionMethod']
  ): void {
    const selector = this.generateSelector($card);
    if (this.detected.has(selector)) return;

    const hasImage = $card.find('img').length > 0;
    const hasName = $card.find('h1, h2, h3, h4, .name, [class*="name"]').length > 0;
    const hasRole = $card.find('.role, .position, [class*="role"]').length > 0;
    const hasSocialLinks = $card.find('[class*="social"] a, [class*="social"] i').length > 0;

    components.push({
      type: 'team-member-card',
      tag: $card[0].tagName.toLowerCase(),
      selector,
      classes: this.getClasses($card),
      confidence,
      detectionMethod: method,
      properties: {
        hasImage,
        hasTitle: hasName,
        hasDescription: hasRole,
        hasName,
        hasRole,
        hasSocialLinks
      }
    });

    this.detected.add(selector);
  }

  private looksLikeTeamMember($el: Cheerio<Element>): boolean {
    const hasImage = $el.find('img').length > 0;
    const hasName = $el.find('h1, h2, h3, h4, .name').length > 0;
    const hasRole = $el.find('.role, .position').length > 0;
    return hasImage && hasName && hasRole;
  }

  // ==========================================================================
  // STATISTIC DETECTION
  // ==========================================================================

  private detectStatistics($: CheerioAPI, components: ContentComponent[]): void {
    $(PATTERNS.statistic.classes.join(', ')).each((_, el) => {
      const $stat = $(el);
      const selector = this.generateSelector($stat);

      if (!this.detected.has(selector) && this.looksLikeStatistic($stat)) {
        this.addStatisticComponent($, $stat, components, 80, 'heuristic');
      }
    });
  }

  private addStatisticComponent(
    $: CheerioAPI,
    $stat: Cheerio<Element>,
    components: ContentComponent[],
    confidence: number,
    method: ContentComponent['detectionMethod']
  ): void {
    const selector = this.generateSelector($stat);
    if (this.detected.has(selector)) return;

    const $number = $stat.find('[class*="number"], [class*="value"], [class*="count"]').first();
    const number = $number.text().trim();
    const label = $stat.find('[class*="label"], p, span').not($number).first().text().trim();
    const hasAnimation = this.hasCounterAnimation($stat);

    components.push({
      type: 'statistic-counter',
      tag: $stat[0].tagName.toLowerCase(),
      selector,
      classes: this.getClasses($stat),
      confidence,
      detectionMethod: method,
      properties: {
        hasImage: false,
        hasTitle: !!label,
        hasDescription: !!label,
        number,
        label,
        hasAnimation
      }
    });

    this.detected.add(selector);
  }

  private looksLikeStatistic($el: Cheerio<Element>): boolean {
    const text = $el.text().trim();
    // Check if contains large number (optionally with units)
    return /\d{2,}[\d,.\s]*[+%KMB]*/.test(text);
  }

  private hasCounterAnimation($el: Cheerio<Element>): boolean {
    const classes = this.getClasses($el).join(' ');
    return /count|animate|counter/.test(classes);
  }

  // ==========================================================================
  // QUOTE/TESTIMONIAL DETECTION
  // ==========================================================================

  private detectQuotes($: CheerioAPI, components: ContentComponent[]): void {
    // Semantic blockquotes
    $('blockquote').each((_, el) => {
      this.addQuoteComponent($, $(el), components, 90, 'semantic');
    });

    // Class-based detection
    $(PATTERNS.quote.classes.join(', ')).each((_, el) => {
      const $quote = $(el);
      const selector = this.generateSelector($quote);

      if (!this.detected.has(selector) && this.looksLikeQuote($quote)) {
        this.addQuoteComponent($, $quote, components, 85, 'class');
      }
    });
  }

  private addQuoteComponent(
    $: CheerioAPI,
    $quote: Cheerio<Element>,
    components: ContentComponent[],
    confidence: number,
    method: ContentComponent['detectionMethod']
  ): void {
    const selector = this.generateSelector($quote);
    if (this.detected.has(selector)) return;

    const quoteText = $quote.find('p, [class*="text"]').first().text().trim() ||
                      $quote.clone().children('cite, .author').remove().end().text().trim();
    const author = $quote.find('cite, .author, [class*="author"]').text().trim();
    const source = $quote.find('.source, [class*="source"]').text().trim();

    components.push({
      type: 'quote-testimonial',
      tag: $quote[0].tagName.toLowerCase(),
      selector,
      classes: this.getClasses($quote),
      confidence,
      detectionMethod: method,
      properties: {
        hasImage: $quote.find('img').length > 0,
        hasTitle: !!author,
        hasDescription: !!quoteText,
        quoteText,
        author,
        source
      }
    });

    this.detected.add(selector);
  }

  private looksLikeQuote($el: Cheerio<Element>): boolean {
    const hasQuoteText = $el.find('p').length > 0;
    const hasAuthor = $el.find('cite, .author').length > 0;
    return hasQuoteText || hasAuthor;
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  private generateSelector($el: Cheerio<Element>): string {
    const el = $el[0];
    if (!el) return '';

    const tag = el.tagName.toLowerCase();
    const id = $el.attr('id');
    const classes = this.getClasses($el);

    if (id) return `${tag}#${id}`;
    if (classes.length > 0) return `${tag}.${classes[0]}`;

    const index = $el.index();
    return `${tag}:nth-child(${index + 1})`;
  }

  private getClasses($el: Cheerio<Element>): string[] {
    const classAttr = $el.attr('class');
    if (!classAttr) return [];
    return classAttr.split(/\s+/).filter(c => c.length > 0);
  }
}
