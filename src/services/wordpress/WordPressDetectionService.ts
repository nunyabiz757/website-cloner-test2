import { loggingService } from '../LoggingService';
import type { WordPressDetection } from '../../types/wordpress.types';

export class WordPressDetectionService {
  async detectWordPress(html: string, url: string): Promise<WordPressDetection> {
    loggingService.info('wp-detection', `Detecting WordPress for ${url}`);

    const detection: WordPressDetection = {
      isWordPress: false,
      version: 'unknown',
      pageBuilder: 'unknown',
      theme: 'unknown',
      plugins: [],
      confidence: 0,
    };

    // Check for WordPress indicators
    const indicators = {
      wpContent: html.includes('wp-content'),
      wpIncludes: html.includes('wp-includes'),
      wpJson: html.includes('wp-json'),
      generatorTag: html.match(/<meta[^>]*name="generator"[^>]*content="WordPress\s+([\d.]+)"/i),
      wpVersion: html.match(/ver=([\d.]+)/),
    };

    // Calculate confidence
    let confidencePoints = 0;
    if (indicators.wpContent) confidencePoints += 30;
    if (indicators.wpIncludes) confidencePoints += 30;
    if (indicators.wpJson) confidencePoints += 20;
    if (indicators.generatorTag) confidencePoints += 20;

    if (confidencePoints >= 50) {
      detection.isWordPress = true;
      detection.confidence = confidencePoints;

      // Extract version
      if (indicators.generatorTag) {
        detection.version = indicators.generatorTag[1];
      } else if (indicators.wpVersion) {
        detection.version = indicators.wpVersion[1];
      }

      // Detect page builder
      detection.pageBuilder = this.detectPageBuilder(html);

      // Detect theme
      detection.theme = this.detectTheme(html);

      // Detect plugins
      detection.plugins = this.detectPlugins(html);

      loggingService.success('wp-detection', `WordPress detected: ${detection.pageBuilder} builder, confidence: ${detection.confidence}%`);
    } else {
      loggingService.info('wp-detection', 'Not a WordPress site');
    }

    return detection;
  }

  private detectPageBuilder(html: string): WordPressDetection['pageBuilder'] {
    // Elementor
    if (html.includes('elementor') || html.includes('data-elementor-type') || html.includes('elementor-element')) {
      return 'elementor';
    }

    // Divi
    if (html.includes('et_pb_') || html.includes('et-db') || html.includes('Divi')) {
      return 'divi';
    }

    // Gutenberg (WordPress 5.0+)
    if (html.includes('wp-block-') || html.includes('<!-- wp:') || html.includes('has-text-align')) {
      return 'gutenberg';
    }

    // WPBakery (Visual Composer)
    if (html.includes('vc_') || html.includes('wpb_') || html.includes('vc_row')) {
      return 'wpbakery';
    }

    // Beaver Builder
    if (html.includes('fl-builder') || html.includes('fl-module') || html.includes('fl-node')) {
      return 'beaver';
    }

    // Vanilla WordPress (no builder)
    return 'vanilla';
  }

  private detectTheme(html: string): string {
    // Extract theme from stylesheet URL
    const themeMatch = html.match(/\/themes\/([^/]+)\//);
    if (themeMatch) {
      return themeMatch[1];
    }

    // Check for popular themes
    const popularThemes = ['Divi', 'Avada', 'Astra', 'OceanWP', 'GeneratePress', 'Hello', 'Kadence', 'Neve'];
    for (const theme of popularThemes) {
      if (html.toLowerCase().includes(theme.toLowerCase())) {
        return theme;
      }
    }

    return 'unknown';
  }

  private detectPlugins(html: string): string[] {
    const plugins: string[] = [];

    const pluginPatterns: Record<string, RegExp> = {
      'Yoast SEO': /yoast/i,
      'WooCommerce': /woocommerce/i,
      'Contact Form 7': /contact-form-7/i,
      'WPForms': /wpforms/i,
      'Gravity Forms': /gravity.*forms/i,
      'Slider Revolution': /revslider/i,
      'WPML': /wpml/i,
      'Jetpack': /jetpack/i,
      'Elementor Pro': /elementor-pro/i,
      'ACF': /acf-|advanced-custom-fields/i,
    };

    for (const [plugin, pattern] of Object.entries(pluginPatterns)) {
      if (pattern.test(html)) {
        plugins.push(plugin);
      }
    }

    return plugins;
  }
}

export const wordPressDetectionService = new WordPressDetectionService();
