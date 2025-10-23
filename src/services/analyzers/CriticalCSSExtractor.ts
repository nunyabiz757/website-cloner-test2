import * as cheerio from 'cheerio';

export class CriticalCSSExtractor {
  private readonly viewportHeight = 900;
  private readonly viewportWidth = 1300;

  extractCriticalCSS(html: string, css: string): {
    criticalCSS: string;
    nonCriticalCSS: string;
    criticalSelectors: string[];
    savings: number;
  } {
    const $ = cheerio.load(html);

    const criticalElements = this.identifyCriticalElements($);
    const criticalSelectors = this.extractCriticalSelectors(criticalElements);
    const cssRules = this.parseCSSRules(css);

    const criticalRules: string[] = [];
    const nonCriticalRules: string[] = [];

    cssRules.forEach(rule => {
      if (this.isRuleCritical(rule.selector, criticalSelectors)) {
        criticalRules.push(rule.original);
      } else {
        nonCriticalRules.push(rule.original);
      }
    });

    const criticalCSS = criticalRules.join('\n');
    const nonCriticalCSS = nonCriticalRules.join('\n');
    const savings = ((nonCriticalCSS.length / css.length) * 100);

    return {
      criticalCSS,
      nonCriticalCSS,
      criticalSelectors: Array.from(criticalSelectors),
      savings,
    };
  }

  private identifyCriticalElements($: cheerio.CheerioAPI): cheerio.Cheerio<cheerio.Element> {
    const criticalElements: cheerio.Element[] = [];

    $('header, nav').each((_, elem) => criticalElements.push(elem));

    $('main > section:first-child, main > div:first-child').each((_, elem) =>
      criticalElements.push(elem)
    );

    $('.hero, .banner, .jumbotron, [class*="hero"], [class*="banner"]').each((_, elem) =>
      criticalElements.push(elem)
    );

    $('h1, h2').slice(0, 3).each((_, elem) => criticalElements.push(elem));

    $('img').slice(0, 5).each((_, elem) => criticalElements.push(elem));

    return $(criticalElements);
  }

  private extractCriticalSelectors(elements: cheerio.Cheerio<cheerio.Element>): Set<string> {
    const selectors = new Set<string>();

    elements.each((_, elem) => {
      selectors.add(elem.tagName.toLowerCase());

      const classes = elem.attribs.class?.split(/\s+/) || [];
      classes.forEach(cls => {
        if (cls) selectors.add(`.${cls}`);
      });

      if (elem.attribs.id) {
        selectors.add(`#${elem.attribs.id}`);
      }

      const parent = elem.parent;
      if (parent && parent.type === 'tag') {
        const parentTag = parent.name;
        const childTag = elem.tagName.toLowerCase();
        selectors.add(`${parentTag} ${childTag}`);
      }
    });

    return selectors;
  }

  private parseCSSRules(css: string): Array<{
    selector: string;
    declarations: string;
    original: string;
  }> {
    const rules: Array<{
      selector: string;
      declarations: string;
      original: string;
    }> = [];

    css = css.replace(/\/\*[\s\S]*?\*\//g, '');

    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    let match;

    while ((match = ruleRegex.exec(css)) !== null) {
      const selector = match[1].trim();
      const declarations = match[2].trim();
      const original = match[0];

      rules.push({ selector, declarations, original });
    }

    return rules;
  }

  private isRuleCritical(selector: string, criticalSelectors: Set<string>): boolean {
    if (selector.startsWith('@')) {
      return true;
    }

    if (selector.includes(':root') || selector === 'html' || selector === 'body') {
      return true;
    }

    for (const criticalSelector of criticalSelectors) {
      if (selector.includes(criticalSelector)) {
        return true;
      }
    }

    return false;
  }
}
