export interface ParsedShadow {
  offsetX: string;
  offsetY: string;
  blur: string;
  spread?: string;
  color: string;
  inset: boolean;
}

export interface VisualEffects {
  boxShadow?: ParsedShadow[];
  textShadow?: ParsedShadow | null;
  filter?: Record<string, string>;
  opacity?: number;
  mixBlendMode?: string;
  zIndex?: number;
}

export class VisualUtils {
  /**
   * Parse box-shadow string into components
   */
  static parseBoxShadow(shadow: string): ParsedShadow[] {
    if (!shadow || shadow === 'none') {
      return [];
    }

    const shadows: ParsedShadow[] = [];

    // Split multiple shadows
    const parts = shadow.split(/,(?![^(]*\))/);

    parts.forEach((part) => {
      const trimmed = part.trim();

      // Check for inset
      const inset = trimmed.startsWith('inset');
      const withoutInset = trimmed.replace('inset', '').trim();

      // Parse components
      const regex = /([-\d.]+px)\s+([-\d.]+px)\s+([-\d.]+px)(?:\s+([-\d.]+px))?\s+(.+)/;
      const match = withoutInset.match(regex);

      if (match) {
        shadows.push({
          offsetX: match[1],
          offsetY: match[2],
          blur: match[3],
          spread: match[4] || undefined,
          color: match[5],
          inset,
        });
      }
    });

    return shadows;
  }

  /**
   * Parse text-shadow (similar to box-shadow but no spread)
   */
  static parseTextShadow(shadow: string): ParsedShadow | null {
    if (!shadow || shadow === 'none') {
      return null;
    }

    const regex = /([-\d.]+px)\s+([-\d.]+px)\s+([-\d.]+px)\s+(.+)/;
    const match = shadow.match(regex);

    if (match) {
      return {
        offsetX: match[1],
        offsetY: match[2],
        blur: match[3],
        color: match[4],
        inset: false,
      };
    }

    return null;
  }

  /**
   * Parse filter property
   */
  static parseFilter(filter: string): Record<string, string> {
    if (!filter || filter === 'none') {
      return {};
    }

    const filters: Record<string, string> = {};

    // Match filter functions like blur(5px), brightness(1.2)
    const regex = /(\w+)\(([^)]+)\)/g;
    let match;

    while ((match = regex.exec(filter)) !== null) {
      filters[match[1]] = match[2];
    }

    return filters;
  }

  /**
   * Parse border-radius (all 4 corners)
   */
  static parseBorderRadius(radius: string): {
    topLeft: string;
    topRight: string;
    bottomRight: string;
    bottomLeft: string;
  } {
    if (!radius || radius === '0px') {
      return {
        topLeft: '0px',
        topRight: '0px',
        bottomRight: '0px',
        bottomLeft: '0px',
      };
    }

    const parts = radius.split(/\s+/);

    if (parts.length === 1) {
      // All corners same
      return {
        topLeft: parts[0],
        topRight: parts[0],
        bottomRight: parts[0],
        bottomLeft: parts[0],
      };
    } else if (parts.length === 2) {
      // Top-left/bottom-right, top-right/bottom-left
      return {
        topLeft: parts[0],
        topRight: parts[1],
        bottomRight: parts[0],
        bottomLeft: parts[1],
      };
    } else if (parts.length === 3) {
      // Top-left, top-right/bottom-left, bottom-right
      return {
        topLeft: parts[0],
        topRight: parts[1],
        bottomRight: parts[2],
        bottomLeft: parts[1],
      };
    } else {
      // All 4 corners specified
      return {
        topLeft: parts[0],
        topRight: parts[1],
        bottomRight: parts[2],
        bottomLeft: parts[3],
      };
    }
  }

  /**
   * Extract visual effects from element
   */
  static extractVisualEffects(element: Element): VisualEffects {
    const computed = window.getComputedStyle(element);

    return {
      boxShadow: this.parseBoxShadow(computed.boxShadow),
      textShadow: this.parseTextShadow(computed.textShadow),
      filter: this.parseFilter(computed.filter),
      opacity: parseFloat(computed.opacity),
      mixBlendMode: computed.mixBlendMode !== 'normal' ? computed.mixBlendMode : undefined,
      zIndex: computed.zIndex !== 'auto' ? parseInt(computed.zIndex) : undefined,
    };
  }
}
