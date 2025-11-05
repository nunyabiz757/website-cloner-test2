import type { WordPressBlock } from '../../../types/wordpress';
import type { PageData, ElementData } from '../../parsers/PlaywrightParserService';

export interface BuilderInput {
  type: 'native-blocks' | 'playwright-data';
  blocks?: WordPressBlock[];
  pageData?: PageData;
}

export interface BuilderOutput {
  format: 'json' | 'html' | 'shortcode';
  content: any;
  metadata?: {
    widgetCount: number;
    sectionCount: number;
    conversionMethod: 'native' | 'playwright';
    buildTime?: number;
  };
}

/**
 * Base Unified Builder
 *
 * All WordPress page builders extend this class to support:
 * 1. Native WordPress blocks (from REST API) - BEST method
 * 2. Playwright page data (from browser) - FALLBACK method
 *
 * This replaces all Cheerio-based parsing with intelligent conversion.
 */
export abstract class BaseUnifiedBuilder {
  /**
   * Main conversion entry point
   */
  async convert(input: BuilderInput): Promise<BuilderOutput> {
    const startTime = Date.now();

    console.log(`🔄 Converting using ${input.type} input...`);

    let result: BuilderOutput;

    if (input.type === 'native-blocks' && input.blocks) {
      result = await this.convertFromNativeBlocks(input.blocks);
    } else if (input.type === 'playwright-data' && input.pageData) {
      result = await this.convertFromPlaywrightData(input.pageData);
    } else {
      throw new Error('Invalid input type or missing data');
    }

    // Add build time to metadata
    if (result.metadata) {
      result.metadata.buildTime = Date.now() - startTime;
    }

    console.log(`✓ Conversion complete in ${result.metadata?.buildTime}ms`);
    console.log(`   Widgets: ${result.metadata?.widgetCount}, Sections: ${result.metadata?.sectionCount}`);

    return result;
  }

  /**
   * Convert from native WordPress blocks (BEST method)
   * Subclasses must implement this for perfect block-to-widget mapping
   */
  protected abstract convertFromNativeBlocks(
    blocks: WordPressBlock[]
  ): Promise<BuilderOutput>;

  /**
   * Convert from Playwright page data (FALLBACK method)
   * Subclasses must implement this for sites with blocked REST API
   */
  protected abstract convertFromPlaywrightData(
    pageData: PageData
  ): Promise<BuilderOutput>;

  // ==========================================
  // UTILITY METHODS (used by all builders)
  // ==========================================

  /**
   * Generate unique ID
   */
  protected generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Strip HTML tags from text
   */
  protected stripHTML(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  }

  /**
   * Extract image src from HTML
   */
  protected extractImageSrc(html: string): string | null {
    if (!html) return null;
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return match ? match[1] : null;
  }

  /**
   * Extract link href from HTML
   */
  protected extractLinkHref(html: string): string | null {
    if (!html) return null;
    const match = html.match(/<a[^>]+href=["']([^"']+)["']/i);
    return match ? match[1] : null;
  }

  /**
   * Parse padding/margin string to object
   * Example: "16px 8px" -> { top: 16, right: 8, bottom: 16, left: 8 }
   */
  protected parsePadding(padding: string): any {
    if (!padding || padding === '0px') {
      return { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' };
    }

    const parts = padding.split(' ').map((p) => parseInt(p) || 0);
    return {
      top: parts[0] || 0,
      right: parts[1] || parts[0] || 0,
      bottom: parts[2] || parts[0] || 0,
      left: parts[3] || parts[1] || parts[0] || 0,
      unit: 'px',
    };
  }

  /**
   * Extract background image URL from CSS
   * Example: "url('image.jpg')" -> "image.jpg"
   */
  protected extractBackgroundImage(backgroundImage: string): string | null {
    if (!backgroundImage || backgroundImage === 'none') return null;
    const match = backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
    return match ? match[1] : null;
  }

  /**
   * Get block full name (namespace:name)
   * Example: { namespace: 'core', name: 'heading' } -> "core:heading"
   */
  protected getBlockFullName(block: WordPressBlock): string {
    return `${block.namespace}:${block.name}`;
  }

  /**
   * Parse color string to hex
   * Handles rgb(), rgba(), hex, and named colors
   */
  protected parseColor(color: string): string {
    if (!color || color === 'transparent' || color === 'inherit') {
      return '';
    }

    // Already hex
    if (color.startsWith('#')) {
      return color.toUpperCase();
    }

    // RGB/RGBA to hex
    if (color.startsWith('rgb')) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
      }
    }

    return color;
  }

  /**
   * Extract text alignment from block attributes
   */
  protected getAlignment(block: WordPressBlock): string {
    return block.attributes?.align ||
           block.attributes?.textAlign ||
           'left';
  }

  /**
   * Check if element is visible
   */
  protected isElementVisible(element: ElementData): boolean {
    if (!element) return false;
    return element.isVisible &&
           element.position.width > 0 &&
           element.position.height > 0 &&
           element.styles.display !== 'none';
  }

  /**
   * Filter visible elements
   */
  protected filterVisibleElements(elements: ElementData[]): ElementData[] {
    return elements.filter(el => this.isElementVisible(el));
  }

  /**
   * Group elements by tag type
   */
  protected groupElementsByTag(elements: ElementData[]): Record<string, ElementData[]> {
    const grouped: Record<string, ElementData[]> = {};

    for (const element of elements) {
      if (!grouped[element.tag]) {
        grouped[element.tag] = [];
      }
      grouped[element.tag].push(element);
    }

    return grouped;
  }

  /**
   * Detect columns in elements (elements with similar y-position and different x)
   */
  protected detectColumns(elements: ElementData[]): ElementData[][] {
    if (elements.length === 0) return [];

    // Sort by y-position, then x-position
    const sorted = [...elements].sort((a, b) => {
      const yDiff = a.position.y - b.position.y;
      if (Math.abs(yDiff) < 50) { // Same row (within 50px)
        return a.position.x - b.position.x;
      }
      return yDiff;
    });

    // Group by rows (y-position)
    const rows: ElementData[][] = [];
    let currentRow: ElementData[] = [];
    let lastY = sorted[0]?.position.y || 0;

    for (const element of sorted) {
      if (Math.abs(element.position.y - lastY) < 50) {
        currentRow.push(element);
      } else {
        if (currentRow.length > 0) rows.push(currentRow);
        currentRow = [element];
        lastY = element.position.y;
      }
    }
    if (currentRow.length > 0) rows.push(currentRow);

    // Find the row with most columns
    const maxRow = rows.reduce((max, row) =>
      row.length > max.length ? row : max,
      []
    );

    // If max row has multiple elements, treat as columns
    if (maxRow.length > 1) {
      return maxRow.map(el => [el]);
    }

    return [[...elements]]; // Single column
  }

  /**
   * Escape HTML special characters
   */
  protected escapeHTML(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Clean CSS selector
   */
  protected cleanSelector(selector: string): string {
    if (!selector) return '';
    return selector
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  }
}
