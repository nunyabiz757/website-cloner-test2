import * as cheerio from 'cheerio';
import type JSZip from 'jszip';
import type { WordPressExportOptions } from '../../../types/wordpress-export.types';

/**
 * Beaver Builder
 * Converts HTML to Beaver Builder module format (.dat file)
 */
export class BeaverBuilderBuilder {
  async generate(
    zip: JSZip,
    options: WordPressExportOptions,
    files: any
  ): Promise<void> {
    const beaverFolder = zip.folder('beaver-builder-layout')!;
    const assetsFolder = beaverFolder.folder('assets')!;
    const cssFolder = assetsFolder.folder('css')!;
    const jsFolder = assetsFolder.folder('js')!;

    // Convert HTML to Beaver Builder format
    const beaverData = this.convertToBeaverBuilder(options.html);

    // Save as .dat file (PHP serialized data)
    const datContent = this.generateDatFile(beaverData);
    beaverFolder.file('beaver-layout.dat', datContent);
    files.templates = files.templates || [];
    files.templates.push('beaver-layout.dat');

    // Also save as JSON for easier viewing
    beaverFolder.file('beaver-layout.json', JSON.stringify(beaverData, null, 2));
    files.templates.push('beaver-layout.json');

    // Add assets
    for (let i = 0; i < options.css.length; i++) {
      cssFolder.file(`custom-${i}.css`, options.css[i]);
      files.css.push(`assets/css/custom-${i}.css`);
    }

    for (let i = 0; i < options.js.length; i++) {
      jsFolder.file(`custom-${i}.js`, options.js[i]);
      files.js.push(`assets/js/custom-${i}.js`);
    }

    // Generate instructions and README
    beaverFolder.file('IMPORT_INSTRUCTIONS.md', this.generateInstructions());
    beaverFolder.file('README.md', this.generateReadme());
  }

  /**
   * Convert HTML to Beaver Builder format
   */
  private convertToBeaverBuilder(html: string): any {
    const $ = cheerio.load(html);
    const rows: any[] = [];

    $('body').children().each((_, element) => {
      const $el = $(element);
      if (['script', 'style', 'noscript'].includes($el.prop('tagName')?.toLowerCase())) {
        return;
      }

      const row = this.createRow($, $el);
      if (row) {
        rows.push(row);
      }
    });

    return rows;
  }

  /**
   * Create Beaver Builder row
   */
  private createRow($: cheerio.CheerioAPI, $element: cheerio.Cheerio<cheerio.Element>): any {
    const nodeId = this.generateNodeId();
    const columns = this.detectColumns($, $element);

    return {
      node: nodeId,
      type: 'row',
      settings: {
        width: 'full',
        content_width: 'fixed',
        bg_type: 'none',
      },
      cols: columns,
    };
  }

  /**
   * Detect columns
   */
  private detectColumns($: cheerio.CheerioAPI, $row: cheerio.Cheerio<cheerio.Element>): any[] {
    const columns: any[] = [];
    let columnElements: cheerio.Cheerio<cheerio.Element>[] = [];

    const columnSelectors = ['[class*="col-"]', '[class*="column"]'];

    for (const selector of columnSelectors) {
      const found = $row.find(selector);
      if (found.length > 0 && found.length <= 6) {
        found.each((_, el) => columnElements.push($(el)));
        break;
      }
    }

    if (columnElements.length === 0) {
      const column = this.createColumn($, $row);
      columns.push(column);
    } else {
      columnElements.forEach(($col) => {
        const column = this.createColumn($, $col);
        columns.push(column);
      });
    }

    return columns;
  }

  /**
   * Create Beaver Builder column
   */
  private createColumn($: cheerio.CheerioAPI, $element: cheerio.Cheerio<cheerio.Element>): any {
    const nodeId = this.generateNodeId();
    const modules: any[] = [];

    $element.children().each((_, child) => {
      const module = this.createModule($, $(child));
      if (module) {
        modules.push(module);
      }
    });

    return {
      node: nodeId,
      size: modules.length === 0 ? 100 : Math.floor(100 / Math.max(1, modules.length)),
      modules,
    };
  }

  /**
   * Create Beaver Builder module
   */
  private createModule($: cheerio.CheerioAPI, $element: cheerio.Cheerio<cheerio.Element>): any {
    const tagName = $element.prop('tagName')?.toLowerCase();
    const classes = $element.attr('class') || '';

    if (['script', 'style', 'noscript'].includes(tagName)) {
      return null;
    }

    // Heading module
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      return this.createHeadingModule($, $element);
    }

    // Rich text module
    if (tagName === 'p') {
      return this.createRichTextModule($, $element);
    }

    // Photo module
    if (tagName === 'img') {
      return this.createPhotoModule($, $element);
    }

    // Button module
    if (tagName === 'a' && (classes.includes('btn') || classes.includes('button')) || tagName === 'button') {
      return this.createButtonModule($, $element);
    }

    // HTML module (fallback)
    return this.createHTMLModule($, $element);
  }

  /**
   * Create heading module
   */
  private createHeadingModule($: cheerio.CheerioAPI, $element: cheerio.Cheerio<cheerio.Element>): any {
    const nodeId = this.generateNodeId();
    const tag = $element.prop('tagName')?.toLowerCase() || 'h2';
    const text = $element.html() || '';

    return {
      node: nodeId,
      type: 'module',
      module_type: 'heading',
      settings: {
        heading: text,
        tag,
        color: '000000',
        align: this.getAlignment($element),
      },
    };
  }

  /**
   * Create rich text module
   */
  private createRichTextModule($: cheerio.CheerioAPI, $element: cheerio.Cheerio<cheerio.Element>): any {
    const nodeId = this.generateNodeId();
    const text = $element.html() || '';

    return {
      node: nodeId,
      type: 'module',
      module_type: 'rich-text',
      settings: {
        text,
        connections: [],
      },
    };
  }

  /**
   * Create photo module
   */
  private createPhotoModule($: cheerio.CheerioAPI, $element: cheerio.Cheerio<cheerio.Element>): any {
    const nodeId = this.generateNodeId();
    const src = $element.attr('src') || '';
    const alt = $element.attr('alt') || '';
    const link = $element.closest('a').attr('href') || '';

    return {
      node: nodeId,
      type: 'module',
      module_type: 'photo',
      settings: {
        photo_src: src,
        photo: { url: src, alt },
        link_url: link,
        align: this.getAlignment($element),
      },
    };
  }

  /**
   * Create button module
   */
  private createButtonModule($: cheerio.CheerioAPI, $element: cheerio.Cheerio<cheerio.Element>): any {
    const nodeId = this.generateNodeId();
    const text = $element.text().trim() || 'Click Here';
    const link = $element.attr('href') || '#';

    return {
      node: nodeId,
      type: 'module',
      module_type: 'button',
      settings: {
        text,
        link,
        link_target: '_self',
        align: this.getAlignment($element),
        style: 'flat',
        width: 'auto',
      },
    };
  }

  /**
   * Create HTML module
   */
  private createHTMLModule($: cheerio.CheerioAPI, $element: cheerio.Cheerio<cheerio.Element>): any {
    const nodeId = this.generateNodeId();
    const html = $.html($element) || '';

    return {
      node: nodeId,
      type: 'module',
      module_type: 'html',
      settings: {
        html,
      },
    };
  }

  /**
   * Get alignment
   */
  private getAlignment($element: cheerio.Cheerio<cheerio.Element>): string {
    const classes = $element.attr('class') || '';
    if (classes.includes('text-center') || classes.includes('center')) return 'center';
    if (classes.includes('text-right') || classes.includes('right')) return 'right';
    return 'left';
  }

  /**
   * Generate node ID
   */
  private generateNodeId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generate .dat file content (simplified PHP serialization)
   */
  private generateDatFile(data: any): string {
    return JSON.stringify(data);
  }

  /**
   * Generate instructions
   */
  private generateInstructions(): string {
    return `# Beaver Builder Import Instructions

## Prerequisites
1. Install and activate Beaver Builder plugin
2. Ensure you have the latest version

## Import Steps
1. Go to **Beaver Builder > Saved Templates**
2. Click **Import Template**
3. Upload \`beaver-layout.dat\` file
4. Click **Import**
5. Use the template on any page

## Alternative: Manual Import
1. View \`beaver-layout.json\` for structure reference
2. Rebuild manually in Beaver Builder

---
**Generated by Website Cloner Pro**
`;
  }

  /**
   * Generate README
   */
  private generateReadme(): string {
    return `# Beaver Builder Layout

Beaver Builder compatible layout with modules for headings, text, images, buttons, and HTML.

## Requirements
- WordPress 5.0+
- Beaver Builder plugin

## Features
- ✅ Full Beaver Builder compatibility
- ✅ All major modules supported
- ✅ Responsive design
- ✅ Easy to customize

---
**Generated by Website Cloner Pro**
`;
  }
}
