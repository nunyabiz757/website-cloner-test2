import * as cheerio from 'cheerio';

export class UnusedCSSDetector {
  removeUnusedCSS(html: string, css: string): {
    optimizedCSS: string;
    removedRules: number;
    originalSize: number;
    optimizedSize: number;
  } {
    const $ = cheerio.load(html);
    const originalSize = css.length;

    const usedSelectors = this.extractUsedSelectors($);
    const cssRules = this.parseCSSRules(css);

    const usedRules = cssRules.filter(rule =>
      this.isRuleUsed(rule.selector, usedSelectors)
    );

    const optimizedCSS = usedRules.map(rule => rule.original).join('\n');

    return {
      optimizedCSS,
      removedRules: cssRules.length - usedRules.length,
      originalSize,
      optimizedSize: optimizedCSS.length,
    };
  }

  private extractUsedSelectors($: cheerio.CheerioAPI): {
    tags: Set<string>;
    classes: Set<string>;
    ids: Set<string>;
  } {
    const tags = new Set<string>();
    const classes = new Set<string>();
    const ids = new Set<string>();

    $('*').each((_, elem) => {
      tags.add(elem.tagName.toLowerCase());
    });

    $('[class]').each((_, elem) => {
      const classList = $(elem).attr('class')?.split(/\s+/) || [];
      classList.forEach(cls => {
        if (cls) classes.add(cls);
      });
    });

    $('[id]').each((_, elem) => {
      const id = $(elem).attr('id');
      if (id) ids.add(id);
    });

    return { tags, classes, ids };
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

  private isRuleUsed(
    selector: string,
    usedSelectors: {
      tags: Set<string>;
      classes: Set<string>;
      ids: Set<string>;
    }
  ): boolean {
    if (selector.startsWith('@')) {
      return true;
    }

    if (selector.includes(':')) {
      const baseSelector = selector.split(':')[0].trim();
      if (!baseSelector) return true;
      selector = baseSelector;
    }

    const parts = selector.split(/[\s>+~]/);

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('#')) {
        const id = trimmed.substring(1);
        if (usedSelectors.ids.has(id)) return true;
      }
      else if (trimmed.startsWith('.')) {
        const className = trimmed.substring(1);
        if (usedSelectors.classes.has(className)) return true;
      }
      else {
        const tag = trimmed.replace(/[.#[].*/, '');
        if (usedSelectors.tags.has(tag.toLowerCase())) return true;
      }
    }

    return false;
  }

  analyzeCSS(html: string, css: string): {
    totalRules: number;
    usedRules: number;
    unusedRules: number;
    usagePercentage: number;
    potentialSavings: number;
  } {
    const $ = cheerio.load(html);
    const usedSelectors = this.extractUsedSelectors($);
    const cssRules = this.parseCSSRules(css);

    const usedRules = cssRules.filter(rule =>
      this.isRuleUsed(rule.selector, usedSelectors)
    );

    const unusedRules = cssRules.length - usedRules.length;
    const usagePercentage = (usedRules.length / cssRules.length) * 100;

    const usedSize = usedRules.reduce((sum, rule) => sum + rule.original.length, 0);
    const totalSize = css.length;
    const potentialSavings = ((totalSize - usedSize) / totalSize) * 100;

    return {
      totalRules: cssRules.length,
      usedRules: usedRules.length,
      unusedRules,
      usagePercentage,
      potentialSavings,
    };
  }
}
