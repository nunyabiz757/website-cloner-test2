export interface NavigationLink {
  text: string;
  href: string;
  hasDropdown: boolean;
  isActive: boolean;
  level: number;
}

export interface NavigationProperties {
  type: 'navigation-menu' | 'horizontal-nav' | 'vertical-nav' | 'dropdown-menu' | 'hamburger-menu';
  confidence: number;
  orientation?: 'horizontal' | 'vertical';
  hasDropdowns: boolean;
  hasHamburger: boolean;
  linkCount: number;
  levels: number;
  links: NavigationLink[];
  characteristics: string[];
}

export interface NavigationComponent {
  selector: string;
  element: string;
  properties: NavigationProperties;
  detectionMethod: 'semantic' | 'aria' | 'class' | 'structural' | 'contextual';
}

interface NavigationPattern {
  semantic: string[];
  aria: string[];
  classes: string[];
  dropdown: string[];
  hamburger: string[];
}

const NAVIGATION_PATTERNS: NavigationPattern = {
  semantic: ['nav'],
  aria: ['navigation', 'menubar', 'menu'],
  classes: [
    'nav', 'navbar', 'navigation', 'menu', 'main-nav', 'primary-nav',
    'site-nav', 'header-nav', 'top-nav', 'mobile-nav', 'sidebar-nav',
    'nav-menu', 'nav-list', 'menubar', 'main-menu', 'primary-menu'
  ],
  dropdown: [
    'dropdown', 'submenu', 'sub-menu', 'mega-menu', 'dropdown-menu',
    'nav-dropdown', 'has-dropdown', 'menu-item-has-children'
  ],
  hamburger: [
    'hamburger', 'burger', 'menu-toggle', 'nav-toggle', 'mobile-toggle',
    'menu-icon', 'nav-icon', 'toggle-menu', 'menu-button'
  ]
};

export class NavigationDetector {
  private detectedSelectors = new Set<string>();

  /**
   * Main detection method - returns all detected navigation components
   */
  detect(document: Document): NavigationComponent[] {
    const navComponents: NavigationComponent[] = [];
    this.detectedSelectors.clear();

    // Level 1: Semantic <nav> tags (95% confidence)
    const semanticNavs = this.detectSemanticNav(document);
    navComponents.push(...semanticNavs);

    // Level 2: ARIA role="navigation" (90% confidence)
    const ariaNavs = this.detectAriaNav(document);
    navComponents.push(...ariaNavs);

    // Level 3: Common CSS classes (85% confidence)
    const classNavs = this.detectClassBasedNav(document);
    navComponents.push(...classNavs);

    // Level 4: Structural patterns (70% confidence)
    const structuralNavs = this.detectStructuralNav(document);
    navComponents.push(...structuralNavs);

    // Level 5: Context-based heuristics (60% confidence)
    const contextNavs = this.detectContextualNav(document);
    navComponents.push(...contextNavs);

    return navComponents;
  }

  /**
   * Level 1: Detect semantic <nav> elements
   */
  private detectSemanticNav(document: Document): NavigationComponent[] {
    const components: NavigationComponent[] = [];
    const navElements = document.querySelectorAll('nav');

    navElements.forEach((nav, index) => {
      const selector = this.generateSelector(nav, 'nav', index);

      if (this.detectedSelectors.has(selector)) return;
      this.detectedSelectors.add(selector);

      const properties = this.analyzeNavigation(nav, 95);

      components.push({
        selector,
        element: nav.tagName.toLowerCase(),
        properties,
        detectionMethod: 'semantic'
      });
    });

    return components;
  }

  /**
   * Level 2: Detect ARIA role="navigation"
   */
  private detectAriaNav(document: Document): NavigationComponent[] {
    const components: NavigationComponent[] = [];
    const ariaElements = document.querySelectorAll('[role="navigation"], [role="menubar"], [role="menu"]');

    ariaElements.forEach((element, index) => {
      const selector = this.generateSelector(element, `[role="${element.getAttribute('role')}"]`, index);

      if (this.detectedSelectors.has(selector)) return;
      this.detectedSelectors.add(selector);

      const baseConfidence = element.getAttribute('role') === 'navigation' ? 90 : 85;
      const properties = this.analyzeNavigation(element, baseConfidence);

      components.push({
        selector,
        element: element.tagName.toLowerCase(),
        properties,
        detectionMethod: 'aria'
      });
    });

    return components;
  }

  /**
   * Level 3: Detect common CSS classes
   */
  private detectClassBasedNav(document: Document): NavigationComponent[] {
    const components: NavigationComponent[] = [];

    NAVIGATION_PATTERNS.classes.forEach((className) => {
      const elements = document.querySelectorAll(`.${className}`);

      elements.forEach((element, index) => {
        // Skip if already detected or doesn't contain links
        if (this.detectedSelectors.has(`.${className}`)) return;

        const linkCount = element.querySelectorAll('a').length;
        if (linkCount < 2) return; // Must have at least 2 links

        const selector = this.generateSelector(element, `.${className}`, index);
        this.detectedSelectors.add(selector);

        const properties = this.analyzeNavigation(element, 85);

        components.push({
          selector,
          element: element.tagName.toLowerCase(),
          properties,
          detectionMethod: 'class'
        });
      });
    });

    return components;
  }

  /**
   * Level 4: Detect structural patterns (header > ul > li > a)
   */
  private detectStructuralNav(document: Document): NavigationComponent[] {
    const components: NavigationComponent[] = [];

    // Look for common structural patterns
    const selectors = [
      'header ul li a',
      'header ol li a',
      '.header ul li a',
      '#header ul li a'
    ];

    selectors.forEach((selector) => {
      const links = document.querySelectorAll(selector);
      if (links.length < 3) return; // Must have at least 3 links

      // Get the parent ul/ol element
      const parentList = links[0]?.closest('ul, ol');
      if (!parentList) return;

      const listSelector = this.generateSelector(parentList, selector, 0);

      if (this.detectedSelectors.has(listSelector)) return;
      this.detectedSelectors.add(listSelector);

      const properties = this.analyzeNavigation(parentList, 70);

      components.push({
        selector: listSelector,
        element: parentList.tagName.toLowerCase(),
        properties,
        detectionMethod: 'structural'
      });
    });

    return components;
  }

  /**
   * Level 5: Context-based heuristics
   */
  private detectContextualNav(document: Document): NavigationComponent[] {
    const components: NavigationComponent[] = [];

    // Look for lists with multiple links in header/footer
    const contexts = document.querySelectorAll('header, footer, aside, .sidebar');

    contexts.forEach((context) => {
      const lists = context.querySelectorAll('ul, ol');

      lists.forEach((list, index) => {
        const links = list.querySelectorAll('a');
        if (links.length < 3) return;

        const selector = this.generateSelector(list, `${context.tagName.toLowerCase()} ul`, index);

        if (this.detectedSelectors.has(selector)) return;
        this.detectedSelectors.add(selector);

        const properties = this.analyzeNavigation(list, 60);

        components.push({
          selector,
          element: list.tagName.toLowerCase(),
          properties,
          detectionMethod: 'contextual'
        });
      });
    });

    return components;
  }

  /**
   * Analyze navigation element and determine its properties
   */
  private analyzeNavigation(element: Element, baseConfidence: number): NavigationProperties {
    const links = this.extractLinks(element);
    const characteristics: string[] = [];

    // Detect orientation
    const orientation = this.detectOrientation(element);
    if (orientation) characteristics.push(`${orientation} orientation`);

    // Detect dropdowns
    const hasDropdowns = this.hasDropdownMenus(element);
    if (hasDropdowns) characteristics.push('has dropdowns');

    // Detect hamburger
    const hasHamburger = this.hasHamburgerMenu(element);
    if (hasHamburger) characteristics.push('has hamburger menu');

    // Count nesting levels
    const levels = this.countNestingLevels(element);
    if (levels > 1) characteristics.push(`${levels} levels deep`);

    // Detect sticky/fixed
    const computed = window.getComputedStyle(element);
    if (computed.position === 'fixed' || computed.position === 'sticky') {
      characteristics.push('fixed/sticky positioning');
    }

    // Determine navigation type
    const type = this.determineNavigationType(element, orientation, hasDropdowns, hasHamburger);

    // Calculate final confidence
    let confidence = baseConfidence;
    if (links.length >= 5) confidence += 5;
    if (hasDropdowns) confidence += 3;
    if (orientation) confidence += 2;
    confidence = Math.min(100, confidence);

    return {
      type,
      confidence,
      orientation,
      hasDropdowns,
      hasHamburger,
      linkCount: links.length,
      levels,
      links,
      characteristics
    };
  }

  /**
   * Determine navigation type based on characteristics
   */
  private determineNavigationType(
    element: Element,
    orientation: 'horizontal' | 'vertical' | undefined,
    hasDropdowns: boolean,
    hasHamburger: boolean
  ): NavigationProperties['type'] {
    if (hasHamburger) return 'hamburger-menu';
    if (hasDropdowns) return 'dropdown-menu';
    if (orientation === 'horizontal') return 'horizontal-nav';
    if (orientation === 'vertical') return 'vertical-nav';
    return 'navigation-menu';
  }

  /**
   * Detect orientation (horizontal vs vertical)
   */
  private detectOrientation(element: Element): 'horizontal' | 'vertical' | undefined {
    const firstLevelItems = element.querySelectorAll(':scope > ul > li, :scope > ol > li, :scope > li');
    if (firstLevelItems.length === 0) return undefined;

    const computed = window.getComputedStyle(element);
    const flexDirection = computed.flexDirection;
    const display = computed.display;

    // Check flex direction
    if (flexDirection === 'row' || flexDirection === 'row-reverse') return 'horizontal';
    if (flexDirection === 'column' || flexDirection === 'column-reverse') return 'vertical';

    // Check display: flex with default row
    if (display === 'flex' || display === 'inline-flex') return 'horizontal';

    // Check list item display
    if (firstLevelItems.length >= 2) {
      const firstItem = firstLevelItems[0] as HTMLElement;
      const secondItem = firstLevelItems[1] as HTMLElement;
      const firstRect = firstItem.getBoundingClientRect();
      const secondRect = secondItem.getBoundingClientRect();

      // If items are side-by-side, it's horizontal
      if (Math.abs(firstRect.top - secondRect.top) < 10) return 'horizontal';
      // If items are stacked, it's vertical
      if (Math.abs(firstRect.left - secondRect.left) < 10) return 'vertical';
    }

    return undefined;
  }

  /**
   * Check if navigation has dropdown menus
   */
  private hasDropdownMenus(element: Element): boolean {
    // Check for dropdown classes
    const hasDropdownClass = NAVIGATION_PATTERNS.dropdown.some((className) =>
      element.querySelector(`.${className}`) !== null
    );
    if (hasDropdownClass) return true;

    // Check for nested lists (ul > li > ul)
    const nestedLists = element.querySelectorAll('ul ul, ol ul, ul ol, ol ol');
    if (nestedLists.length > 0) return true;

    // Check for aria-haspopup
    const hasPopup = element.querySelector('[aria-haspopup="true"]') !== null;
    if (hasPopup) return true;

    return false;
  }

  /**
   * Check if navigation has hamburger menu
   */
  private hasHamburgerMenu(element: Element): boolean {
    // Check parent element for hamburger patterns
    const parent = element.parentElement;
    if (!parent) return false;

    const hasHamburgerClass = NAVIGATION_PATTERNS.hamburger.some((className) =>
      parent.querySelector(`.${className}`) !== null ||
      element.querySelector(`.${className}`) !== null
    );

    return hasHamburgerClass;
  }

  /**
   * Count nesting levels of lists
   */
  private countNestingLevels(element: Element): number {
    let maxDepth = 0;

    const countDepth = (el: Element, depth: number) => {
      maxDepth = Math.max(maxDepth, depth);
      const childLists = el.querySelectorAll(':scope > li > ul, :scope > li > ol');
      childLists.forEach((child) => countDepth(child, depth + 1));
    };

    const topLists = element.querySelectorAll(':scope > ul, :scope > ol');
    topLists.forEach((list) => countDepth(list, 1));

    return maxDepth || 1;
  }

  /**
   * Extract all links with metadata
   */
  private extractLinks(element: Element): NavigationLink[] {
    const links: NavigationLink[] = [];
    const anchorElements = element.querySelectorAll('a');

    anchorElements.forEach((anchor) => {
      const href = anchor.getAttribute('href') || '#';
      const text = anchor.textContent?.trim() || '';

      // Check if link has dropdown
      const parent = anchor.parentElement;
      const hasDropdown = parent
        ? parent.querySelectorAll('ul, ol').length > 0 ||
          parent.classList.toString().match(/dropdown|submenu|has-children/) !== null
        : false;

      // Check if link is active
      const isActive = anchor.classList.contains('active') ||
                      anchor.classList.contains('current') ||
                      anchor.getAttribute('aria-current') === 'page';

      // Determine nesting level
      let level = 0;
      let currentParent = anchor.parentElement;
      while (currentParent && currentParent !== element) {
        if (currentParent.tagName === 'UL' || currentParent.tagName === 'OL') {
          level++;
        }
        currentParent = currentParent.parentElement;
      }

      links.push({
        text,
        href,
        hasDropdown,
        isActive,
        level: Math.max(1, level)
      });
    });

    return links;
  }

  /**
   * Generate unique selector for element
   */
  private generateSelector(element: Element, base: string, index: number): string {
    const id = element.id;
    if (id) return `#${id}`;

    const classes = Array.from(element.classList).filter(c => c.length > 0);
    if (classes.length > 0) {
      return `.${classes[0]}`;
    }

    return index === 0 ? base : `${base}:nth-of-type(${index + 1})`;
  }

  /**
   * Generate human-readable report
   */
  generateReport(components: NavigationComponent[]): string {
    let report = '# 🧭 NAVIGATION DETECTION REPORT\n\n';

    report += `## Summary\n`;
    report += `- Total Navigation Components: ${components.length}\n`;

    const byType = components.reduce((acc, c) => {
      acc[c.properties.type] = (acc[c.properties.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(byType).forEach(([type, count]) => {
      report += `- ${type}: ${count}\n`;
    });
    report += '\n';

    // List by detection method
    const byMethod = components.reduce((acc, c) => {
      acc[c.detectionMethod] = (acc[c.detectionMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    report += `## Detection Methods\n`;
    Object.entries(byMethod).forEach(([method, count]) => {
      report += `- ${method}: ${count}\n`;
    });
    report += '\n';

    // List all components
    report += `## Detected Components\n\n`;
    components.forEach((component, index) => {
      report += `### ${index + 1}. ${component.selector}\n`;
      report += `- **Type**: ${component.properties.type}\n`;
      report += `- **Confidence**: ${component.properties.confidence}%\n`;
      report += `- **Detection Method**: ${component.detectionMethod}\n`;
      report += `- **Link Count**: ${component.properties.linkCount}\n`;
      report += `- **Levels**: ${component.properties.levels}\n`;

      if (component.properties.orientation) {
        report += `- **Orientation**: ${component.properties.orientation}\n`;
      }

      if (component.properties.hasDropdowns) {
        report += `- **Has Dropdowns**: Yes\n`;
      }

      if (component.properties.hasHamburger) {
        report += `- **Has Hamburger**: Yes\n`;
      }

      if (component.properties.characteristics.length > 0) {
        report += `- **Characteristics**: ${component.properties.characteristics.join(', ')}\n`;
      }

      report += '\n';
    });

    return report;
  }
}
