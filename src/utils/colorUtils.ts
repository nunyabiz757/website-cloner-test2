export interface RGBColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface ColorPalette {
  primary: string[];
  backgrounds: string[];
  text: string[];
  borders: string[];
  all: Set<string>;
}

export class ColorUtils {
  /**
   * Convert RGB/RGBA to HEX
   */
  static rgbToHex(rgb: string): string {
    // Handle rgb(255, 87, 51) or rgba(255, 87, 51, 0.5)
    const rgbMatch = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);

    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);

      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
      return hex;
    }

    return rgb; // Return original if not RGB
  }

  /**
   * Extract opacity from RGBA
   */
  static extractOpacity(rgba: string): number {
    const match = rgba.match(/rgba?\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/);
    return match ? parseFloat(match[1]) : 1;
  }

  /**
   * Normalize any color format to HEX
   */
  static normalizeColor(color: string): string {
    if (!color || color === 'transparent' || color === 'inherit') {
      return color;
    }

    // Already HEX
    if (color.startsWith('#')) {
      return color.toUpperCase();
    }

    // RGB/RGBA
    if (color.startsWith('rgb')) {
      return this.rgbToHex(color);
    }

    // Named colors
    const namedColors: Record<string, string> = {
      red: '#FF0000',
      blue: '#0000FF',
      green: '#008000',
      white: '#FFFFFF',
      black: '#000000',
      yellow: '#FFFF00',
      orange: '#FFA500',
      purple: '#800080',
      pink: '#FFC0CB',
      gray: '#808080',
      grey: '#808080',
      brown: '#A52A2A',
      cyan: '#00FFFF',
      magenta: '#FF00FF',
      // Add more as needed
    };

    if (namedColors[color.toLowerCase()]) {
      return namedColors[color.toLowerCase()];
    }

    return color; // Return original if can't normalize
  }

  /**
   * Extract color palette from elements
   */
  static extractPalette(elements: Element[]): ColorPalette {
    const palette: ColorPalette = {
      primary: [],
      backgrounds: [],
      text: [],
      borders: [],
      all: new Set<string>(),
    };

    elements.forEach((el) => {
      const computed = window.getComputedStyle(el);

      // Background colors
      const bgColor = this.normalizeColor(computed.backgroundColor);
      if (bgColor && bgColor !== 'transparent') {
        palette.backgrounds.push(bgColor);
        palette.all.add(bgColor);
      }

      // Text colors
      const textColor = this.normalizeColor(computed.color);
      if (textColor) {
        palette.text.push(textColor);
        palette.all.add(textColor);
      }

      // Border colors
      const borderColor = this.normalizeColor(computed.borderColor);
      if (borderColor && borderColor !== 'transparent') {
        palette.borders.push(borderColor);
        palette.all.add(borderColor);
      }
    });

    // Identify primary colors (most used)
    const colorCounts = new Map<string, number>();
    [...palette.backgrounds, ...palette.text].forEach((color) => {
      colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
    });

    // Sort by frequency
    const sorted = Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([color]) => color);

    palette.primary = sorted.slice(0, 5); // Top 5 colors

    return palette;
  }

  /**
   * Parse gradient string
   */
  static parseGradient(gradient: string): {
    type: 'linear' | 'radial';
    colors: string[];
    angle?: string;
  } | null {
    if (!gradient || !gradient.includes('gradient')) {
      return null;
    }

    const isLinear = gradient.includes('linear-gradient');
    const isRadial = gradient.includes('radial-gradient');

    if (!isLinear && !isRadial) return null;

    // Extract colors
    const colorRegex = /#[0-9A-Fa-f]{3,6}|rgba?\([^)]+\)/g;
    const colors = gradient.match(colorRegex)?.map((c) => this.normalizeColor(c)) || [];

    // Extract angle (for linear)
    let angle = undefined;
    if (isLinear) {
      const angleMatch = gradient.match(/(\d+deg|to\s+\w+)/);
      angle = angleMatch ? angleMatch[1] : undefined;
    }

    return {
      type: isLinear ? 'linear' : 'radial',
      colors,
      angle,
    };
  }
}
