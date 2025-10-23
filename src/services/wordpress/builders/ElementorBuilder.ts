import * as cheerio from 'cheerio';
import type JSZip from 'jszip';
import type { WordPressExportOptions, ElementorElement } from '../../../types/wordpress-export.types';

/**
 * Elementor Builder
 * Converts HTML to Elementor JSON format with comprehensive widget support
 */
export class ElementorBuilder {
  async generate(
    zip: JSZip,
    options: WordPressExportOptions,
    files: any
  ): Promise<void> {
    // Create plugin directory
    const pluginFolder = zip.folder('elementor-custom-template')!;
    const templatesFolder = pluginFolder.folder('templates')!;
    const assetsFolder = pluginFolder.folder('assets')!;
    const cssFolder = assetsFolder.folder('css')!;
    const jsFolder = assetsFolder.folder('js')!;
    const includesFolder = pluginFolder.folder('includes')!;

    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Convert HTML to Elementor JSON
    // ═══════════════════════════════════════════════════════════════

    const elementorJSON = this.convertToElementor(options.html);

    // Save template JSON
    templatesFolder.file('template.json', JSON.stringify(elementorJSON, null, 2));
    files.templates = files.templates || [];
    files.templates.push('templates/template.json');

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Generate main plugin file
    // ═══════════════════════════════════════════════════════════════

    const pluginPHP = this.generatePluginPHP(options);
    pluginFolder.file('elementor-custom-template.php', pluginPHP);
    files.php.push('elementor-custom-template.php');

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: Generate template loader
    // ═══════════════════════════════════════════════════════════════

    const loaderPHP = this.generateLoaderPHP();
    includesFolder.file('template-loader.php', loaderPHP);
    files.php.push('includes/template-loader.php');

    // ═══════════════════════════════════════════════════════════════
    // STEP 4: Copy assets
    // ═══════════════════════════════════════════════════════════════

    for (let i = 0; i < options.css.length; i++) {
      cssFolder.file(`style-${i}.css`, options.css[i]);
      files.css.push(`assets/css/style-${i}.css`);
    }

    for (let i = 0; i < options.js.length; i++) {
      jsFolder.file(`script-${i}.js`, options.js[i]);
      files.js.push(`assets/js/script-${i}.js`);
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 5: Generate README
    // ═══════════════════════════════════════════════════════════════

    const readme = this.generateReadme();
    pluginFolder.file('README.md', readme);
  }

  /**
   * Convert HTML to Elementor JSON structure with full widget support
   */
  private convertToElementor(html: string): any {
    const $ = cheerio.load(html);
    const sections: ElementorElement[] = [];

    // Parse body children as sections
    $('body').children().each((_, element) => {
      const $el = $(element);
      const tagName = $el.prop('tagName')?.toLowerCase();

      // Skip script/style tags
      if (['script', 'style', 'noscript'].includes(tagName)) {
        return;
      }

      const section = this.parseSection($, $el);
      if (section) {
        sections.push(section);
      }
    });

    return {
      version: '3.0.0',
      title: 'Imported Template',
      type: 'page',
      content: sections,
    };
  }

  /**
   * Parse element as Elementor section
   */
  private parseSection(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): ElementorElement | null {
    const id = this.generateId();
    const classes = $element.attr('class') || '';

    // Detect columns within section
    const columns = this.detectColumns($, $element);

    if (columns.length === 0) {
      // No columns found, create default single column
      columns.push(this.createDefaultColumn($, $element));
    }

    // Extract section styles
    const settings: any = {
      layout: 'boxed',
      gap: 'default',
    };

    // Check for full-width
    if (classes.includes('full-width') || classes.includes('container-fluid')) {
      settings.content_width = 'full';
    }

    return {
      id,
      elType: 'section',
      settings,
      elements: columns,
    };
  }

  /**
   * Detect columns within section
   */
  private detectColumns(
    $: cheerio.CheerioAPI,
    $section: cheerio.Cheerio<cheerio.Element>
  ): ElementorElement[] {
    const columns: ElementorElement[] = [];

    // Column selectors
    const columnSelectors = [
      '[class*="col-"]',       // Bootstrap columns
      '[class*="column"]',     // Generic columns
      '.grid > *',             // CSS Grid
      '[class*="flex"] > *',   // Flexbox
    ];

    let columnElements: cheerio.Cheerio<cheerio.Element>[] = [];

    for (const selector of columnSelectors) {
      const found = $section.find(selector);
      if (found.length > 0 && found.length <= 6) {
        found.each((_, el) => columnElements.push($(el)));
        break;
      }
    }

    // If no columns found, treat direct children as potential columns
    if (columnElements.length === 0) {
      const directChildren = $section.children();
      if (directChildren.length > 1 && directChildren.length <= 6) {
        directChildren.each((_, el) => {
          const $el = $(el);
          const tag = $el.prop('tagName')?.toLowerCase();
          if (tag !== 'script' && tag !== 'style') {
            columnElements.push($el);
          }
        });
      }
    }

    // Calculate column size
    const columnSize = columnElements.length > 0
      ? Math.floor(100 / columnElements.length)
      : 100;

    // Create Elementor columns
    columnElements.forEach(($col) => {
      const column = this.createColumn($, $col, columnSize);
      columns.push(column);
    });

    return columns;
  }

  /**
   * Create Elementor column
   */
  private createColumn(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>,
    size: number = 100
  ): ElementorElement {
    const id = this.generateId();
    const widgets = this.detectWidgets($, $element);

    return {
      id,
      elType: 'column',
      settings: {
        _column_size: size,
      },
      elements: widgets,
    };
  }

  /**
   * Create default column (single column with all content)
   */
  private createDefaultColumn(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): ElementorElement {
    return this.createColumn($, $element, 100);
  }

  /**
   * Detect widgets within column
   */
  private detectWidgets(
    $: cheerio.CheerioAPI,
    $container: cheerio.Cheerio<cheerio.Element>
  ): ElementorElement[] {
    const widgets: ElementorElement[] = [];

    // Process all children
    $container.children().each((_, element) => {
      const $el = $(element);
      const widget = this.elementToWidget($, $el);
      if (widget) {
        widgets.push(widget);
      }
    });

    return widgets;
  }

  /**
   * Convert HTML element to Elementor widget
   */
  private elementToWidget(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): ElementorElement | null {
    const tagName = $element.prop('tagName')?.toLowerCase();
    const classes = $element.attr('class') || '';

    // Skip non-visual elements
    if (['script', 'style', 'noscript'].includes(tagName)) {
      return null;
    }

    // Heading widget
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      return this.createHeadingWidget($, $element);
    }

    // Paragraph/text widget
    if (tagName === 'p') {
      return this.createTextWidget($, $element);
    }

    // Image widget
    if (tagName === 'img') {
      return this.createImageWidget($, $element);
    }

    // Button widget
    if (tagName === 'button' || tagName === 'a' && (classes.includes('btn') || classes.includes('button'))) {
      return this.createButtonWidget($, $element);
    }

    // Icon box widget
    if (classes.includes('icon-box') || classes.includes('feature') || classes.includes('service')) {
      return this.createIconBoxWidget($, $element);
    }

    // Testimonial widget
    if (classes.includes('testimonial') || classes.includes('review')) {
      return this.createTestimonialWidget($, $element);
    }

    // Counter widget
    if (classes.includes('counter') || $element.attr('data-count')) {
      return this.createCounterWidget($, $element);
    }

    // Video widget
    if (tagName === 'video' || (tagName === 'iframe' && this.isVideoIframe($element))) {
      return this.createVideoWidget($, $element);
    }

    // List widget
    if (tagName === 'ul' || tagName === 'ol') {
      return this.createListWidget($, $element);
    }

    // Quote widget
    if (tagName === 'blockquote') {
      return this.createQuoteWidget($, $element);
    }

    // Divider widget
    if (tagName === 'hr') {
      return this.createDividerWidget($, $element);
    }

    // Spacer widget
    if (classes.includes('spacer') || classes.includes('spacing')) {
      return this.createSpacerWidget($, $element);
    }

    // Default: HTML widget (fallback)
    return this.createHTMLWidget($, $element);
  }

  /**
   * Create heading widget
   */
  private createHeadingWidget(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): ElementorElement {
    const tagName = $element.prop('tagName')?.toLowerCase() || 'h2';
    const text = $element.html() || '';
    const align = this.getTextAlign($element);
    const color = this.getTextColor($element);

    return {
      id: this.generateId(),
      elType: 'widget',
      widgetType: 'heading',
      settings: {
        title: text,
        header_size: tagName,
        align: align !== 'left' ? align : undefined,
        title_color: color !== '#000000' ? color : undefined,
      },
    };
  }

  /**
   * Create text editor widget
   */
  private createTextWidget(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): ElementorElement {
    return {
      id: this.generateId(),
      elType: 'widget',
      widgetType: 'text-editor',
      settings: {
        editor: $element.html() || '',
      },
    };
  }

  /**
   * Create image widget
   */
  private createImageWidget(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): ElementorElement {
    const src = $element.attr('src') || '';
    const alt = $element.attr('alt') || '';
    const width = $element.attr('width');
    const height = $element.attr('height');
    const link = $element.closest('a').attr('href');

    return {
      id: this.generateId(),
      elType: 'widget',
      widgetType: 'image',
      settings: {
        image: { url: src, alt },
        width: width ? { size: parseInt(width), unit: 'px' } : undefined,
        height: height ? { size: parseInt(height), unit: 'px' } : undefined,
        link: link ? { url: link } : undefined,
        align: this.getAlign($element),
      },
    };
  }

  /**
   * Create button widget
   */
  private createButtonWidget(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): ElementorElement {
    const text = $element.text().trim() || 'Button';
    const href = $element.attr('href') || '#';
    const classes = $element.attr('class') || '';

    // Detect button size
    let size = 'md';
    if (classes.includes('large') || classes.includes('lg')) size = 'lg';
    if (classes.includes('small') || classes.includes('sm')) size = 'sm';

    return {
      id: this.generateId(),
      elType: 'widget',
      widgetType: 'button',
      settings: {
        text,
        link: { url: href },
        align: this.getAlign($element),
        size,
      },
    };
  }

  /**
   * Create icon box widget
   */
  private createIconBoxWidget(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): ElementorElement {
    const icon = $element.find('i, svg, .icon').first();
    const title = $element.find('h3, h4, .title').first();
    const description = $element.find('p, .description').first();

    const iconClass = icon.attr('class') || '';
    const iconValue = iconClass.match(/fa-[\w-]+/)?.[0] || 'fa-star';

    return {
      id: this.generateId(),
      elType: 'widget',
      widgetType: 'icon-box',
      settings: {
        icon: { value: `fas ${iconValue}`, library: 'fa-solid' },
        title_text: title.text().trim() || '',
        description_text: description.text().trim() || '',
        position: 'top',
        title_color: this.getTextColor(title),
      },
    };
  }

  /**
   * Create testimonial widget
   */
  private createTestimonialWidget(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): ElementorElement {
    const content = $element.find('p, .content, .quote').first();
    const name = $element.find('.name, .author').first();
    const title = $element.find('.title, .position').first();
    const image = $element.find('img').first();

    return {
      id: this.generateId(),
      elType: 'widget',
      widgetType: 'testimonial',
      settings: {
        testimonial_content: content.text().trim() || '',
        testimonial_name: name.text().trim() || '',
        testimonial_job: title.text().trim() || '',
        testimonial_image: image.length ? { url: image.attr('src') } : undefined,
      },
    };
  }

  /**
   * Create counter widget
   */
  private createCounterWidget(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): ElementorElement {
    const count = $element.attr('data-count') || $element.text().match(/\d+/)?.[0] || '100';
    const title = $element.find('.title, .label').first();

    return {
      id: this.generateId(),
      elType: 'widget',
      widgetType: 'counter',
      settings: {
        ending_number: parseInt(count, 10),
        title: title.text().trim() || '',
        duration: 2000,
        thousand_separator: ',',
      },
    };
  }

  /**
   * Create video widget
   */
  private createVideoWidget(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): ElementorElement {
    const tagName = $element.prop('tagName')?.toLowerCase();
    let videoUrl = '';
    let videoType = 'hosted';

    if (tagName === 'video') {
      videoUrl = $element.attr('src') || $element.find('source').attr('src') || '';
    } else if (tagName === 'iframe') {
      videoUrl = $element.attr('src') || '';
      if (videoUrl.includes('youtube')) {
        videoType = 'youtube';
      } else if (videoUrl.includes('vimeo')) {
        videoType = 'vimeo';
      }
    }

    return {
      id: this.generateId(),
      elType: 'widget',
      widgetType: 'video',
      settings: {
        video_type: videoType,
        [videoType === 'youtube' ? 'youtube_url' : videoType === 'vimeo' ? 'vimeo_url' : 'hosted_url']: videoUrl,
      },
    };
  }

  /**
   * Create list widget
   */
  private createListWidget(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): ElementorElement {
    const items: any[] = [];

    $element.find('li').each((_, li) => {
      items.push({
        text: $(li).text().trim(),
        _id: this.generateId(),
      });
    });

    return {
      id: this.generateId(),
      elType: 'widget',
      widgetType: 'icon-list',
      settings: {
        icon_list: items,
        view: 'traditional',
      },
    };
  }

  /**
   * Create quote widget
   */
  private createQuoteWidget(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): ElementorElement {
    return {
      id: this.generateId(),
      elType: 'widget',
      widgetType: 'text-editor',
      settings: {
        editor: `<blockquote>${$element.html()}</blockquote>`,
      },
    };
  }

  /**
   * Create divider widget
   */
  private createDividerWidget(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): ElementorElement {
    return {
      id: this.generateId(),
      elType: 'widget',
      widgetType: 'divider',
      settings: {
        style: 'solid',
        weight: { size: 1 },
      },
    };
  }

  /**
   * Create spacer widget
   */
  private createSpacerWidget(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): ElementorElement {
    return {
      id: this.generateId(),
      elType: 'widget',
      widgetType: 'spacer',
      settings: {
        space: { size: 50 },
      },
    };
  }

  /**
   * Create HTML widget (fallback)
   */
  private createHTMLWidget(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): ElementorElement {
    return {
      id: this.generateId(),
      elType: 'widget',
      widgetType: 'html',
      settings: {
        html: $.html($element) || '',
      },
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
    // This would require DOM access for computed styles
    // For now, return default
    return '#000000';
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate main plugin PHP file
   */
  private generatePluginPHP(options: WordPressExportOptions): string {
    return `<?php
/**
 * Plugin Name: Elementor Custom Template
 * Description: Custom Elementor template from cloned website
 * Version: 1.0.0
 * Author: Website Cloner Pro
 * Requires Plugins: elementor
 */

if (!defined('ABSPATH')) exit;

class Elementor_Custom_Template {
    public function __construct() {
        add_action('elementor/init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));
    }

    public function init() {
        require_once plugin_dir_path(__FILE__) . 'includes/template-loader.php';
    }

    public function enqueue_assets() {
${options.css.map((_, i) => `        wp_enqueue_style('elementor-custom-css-${i}', plugin_dir_url(__FILE__) . 'assets/css/style-${i}.css', array(), '1.0.0');`).join('\n')}
${options.js.map((_, i) => `        wp_enqueue_script('elementor-custom-js-${i}', plugin_dir_url(__FILE__) . 'assets/js/script-${i}.js', array('jquery'), '1.0.0', true);`).join('\n')}
    }
}

new Elementor_Custom_Template();
?>`;
  }

  /**
   * Generate template loader PHP
   */
  private generateLoaderPHP(): string {
    return `<?php
if (!defined('ABSPATH')) exit;

function load_elementor_custom_template() {
    $template_file = plugin_dir_path(dirname(__FILE__)) . 'templates/template.json';
    if (file_exists($template_file)) {
        $template_data = json_decode(file_get_contents($template_file), true);
        return $template_data;
    }
    return null;
}

// Register template in Elementor library
add_action('elementor/init', function() {
    \\Elementor\\Plugin::instance()->templates_manager->register_source('\\My_Custom_Template_Source');
});
?>`;
  }

  /**
   * Generate README
   */
  private generateReadme(): string {
    return `# Elementor Custom Template Plugin

This plugin provides a custom Elementor template from a cloned website.

## Requirements

- WordPress 5.0+
- Elementor (Free or Pro)

## Installation

1. Install and activate Elementor plugin
2. Upload this plugin ZIP to /wp-content/plugins/
3. Activate in WordPress admin > Plugins
4. Template available in Elementor library

## Usage

1. Create a new page
2. Click "Edit with Elementor"
3. Click folder icon (Templates)
4. Find "Imported Template"
5. Click "Insert"

## Features

- Full Elementor compatibility
- Responsive design
- Custom styles included
- Easy to customize
- Supports all major widgets:
  - Headings
  - Text Editor
  - Images
  - Buttons
  - Icon Boxes
  - Testimonials
  - Counters
  - Videos
  - Lists
  - Dividers
  - HTML

## Support

For issues or questions, contact the plugin author.

---

**Generated by Website Cloner Pro**
`;
  }
}
