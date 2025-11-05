import type { WordPressBlock } from '../../types/wordpress';
import type { PageData } from '../parsers/PlaywrightParserService';
import type { BuilderInput, BuilderOutput } from './builders/BaseUnifiedBuilder';

// Import all unified builders
import { unifiedElementorBuilder } from './builders/UnifiedElementorBuilder';
import { unifiedGutenbergBuilder } from './builders/UnifiedGutenbergBuilder';
import { unifiedDiviBuilder } from './builders/UnifiedDiviBuilder';
import { unifiedBeaverBuilderBuilder } from './builders/UnifiedBeaverBuilderBuilder';
import { unifiedBricksBuilder } from './builders/UnifiedBricksBuilder';
import { unifiedOxygenBuilder } from './builders/UnifiedOxygenBuilder';
import { unifiedKadenceBuilder } from './builders/UnifiedKadenceBuilder';
import { unifiedBrizyBuilder } from './builders/UnifiedBrizyBuilder';
import { unifiedPluginFreeThemeBuilder } from './builders/UnifiedPluginFreeThemeBuilder';
import { unifiedOptimizePressBuilder } from './builders/UnifiedOptimizePressBuilder';
import { unifiedCrocoblockBuilder } from './builders/UnifiedCrocoblockBuilder';

export type BuilderName =
  | 'elementor'
  | 'gutenberg'
  | 'divi'
  | 'beaver-builder'
  | 'beaverbuilder'
  | 'bricks'
  | 'oxygen'
  | 'kadence'
  | 'brizy'
  | 'plugin-free'
  | 'pluginfree'
  | 'optimizepress'
  | 'crocoblock'
  | 'jetengine';

export interface ExportOptions {
  builderName: BuilderName;
  nativeBlocks?: WordPressBlock[];
  playwrightData?: PageData;
}

export interface ExportResult extends BuilderOutput {
  builder: BuilderName;
  success: boolean;
  error?: string;
}

/**
 * Unified Export Service
 *
 * Single entry point for all 11 WordPress page builders.
 * Automatically selects the correct builder and converts content.
 *
 * Usage:
 * ```typescript
 * // From native blocks (BEST)
 * const result = await unifiedExportService.export({
 *   builderName: 'elementor',
 *   nativeBlocks: blocks
 * });
 *
 * // From Playwright data (FALLBACK)
 * const result = await unifiedExportService.export({
 *   builderName: 'elementor',
 *   playwrightData: pageData
 * });
 * ```
 */
export class UnifiedExportService {
  /**
   * Export content to specified page builder format
   */
  async export(options: ExportOptions): Promise<ExportResult> {
    console.log(`📦 Exporting to ${options.builderName} format...`);

    try {
      // Validate input
      if (!options.nativeBlocks && !options.playwrightData) {
        throw new Error('Either nativeBlocks or playwrightData must be provided');
      }

      // Get the appropriate builder
      const builder = this.getBuilder(options.builderName);
      if (!builder) {
        throw new Error(`Unknown builder: ${options.builderName}`);
      }

      // Prepare builder input
      const builderInput: BuilderInput = options.nativeBlocks
        ? {
            type: 'native-blocks',
            blocks: options.nativeBlocks,
          }
        : {
            type: 'playwright-data',
            pageData: options.playwrightData!,
          };

      // Convert using the builder
      const result = await builder.convert(builderInput);

      console.log(`✓ Export complete: ${result.metadata?.widgetCount || 0} widgets`);

      return {
        ...result,
        builder: options.builderName,
        success: true,
      };
    } catch (error) {
      console.error(`❌ Export failed:`, error);

      return {
        format: 'html',
        content: '',
        builder: options.builderName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Export to multiple builders at once (useful for comparison)
   */
  async exportToMultiple(
    builders: BuilderName[],
    input: { nativeBlocks?: WordPressBlock[]; playwrightData?: PageData }
  ): Promise<Record<BuilderName, ExportResult>> {
    console.log(`📦 Exporting to ${builders.length} builders...`);

    const results: Record<string, ExportResult> = {};

    for (const builderName of builders) {
      results[builderName] = await this.export({
        builderName,
        ...input,
      });
    }

    console.log(`✓ Exported to ${builders.length} builders`);
    return results;
  }

  /**
   * Get list of all available builders
   */
  getAvailableBuilders(): BuilderName[] {
    return [
      'elementor',
      'gutenberg',
      'divi',
      'beaver-builder',
      'bricks',
      'oxygen',
      'kadence',
      'brizy',
      'plugin-free',
      'optimizepress',
      'crocoblock',
    ];
  }

  /**
   * Get builder information
   */
  getBuilderInfo(builderName: BuilderName): {
    name: string;
    format: 'json' | 'html' | 'shortcode';
    description: string;
  } | null {
    const builderInfo: Record<
      string,
      { name: string; format: 'json' | 'html' | 'shortcode'; description: string }
    > = {
      elementor: {
        name: 'Elementor',
        format: 'json',
        description: 'Most popular drag-and-drop page builder',
      },
      gutenberg: {
        name: 'Gutenberg',
        format: 'html',
        description: 'Native WordPress block editor',
      },
      divi: {
        name: 'Divi Builder',
        format: 'shortcode',
        description: 'Popular Elegant Themes page builder',
      },
      'beaver-builder': {
        name: 'Beaver Builder',
        format: 'shortcode',
        description: 'Professional page builder for WordPress',
      },
      beaverbuilder: {
        name: 'Beaver Builder',
        format: 'shortcode',
        description: 'Professional page builder for WordPress',
      },
      bricks: {
        name: 'Bricks',
        format: 'json',
        description: 'Visual site builder for WordPress',
      },
      oxygen: {
        name: 'Oxygen',
        format: 'json',
        description: 'Visual design tool for WordPress',
      },
      kadence: {
        name: 'Kadence Blocks',
        format: 'html',
        description: 'Gutenberg-enhanced blocks for WordPress',
      },
      brizy: {
        name: 'Brizy',
        format: 'json',
        description: 'Next-gen website builder',
      },
      'plugin-free': {
        name: 'Plugin-Free Theme',
        format: 'html',
        description: 'Pure semantic HTML without builder dependencies',
      },
      pluginfree: {
        name: 'Plugin-Free Theme',
        format: 'html',
        description: 'Pure semantic HTML without builder dependencies',
      },
      optimizepress: {
        name: 'OptimizePress',
        format: 'shortcode',
        description: 'Landing page and sales funnel builder',
      },
      crocoblock: {
        name: 'Crocoblock (JetEngine)',
        format: 'json',
        description: 'Dynamic content and custom post types',
      },
      jetengine: {
        name: 'Crocoblock (JetEngine)',
        format: 'json',
        description: 'Dynamic content and custom post types',
      },
    };

    return builderInfo[builderName] || null;
  }

  /**
   * Get the appropriate builder instance
   */
  private getBuilder(builderName: BuilderName) {
    const normalizedName = builderName.toLowerCase().replace(/[-_]/g, '');

    switch (normalizedName) {
      case 'elementor':
        return unifiedElementorBuilder;

      case 'gutenberg':
        return unifiedGutenbergBuilder;

      case 'divi':
        return unifiedDiviBuilder;

      case 'beaverbuilder':
        return unifiedBeaverBuilderBuilder;

      case 'bricks':
        return unifiedBricksBuilder;

      case 'oxygen':
        return unifiedOxygenBuilder;

      case 'kadence':
        return unifiedKadenceBuilder;

      case 'brizy':
        return unifiedBrizyBuilder;

      case 'pluginfree':
        return unifiedPluginFreeThemeBuilder;

      case 'optimizepress':
        return unifiedOptimizePressBuilder;

      case 'crocoblock':
      case 'jetengine':
        return unifiedCrocoblockBuilder;

      default:
        return null;
    }
  }

  /**
   * Detect builder from page content (heuristic)
   */
  detectBuilder(html: string): BuilderName | null {
    const detectors: Array<{ pattern: RegExp; builder: BuilderName }> = [
      { pattern: /data-elementor-type/i, builder: 'elementor' },
      { pattern: /class="[^"]*et_pb_/i, builder: 'divi' },
      { pattern: /class="[^"]*fl-builder/i, builder: 'beaver-builder' },
      { pattern: /data-brx-element/i, builder: 'bricks' },
      { pattern: /class="[^"]*ct-section/i, builder: 'oxygen' },
      { pattern: /wp-block-kadence/i, builder: 'kadence' },
      { pattern: /brz-/i, builder: 'brizy' },
      { pattern: /class="[^"]*op-row/i, builder: 'optimizepress' },
      { pattern: /wp-block-/i, builder: 'gutenberg' },
    ];

    for (const detector of detectors) {
      if (detector.pattern.test(html)) {
        return detector.builder;
      }
    }

    return null;
  }
}

/**
 * Export singleton instance
 */
export const unifiedExportService = new UnifiedExportService();
