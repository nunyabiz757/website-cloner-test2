import * as cheerio from 'cheerio';
import type JSZip from 'jszip';
import type { WordPressExportOptions } from '../../../types/wordpress-export.types';

/**
 * Divi Builder
 * Converts HTML to Divi Builder shortcode format
 */
export class DiviBuilder {
  async generate(
    zip: JSZip,
    options: WordPressExportOptions,
    files: any
  ): Promise<void> {
    // Create export directory
    const diviFolder = zip.folder('divi-layout')!;
    const assetsFolder = diviFolder.folder('assets')!;
    const cssFolder = assetsFolder.folder('css')!;
    const jsFolder = assetsFolder.folder('js')!;

    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Convert HTML to Divi shortcodes
    // ═══════════════════════════════════════════════════════════════

    const diviShortcodes = this.convertToDivi(options.html);

    // Save shortcodes
    diviFolder.file('divi-layout.txt', diviShortcodes);
    files.templates = files.templates || [];
    files.templates.push('divi-layout.txt');

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Generate JSON export (for Divi Library)
    // ═══════════════════════════════════════════════════════════════

    const diviJSON = this.generateDiviJSON(diviShortcodes, options);
    diviFolder.file('divi-export.json', JSON.stringify(diviJSON, null, 2));
    files.templates.push('divi-export.json');

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: Add CSS files
    // ═══════════════════════════════════════════════════════════════

    for (let i = 0; i < options.css.length; i++) {
      cssFolder.file(`custom-${i}.css`, options.css[i]);
      files.css.push(`assets/css/custom-${i}.css`);
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 4: Add JavaScript files
    // ═══════════════════════════════════════════════════════════════

    for (let i = 0; i < options.js.length; i++) {
      jsFolder.file(`custom-${i}.js`, options.js[i]);
      files.js.push(`assets/js/custom-${i}.js`);
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 5: Generate import instructions
    // ═══════════════════════════════════════════════════════════════

    const instructions = this.generateInstructions();
    diviFolder.file('IMPORT_INSTRUCTIONS.md', instructions);

    // ═══════════════════════════════════════════════════════════════
    // STEP 6: Generate README
    // ═══════════════════════════════════════════════════════════════

    const readme = this.generateReadme();
    diviFolder.file('README.md', readme);
  }

  /**
   * Convert HTML to Divi Builder shortcodes
   */
  private convertToDivi(html: string): string {
    const $ = cheerio.load(html);
    const sections: string[] = [];

    // Process body children as sections
    $('body').children().each((_, element) => {
      const $el = $(element);
      const tagName = $el.prop('tagName')?.toLowerCase();

      // Skip non-visual elements
      if (['script', 'style', 'noscript'].includes(tagName)) {
        return;
      }

      const section = this.createSection($, $el);
      if (section) {
        sections.push(section);
      }
    });

    return sections.join('\n\n');
  }

  /**
   * Create Divi section
   */
  private createSection($: cheerio.CheerioAPI, $element: cheerio.Cheerio<cheerio.Element>): string {
    const bgColor = this.getBackgroundColor($element);
    const padding = this.getPadding($element);

    // Detect columns/rows
    const rows = this.detectRows($, $element);

    const sectionAttrs = [
      'fullwidth="off"',
      'specialty="off"',
      ...(bgColor ? [`background_color="${bgColor}"`] : []),
      ...(padding ? [`padding_top="${padding.top}px"`, `padding_bottom="${padding.bottom}px"`] : []),
    ].join(' ');

    return `[et_pb_section ${sectionAttrs}]
${rows.join('\n')}
[/et_pb_section]`;
  }

  /**
   * Detect rows within section
   */
  private detectRows($: cheerio.CheerioAPI, $section: cheerio.Cheerio<cheerio.Element>): string[] {
    const rows: string[] = [];

    // Check for existing row structure
    const rowElements = $section.find('[class*="row"]');

    if (rowElements.length > 0) {
      rowElements.each((_, row) => {
        const rowContent = this.createRow($, $(row));
        if (rowContent) {
          rows.push(rowContent);
        }
      });
    } else {
      // Create single row with all content
      const rowContent = this.createRow($, $section);
      if (rowContent) {
        rows.push(rowContent);
      }
    }

    return rows;
  }

  /**
   * Create Divi row
   */
  private createRow($: cheerio.CheerioAPI, $element: cheerio.Cheerio<cheerio.Element>): string {
    const columns = this.detectColumns($, $element);

    if (columns.length === 0) {
      return '';
    }

    return `[et_pb_row]
${columns.join('\n')}
[/et_pb_row]`;
  }

  /**
   * Detect columns within row
   */
  private detectColumns($: cheerio.CheerioAPI, $row: cheerio.Cheerio<cheerio.Element>): string[] {
    const columns: string[] = [];

    // Column selectors
    const columnSelectors = [
      '[class*="col-"]',
      '[class*="column"]',
      '.grid > *',
    ];

    let columnElements: cheerio.Cheerio<cheerio.Element>[] = [];

    for (const selector of columnSelectors) {
      const found = $row.find(selector);
      if (found.length > 0 && found.length <= 4) {
        found.each((_, el) => columnElements.push($(el)));
        break;
      }
    }

    // If no columns found, create single column
    if (columnElements.length === 0) {
      const column = this.createColumn($, $row);
      if (column) {
        columns.push(column);
      }
    } else {
      columnElements.forEach(($col) => {
        const column = this.createColumn($, $col);
        if (column) {
          columns.push(column);
        }
      });
    }

    return columns;
  }

  /**
   * Create Divi column
   */
  private createColumn($: cheerio.CheerioAPI, $element: cheerio.Cheerio<cheerio.Element>): string {
    const modules: string[] = [];

    // Process children as modules
    $element.children().each((_, child) => {
      const $child = $(child);
      const module = this.createModule($, $child);
      if (module) {
        modules.push(module);
      }
    });

    if (modules.length === 0) {
      return '';
    }

    return `[et_pb_column type="4_4"]
${modules.join('\n')}
[/et_pb_column]`;
  }

  /**
   * Create Divi module based on element type
   */
  private createModule($: cheerio.CheerioAPI, $element: cheerio.Cheerio<cheerio.Element>): string {
    const tagName = $element.prop('tagName')?.toLowerCase();
    const classes = $element.attr('class') || '';

    // Skip non-visual elements
    if (['script', 'style', 'noscript'].includes(tagName)) {
      return '';
    }

    // Text module (headings and paragraphs)
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].includes(tagName)) {
      return this.createTextModule($, $element);
    }

    // Image module
    if (tagName === 'img') {
      return this.createImageModule($, $element);
    }

    // Button module
    if (tagName === 'a' && (classes.includes('btn') || classes.includes('button')) || tagName === 'button') {
      return this.createButtonModule($, $element);
    }

    // Blurb module (icon + text)
    if (classes.includes('icon-box') || classes.includes('feature')) {
      return this.createBlurbModule($, $element);
    }

    // Testimonial module
    if (classes.includes('testimonial') || classes.includes('review')) {
      return this.createTestimonialModule($, $element);
    }

    // Video module
    if (tagName === 'video' || (tagName === 'iframe' && this.isVideoIframe($element))) {
      return this.createVideoModule($, $element);
    }

    // Divider module
    if (tagName === 'hr') {
      return this.createDividerModule();
    }

    // Default: Code module (raw HTML)
    return this.createCodeModule($, $element);
  }

  /**
   * Create text module
   */
  private createTextModule($: cheerio.CheerioAPI, $element: cheerio.Cheerio<cheerio.Element>): string {
    const content = $element.html() || '';
    const textAlign = this.getTextAlign($element);
    const textColor = this.getTextColor($element);

    const attrs = [
      `text_orientation="${textAlign}"`,
      ...(textColor ? [`text_color="${textColor}"`] : []),
    ].join(' ');

    return `[et_pb_text ${attrs}]
${content}
[/et_pb_text]`;
  }

  /**
   * Create image module
   */
  private createImageModule($: cheerio.CheerioAPI, $element: cheerio.Cheerio<cheerio.Element>): string {
    const src = $element.attr('src') || '';
    const alt = $element.attr('alt') || '';
    const url = $element.closest('a').attr('href') || '';
    const align = this.getAlign($element);

    const attrs = [
      `src="${src}"`,
      `alt="${alt}"`,
      `align="${align}"`,
      ...(url ? [`url="${url}"`] : []),
      'show_in_lightbox="off"',
    ].join(' ');

    return `[et_pb_image ${attrs} /]`;
  }

  /**
   * Create button module
   */
  private createButtonModule($: cheerio.CheerioAPI, $element: cheerio.Cheerio<cheerio.Element>): string {
    const text = $element.text().trim() || 'Click Here';
    const url = $element.attr('href') || '#';
    const align = this.getAlign($element);

    const attrs = [
      `button_text="${this.escapeAttr(text)}"`,
      `button_url="${url}"`,
      `button_alignment="${align}"`,
      'url_new_window="off"',
    ].join(' ');

    return `[et_pb_button ${attrs} /]`;
  }

  /**
   * Create blurb module (icon + text)
   */
  private createBlurbModule($: cheerio.CheerioAPI, $element: cheerio.Cheerio<cheerio.Element>): string {
    const icon = $element.find('i, .icon').first();
    const title = $element.find('h3, h4, .title').first();
    const content = $element.find('p, .description').first();

    const iconClass = icon.attr('class') || '';
    const iconCode = this.extractIconCode(iconClass);

    const attrs = [
      `title="${this.escapeAttr(title.text().trim())}"`,
      `url="#"`,
      `use_icon="on"`,
      `font_icon="${iconCode}"`,
      `icon_placement="top"`,
      `text_orientation="center"`,
    ].join(' ');

    return `[et_pb_blurb ${attrs}]
${content.html() || ''}
[/et_pb_blurb]`;
  }

  /**
   * Create testimonial module
   */
  private createTestimonialModule($: cheerio.CheerioAPI, $element: cheerio.Cheerio<cheerio.Element>): string {
    const author = $element.find('.name, .author').first().text().trim();
    const jobTitle = $element.find('.title, .position').first().text().trim();
    const content = $element.find('p, .content').first().html() || '';
    const image = $element.find('img').first();
    const portraitUrl = image.attr('src') || '';

    const attrs = [
      `author="${this.escapeAttr(author)}"`,
      `job_title="${this.escapeAttr(jobTitle)}"`,
      ...(portraitUrl ? [`portrait_url="${portraitUrl}"`] : []),
      'use_background_color="on"',
      'quote_icon="on"',
    ].join(' ');

    return `[et_pb_testimonial ${attrs}]
${content}
[/et_pb_testimonial]`;
  }

  /**
   * Create video module
   */
  private createVideoModule($: cheerio.CheerioAPI, $element: cheerio.Cheerio<cheerio.Element>): string {
    const tagName = $element.prop('tagName')?.toLowerCase();
    let src = '';

    if (tagName === 'video') {
      src = $element.attr('src') || $element.find('source').attr('src') || '';
    } else if (tagName === 'iframe') {
      src = $element.attr('src') || '';
    }

    const attrs = [
      `src="${src}"`,
      'play_icon_color="#ffffff"',
    ].join(' ');

    return `[et_pb_video ${attrs} /]`;
  }

  /**
   * Create divider module
   */
  private createDividerModule(): string {
    return `[et_pb_divider color="#dddddd" divider_style="solid" divider_position="top" divider_weight="1px" /]`;
  }

  /**
   * Create code module (fallback)
   */
  private createCodeModule($: cheerio.CheerioAPI, $element: cheerio.Cheerio<cheerio.Element>): string {
    const content = $.html($element) || '';

    return `[et_pb_code]
${this.escapeShortcodeContent(content)}
[/et_pb_code]`;
  }

  /**
   * Generate Divi JSON export format
   */
  private generateDiviJSON(shortcodes: string, options: WordPressExportOptions): any {
    return {
      version: '4.0',
      content: shortcodes,
      is_global: false,
      global_colors_info: {},
      post_title: options.themeName || 'Imported Layout',
      post_status: 'publish',
      post_type: 'et_pb_layout',
      post_date: new Date().toISOString(),
    };
  }

  /**
   * Check if iframe is video
   */
  private isVideoIframe($element: cheerio.Cheerio<cheerio.Element>): boolean {
    const src = $element.attr('src') || '';
    return src.includes('youtube') || src.includes('vimeo') || src.includes('video');
  }

  /**
   * Get background color
   */
  private getBackgroundColor($element: cheerio.Cheerio<cheerio.Element>): string {
    // Would need DOM access for computed styles
    return '';
  }

  /**
   * Get padding
   */
  private getPadding($element: cheerio.Cheerio<cheerio.Element>): { top: number; bottom: number } | null {
    // Would need DOM access for computed styles
    return null;
  }

  /**
   * Get text alignment
   */
  private getTextAlign($element: cheerio.Cheerio<cheerio.Element>): string {
    const classes = $element.attr('class') || '';
    if (classes.includes('text-center') || classes.includes('center')) return 'center';
    if (classes.includes('text-right') || classes.includes('right')) return 'right';
    return 'left';
  }

  /**
   * Get element alignment
   */
  private getAlign($element: cheerio.Cheerio<cheerio.Element>): string {
    return this.getTextAlign($element);
  }

  /**
   * Get text color
   */
  private getTextColor($element: cheerio.Cheerio<cheerio.Element>): string {
    return '';
  }

  /**
   * Extract icon code from Font Awesome classes
   */
  private extractIconCode(iconClass: string): string {
    const match = iconClass.match(/fa-([\w-]+)/);
    return match ? `&#x${this.fontAwesomeToUnicode(match[1])};` : '&#xf005;';
  }

  /**
   * Convert Font Awesome name to unicode (simplified)
   */
  private fontAwesomeToUnicode(name: string): string {
    const iconMap: Record<string, string> = {
      'star': 'f005',
      'heart': 'f004',
      'check': 'f00c',
      'times': 'f00d',
      'user': 'f007',
    };
    return iconMap[name] || 'f005';
  }

  /**
   * Escape attribute value
   */
  private escapeAttr(text: string): string {
    return text.replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  /**
   * Escape shortcode content
   */
  private escapeShortcodeContent(content: string): string {
    return content.replace(/\[/g, '&#91;').replace(/\]/g, '&#93;');
  }

  /**
   * Generate import instructions
   */
  private generateInstructions(): string {
    return `# Divi Builder Import Instructions

Follow these steps to import the layout into Divi:

## Prerequisites

1. Install and activate Divi theme
2. Ensure you have the latest version of Divi

## Method 1: Import via Divi Library (Recommended)

1. Log in to your WordPress admin panel
2. Go to **Divi > Divi Library**
3. Click **Import & Export** at the top
4. Click **Choose File** and select \`divi-export.json\`
5. Click **Import Divi Builder Layouts**
6. Wait for the import to complete

## Method 2: Manual Shortcode Import

1. Create a new page in WordPress
2. Click **"Use The Divi Builder"**
3. Click the **settings icon** (three dots)
4. Select **"Portability"**
5. In the Import tab, open \`divi-layout.txt\`
6. Copy ALL the shortcode content
7. Paste into the import text area
8. Click **Import Divi Builder Layout**

## Method 3: Direct Shortcode Paste

1. Create a new page
2. Switch to **Text editor** (not Visual)
3. Open \`divi-layout.txt\`
4. Copy and paste the entire content
5. Switch to **Visual editor** or **Divi Builder**
6. Publish the page

## Adding Custom Styles

If custom CSS is included:

1. Go to **Divi > Theme Options > Custom CSS**
2. Open each CSS file from \`assets/css/\`
3. Copy the CSS content
4. Paste into the Custom CSS box
5. Save changes

## Adding Custom Scripts

If custom JavaScript is included:

1. Go to **Divi > Theme Options > Integration**
2. Scroll to **"Add code to the < head > of your blog"**
3. Add script tags with your JS:
   \`\`\`html
   <script>
   // Your JS code here
   </script>
   \`\`\`
4. Save changes

## Troubleshooting

- **Layout doesn't import**: Make sure Divi is activated and updated
- **Modules missing**: Some modules may require Divi premium features
- **Styles don't match**: Add custom CSS from the assets folder
- **Shortcodes visible**: Make sure you're using Divi Builder, not Classic editor

## Support

For Divi support:
- https://www.elegantthemes.com/documentation/divi/
- https://www.elegantthemes.com/forum/
`;
  }

  /**
   * Generate README
   */
  private generateReadme(): string {
    return `# Divi Builder Layout Export

This export contains a Divi Builder layout converted from your cloned website.

## What's Included

- \`divi-layout.txt\` - Divi shortcodes ready to import
- \`divi-export.json\` - JSON file for Divi Library import
- \`assets/css/\` - Custom CSS files
- \`assets/js/\` - Custom JavaScript files
- \`IMPORT_INSTRUCTIONS.md\` - Detailed import guide

## Features

- ✅ Full Divi compatibility
- ✅ All major Divi modules:
  - Text
  - Images
  - Buttons
  - Blurbs (icon boxes)
  - Testimonials
  - Videos
  - Dividers
  - Code (raw HTML)
- ✅ Section/Row/Column structure
- ✅ Responsive design
- ✅ Easy to customize

## Requirements

- WordPress 5.0+
- Divi theme (by Elegant Themes)

## Quick Start

1. Read \`IMPORT_INSTRUCTIONS.md\`
2. Go to Divi > Divi Library
3. Import \`divi-export.json\`
4. Use the layout on any page

## Customization

All modules can be edited in Divi Builder:
- Click any module to edit
- Adjust colors, fonts, spacing
- Add/remove modules
- Rearrange layout
- Save to Divi Library for reuse

## Support

For Divi support:
- Official docs: https://www.elegantthemes.com/documentation/divi/
- Community: https://www.elegantthemes.com/forum/

---

**Generated by Website Cloner Pro**
`;
  }
}
