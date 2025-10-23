import * as cheerio from 'cheerio';
import type {
  VerificationReport,
  DependencyCheck,
  FileAnalysisResult,
} from '../../types/wordpress-export.types';

export class PluginFreeVerificationService {
  private readonly PLUGIN_SIGNATURES = {
    elementor: ['elementor', 'elementor-widget', 'data-elementor', 'elementor-element'],
    woocommerce: ['woocommerce', 'wc-', 'product_cat', 'wc_'],
    yoast: ['yoast', 'wpseo', 'rank-math'],
    acf: ['acf', 'advanced-custom-fields', 'get_field', 'the_field'],
    wpbakery: ['vc_', 'wpb_', 'js_composer'],
    contactForm7: ['wpcf7', 'contact-form-7'],
    jetpack: ['jetpack', 'jp-'],
    gravityforms: ['gform', 'gravity'],
  };

  private readonly WP_CORE_FUNCTIONS = [
    'wp_head', 'wp_footer', 'wp_body_open', 'get_header', 'get_footer',
    'wp_enqueue_style', 'wp_enqueue_script', 'bloginfo', 'get_template_directory_uri',
    'home_url', 'esc_url', 'esc_html', 'the_content', 'the_title', 'have_posts',
    'the_post', 'language_attributes', 'body_class', 'get_stylesheet_uri',
  ];

  async verifyPluginFree(
    exportPath: string,
    files: {
      php: string[];
      html: string[];
      css: string[];
      js: string[];
    },
    options: any = {}
  ): Promise<VerificationReport> {
    const dependencies: DependencyCheck[] = [];
    const fileAnalysis: VerificationReport['fileAnalysis'] = {
      php: [],
      html: [],
      css: [],
      js: [],
    };

    for (const phpFile of files.php) {
      const analysis = this.analyzePHPFile(phpFile);
      fileAnalysis.php.push(analysis);
      dependencies.push(...this.convertToChecks(analysis, 'PHP'));
    }

    for (const htmlFile of files.html) {
      const analysis = this.analyzeHTMLFile(htmlFile);
      fileAnalysis.html.push(analysis);
      dependencies.push(...this.convertToChecks(analysis, 'HTML'));
    }

    for (const cssFile of files.css) {
      const analysis = this.analyzeCSSFile(cssFile);
      fileAnalysis.css.push(analysis);
      dependencies.push(...this.convertToChecks(analysis, 'CSS'));
    }

    for (const jsFile of files.js) {
      const analysis = this.analyzeJSFile(jsFile);
      fileAnalysis.js.push(analysis);
      dependencies.push(...this.convertToChecks(analysis, 'JS'));
    }

    const critical = dependencies.filter((d) => d.severity === 'critical').length;
    const warnings = dependencies.filter((d) => d.severity === 'warning').length;
    const passed = dependencies.filter((d) => !d.detected).length;

    let score = 100;
    score -= critical * 20;
    score -= warnings * 5;
    score = Math.max(0, score);

    const isPluginFree = score >= 90 && critical === 0;

    return {
      isPluginFree,
      score,
      summary: {
        totalChecks: dependencies.length,
        passed,
        warnings,
        critical,
      },
      dependencies,
      fileAnalysis,
      recommendations: this.generateRecommendations(dependencies, isPluginFree),
      timestamp: new Date(),
    };
  }

  private analyzePHPFile(phpContent: string): FileAnalysisResult {
    const dependencies: string[] = [];
    const pluginReferences: string[] = [];

    const functionCalls = phpContent.match(/\b(\w+)\s*\(/g) || [];

    for (const call of functionCalls) {
      const funcName = call.replace('(', '').trim();

      for (const [plugin, signatures] of Object.entries(this.PLUGIN_SIGNATURES)) {
        for (const sig of signatures) {
          if (funcName.toLowerCase().includes(sig)) {
            pluginReferences.push(`${plugin}: ${funcName}`);
          }
        }
      }

      if (!this.WP_CORE_FUNCTIONS.includes(funcName) && !funcName.startsWith('custom_')) {
        dependencies.push(funcName);
      }
    }

    return {
      filePath: 'php-file',
      size: phpContent.length,
      dependencies,
      pluginReferences,
      isClean: pluginReferences.length === 0,
    };
  }

  private analyzeHTMLFile(htmlContent: string): FileAnalysisResult {
    const $ = cheerio.load(htmlContent);
    const pluginReferences: string[] = [];

    $('[class]').each((_, element) => {
      const classes = $(element).attr('class') || '';

      for (const [plugin, signatures] of Object.entries(this.PLUGIN_SIGNATURES)) {
        for (const sig of signatures) {
          if (classes.includes(sig)) {
            pluginReferences.push(`${plugin} class: ${sig}`);
          }
        }
      }
    });

    const shortcodes = htmlContent.match(/\[(\w+)[^\]]*\]/g) || [];
    pluginReferences.push(...shortcodes.map((s) => `shortcode: ${s}`));

    return {
      filePath: 'html-file',
      size: htmlContent.length,
      dependencies: [],
      pluginReferences,
      isClean: pluginReferences.length === 0,
    };
  }

  private analyzeCSSFile(cssContent: string): FileAnalysisResult {
    const pluginReferences: string[] = [];

    for (const [plugin, signatures] of Object.entries(this.PLUGIN_SIGNATURES)) {
      for (const sig of signatures) {
        const regex = new RegExp(`\\.${sig}|#${sig}|\\[${sig}`, 'gi');
        if (regex.test(cssContent)) {
          pluginReferences.push(`${plugin} CSS selector`);
        }
      }
    }

    return {
      filePath: 'css-file',
      size: cssContent.length,
      dependencies: [],
      pluginReferences,
      isClean: pluginReferences.length === 0,
    };
  }

  private analyzeJSFile(jsContent: string): FileAnalysisResult {
    const pluginReferences: string[] = [];

    for (const [plugin, signatures] of Object.entries(this.PLUGIN_SIGNATURES)) {
      for (const sig of signatures) {
        if (jsContent.includes(sig)) {
          pluginReferences.push(`${plugin} JS reference`);
        }
      }
    }

    return {
      filePath: 'js-file',
      size: jsContent.length,
      dependencies: [],
      pluginReferences,
      isClean: pluginReferences.length === 0,
    };
  }

  private convertToChecks(analysis: FileAnalysisResult, fileType: string): DependencyCheck[] {
    return analysis.pluginReferences.map((ref) => ({
      type: 'plugin' as const,
      name: ref,
      detected: true,
      location: `${fileType} file`,
      severity: 'critical' as const,
      description: `Plugin dependency detected: ${ref}`,
    }));
  }

  private generateRecommendations(dependencies: DependencyCheck[], isPluginFree: boolean): string[] {
    const recommendations: string[] = [];

    if (isPluginFree) {
      recommendations.push('✅ Export is 100% plugin-free');
      recommendations.push('✅ Ready for WordPress installation');
      recommendations.push('✅ No additional plugins required');
      recommendations.push('Can be installed on any WordPress site');
    } else {
      recommendations.push('⚠️ Plugin dependencies detected');
      recommendations.push('Run dependency elimination to remove plugin code');
      recommendations.push('Consider using plugin-free theme builder');

      const detectedPlugins = new Set<string>();
      dependencies.forEach(d => {
        const plugin = d.name.split(':')[0];
        detectedPlugins.add(plugin);
      });

      if (detectedPlugins.size > 0) {
        recommendations.push(`Detected plugins: ${Array.from(detectedPlugins).join(', ')}`);
      }
    }

    return recommendations;
  }

  generateTextReport(report: VerificationReport): string {
    const lines: string[] = [];

    lines.push('╔══════════════════════════════════════════════════════════════╗');
    lines.push('║         PLUGIN-FREE VERIFICATION REPORT                      ║');
    lines.push('╚══════════════════════════════════════════════════════════════╝');
    lines.push('');

    if (report.isPluginFree) {
      lines.push('✅ PLUGIN-FREE STATUS: VERIFIED');
    } else {
      lines.push('❌ PLUGIN-FREE STATUS: FAILED');
    }

    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('');
    lines.push(`Overall Score: ${report.score}/100`);
    lines.push('');
    lines.push('Summary:');
    lines.push(`  Total Checks:     ${report.summary.totalChecks}`);
    lines.push(`  Passed:           ${report.summary.passed}`);
    lines.push(`  Warnings:         ${report.summary.warnings}`);
    lines.push(`  Critical Issues:  ${report.summary.critical}`);
    lines.push('');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('');
    lines.push('Recommendations:');
    report.recommendations.forEach((rec) => {
      lines.push(`  ${rec}`);
    });
    lines.push('');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('');
    lines.push(`Generated: ${report.timestamp.toISOString()}`);

    return lines.join('\n');
  }
}
