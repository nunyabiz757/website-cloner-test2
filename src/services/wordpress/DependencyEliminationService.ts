import * as cheerio from 'cheerio';
import type { EliminationResult } from '../../types/wordpress-export.types';

export class DependencyEliminationService {
  private readonly PLUGIN_PATTERNS = {
    elementor: /elementor|data-elementor|elementor-element|elementor-widget/gi,
    woocommerce: /woocommerce|wc-|product_cat/gi,
    yoast: /yoast|wpseo|rank-math/gi,
    acf: /acf-|advanced-custom-fields/gi,
    wpbakery: /vc_|wpb_|js_composer/gi,
    contactForm7: /wpcf7|contact-form-7/gi,
  };

  private readonly SHORTCODE_PATTERN = /\[([^\]]+)\]/g;

  async eliminateFromHTML(
    html: string,
    options: {
      removeShortcodes?: boolean;
      convertToStatic?: boolean;
      removePluginClasses?: boolean;
      removePluginScripts?: boolean;
      removePluginStyles?: boolean;
      preserveLayout?: boolean;
    } = {}
  ): Promise<EliminationResult> {
    const originalSize = html.length;
    const removed: string[] = [];
    const converted: string[] = [];
    const warnings: string[] = [];

    let cleanedContent = html;
    const $ = cheerio.load(html);

    if (options.removeShortcodes !== false) {
      const shortcodes = html.match(this.SHORTCODE_PATTERN) || [];
      shortcodes.forEach(shortcode => {
        removed.push(`Shortcode: ${shortcode}`);
        cleanedContent = cleanedContent.replace(shortcode, '');
      });
    }

    if (options.removePluginClasses !== false) {
      $('[class]').each((_, element) => {
        const $el = $(element);
        const classes = $el.attr('class') || '';
        const classList = classes.split(' ');
        const cleanClasses = classList.filter(cls => {
          for (const [plugin, pattern] of Object.entries(this.PLUGIN_PATTERNS)) {
            if (pattern.test(cls)) {
              removed.push(`Class: ${cls} (${plugin})`);
              return false;
            }
          }
          return true;
        });

        if (cleanClasses.length !== classList.length) {
          if (cleanClasses.length > 0) {
            $el.attr('class', cleanClasses.join(' '));
          } else {
            $el.removeAttr('class');
          }
        }
      });
    }

    if (options.removePluginScripts !== false) {
      $('script').each((_, element) => {
        const $script = $(element);
        const src = $script.attr('src') || '';
        const content = $script.html() || '';

        for (const [plugin, pattern] of Object.entries(this.PLUGIN_PATTERNS)) {
          if (pattern.test(src) || pattern.test(content)) {
            removed.push(`Script: ${src || 'inline'} (${plugin})`);
            $script.remove();
            break;
          }
        }
      });
    }

    if (options.removePluginStyles !== false) {
      $('link[rel="stylesheet"]').each((_, element) => {
        const $link = $(element);
        const href = $link.attr('href') || '';

        for (const [plugin, pattern] of Object.entries(this.PLUGIN_PATTERNS)) {
          if (pattern.test(href)) {
            removed.push(`Stylesheet: ${href} (${plugin})`);
            $link.remove();
            break;
          }
        }
      });

      $('style').each((_, element) => {
        const $style = $(element);
        const content = $style.html() || '';

        for (const [plugin, pattern] of Object.entries(this.PLUGIN_PATTERNS)) {
          if (pattern.test(content)) {
            removed.push(`Inline style (${plugin})`);
            $style.remove();
            break;
          }
        }
      });
    }

    cleanedContent = $.html();
    const newSize = cleanedContent.length;

    return {
      success: true,
      removed,
      converted,
      warnings,
      originalSize,
      newSize,
      cleanedContent,
    };
  }

  async eliminateFromCSS(css: string): Promise<EliminationResult> {
    const originalSize = css.length;
    const removed: string[] = [];
    const warnings: string[] = [];

    let cleanedContent = css;

    for (const [plugin, pattern] of Object.entries(this.PLUGIN_PATTERNS)) {
      const lines = cleanedContent.split('\n');
      const cleanLines = lines.filter(line => {
        if (pattern.test(line)) {
          removed.push(`CSS rule (${plugin})`);
          return false;
        }
        return true;
      });
      cleanedContent = cleanLines.join('\n');
    }

    const newSize = cleanedContent.length;

    return {
      success: true,
      removed,
      converted: [],
      warnings,
      originalSize,
      newSize,
      cleanedContent,
    };
  }

  async eliminateFromJS(js: string): Promise<EliminationResult> {
    const originalSize = js.length;
    const removed: string[] = [];
    const warnings: string[] = [];

    let cleanedContent = js;

    for (const [plugin, pattern] of Object.entries(this.PLUGIN_PATTERNS)) {
      if (pattern.test(cleanedContent)) {
        warnings.push(`Plugin code detected in JS (${plugin}) - manual review recommended`);
      }
    }

    const newSize = cleanedContent.length;

    return {
      success: true,
      removed,
      converted: [],
      warnings,
      originalSize,
      newSize,
      cleanedContent,
    };
  }

  generateReport(results: { html?: EliminationResult }): string {
    const lines: string[] = [];

    lines.push('╔══════════════════════════════════════════════════════════════╗');
    lines.push('║         DEPENDENCY ELIMINATION REPORT                        ║');
    lines.push('╚══════════════════════════════════════════════════════════════╝');
    lines.push('');

    if (results.html) {
      lines.push('HTML Elimination:');
      lines.push(`  Original Size: ${this.formatBytes(results.html.originalSize)}`);
      lines.push(`  New Size: ${this.formatBytes(results.html.newSize)}`);
      lines.push(`  Reduced: ${this.formatBytes(results.html.originalSize - results.html.newSize)}`);
      lines.push(`  Items Removed: ${results.html.removed.length}`);
      lines.push('');

      if (results.html.removed.length > 0) {
        lines.push('Removed Items:');
        results.html.removed.slice(0, 10).forEach(item => {
          lines.push(`  - ${item}`);
        });
        if (results.html.removed.length > 10) {
          lines.push(`  ... and ${results.html.removed.length - 10} more`);
        }
        lines.push('');
      }

      if (results.html.warnings.length > 0) {
        lines.push('Warnings:');
        results.html.warnings.forEach(warning => {
          lines.push(`  ⚠️ ${warning}`);
        });
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}
