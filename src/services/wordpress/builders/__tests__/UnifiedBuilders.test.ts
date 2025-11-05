import { describe, it, expect } from 'vitest';
import type { WordPressBlock } from '../../../../types/wordpress';
import type { PageData, ElementData } from '../../../parsers/PlaywrightParserService';

// Import all builders
import { unifiedElementorBuilder } from '../UnifiedElementorBuilder';
import { unifiedGutenbergBuilder } from '../UnifiedGutenbergBuilder';
import { unifiedDiviBuilder } from '../UnifiedDiviBuilder';
import { unifiedBeaverBuilderBuilder } from '../UnifiedBeaverBuilderBuilder';
import { unifiedBricksBuilder } from '../UnifiedBricksBuilder';
import { unifiedOxygenBuilder } from '../UnifiedOxygenBuilder';
import { unifiedKadenceBuilder } from '../UnifiedKadenceBuilder';
import { unifiedBrizyBuilder } from '../UnifiedBrizyBuilder';
import { unifiedPluginFreeThemeBuilder } from '../UnifiedPluginFreeThemeBuilder';
import { unifiedOptimizePressBuilder } from '../UnifiedOptimizePressBuilder';
import { unifiedCrocoblockBuilder } from '../UnifiedCrocoblockBuilder';

// Sample WordPress blocks for testing
const sampleBlocks: WordPressBlock[] = [
  {
    namespace: 'core',
    name: 'heading',
    attributes: {
      level: 2,
      textAlign: 'center',
      textColor: '#333333',
    },
    innerHTML: '<h2>Welcome to Our Site</h2>',
    innerBlocks: [],
  },
  {
    namespace: 'core',
    name: 'paragraph',
    attributes: {
      align: 'left',
    },
    innerHTML: '<p>This is a sample paragraph with some text content.</p>',
    innerBlocks: [],
  },
  {
    namespace: 'core',
    name: 'image',
    attributes: {
      url: 'https://example.com/image.jpg',
      alt: 'Sample Image',
    },
    innerHTML: '<img src="https://example.com/image.jpg" alt="Sample Image" />',
    innerBlocks: [],
  },
  {
    namespace: 'core',
    name: 'button',
    attributes: {
      url: 'https://example.com',
      text: 'Click Here',
      backgroundColor: '#0073aa',
      textColor: '#ffffff',
    },
    innerHTML: '<a href="https://example.com" class="wp-block-button__link">Click Here</a>',
    innerBlocks: [],
  },
];

// Sample Playwright data for testing
const samplePageData: PageData = {
  url: 'https://example.com',
  title: 'Test Page',
  html: '<html><body><h1>Test</h1></body></html>',
  elements: [
    {
      tag: 'h1',
      classes: '',
      id: '',
      text: 'Test Heading',
      attributes: {},
      position: { x: 0, y: 0, width: 800, height: 50 },
      styles: {
        display: 'block',
        position: 'static',
        backgroundColor: 'transparent',
        color: 'rgb(51, 51, 51)',
        fontSize: '32px',
        fontWeight: 'bold',
        textAlign: 'left',
        padding: '0px',
        margin: '0px 0px 16px',
        border: 'none',
        borderRadius: '0px',
        width: '800px',
        height: '50px',
      },
      isVisible: true,
    },
    {
      tag: 'p',
      classes: '',
      id: '',
      text: 'Test paragraph content',
      attributes: {},
      position: { x: 0, y: 66, width: 800, height: 24 },
      styles: {
        display: 'block',
        position: 'static',
        backgroundColor: 'transparent',
        color: 'rgb(0, 0, 0)',
        fontSize: '16px',
        fontWeight: 'normal',
        textAlign: 'left',
        padding: '0px',
        margin: '0px 0px 16px',
        border: 'none',
        borderRadius: '0px',
        width: '800px',
        height: '24px',
      },
      isVisible: true,
    },
    {
      tag: 'img',
      classes: '',
      id: '',
      text: '',
      attributes: {
        src: 'https://example.com/test.jpg',
        alt: 'Test Image',
      },
      position: { x: 0, y: 106, width: 400, height: 300 },
      styles: {
        display: 'block',
        position: 'static',
        backgroundColor: 'transparent',
        color: '',
        fontSize: '',
        fontWeight: '',
        textAlign: '',
        padding: '0px',
        margin: '0px',
        border: 'none',
        borderRadius: '0px',
        width: '400px',
        height: '300px',
      },
      isVisible: true,
    },
  ] as ElementData[],
  meta: {
    title: 'Test Page',
    description: 'Test description',
    keywords: [],
  },
};

describe('Unified WordPress Builders', () => {
  describe('UnifiedElementorBuilder', () => {
    it('should convert native blocks to Elementor JSON format', async () => {
      const result = await unifiedElementorBuilder.convert({
        type: 'native-blocks',
        blocks: sampleBlocks,
      });

      expect(result.format).toBe('json');
      expect(result.metadata?.conversionMethod).toBe('native');
      expect(result.metadata?.widgetCount).toBeGreaterThan(0);
      expect(result.content).toHaveProperty('content');
      expect(Array.isArray(result.content.content)).toBe(true);
    });

    it('should convert Playwright data to Elementor format', async () => {
      const result = await unifiedElementorBuilder.convert({
        type: 'playwright-data',
        pageData: samplePageData,
      });

      expect(result.format).toBe('json');
      expect(result.metadata?.conversionMethod).toBe('playwright');
      expect(result.content).toHaveProperty('content');
    });
  });

  describe('UnifiedGutenbergBuilder', () => {
    it('should convert native blocks to Gutenberg HTML format', async () => {
      const result = await unifiedGutenbergBuilder.convert({
        type: 'native-blocks',
        blocks: sampleBlocks,
      });

      expect(result.format).toBe('html');
      expect(result.metadata?.conversionMethod).toBe('native');
      expect(typeof result.content).toBe('string');
      expect(result.content).toContain('<!-- wp:heading');
      expect(result.content).toContain('<!-- wp:paragraph');
    });

    it('should convert Playwright data to Gutenberg format', async () => {
      const result = await unifiedGutenbergBuilder.convert({
        type: 'playwright-data',
        pageData: samplePageData,
      });

      expect(result.format).toBe('html');
      expect(result.metadata?.conversionMethod).toBe('playwright');
      expect(typeof result.content).toBe('string');
    });
  });

  describe('UnifiedDiviBuilder', () => {
    it('should convert native blocks to Divi shortcode format', async () => {
      const result = await unifiedDiviBuilder.convert({
        type: 'native-blocks',
        blocks: sampleBlocks,
      });

      expect(result.format).toBe('shortcode');
      expect(result.metadata?.conversionMethod).toBe('native');
      expect(typeof result.content).toBe('string');
      expect(result.content).toContain('[et_pb_section');
      expect(result.content).toContain('[et_pb_row');
    });

    it('should convert Playwright data to Divi format', async () => {
      const result = await unifiedDiviBuilder.convert({
        type: 'playwright-data',
        pageData: samplePageData,
      });

      expect(result.format).toBe('shortcode');
      expect(result.metadata?.conversionMethod).toBe('playwright');
    });
  });

  describe('UnifiedBeaverBuilderBuilder', () => {
    it('should convert native blocks to Beaver Builder shortcode', async () => {
      const result = await unifiedBeaverBuilderBuilder.convert({
        type: 'native-blocks',
        blocks: sampleBlocks,
      });

      expect(result.format).toBe('shortcode');
      expect(result.metadata?.conversionMethod).toBe('native');
      expect(result.content).toContain('[fl_row');
      expect(result.content).toContain('[fl_module');
    });
  });

  describe('UnifiedBricksBuilder', () => {
    it('should convert native blocks to Bricks JSON format', async () => {
      const result = await unifiedBricksBuilder.convert({
        type: 'native-blocks',
        blocks: sampleBlocks,
      });

      expect(result.format).toBe('json');
      expect(result.metadata?.conversionMethod).toBe('native');
      expect(result.content).toHaveProperty('elements');
      expect(Array.isArray(result.content.elements)).toBe(true);
    });
  });

  describe('UnifiedOxygenBuilder', () => {
    it('should convert native blocks to Oxygen JSON format', async () => {
      const result = await unifiedOxygenBuilder.convert({
        type: 'native-blocks',
        blocks: sampleBlocks,
      });

      expect(result.format).toBe('json');
      expect(result.metadata?.conversionMethod).toBe('native');
      expect(result.content).toHaveProperty('components');
      expect(Array.isArray(result.content.components)).toBe(true);
    });
  });

  describe('UnifiedKadenceBuilder', () => {
    it('should convert native blocks to Kadence format', async () => {
      const result = await unifiedKadenceBuilder.convert({
        type: 'native-blocks',
        blocks: sampleBlocks,
      });

      expect(result.format).toBe('html');
      expect(result.metadata?.conversionMethod).toBe('native');
      expect(result.content).toContain('wp:kadence');
    });
  });

  describe('UnifiedBrizyBuilder', () => {
    it('should convert native blocks to Brizy JSON format', async () => {
      const result = await unifiedBrizyBuilder.convert({
        type: 'native-blocks',
        blocks: sampleBlocks,
      });

      expect(result.format).toBe('json');
      expect(result.metadata?.conversionMethod).toBe('native');
      expect(result.content).toHaveProperty('items');
      expect(Array.isArray(result.content.items)).toBe(true);
    });
  });

  describe('UnifiedPluginFreeThemeBuilder', () => {
    it('should convert native blocks to semantic HTML', async () => {
      const result = await unifiedPluginFreeThemeBuilder.convert({
        type: 'native-blocks',
        blocks: sampleBlocks,
      });

      expect(result.format).toBe('html');
      expect(result.metadata?.conversionMethod).toBe('native');
      expect(result.content).toContain('<h2');
      expect(result.content).toContain('<p');
      expect(result.content).not.toContain('wp:'); // No WordPress blocks
      expect(result.content).not.toContain('['); // No shortcodes
    });
  });

  describe('UnifiedOptimizePressBuilder', () => {
    it('should convert native blocks to OptimizePress shortcode', async () => {
      const result = await unifiedOptimizePressBuilder.convert({
        type: 'native-blocks',
        blocks: sampleBlocks,
      });

      expect(result.format).toBe('shortcode');
      expect(result.metadata?.conversionMethod).toBe('native');
      expect(result.content).toContain('[op_row');
      expect(result.content).toContain('[op_col');
    });
  });

  describe('UnifiedCrocoblockBuilder', () => {
    it('should convert native blocks to Crocoblock JSON format', async () => {
      const result = await unifiedCrocoblockBuilder.convert({
        type: 'native-blocks',
        blocks: sampleBlocks,
      });

      expect(result.format).toBe('json');
      expect(result.metadata?.conversionMethod).toBe('native');
      expect(result.content).toHaveProperty('content');
      expect(Array.isArray(result.content.content)).toBe(true);
    });
  });

  describe('All Builders - Common Tests', () => {
    const builders = [
      { name: 'Elementor', instance: unifiedElementorBuilder },
      { name: 'Gutenberg', instance: unifiedGutenbergBuilder },
      { name: 'Divi', instance: unifiedDiviBuilder },
      { name: 'Beaver Builder', instance: unifiedBeaverBuilderBuilder },
      { name: 'Bricks', instance: unifiedBricksBuilder },
      { name: 'Oxygen', instance: unifiedOxygenBuilder },
      { name: 'Kadence', instance: unifiedKadenceBuilder },
      { name: 'Brizy', instance: unifiedBrizyBuilder },
      { name: 'Plugin-Free', instance: unifiedPluginFreeThemeBuilder },
      { name: 'OptimizePress', instance: unifiedOptimizePressBuilder },
      { name: 'Crocoblock', instance: unifiedCrocoblockBuilder },
    ];

    builders.forEach(({ name, instance }) => {
      it(`${name}: should include metadata with widget count`, async () => {
        const result = await instance.convert({
          type: 'native-blocks',
          blocks: sampleBlocks,
        });

        expect(result.metadata).toBeDefined();
        expect(result.metadata?.widgetCount).toBeGreaterThan(0);
        expect(result.metadata?.sectionCount).toBeGreaterThan(0);
      });

      it(`${name}: should include build time in metadata`, async () => {
        const result = await instance.convert({
          type: 'native-blocks',
          blocks: sampleBlocks,
        });

        expect(result.metadata?.buildTime).toBeDefined();
        expect(typeof result.metadata?.buildTime).toBe('number');
        expect(result.metadata!.buildTime).toBeGreaterThan(0);
      });

      it(`${name}: should support Playwright fallback`, async () => {
        const result = await instance.convert({
          type: 'playwright-data',
          pageData: samplePageData,
        });

        expect(result.success).not.toBe(false);
        expect(result.metadata?.conversionMethod).toBe('playwright');
      });

      it(`${name}: should have valid output format`, async () => {
        const result = await instance.convert({
          type: 'native-blocks',
          blocks: sampleBlocks,
        });

        expect(['json', 'html', 'shortcode']).toContain(result.format);
      });
    });
  });

  describe('Block Type Support', () => {
    const testBlockTypes = [
      { type: 'heading', namespace: 'core', name: 'heading' },
      { type: 'paragraph', namespace: 'core', name: 'paragraph' },
      { type: 'image', namespace: 'core', name: 'image' },
      { type: 'button', namespace: 'core', name: 'button' },
    ];

    testBlockTypes.forEach(({ type, namespace, name }) => {
      it(`should support ${type} blocks in all builders`, async () => {
        const block: WordPressBlock = {
          namespace,
          name,
          attributes: {},
          innerHTML: `<${type}>Test</${type}>`,
          innerBlocks: [],
        };

        const builders = [
          unifiedElementorBuilder,
          unifiedGutenbergBuilder,
          unifiedDiviBuilder,
        ];

        for (const builder of builders) {
          const result = await builder.convert({
            type: 'native-blocks',
            blocks: [block],
          });

          expect(result.metadata?.widgetCount).toBeGreaterThan(0);
        }
      });
    });
  });
});
