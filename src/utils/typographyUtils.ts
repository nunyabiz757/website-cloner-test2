export interface FontFace {
  fontFamily: string;
  src: string[];
  fontWeight?: string;
  fontStyle?: string;
  fontDisplay?: string;
}

export interface TypographyScale {
  h1?: string;
  h2?: string;
  h3?: string;
  h4?: string;
  h5?: string;
  h6?: string;
  body?: string;
  small?: string;
}

export class TypographyUtils {
  /**
   * Normalize font weight (bold → 700, normal → 400)
   */
  static normalizeFontWeight(weight: string): string {
    const weightMap: Record<string, string> = {
      normal: '400',
      bold: '700',
      bolder: '900',
      lighter: '300',
    };

    // Already numeric
    if (/^\d+$/.test(weight)) {
      return weight;
    }

    return weightMap[weight.toLowerCase()] || weight;
  }

  /**
   * Parse @font-face rules from CSS
   */
  static parseFontFaces(cssText: string): FontFace[] {
    const fontFaces: FontFace[] = [];
    const regex = /@font-face\s*\{([^}]+)\}/g;

    let match;
    while ((match = regex.exec(cssText)) !== null) {
      const rules = match[1];

      // Extract font-family
      const familyMatch = rules.match(/font-family:\s*['"]?([^'";\n]+)['"]?/);
      const fontFamily = familyMatch ? familyMatch[1].trim() : '';

      // Extract src (multiple URLs)
      const srcMatches = rules.matchAll(/url\(['"]?([^'")\n]+)['"]?\)/g);
      const src = Array.from(srcMatches).map((m) => m[1]);

      // Extract font-weight
      const weightMatch = rules.match(/font-weight:\s*(\d+|normal|bold)/);
      const fontWeight = weightMatch ? this.normalizeFontWeight(weightMatch[1]) : undefined;

      // Extract font-style
      const styleMatch = rules.match(/font-style:\s*(normal|italic|oblique)/);
      const fontStyle = styleMatch ? styleMatch[1] : undefined;

      // Extract font-display
      const displayMatch = rules.match(/font-display:\s*(swap|block|fallback|optional)/);
      const fontDisplay = displayMatch ? displayMatch[1] : undefined;

      if (fontFamily && src.length > 0) {
        fontFaces.push({
          fontFamily,
          src,
          fontWeight,
          fontStyle,
          fontDisplay,
        });
      }
    }

    return fontFaces;
  }

  /**
   * Extract typography scale from page
   */
  static extractTypographyScale(document: Document): TypographyScale {
    const scale: TypographyScale = {};

    // Find heading elements
    (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).forEach((tag) => {
      const element = document.querySelector(tag);
      if (element) {
        const computed = window.getComputedStyle(element);
        scale[tag] = computed.fontSize;
      }
    });

    // Body text
    const body = document.querySelector('body');
    if (body) {
      const computed = window.getComputedStyle(body);
      scale.body = computed.fontSize;
    }

    // Small text
    const small = document.querySelector('small, .small, .text-sm');
    if (small) {
      const computed = window.getComputedStyle(small);
      scale.small = computed.fontSize;
    }

    return scale;
  }

  /**
   * Parse font stack into primary and fallbacks
   */
  static parseFontStack(fontFamily: string): {
    primary: string;
    fallbacks: string[];
  } {
    const fonts = fontFamily
      .split(',')
      .map((f) => f.trim().replace(/['"]/g, ''));

    return {
      primary: fonts[0] || '',
      fallbacks: fonts.slice(1),
    };
  }
}
