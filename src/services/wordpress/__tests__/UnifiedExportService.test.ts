import { describe, it, expect } from 'vitest';
import { unifiedExportService } from '../UnifiedExportService';
import type { WordPressBlock } from '../../../types/wordpress';

const sampleBlocks: WordPressBlock[] = [
  {
    namespace: 'core',
    name: 'heading',
    attributes: { level: 1 },
    innerHTML: '<h1>Test Heading</h1>',
    innerBlocks: [],
  },
  {
    namespace: 'core',
    name: 'paragraph',
    attributes: {},
    innerHTML: '<p>Test paragraph</p>',
    innerBlocks: [],
  },
];

describe('UnifiedExportService', () => {
  describe('export()', () => {
    it('should export to Elementor format', async () => {
      const result = await unifiedExportService.export({
        builderName: 'elementor',
        nativeBlocks: sampleBlocks,
      });

      expect(result.success).toBe(true);
      expect(result.builder).toBe('elementor');
      expect(result.format).toBe('json');
      expect(result.metadata?.widgetCount).toBeGreaterThan(0);
    });

    it('should export to Gutenberg format', async () => {
      const result = await unifiedExportService.export({
        builderName: 'gutenberg',
        nativeBlocks: sampleBlocks,
      });

      expect(result.success).toBe(true);
      expect(result.builder).toBe('gutenberg');
      expect(result.format).toBe('html');
    });

    it('should export to Divi format', async () => {
      const result = await unifiedExportService.export({
        builderName: 'divi',
        nativeBlocks: sampleBlocks,
      });

      expect(result.success).toBe(true);
      expect(result.builder).toBe('divi');
      expect(result.format).toBe('shortcode');
    });

    it('should handle unknown builder gracefully', async () => {
      const result = await unifiedExportService.export({
        builderName: 'unknown-builder' as any,
        nativeBlocks: sampleBlocks,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Unknown builder');
    });

    it('should validate input requirements', async () => {
      const result = await unifiedExportService.export({
        builderName: 'elementor',
        // No blocks or pageData provided
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('exportToMultiple()', () => {
    it('should export to multiple builders', async () => {
      const results = await unifiedExportService.exportToMultiple(
        ['elementor', 'gutenberg', 'divi'],
        { nativeBlocks: sampleBlocks }
      );

      expect(Object.keys(results)).toHaveLength(3);
      expect(results.elementor.success).toBe(true);
      expect(results.gutenberg.success).toBe(true);
      expect(results.divi.success).toBe(true);
    });

    it('should handle mixed success/failure in multiple exports', async () => {
      const results = await unifiedExportService.exportToMultiple(
        ['elementor', 'unknown-builder' as any],
        { nativeBlocks: sampleBlocks }
      );

      expect(results.elementor.success).toBe(true);
      expect(results['unknown-builder'].success).toBe(false);
    });
  });

  describe('getAvailableBuilders()', () => {
    it('should return all 11 available builders', () => {
      const builders = unifiedExportService.getAvailableBuilders();

      expect(builders).toHaveLength(11);
      expect(builders).toContain('elementor');
      expect(builders).toContain('gutenberg');
      expect(builders).toContain('divi');
      expect(builders).toContain('beaver-builder');
      expect(builders).toContain('bricks');
      expect(builders).toContain('oxygen');
      expect(builders).toContain('kadence');
      expect(builders).toContain('brizy');
      expect(builders).toContain('plugin-free');
      expect(builders).toContain('optimizepress');
      expect(builders).toContain('crocoblock');
    });
  });

  describe('getBuilderInfo()', () => {
    it('should return correct info for Elementor', () => {
      const info = unifiedExportService.getBuilderInfo('elementor');

      expect(info).toBeDefined();
      expect(info?.name).toBe('Elementor');
      expect(info?.format).toBe('json');
      expect(info?.description).toContain('drag-and-drop');
    });

    it('should return correct info for Gutenberg', () => {
      const info = unifiedExportService.getBuilderInfo('gutenberg');

      expect(info).toBeDefined();
      expect(info?.name).toBe('Gutenberg');
      expect(info?.format).toBe('html');
      expect(info?.description).toContain('Native WordPress');
    });

    it('should return correct info for Divi', () => {
      const info = unifiedExportService.getBuilderInfo('divi');

      expect(info).toBeDefined();
      expect(info?.name).toBe('Divi Builder');
      expect(info?.format).toBe('shortcode');
    });

    it('should handle builder name variations', () => {
      const info1 = unifiedExportService.getBuilderInfo('beaver-builder');
      const info2 = unifiedExportService.getBuilderInfo('beaverbuilder');

      expect(info1).toBeDefined();
      expect(info2).toBeDefined();
      expect(info1?.name).toBe(info2?.name);
    });

    it('should return null for unknown builder', () => {
      const info = unifiedExportService.getBuilderInfo('unknown' as any);
      expect(info).toBeNull();
    });
  });

  describe('detectBuilder()', () => {
    it('should detect Elementor from HTML', () => {
      const html = '<div data-elementor-type="page">Content</div>';
      const builder = unifiedExportService.detectBuilder(html);

      expect(builder).toBe('elementor');
    });

    it('should detect Divi from HTML', () => {
      const html = '<div class="et_pb_section">Content</div>';
      const builder = unifiedExportService.detectBuilder(html);

      expect(builder).toBe('divi');
    });

    it('should detect Beaver Builder from HTML', () => {
      const html = '<div class="fl-builder-content">Content</div>';
      const builder = unifiedExportService.detectBuilder(html);

      expect(builder).toBe('beaver-builder');
    });

    it('should detect Bricks from HTML', () => {
      const html = '<div data-brx-element="section">Content</div>';
      const builder = unifiedExportService.detectBuilder(html);

      expect(builder).toBe('bricks');
    });

    it('should detect Oxygen from HTML', () => {
      const html = '<div class="ct-section">Content</div>';
      const builder = unifiedExportService.detectBuilder(html);

      expect(builder).toBe('oxygen');
    });

    it('should detect Kadence from HTML', () => {
      const html = '<div class="wp-block-kadence-column">Content</div>';
      const builder = unifiedExportService.detectBuilder(html);

      expect(builder).toBe('kadence');
    });

    it('should detect Gutenberg from HTML', () => {
      const html = '<div class="wp-block-paragraph">Content</div>';
      const builder = unifiedExportService.detectBuilder(html);

      expect(builder).toBe('gutenberg');
    });

    it('should return null for unrecognized HTML', () => {
      const html = '<div>Plain HTML content</div>';
      const builder = unifiedExportService.detectBuilder(html);

      expect(builder).toBeNull();
    });
  });

  describe('Builder Format Validation', () => {
    it('should return JSON format for JSON builders', async () => {
      const jsonBuilders = ['elementor', 'bricks', 'oxygen', 'brizy', 'crocoblock'];

      for (const builderName of jsonBuilders) {
        const result = await unifiedExportService.export({
          builderName: builderName as any,
          nativeBlocks: sampleBlocks,
        });

        expect(result.format).toBe('json');
      }
    });

    it('should return shortcode format for shortcode builders', async () => {
      const shortcodeBuilders = ['divi', 'beaver-builder', 'optimizepress'];

      for (const builderName of shortcodeBuilders) {
        const result = await unifiedExportService.export({
          builderName: builderName as any,
          nativeBlocks: sampleBlocks,
        });

        expect(result.format).toBe('shortcode');
      }
    });

    it('should return HTML format for HTML builders', async () => {
      const htmlBuilders = ['gutenberg', 'kadence', 'plugin-free'];

      for (const builderName of htmlBuilders) {
        const result = await unifiedExportService.export({
          builderName: builderName as any,
          nativeBlocks: sampleBlocks,
        });

        expect(result.format).toBe('html');
      }
    });
  });
});
