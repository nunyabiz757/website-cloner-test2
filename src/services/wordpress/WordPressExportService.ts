import JSZip from 'jszip';
import type {
  WordPressExportOptions,
  WordPressExportResult,
  PageBuilder,
} from '../../types/wordpress-export.types';

import { PluginFreeThemeBuilder } from './builders/PluginFreeThemeBuilder';
import { ElementorBuilder } from './builders/ElementorBuilder';
import { GutenbergBuilder } from './builders/GutenbergBuilder';
import {
  DiviBuilder,
  BeaverBuilderBuilder,
  BricksBuilder,
  OxygenBuilder,
  KadenceBuilder,
  BrizyBuilder,
  OptimizePressBuilder,
  CrocoblockBuilder,
} from './builders';

import { PluginFreeVerificationService } from './PluginFreeVerificationService';
import { DependencyEliminationService } from './DependencyEliminationService';
import { AssetEmbeddingService } from './AssetEmbeddingService';
import { PerformanceBudgetService } from './PerformanceBudgetService';

export class WordPressExportService {
  private builders: Map<PageBuilder, any>;
  private verificationService: PluginFreeVerificationService;
  private eliminationService: DependencyEliminationService;
  private embeddingService: AssetEmbeddingService;
  private budgetService: PerformanceBudgetService;

  constructor() {
    this.builders = new Map([
      ['plugin-free', new PluginFreeThemeBuilder()],
      ['elementor', new ElementorBuilder()],
      ['gutenberg', new GutenbergBuilder()],
      ['divi', new DiviBuilder()],
      ['beaver-builder', new BeaverBuilderBuilder()],
      ['bricks', new BricksBuilder()],
      ['oxygen', new OxygenBuilder()],
      ['kadence', new KadenceBuilder()],
      ['brizy', new BrizyBuilder()],
      ['optimizepress', new OptimizePressBuilder()],
      ['crocoblock', new CrocoblockBuilder()],
    ]);

    this.verificationService = new PluginFreeVerificationService();
    this.eliminationService = new DependencyEliminationService();
    this.embeddingService = new AssetEmbeddingService();
    this.budgetService = new PerformanceBudgetService();
  }

  async generateWordPressExport(
    options: WordPressExportOptions
  ): Promise<WordPressExportResult> {
    const exportId = `wp_export_${Date.now()}_${this.generateId()}`;

    let verificationReport: any;
    let eliminationResults: any;
    let embeddingResult: any;
    let budgetValidation: any;

    const files = {
      php: [] as string[],
      css: [] as string[],
      js: [] as string[],
      images: [] as string[],
      templates: [] as string[],
    };

    // Create ZIP archive for export
    const zip = new JSZip();

    // ═══════════════════════════════════════════════════════════════
    // STEP 1: PERFORMANCE BUDGET VALIDATION (Pre-flight check)
    // ═══════════════════════════════════════════════════════════════

    if (options.validateBudget) {
      console.log('⏳ Validating performance budget...');

      budgetValidation = await this.budgetService.validateBudget(
        options.html,
        options.css,
        options.js,
        options.images,
        options.customBudget
      );

      // Block export if budget exceeded (unless override)
      if (!budgetValidation.canExport && !options.budgetOverride) {
        const report = this.budgetService.generateReport(budgetValidation);

        // Add budget violation report to ZIP
        zip.file('BUDGET_VIOLATION_REPORT.txt', report);

        throw new Error(
          `Export blocked: ${budgetValidation.summary.totalViolations} budget violations. ` +
          `Set budgetOverride: true to proceed.`
        );
      }

      // Save budget report
      const budgetReport = this.budgetService.generateReport(budgetValidation);
      zip.file('BUDGET_VALIDATION_REPORT.txt', budgetReport);

      console.log('✅ Budget validation complete');
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: ASSET EMBEDDING (Optimize assets)
    // ═══════════════════════════════════════════════════════════════

    if (options.embedAssets && options.assets) {
      console.log('⏳ Processing asset embedding...');

      embeddingResult = await this.embeddingService.processAssets(
        options.html,
        options.assets,
        options.assetEmbeddingOptions || {}
      );

      // Use optimized HTML
      options.html = embeddingResult.html;

      // Save embedding report
      const embeddingReport = this.embeddingService.generateReport(embeddingResult);
      zip.file('ASSET_EMBEDDING_REPORT.txt', embeddingReport);

      console.log('✅ Asset embedding complete');
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: DEPENDENCY ELIMINATION (Remove plugin code)
    // ═══════════════════════════════════════════════════════════════

    if (options.eliminateDependencies) {
      console.log('⏳ Eliminating plugin dependencies...');

      // Eliminate from HTML
      const htmlResult = await this.eliminationService.eliminateFromHTML(
        options.html,
        {
          removeShortcodes: true,
          convertToStatic: true,
          removePluginClasses: true,
          removePluginScripts: true,
          removePluginStyles: true,
          preserveLayout: true,
        }
      );

      options.html = htmlResult.cleanedContent;
      eliminationResults = { html: htmlResult };

      // Eliminate from CSS
      for (let i = 0; i < options.css.length; i++) {
        const cssResult = await this.eliminationService.eliminateFromCSS(options.css[i]);
        options.css[i] = cssResult.cleanedContent;
      }

      // Eliminate from JS
      for (let i = 0; i < options.js.length; i++) {
        const jsResult = await this.eliminationService.eliminateFromJS(options.js[i]);
        options.js[i] = jsResult.cleanedContent;
      }

      // Save elimination report
      const eliminationReport = this.eliminationService.generateReport(eliminationResults);
      zip.file('ELIMINATION_REPORT.txt', eliminationReport);

      console.log('✅ Dependency elimination complete');
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 4: GENERATE BUILDER-SPECIFIC EXPORT
    // ═══════════════════════════════════════════════════════════════

    console.log(`⏳ Generating ${options.targetBuilder} export...`);

    const builder = this.builders.get(options.targetBuilder);
    if (!builder) {
      throw new Error(`Unsupported builder: ${options.targetBuilder}`);
    }

    // Builder generates content into the ZIP
    await builder.generate(zip, options, files);

    console.log('✅ Export generation complete');

    // ═══════════════════════════════════════════════════════════════
    // STEP 5: PLUGIN-FREE VERIFICATION
    // ═══════════════════════════════════════════════════════════════

    if (options.verifyPluginFree || options.pluginFree) {
      console.log('⏳ Verifying plugin-free status...');

      // Collect generated PHP content
      const phpFiles: string[] = [];
      zip.forEach((relativePath, file) => {
        if (relativePath.endsWith('.php') && !file.dir) {
          // We'll collect these after generation
          phpFiles.push(relativePath);
        }
      });

      const generatedFiles = {
        php: files.php,
        html: [options.html],
        css: options.css,
        js: options.js,
      };

      verificationReport = await this.verificationService.verifyPluginFree(
        '',
        generatedFiles,
        {
          strictMode: false,
          allowWordPressCore: true,
          allowThemeFunctions: true,
        }
      );

      // Save verification report
      const verificationText = this.verificationService.generateTextReport(
        verificationReport
      );
      zip.file('VERIFICATION_REPORT.txt', verificationText);

      console.log(
        verificationReport.isPluginFree
          ? '✅ Plugin-free verification PASSED'
          : '⚠️  Plugin-free verification FAILED'
      );
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 6: CREATE ZIP ARCHIVE
    // ═══════════════════════════════════════════════════════════════

    console.log('⏳ Creating ZIP archive...');

    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });

    // Create download URL
    const zipUrl = URL.createObjectURL(zipBlob);

    console.log('✅ ZIP archive created');

    // ═══════════════════════════════════════════════════════════════
    // STEP 7: GENERATE INSTALLATION INSTRUCTIONS
    // ═══════════════════════════════════════════════════════════════

    const instructions = this.generateInstructions(options.targetBuilder);

    // Calculate total size
    const totalSize = zipBlob.size;

    return {
      success: true,
      exportId,
      zipPath: zipUrl,
      zipBlob,
      files,
      instructions,
      verificationReport,
      eliminationResults,
      embeddingResult,
      budgetValidation,
      metadata: {
        builder: options.targetBuilder,
        createdAt: new Date().toISOString(),
        totalSize,
        fileCount: Object.values(files).flat().length,
      },
    };
  }

  private generateInstructions(builder: PageBuilder): string {
    const instructions: Record<PageBuilder, string> = {
      'plugin-free': `
INSTALLATION INSTRUCTIONS

1. Extract the ZIP file
2. Upload the theme folder to /wp-content/themes/
3. Activate in WordPress admin > Appearance > Themes
4. Done! No plugins needed.

This theme is 100% plugin-free and works on any WordPress site.
      `,
      'elementor': `
INSTALLATION INSTRUCTIONS

1. Install Elementor plugin (if not already installed)
2. Extract the ZIP file
3. Upload the plugin to /wp-content/plugins/
4. Activate in WordPress admin > Plugins
5. Template available in Elementor library
      `,
      'gutenberg': `
INSTALLATION INSTRUCTIONS

1. Create a new page in WordPress
2. Extract the ZIP file
3. Copy the block content from the export
4. Paste into Gutenberg editor
5. Publish immediately
      `,
      'divi': `
INSTALLATION INSTRUCTIONS

1. Install Divi theme (if not already installed)
2. Extract the ZIP file
3. Import template in Divi Library
4. Use template on any page
      `,
      'beaver-builder': `
INSTALLATION INSTRUCTIONS

1. Install Beaver Builder plugin
2. Extract the ZIP file
3. Import template in Beaver Builder
4. Apply to your pages
      `,
      'bricks': `
INSTALLATION INSTRUCTIONS

1. Install Bricks theme
2. Extract the ZIP file
3. Import template in Bricks
4. Use on any page
      `,
      'oxygen': `
INSTALLATION INSTRUCTIONS

1. Install Oxygen Builder plugin
2. Extract the ZIP file
3. Import template in Oxygen
4. Apply to pages
      `,
      'kadence': `
INSTALLATION INSTRUCTIONS

1. Install Kadence theme and blocks
2. Extract the ZIP file
3. Import blocks
4. Use in your pages
      `,
      'brizy': `
INSTALLATION INSTRUCTIONS

1. Install Brizy plugin
2. Extract the ZIP file
3. Import template
4. Use on pages
      `,
      'optimizepress': `
INSTALLATION INSTRUCTIONS

1. Install OptimizePress
2. Extract the ZIP file
3. Go to OptimizePress > Templates
4. Import template JSON
5. Apply to pages
      `,
      'crocoblock': `
INSTALLATION INSTRUCTIONS

1. Install JetEngine and required Crocoblock plugins
2. Extract the ZIP file
3. Go to JetEngine > Templates
4. Import template JSON
5. Use dynamic templates on your site
      `,
    };

    return instructions[builder] || instructions['plugin-free'];
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}
