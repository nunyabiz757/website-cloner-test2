import type { CheerioAPI, Cheerio, Element } from 'cheerio';

/**
 * Interactive Pattern Detection Strategy:
 * - Multi-signal detection (ARIA + classes + structure + attributes)
 * - Framework detection (Bootstrap, Tailwind, Material UI, custom)
 * - Confidence scoring based on signal strength
 * - Metadata extraction for each pattern type
 */

// ============================================================================
// TYPES
// ============================================================================

export interface InteractiveComponent {
  type: 'modal' | 'accordion' | 'tabs' | 'carousel' | 'pagination' | 'breadcrumbs' | 'search-bar';
  tag: string;
  selector: string;
  classes: string[];
  confidence: number;
  detectionMethod: 'aria' | 'framework' | 'structure' | 'attribute';
  framework?: 'bootstrap' | 'tailwind' | 'material-ui' | 'custom';
  properties: InteractiveProperties;
}

export interface InteractiveProperties {
  // Common properties
  isVisible: boolean;
  hasAnimation: boolean;

  // Modal-specific
  hasBackdrop?: boolean;
  hasCloseButton?: boolean;

  // Accordion-specific
  itemCount?: number;
  allowMultiple?: boolean;

  // Tabs-specific
  tabCount?: number;
  orientation?: 'horizontal' | 'vertical';

  // Carousel-specific
  slideCount?: number;
  hasNavigation?: boolean;
  hasIndicators?: boolean;
  autoplay?: boolean;

  // Pagination-specific
  pageCount?: number;
  currentPage?: number;

  // Breadcrumbs-specific
  levelCount?: number;
  items?: BreadcrumbItem[];

  // Search-specific
  placeholder?: string;
  hasButton?: boolean;
}

export interface BreadcrumbItem {
  text: string;
  href?: string;
  isActive: boolean;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const PATTERNS = {
  modal: {
    aria: ['[role="dialog"]', '[role="alertdialog"]'],
    classes: [
      '.modal',
      '.dialog',
      '.popup',
      '.lightbox',
      '.overlay',
      '[class*="modal"]',
      '[class*="dialog"]'
    ],
    bootstrap: ['.modal'],
    tailwind: ['[x-data*="modal"]', '[data-modal]']
  },

  accordion: {
    aria: ['[role="accordion"]'],
    classes: [
      '.accordion',
      '.collapse',
      '[class*="accordion"]',
      '[class*="collapse"]'
    ],
    bootstrap: ['.accordion'],
    structure: {
      parent: '.accordion',
      item: '.accordion-item',
      button: '.accordion-button',
      panel: '.accordion-collapse'
    }
  },

  tabs: {
    aria: ['[role="tablist"]'],
    classes: [
      '.tabs',
      '.tab-container',
      '[class*="tabs"]',
      '[class*="tab-"]'
    ],
    bootstrap: ['.nav-tabs'],
    structure: {
      tablist: '[role="tablist"]',
      tab: '[role="tab"]',
      panel: '[role="tabpanel"]'
    }
  },

  carousel: {
    aria: ['[role="carousel"]', '[role="region"][aria-roledescription*="carousel"]'],
    classes: [
      '.carousel',
      '.slider',
      '.swiper',
      '.slick-slider',
      '[class*="carousel"]',
      '[class*="slider"]',
      '[class*="swiper"]'
    ],
    bootstrap: ['.carousel'],
    attributes: ['[data-ride="carousel"]', '[data-bs-ride="carousel"]']
  },

  pagination: {
    aria: ['[role="navigation"][aria-label*="pagination"]'],
    classes: [
      '.pagination',
      '[class*="pagination"]'
    ],
    bootstrap: ['.pagination']
  },

  breadcrumbs: {
    aria: ['[role="navigation"][aria-label*="breadcrumb"]', '[aria-label="breadcrumb"]'],
    classes: [
      '.breadcrumb',
      '[class*="breadcrumb"]'
    ],
    bootstrap: ['.breadcrumb']
  },

  search: {
    aria: ['[role="search"]'],
    classes: [
      '.search',
      '.search-bar',
      '.search-form',
      '[class*="search"]'
    ],
    input: ['input[type="search"]', 'input[name*="search"]', 'input[placeholder*="search" i]']
  }
};

// ============================================================================
// MAIN DETECTOR CLASS
// ============================================================================

export class InteractivePatternDetector {
  private detected = new Set<string>();

  /**
   * Main detection entry point
   */
  detect($: CheerioAPI): InteractiveComponent[] {
    const components: InteractiveComponent[] = [];
    this.detected.clear();

    // Detect all pattern types
    this.detectModals($, components);
    this.detectAccordions($, components);
    this.detectTabs($, components);
    this.detectCarousels($, components);
    this.detectPagination($, components);
    this.detectBreadcrumbs($, components);
    this.detectSearch($, components);

    return components;
  }

  // ==========================================================================
  // MODAL DETECTION
  // ==========================================================================

  private detectModals($: CheerioAPI, components: InteractiveComponent[]): void {
    // ARIA dialogs
    $(PATTERNS.modal.aria.join(', ')).each((_, el) => {
      this.addModalComponent($, $(el), components, 95, 'aria');
    });

    // Class-based detection
    $(PATTERNS.modal.classes.join(', ')).each((_, el) => {
      const $modal = $(el);
      const selector = this.generateSelector($modal);

      if (!this.detected.has(selector) && this.looksLikeModal($modal)) {
        this.addModalComponent($, $modal, components, 85, 'structure');
      }
    });
  }

  private addModalComponent(
    $: CheerioAPI,
    $modal: Cheerio<Element>,
    components: InteractiveComponent[],
    confidence: number,
    method: InteractiveComponent['detectionMethod']
  ): void {
    const selector = this.generateSelector($modal);
    if (this.detected.has(selector)) return;

    const hasBackdrop = $modal.siblings('.modal-backdrop, .backdrop, [class*="backdrop"]').length > 0 ||
                        $modal.find('.modal-backdrop, .backdrop').length > 0;
    const hasCloseButton = $modal.find('[data-dismiss="modal"], [data-bs-dismiss="modal"], .close, [aria-label*="close" i]').length > 0;
    const hasAnimation = this.hasAnimationClass($modal);

    // Detect framework
    const framework = this.detectFramework($modal, ['modal']);

    components.push({
      type: 'modal',
      tag: $modal[0].tagName.toLowerCase(),
      selector,
      classes: this.getClasses($modal),
      confidence,
      detectionMethod: method,
      framework,
      properties: {
        isVisible: !$modal.hasClass('hidden') && $modal.css('display') !== 'none',
        hasAnimation,
        hasBackdrop,
        hasCloseButton
      }
    });

    this.detected.add(selector);
  }

  private looksLikeModal($el: Cheerio<Element>): boolean {
    // Modal typically has dialog content and close mechanism
    const hasDialogContent = $el.find('[class*="content"], [class*="body"], [class*="header"]').length > 0;
    const hasCloseButton = $el.find('[class*="close"], [aria-label*="close"]').length > 0;
    const position = $el.css('position');
    const isPositioned = position === 'fixed' || position === 'absolute';

    return (hasDialogContent || hasCloseButton) && isPositioned;
  }

  // ==========================================================================
  // ACCORDION DETECTION
  // ==========================================================================

  private detectAccordions($: CheerioAPI, components: InteractiveComponent[]): void {
    // ARIA accordions
    $(PATTERNS.accordion.aria.join(', ')).each((_, el) => {
      this.addAccordionComponent($, $(el), components, 95, 'aria');
    });

    // Bootstrap structure
    $(PATTERNS.accordion.bootstrap.join(', ')).each((_, el) => {
      const $accordion = $(el);
      const selector = this.generateSelector($accordion);

      if (!this.detected.has(selector)) {
        this.addAccordionComponent($, $accordion, components, 90, 'framework');
      }
    });

    // Class-based detection
    $(PATTERNS.accordion.classes.join(', ')).each((_, el) => {
      const $accordion = $(el);
      const selector = this.generateSelector($accordion);

      if (!this.detected.has(selector) && this.looksLikeAccordion($accordion)) {
        this.addAccordionComponent($, $accordion, components, 85, 'structure');
      }
    });
  }

  private addAccordionComponent(
    $: CheerioAPI,
    $accordion: Cheerio<Element>,
    components: InteractiveComponent[],
    confidence: number,
    method: InteractiveComponent['detectionMethod']
  ): void {
    const selector = this.generateSelector($accordion);
    if (this.detected.has(selector)) return;

    // Count accordion items
    const items = $accordion.find('[class*="accordion-item"], [role="tab"], [class*="collapse"]').length;

    // Check if multiple panels can be open
    const allowMultiple = $accordion.attr('data-allow-multiple') === 'true' ||
                          !$accordion.attr('data-parent');

    const framework = this.detectFramework($accordion, ['accordion']);

    components.push({
      type: 'accordion',
      tag: $accordion[0].tagName.toLowerCase(),
      selector,
      classes: this.getClasses($accordion),
      confidence,
      detectionMethod: method,
      framework,
      properties: {
        isVisible: true,
        hasAnimation: this.hasAnimationClass($accordion),
        itemCount: items,
        allowMultiple
      }
    });

    this.detected.add(selector);
  }

  private looksLikeAccordion($el: Cheerio<Element>): boolean {
    // Accordion has multiple collapsible sections
    const collapsibleSections = $el.find('[class*="collapse"], [aria-expanded]').length;
    return collapsibleSections >= 2;
  }

  // ==========================================================================
  // TABS DETECTION
  // ==========================================================================

  private detectTabs($: CheerioAPI, components: InteractiveComponent[]): void {
    // ARIA tablists
    $(PATTERNS.tabs.aria.join(', ')).each((_, el) => {
      this.addTabsComponent($, $(el), components, 95, 'aria');
    });

    // Bootstrap tabs
    $(PATTERNS.tabs.bootstrap.join(', ')).each((_, el) => {
      const $tabs = $(el);
      const selector = this.generateSelector($tabs);

      if (!this.detected.has(selector)) {
        this.addTabsComponent($, $tabs, components, 90, 'framework');
      }
    });

    // Class-based detection
    $(PATTERNS.tabs.classes.join(', ')).each((_, el) => {
      const $tabs = $(el);
      const selector = this.generateSelector($tabs);

      if (!this.detected.has(selector) && this.looksLikeTabs($tabs)) {
        this.addTabsComponent($, $tabs, components, 85, 'structure');
      }
    });
  }

  private addTabsComponent(
    $: CheerioAPI,
    $tabs: Cheerio<Element>,
    components: InteractiveComponent[],
    confidence: number,
    method: InteractiveComponent['detectionMethod']
  ): void {
    const selector = this.generateSelector($tabs);
    if (this.detected.has(selector)) return;

    // Count tabs
    const tabElements = $tabs.find('[role="tab"], [class*="tab-"]:not([class*="panel"]):not([class*="content"])');
    const tabCount = tabElements.length;

    // Detect orientation
    const flexDirection = $tabs.css('flex-direction');
    const orientation = flexDirection === 'column' || $tabs.hasClass('vertical') ? 'vertical' : 'horizontal';

    const framework = this.detectFramework($tabs, ['tabs', 'nav-tabs']);

    components.push({
      type: 'tabs',
      tag: $tabs[0].tagName.toLowerCase(),
      selector,
      classes: this.getClasses($tabs),
      confidence,
      detectionMethod: method,
      framework,
      properties: {
        isVisible: true,
        hasAnimation: this.hasAnimationClass($tabs),
        tabCount,
        orientation
      }
    });

    this.detected.add(selector);
  }

  private looksLikeTabs($el: Cheerio<Element>): boolean {
    // Tabs have tab elements and associated panels
    const tabs = $el.find('[role="tab"], [class*="tab-"]:not([class*="panel"])').length;
    const panels = $el.find('[role="tabpanel"], [class*="tab-panel"], [class*="tab-content"]').length;
    return tabs >= 2 && (panels >= 2 || tabs === panels);
  }

  // ==========================================================================
  // CAROUSEL DETECTION
  // ==========================================================================

  private detectCarousels($: CheerioAPI, components: InteractiveComponent[]): void {
    // ARIA carousels
    $(PATTERNS.carousel.aria.join(', ')).each((_, el) => {
      this.addCarouselComponent($, $(el), components, 95, 'aria');
    });

    // Class-based detection (Bootstrap, Slick, Swiper)
    $(PATTERNS.carousel.classes.join(', ')).each((_, el) => {
      const $carousel = $(el);
      const selector = this.generateSelector($carousel);

      if (!this.detected.has(selector)) {
        this.addCarouselComponent($, $carousel, components, 90, 'framework');
      }
    });
  }

  private addCarouselComponent(
    $: CheerioAPI,
    $carousel: Cheerio<Element>,
    components: InteractiveComponent[],
    confidence: number,
    method: InteractiveComponent['detectionMethod']
  ): void {
    const selector = this.generateSelector($carousel);
    if (this.detected.has(selector)) return;

    // Count slides
    const slides = $carousel.find('[class*="slide"], [class*="item"], [class*="swiper-slide"]');
    const slideCount = slides.length;

    // Detect navigation
    const hasNavigation = $carousel.find('[class*="prev"], [class*="next"], [class*="arrow"]').length > 0;

    // Detect indicators/dots
    const hasIndicators = $carousel.find('[class*="indicator"], [class*="dot"], [class*="pagination"]').length > 0;

    // Detect autoplay
    const autoplay = $carousel.attr('data-autoplay') === 'true' ||
                     $carousel.attr('data-ride') === 'carousel' ||
                     $carousel.attr('data-bs-ride') === 'carousel';

    const framework = this.detectFramework($carousel, ['carousel', 'slider', 'swiper', 'slick']);

    components.push({
      type: 'carousel',
      tag: $carousel[0].tagName.toLowerCase(),
      selector,
      classes: this.getClasses($carousel),
      confidence,
      detectionMethod: method,
      framework,
      properties: {
        isVisible: true,
        hasAnimation: true,
        slideCount,
        hasNavigation,
        hasIndicators,
        autoplay
      }
    });

    this.detected.add(selector);
  }

  // ==========================================================================
  // PAGINATION DETECTION
  // ==========================================================================

  private detectPagination($: CheerioAPI, components: InteractiveComponent[]): void {
    // ARIA pagination
    $(PATTERNS.pagination.aria.join(', ')).each((_, el) => {
      this.addPaginationComponent($, $(el), components, 95, 'aria');
    });

    // Class-based detection
    $(PATTERNS.pagination.classes.join(', ')).each((_, el) => {
      const $pagination = $(el);
      const selector = this.generateSelector($pagination);

      if (!this.detected.has(selector) && this.looksLikePagination($pagination)) {
        this.addPaginationComponent($, $pagination, components, 85, 'structure');
      }
    });
  }

  private addPaginationComponent(
    $: CheerioAPI,
    $pagination: Cheerio<Element>,
    components: InteractiveComponent[],
    confidence: number,
    method: InteractiveComponent['detectionMethod']
  ): void {
    const selector = this.generateSelector($pagination);
    if (this.detected.has(selector)) return;

    // Count pages
    const pageLinks = $pagination.find('a, button, [role="button"]');
    const pageCount = pageLinks.filter((_, el) => {
      const text = $(el).text().trim();
      return /^\d+$/.test(text);
    }).length;

    // Detect current page
    const currentPage = pageLinks.filter('.active, [aria-current="page"]').first().text().trim();

    const framework = this.detectFramework($pagination, ['pagination']);

    components.push({
      type: 'pagination',
      tag: $pagination[0].tagName.toLowerCase(),
      selector,
      classes: this.getClasses($pagination),
      confidence,
      detectionMethod: method,
      framework,
      properties: {
        isVisible: true,
        hasAnimation: false,
        pageCount,
        currentPage: parseInt(currentPage) || undefined
      }
    });

    this.detected.add(selector);
  }

  private looksLikePagination($el: Cheerio<Element>): boolean {
    // Pagination has numbered links
    const links = $el.find('a, button');
    const numberedLinks = links.filter((_, el) => /^\d+$/.test($(el).text().trim())).length;
    return numberedLinks >= 2;
  }

  // ==========================================================================
  // BREADCRUMBS DETECTION
  // ==========================================================================

  private detectBreadcrumbs($: CheerioAPI, components: InteractiveComponent[]): void {
    // ARIA breadcrumbs
    $(PATTERNS.breadcrumbs.aria.join(', ')).each((_, el) => {
      this.addBreadcrumbsComponent($, $(el), components, 95, 'aria');
    });

    // Class-based detection
    $(PATTERNS.breadcrumbs.classes.join(', ')).each((_, el) => {
      const $breadcrumbs = $(el);
      const selector = this.generateSelector($breadcrumbs);

      if (!this.detected.has(selector) && this.looksLikeBreadcrumbs($breadcrumbs)) {
        this.addBreadcrumbsComponent($, $breadcrumbs, components, 85, 'structure');
      }
    });
  }

  private addBreadcrumbsComponent(
    $: CheerioAPI,
    $breadcrumbs: Cheerio<Element>,
    components: InteractiveComponent[],
    confidence: number,
    method: InteractiveComponent['detectionMethod']
  ): void {
    const selector = this.generateSelector($breadcrumbs);
    if (this.detected.has(selector)) return;

    // Extract breadcrumb items
    const items: BreadcrumbItem[] = [];
    $breadcrumbs.find('a, li, [class*="item"]').each((_, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      const href = $el.attr('href') || $el.find('a').attr('href');
      const isActive = $el.hasClass('active') || $el.attr('aria-current') === 'page';

      if (text) {
        items.push({ text, href, isActive });
      }
    });

    const framework = this.detectFramework($breadcrumbs, ['breadcrumb']);

    components.push({
      type: 'breadcrumbs',
      tag: $breadcrumbs[0].tagName.toLowerCase(),
      selector,
      classes: this.getClasses($breadcrumbs),
      confidence,
      detectionMethod: method,
      framework,
      properties: {
        isVisible: true,
        hasAnimation: false,
        levelCount: items.length,
        items
      }
    });

    this.detected.add(selector);
  }

  private looksLikeBreadcrumbs($el: Cheerio<Element>): boolean {
    // Breadcrumbs have links separated by separators (/, >, », ›)
    const text = $el.text();
    const hasSeparators = /[/>»›]/.test(text);
    const hasLinks = $el.find('a').length >= 2;
    return hasSeparators && hasLinks;
  }

  // ==========================================================================
  // SEARCH DETECTION
  // ==========================================================================

  private detectSearch($: CheerioAPI, components: InteractiveComponent[]): void {
    // ARIA search
    $(PATTERNS.search.aria.join(', ')).each((_, el) => {
      this.addSearchComponent($, $(el), components, 95, 'aria');
    });

    // Search input detection
    $(PATTERNS.search.input.join(', ')).each((_, el) => {
      const $input = $(el);
      const $container = $input.closest('form, div, [class*="search"]');
      const selector = this.generateSelector($container.length ? $container : $input);

      if (!this.detected.has(selector)) {
        this.addSearchComponent($, $container.length ? $container : $input, components, 90, 'attribute');
      }
    });

    // Class-based detection
    $(PATTERNS.search.classes.join(', ')).each((_, el) => {
      const $search = $(el);
      const selector = this.generateSelector($search);

      if (!this.detected.has(selector) && this.looksLikeSearch($search)) {
        this.addSearchComponent($, $search, components, 85, 'structure');
      }
    });
  }

  private addSearchComponent(
    $: CheerioAPI,
    $search: Cheerio<Element>,
    components: InteractiveComponent[],
    confidence: number,
    method: InteractiveComponent['detectionMethod']
  ): void {
    const selector = this.generateSelector($search);
    if (this.detected.has(selector)) return;

    const $input = $search.is('input') ? $search : $search.find('input[type="search"], input[type="text"]').first();
    const placeholder = $input.attr('placeholder') || '';
    const hasButton = $search.find('button, [type="submit"]').length > 0;

    components.push({
      type: 'search-bar',
      tag: $search[0].tagName.toLowerCase(),
      selector,
      classes: this.getClasses($search),
      confidence,
      detectionMethod: method,
      properties: {
        isVisible: true,
        hasAnimation: false,
        placeholder,
        hasButton
      }
    });

    this.detected.add(selector);
  }

  private looksLikeSearch($el: Cheerio<Element>): boolean {
    const hasSearchInput = $el.find('input[type="search"], input[placeholder*="search" i]').length > 0;
    const hasSearchText = /search/i.test($el.text());
    return hasSearchInput || hasSearchText;
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  private detectFramework($el: Cheerio<Element>, keywords: string[]): InteractiveComponent['framework'] {
    const classes = this.getClasses($el).join(' ');

    if (keywords.some(kw => classes.includes(`bs-${kw}`) || classes.includes(`btn-`))) {
      return 'bootstrap';
    }
    if ($el.attr('x-data') || $el.attr('x-show')) {
      return 'tailwind'; // Alpine.js (common with Tailwind)
    }
    if (classes.includes('mat-') || classes.includes('mdc-')) {
      return 'material-ui';
    }

    return 'custom';
  }

  private hasAnimationClass($el: Cheerio<Element>): boolean {
    const classes = this.getClasses($el).join(' ');
    return /fade|slide|transition|animate/.test(classes);
  }

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
