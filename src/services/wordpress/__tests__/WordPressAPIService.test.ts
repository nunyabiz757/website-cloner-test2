import { describe, it, expect, beforeEach } from 'vitest';
import { WordPressAPIService } from '../WordPressAPIService';
import type { WordPressBlock } from '../../../types/wordpress';

describe('WordPressAPIService', () => {
  let service: WordPressAPIService;

  beforeEach(() => {
    service = new WordPressAPIService();
  });

  describe('parseWordPressBlocks', () => {
    it('should parse a simple heading block', () => {
      const content = `
<!-- wp:heading {"level":2} -->
<h2>My Heading</h2>
<!-- /wp:heading -->
      `.trim();

      const blocks = service.parseWordPressBlocks(content);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].namespace).toBe('core');
      expect(blocks[0].name).toBe('heading');
      expect(blocks[0].attributes).toEqual({ level: 2 });
      expect(blocks[0].innerHTML).toContain('<h2>My Heading</h2>');
      expect(blocks[0].innerBlocks).toEqual([]);
    });

    it('should parse a paragraph block with no attributes', () => {
      const content = `
<!-- wp:paragraph -->
<p>This is a paragraph.</p>
<!-- /wp:paragraph -->
      `.trim();

      const blocks = service.parseWordPressBlocks(content);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].namespace).toBe('core');
      expect(blocks[0].name).toBe('paragraph');
      expect(blocks[0].attributes).toEqual({});
      expect(blocks[0].innerHTML).toContain('<p>This is a paragraph.</p>');
    });

    it('should parse multiple blocks', () => {
      const content = `
<!-- wp:heading {"level":1} -->
<h1>Title</h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>First paragraph.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Second paragraph.</p>
<!-- /wp:paragraph -->
      `.trim();

      const blocks = service.parseWordPressBlocks(content);

      expect(blocks).toHaveLength(3);
      expect(blocks[0].name).toBe('heading');
      expect(blocks[1].name).toBe('paragraph');
      expect(blocks[2].name).toBe('paragraph');
    });

    it('should parse nested blocks (columns with inner blocks)', () => {
      const content = `
<!-- wp:columns -->
<div class="wp-block-columns">
  <!-- wp:column -->
  <div class="wp-block-column">
    <!-- wp:heading {"level":3} -->
    <h3>Column 1 Title</h3>
    <!-- /wp:heading -->
  </div>
  <!-- /wp:column -->

  <!-- wp:column -->
  <div class="wp-block-column">
    <!-- wp:paragraph -->
    <p>Column 2 content</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->
      `.trim();

      const blocks = service.parseWordPressBlocks(content);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].name).toBe('columns');
      expect(blocks[0].innerBlocks).toHaveLength(2);
      expect(blocks[0].innerBlocks[0].name).toBe('column');
      expect(blocks[0].innerBlocks[0].innerBlocks).toHaveLength(1);
      expect(blocks[0].innerBlocks[0].innerBlocks[0].name).toBe('heading');
      expect(blocks[0].innerBlocks[1].name).toBe('column');
      expect(blocks[0].innerBlocks[1].innerBlocks).toHaveLength(1);
      expect(blocks[0].innerBlocks[1].innerBlocks[0].name).toBe('paragraph');
    });

    it('should parse blocks with namespace (custom blocks)', () => {
      const content = `
<!-- wp:acf/testimonial {"id":"block_123"} -->
<div class="testimonial">Custom ACF block content</div>
<!-- /wp:acf/testimonial -->
      `.trim();

      const blocks = service.parseWordPressBlocks(content);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].namespace).toBe('acf');
      expect(blocks[0].name).toBe('testimonial');
      expect(blocks[0].attributes).toEqual({ id: 'block_123' });
    });

    it('should parse self-closing blocks', () => {
      const content = `
<!-- wp:separator /-->
      `.trim();

      const blocks = service.parseWordPressBlocks(content);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].name).toBe('separator');
      expect(blocks[0].innerHTML).toBe('');
      expect(blocks[0].innerBlocks).toEqual([]);
    });

    it('should handle complex attributes with multiple properties', () => {
      const content = `
<!-- wp:image {"id":123,"sizeSlug":"large","linkDestination":"none","align":"center","className":"custom-image"} -->
<figure class="wp-block-image size-large aligncenter custom-image">
  <img src="image.jpg" alt="My Image" />
</figure>
<!-- /wp:image -->
      `.trim();

      const blocks = service.parseWordPressBlocks(content);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].name).toBe('image');
      expect(blocks[0].attributes).toEqual({
        id: 123,
        sizeSlug: 'large',
        linkDestination: 'none',
        align: 'center',
        className: 'custom-image',
      });
    });

    it('should handle deeply nested blocks (groups within columns)', () => {
      const content = `
<!-- wp:group -->
<div class="wp-block-group">
  <!-- wp:columns -->
  <div class="wp-block-columns">
    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:heading {"level":2} -->
      <h2>Nested Title</h2>
      <!-- /wp:heading -->
    </div>
    <!-- /wp:column -->
  </div>
  <!-- /wp:columns -->
</div>
<!-- /wp:group -->
      `.trim();

      const blocks = service.parseWordPressBlocks(content);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].name).toBe('group');
      expect(blocks[0].innerBlocks).toHaveLength(1);
      expect(blocks[0].innerBlocks[0].name).toBe('columns');
      expect(blocks[0].innerBlocks[0].innerBlocks).toHaveLength(1);
      expect(blocks[0].innerBlocks[0].innerBlocks[0].name).toBe('column');
      expect(blocks[0].innerBlocks[0].innerBlocks[0].innerBlocks).toHaveLength(1);
      expect(blocks[0].innerBlocks[0].innerBlocks[0].innerBlocks[0].name).toBe('heading');
    });

    it('should handle empty content gracefully', () => {
      const blocks = service.parseWordPressBlocks('');
      expect(blocks).toEqual([]);
    });

    it('should handle content with no blocks', () => {
      const content = '<p>Regular HTML without blocks</p>';
      const blocks = service.parseWordPressBlocks(content);
      expect(blocks).toEqual([]);
    });

    it('should handle malformed JSON attributes gracefully', () => {
      const content = `
<!-- wp:heading {invalid json} -->
<h2>Title</h2>
<!-- /wp:heading -->
      `.trim();

      const blocks = service.parseWordPressBlocks(content);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].name).toBe('heading');
      expect(blocks[0].attributes).toEqual({});
    });

    it('should skip empty blocks when skipEmpty option is true', () => {
      const content = `
<!-- wp:paragraph -->
<p>Content</p>
<!-- /wp:paragraph -->

<!-- wp:separator /-->

<!-- wp:paragraph -->
<p>More content</p>
<!-- /wp:paragraph -->
      `.trim();

      const blocks = service.parseWordPressBlocks(content, { skipEmpty: true });

      expect(blocks).toHaveLength(2);
      expect(blocks[0].name).toBe('paragraph');
      expect(blocks[1].name).toBe('paragraph');
    });

    it('should filter blocks by type when blockTypes option is provided', () => {
      const content = `
<!-- wp:heading {"level":1} -->
<h1>Title</h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Paragraph</p>
<!-- /wp:paragraph -->

<!-- wp:image -->
<img src="image.jpg" />
<!-- /wp:image -->
      `.trim();

      const blocks = service.parseWordPressBlocks(content, {
        blockTypes: ['heading', 'image'],
      });

      expect(blocks).toHaveLength(2);
      expect(blocks[0].name).toBe('heading');
      expect(blocks[1].name).toBe('image');
    });

    it('should respect maxDepth option for nested blocks', () => {
      const content = `
<!-- wp:group -->
<div class="wp-block-group">
  <!-- wp:columns -->
  <div class="wp-block-columns">
    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:heading {"level":2} -->
      <h2>Deep Title</h2>
      <!-- /wp:heading -->
    </div>
    <!-- /wp:column -->
  </div>
  <!-- /wp:columns -->
</div>
<!-- /wp:group -->
      `.trim();

      const blocks = service.parseWordPressBlocks(content, { maxDepth: 1 });

      expect(blocks).toHaveLength(1);
      expect(blocks[0].name).toBe('group');
      expect(blocks[0].innerBlocks).toHaveLength(1);
      expect(blocks[0].innerBlocks[0].name).toBe('columns');
      // Should stop here due to maxDepth: 1
      expect(blocks[0].innerBlocks[0].innerBlocks).toHaveLength(0);
    });

    it('should handle real-world WordPress content', () => {
      const content = `
<!-- wp:heading {"level":1} -->
<h1>Welcome to My Blog</h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This is an introduction paragraph with <strong>bold text</strong> and <a href="https://example.com">a link</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:columns -->
<div class="wp-block-columns">
  <!-- wp:column {"width":"66.66%"} -->
  <div class="wp-block-column" style="flex-basis:66.66%">
    <!-- wp:heading {"level":2} -->
    <h2>Main Content Area</h2>
    <!-- /wp:heading -->

    <!-- wp:paragraph -->
    <p>Lorem ipsum dolor sit amet.</p>
    <!-- /wp:paragraph -->

    <!-- wp:image {"id":456,"sizeSlug":"large"} -->
    <figure class="wp-block-image size-large">
      <img src="main-image.jpg" alt="Main image" />
    </figure>
    <!-- /wp:image -->
  </div>
  <!-- /wp:column -->

  <!-- wp:column {"width":"33.33%"} -->
  <div class="wp-block-column" style="flex-basis:33.33%">
    <!-- wp:heading {"level":3} -->
    <h3>Sidebar</h3>
    <!-- /wp:heading -->

    <!-- wp:list -->
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>
    <!-- /wp:list -->
  </div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->

<!-- wp:separator /-->

<!-- wp:acf/call-to-action {"buttonText":"Learn More","buttonUrl":"https://example.com/cta"} -->
<div class="cta-block">
  <button>Learn More</button>
</div>
<!-- /wp:acf/call-to-action -->
      `.trim();

      const blocks = service.parseWordPressBlocks(content);

      expect(blocks).toHaveLength(5);

      // Check heading
      expect(blocks[0].name).toBe('heading');
      expect(blocks[0].attributes.level).toBe(1);

      // Check paragraph
      expect(blocks[1].name).toBe('paragraph');

      // Check columns with nested structure
      expect(blocks[2].name).toBe('columns');
      expect(blocks[2].innerBlocks).toHaveLength(2);
      expect(blocks[2].innerBlocks[0].attributes.width).toBe('66.66%');
      expect(blocks[2].innerBlocks[0].innerBlocks).toHaveLength(3);
      expect(blocks[2].innerBlocks[1].attributes.width).toBe('33.33%');
      expect(blocks[2].innerBlocks[1].innerBlocks).toHaveLength(2);

      // Check separator (self-closing)
      expect(blocks[3].name).toBe('separator');

      // Check custom ACF block
      expect(blocks[4].namespace).toBe('acf');
      expect(blocks[4].name).toBe('call-to-action');
      expect(blocks[4].attributes.buttonText).toBe('Learn More');
    });
  });

  describe('normalizeUrl', () => {
    it('should add https protocol if missing', () => {
      const normalized = (service as any).normalizeUrl('example.com');
      expect(normalized).toBe('https://example.com');
    });

    it('should not modify URL with existing protocol', () => {
      const normalized = (service as any).normalizeUrl('https://example.com');
      expect(normalized).toBe('https://example.com');
    });

    it('should remove trailing slash', () => {
      const normalized = (service as any).normalizeUrl('https://example.com/');
      expect(normalized).toBe('https://example.com');
    });

    it('should handle URLs with paths', () => {
      const normalized = (service as any).normalizeUrl('https://example.com/blog/');
      expect(normalized).toBe('https://example.com/blog');
    });
  });

  describe('countBlocks', () => {
    it('should count simple blocks', () => {
      const blocks: WordPressBlock[] = [
        { namespace: 'core', name: 'heading', attributes: {}, innerHTML: '', innerBlocks: [] },
        { namespace: 'core', name: 'paragraph', attributes: {}, innerHTML: '', innerBlocks: [] },
      ];

      const count = (service as any).countBlocks(blocks);
      expect(count).toBe(2);
    });

    it('should count nested blocks', () => {
      const blocks: WordPressBlock[] = [
        {
          namespace: 'core',
          name: 'columns',
          attributes: {},
          innerHTML: '',
          innerBlocks: [
            {
              namespace: 'core',
              name: 'column',
              attributes: {},
              innerHTML: '',
              innerBlocks: [
                { namespace: 'core', name: 'heading', attributes: {}, innerHTML: '', innerBlocks: [] },
              ],
            },
            {
              namespace: 'core',
              name: 'column',
              attributes: {},
              innerHTML: '',
              innerBlocks: [
                { namespace: 'core', name: 'paragraph', attributes: {}, innerHTML: '', innerBlocks: [] },
              ],
            },
          ],
        },
      ];

      const count = (service as any).countBlocks(blocks);
      expect(count).toBe(5); // 1 columns + 2 column + 1 heading + 1 paragraph
    });
  });
});
