export class CSSMinifier {
  minify(css: string): { code: string; originalSize: number; minifiedSize: number } {
    const originalSize = css.length;
    let minified = css;

    minified = this.removeComments(minified);
    minified = this.removeWhitespace(minified);
    minified = this.optimizeColors(minified);
    minified = this.removeTrailingSemicolons(minified);
    minified = this.optimizeZeros(minified);
    minified = this.mergeDuplicateSelectors(minified);

    return {
      code: minified,
      originalSize,
      minifiedSize: minified.length,
    };
  }

  private removeComments(css: string): string {
    return css.replace(/\/\*[\s\S]*?\*\//g, '');
  }

  private removeWhitespace(css: string): string {
    return css
      .replace(/\s+/g, ' ')
      .replace(/\s*{\s*/g, '{')
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*:\s*/g, ':')
      .replace(/\s*;\s*/g, ';')
      .replace(/\s*,\s*/g, ',')
      .replace(/;\s*}/g, '}')
      .trim();
  }

  private optimizeColors(css: string): string {
    return css.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3');
  }

  private removeTrailingSemicolons(css: string): string {
    return css.replace(/;}/g, '}');
  }

  private optimizeZeros(css: string): string {
    return css
      .replace(/\b0(px|em|rem|%|vh|vw|cm|mm|in|pt|pc)/g, '0')
      .replace(/\b0\.(\d+)/g, '.$1')
      .replace(/:\s*0\s+0\s+0\s+0/g, ':0');
  }

  private mergeDuplicateSelectors(css: string): string {
    const selectorMap = new Map<string, string[]>();

    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    let match;

    while ((match = ruleRegex.exec(css)) !== null) {
      const selector = match[1].trim();
      const declarations = match[2].trim();

      if (!selectorMap.has(selector)) {
        selectorMap.set(selector, []);
      }
      selectorMap.get(selector)!.push(declarations);
    }

    let merged = '';
    for (const [selector, declarationsArray] of selectorMap) {
      const allDeclarations = declarationsArray.join(';');
      merged += `${selector}{${allDeclarations}}`;
    }

    return merged;
  }
}
