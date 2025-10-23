import * as cheerio from 'cheerio';
import type JSZip from 'jszip';
import type { WordPressExportOptions, GutenbergBlock } from '../../../types/wordpress-export.types';

/**
 * Gutenberg Builder
 * Converts HTML to WordPress Gutenberg (Block Editor) format
 */
export class GutenbergBuilder {
  async generate(
    zip: JSZip,
    options: WordPressExportOptions,
    files: any
  ): Promise<void> {
    // Create export directory
    const gutenbergFolder = zip.folder('gutenberg-blocks')!;
    const assetsFolder = gutenbergFolder.folder('assets')!;
    const cssFolder = assetsFolder.folder('css')!;
    const jsFolder = assetsFolder.folder('js')!;

    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Convert HTML to Gutenberg blocks
    // ═══════════════════════════════════════════════════════════════

    const blocks = this.convertToGutenberg(options.html);
    const blockContent = this.serializeBlocks(blocks);

    // Save block content
    gutenbergFolder.file('blocks.html', blockContent);
    files.templates = files.templates || [];
    files.templates.push('blocks.html');

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Add CSS files
    // ═══════════════════════════════════════════════════════════════

    for (let i = 0; i < options.css.length; i++) {
      cssFolder.file(`custom-${i}.css`, options.css[i]);
      files.css.push(`assets/css/custom-${i}.css`);
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: Add JavaScript files
    // ═══════════════════════════════════════════════════════════════

    for (let i = 0; i < options.js.length; i++) {
      jsFolder.file(`custom-${i}.js`, options.js[i]);
      files.js.push(`assets/js/custom-${i}.js`);
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 4: Generate import instructions
    // ═══════════════════════════════════════════════════════════════

    const instructions = this.generateInstructions();
    gutenbergFolder.file('IMPORT_INSTRUCTIONS.md', instructions);

    // ═══════════════════════════════════════════════════════════════
    // STEP 5: Generate README
    // ═══════════════════════════════════════════════════════════════

    const readme = this.generateReadme();
    gutenbergFolder.file('README.md', readme);
  }

  /**
   * Convert HTML to Gutenberg blocks
   */
  private convertToGutenberg(html: string): GutenbergBlock[] {
    const $ = cheerio.load(html);
    const blocks: GutenbergBlock[] = [];

    // Process body children
    $('body').children().each((_, element) => {
      const $el = $(element);
      const tagName = $el.prop('tagName')?.toLowerCase();

      // Skip non-visual elements
      if (['script', 'style', 'noscript'].includes(tagName)) {
        return;
      }

      const block = this.elementToBlock($, $el);
      if (block) {
        blocks.push(block);
      }
    });

    return blocks;
  }

  /**
   * Convert HTML element to Gutenberg block
   */
  private elementToBlock(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): GutenbergBlock | null {
    const tagName = $element.prop('tagName')?.toLowerCase();
    const classes = $element.attr('class') || '';

    // Heading blocks
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      return this.createHeadingBlock($, $element);
    }

    // Paragraph block
    if (tagName === 'p') {
      return this.createParagraphBlock($, $element);
    }

    // Image block
    if (tagName === 'img') {
      return this.createImageBlock($, $element);
    }

    // Button block
    if (tagName === 'a' && (classes.includes('btn') || classes.includes('button')) || tagName === 'button') {
      return this.createButtonBlock($, $element);
    }

    // List blocks
    if (tagName === 'ul' || tagName === 'ol') {
      return this.createListBlock($, $element);
    }

    // Quote block
    if (tagName === 'blockquote') {
      return this.createQuoteBlock($, $element);
    }

    // Code block
    if (tagName === 'pre' || tagName === 'code') {
      return this.createCodeBlock($, $element);
    }

    // Video block
    if (tagName === 'video') {
      return this.createVideoBlock($, $element);
    }

    // Embed block (iframe)
    if (tagName === 'iframe') {
      return this.createEmbedBlock($, $element);
    }

    // Separator block
    if (tagName === 'hr') {
      return this.createSeparatorBlock($, $element);
    }

    // Spacer block
    if (classes.includes('spacer') || classes.includes('spacing')) {
      return this.createSpacerBlock($, $element);
    }

    // Columns block (detect multi-column layouts)
    if (this.isColumnsContainer($, $element)) {
      return this.createColumnsBlock($, $element);
    }

    // Group block (detect containers)
    if (this.isGroupContainer($, $element)) {
      return this.createGroupBlock($, $element);
    }

    // Cover block (hero sections)
    if (classes.includes('hero') || classes.includes('banner') || classes.includes('cover')) {
      return this.createCoverBlock($, $element);
    }

    // Media & Text block
    if (this.isMediaTextContainer($, $element)) {
      return this.createMediaTextBlock($, $element);
    }

    // Table block
    if (tagName === 'table') {
      return this.createTableBlock($, $element);
    }

    // Default: HTML block
    return this.createHTMLBlock($, $element);
  }

  /**
   * Create heading block
   */
  private createHeadingBlock(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): GutenbergBlock {
    const level = parseInt($element.prop('tagName')?.charAt(1) || '2');
    const content = $element.html() || '';
    const align = this.getAlignment($element);

    const attrs: any = { level };
    if (align !== 'left') {
      attrs.textAlign = align;
    }

    return {
      blockName: 'core/heading',
      attrs,
      innerHTML: content,
      innerBlocks: [],
    };
  }

  /**
   * Create paragraph block
   */
  private createParagraphBlock(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): GutenbergBlock {
    const content = $element.html() || '';
    const align = this.getAlignment($element);

    const attrs: any = {};
    if (align !== 'left') {
      attrs.align = align;
    }

    return {
      blockName: 'core/paragraph',
      attrs,
      innerHTML: content,
      innerBlocks: [],
    };
  }

  /**
   * Create image block
   */
  private createImageBlock(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): GutenbergBlock {
    const url = $element.attr('src') || '';
    const alt = $element.attr('alt') || '';
    const width = $element.attr('width');
    const height = $element.attr('height');

    const attrs: any = {
      url,
      alt,
      sizeSlug: 'large',
    };

    if (width) attrs.width = parseInt(width);
    if (height) attrs.height = parseInt(height);

    const imgHtml = `<img src="${url}" alt="${alt}"${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''}/>`;

    return {
      blockName: 'core/image',
      attrs,
      innerHTML: `<figure class="wp-block-image size-large">${imgHtml}</figure>`,
      innerBlocks: [],
    };
  }

  /**
   * Create button block
   */
  private createButtonBlock(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): GutenbergBlock {
    const text = $element.text().trim() || 'Button';
    const url = $element.attr('href') || '#';
    const align = this.getAlignment($element);

    return {
      blockName: 'core/buttons',
      attrs: {},
      innerHTML: `<div class="wp-block-buttons">
  <!-- wp:button {"align":"${align}"} -->
  <div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="${url}">${text}</a></div>
  <!-- /wp:button -->
</div>`,
      innerBlocks: [],
    };
  }

  /**
   * Create list block
   */
  private createListBlock(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): GutenbergBlock {
    const tagName = $element.prop('tagName')?.toLowerCase();
    const ordered = tagName === 'ol';
    const content = $element.html() || '';

    return {
      blockName: 'core/list',
      attrs: { ordered },
      innerHTML: `<${tagName}>${content}</${tagName}>`,
      innerBlocks: [],
    };
  }

  /**
   * Create quote block
   */
  private createQuoteBlock(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): GutenbergBlock {
    const content = $element.html() || '';

    return {
      blockName: 'core/quote',
      attrs: {},
      innerHTML: `<blockquote class="wp-block-quote">${content}</blockquote>`,
      innerBlocks: [],
    };
  }

  /**
   * Create code block
   */
  private createCodeBlock(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): GutenbergBlock {
    const content = $element.text() || '';

    return {
      blockName: 'core/code',
      attrs: {},
      innerHTML: `<pre class="wp-block-code"><code>${this.escapeHtml(content)}</code></pre>`,
      innerBlocks: [],
    };
  }

  /**
   * Create video block
   */
  private createVideoBlock(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): GutenbergBlock {
    const src = $element.attr('src') || $element.find('source').attr('src') || '';

    return {
      blockName: 'core/video',
      attrs: { src },
      innerHTML: `<figure class="wp-block-video"><video controls src="${src}"></video></figure>`,
      innerBlocks: [],
    };
  }

  /**
   * Create embed block (YouTube, Vimeo, etc.)
   */
  private createEmbedBlock(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): GutenbergBlock {
    const src = $element.attr('src') || '';

    let provider = 'generic';
    let blockName = 'core/embed';

    if (src.includes('youtube.com') || src.includes('youtu.be')) {
      provider = 'youtube';
      blockName = 'core/embed';
    } else if (src.includes('vimeo.com')) {
      provider = 'vimeo';
      blockName = 'core/embed';
    }

    return {
      blockName,
      attrs: {
        url: src,
        type: 'video',
        providerNameSlug: provider,
      },
      innerHTML: `<figure class="wp-block-embed is-type-video is-provider-${provider} wp-block-embed-${provider}">
  <div class="wp-block-embed__wrapper">${src}</div>
</figure>`,
      innerBlocks: [],
    };
  }

  /**
   * Create separator block
   */
  private createSeparatorBlock(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): GutenbergBlock {
    return {
      blockName: 'core/separator',
      attrs: {},
      innerHTML: '<hr class="wp-block-separator has-alpha-channel-opacity"/>',
      innerBlocks: [],
    };
  }

  /**
   * Create spacer block
   */
  private createSpacerBlock(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): GutenbergBlock {
    return {
      blockName: 'core/spacer',
      attrs: { height: '50px' },
      innerHTML: '<div style="height:50px" aria-hidden="true" class="wp-block-spacer"></div>',
      innerBlocks: [],
    };
  }

  /**
   * Create columns block
   */
  private createColumnsBlock(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): GutenbergBlock {
    const columns: GutenbergBlock[] = [];

    // Find column elements
    $element.children().each((_, col) => {
      const $col = $(col);
      const columnContent: GutenbergBlock[] = [];

      // Process column children
      $col.children().each((_, child) => {
        const block = this.elementToBlock($, $(child));
        if (block) {
          columnContent.push(block);
        }
      });

      columns.push({
        blockName: 'core/column',
        attrs: {},
        innerHTML: '',
        innerBlocks: columnContent,
      });
    });

    return {
      blockName: 'core/columns',
      attrs: {},
      innerHTML: '',
      innerBlocks: columns,
    };
  }

  /**
   * Create group block
   */
  private createGroupBlock(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): GutenbergBlock {
    const innerBlocks: GutenbergBlock[] = [];

    $element.children().each((_, child) => {
      const block = this.elementToBlock($, $(child));
      if (block) {
        innerBlocks.push(block);
      }
    });

    return {
      blockName: 'core/group',
      attrs: {},
      innerHTML: '',
      innerBlocks,
    };
  }

  /**
   * Create cover block (hero sections)
   */
  private createCoverBlock(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): GutenbergBlock {
    const bgImage = $element.css('background-image')?.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1];
    const innerBlocks: GutenbergBlock[] = [];

    $element.children().each((_, child) => {
      const block = this.elementToBlock($, $(child));
      if (block) {
        innerBlocks.push(block);
      }
    });

    return {
      blockName: 'core/cover',
      attrs: bgImage ? { url: bgImage } : {},
      innerHTML: '',
      innerBlocks,
    };
  }

  /**
   * Create media & text block
   */
  private createMediaTextBlock(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): GutenbergBlock {
    const img = $element.find('img').first();
    const mediaUrl = img.attr('src') || '';

    return {
      blockName: 'core/media-text',
      attrs: { mediaUrl, mediaType: 'image' },
      innerHTML: '',
      innerBlocks: [],
    };
  }

  /**
   * Create table block
   */
  private createTableBlock(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): GutenbergBlock {
    const tableHtml = $.html($element);

    return {
      blockName: 'core/table',
      attrs: {},
      innerHTML: `<figure class="wp-block-table">${tableHtml}</figure>`,
      innerBlocks: [],
    };
  }

  /**
   * Create HTML block (fallback)
   */
  private createHTMLBlock(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): GutenbergBlock {
    return {
      blockName: 'core/html',
      attrs: {},
      innerHTML: $.html($element) || '',
      innerBlocks: [],
    };
  }

  /**
   * Check if element is a columns container
   */
  private isColumnsContainer(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): boolean {
    const classes = $element.attr('class') || '';
    const children = $element.children();

    // Check for Bootstrap/common column patterns
    if (classes.includes('row') && children.length > 1) {
      return true;
    }

    // Check if children have column classes
    let hasColumns = false;
    children.each((_, child) => {
      const childClasses = $(child).attr('class') || '';
      if (childClasses.includes('col')) {
        hasColumns = true;
      }
    });

    return hasColumns;
  }

  /**
   * Check if element is a group container
   */
  private isGroupContainer(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): boolean {
    const classes = $element.attr('class') || '';
    const tagName = $element.prop('tagName')?.toLowerCase();

    return (
      (tagName === 'div' || tagName === 'section') &&
      (classes.includes('container') || classes.includes('wrapper') || classes.includes('group')) &&
      !this.isColumnsContainer($, $element)
    );
  }

  /**
   * Check if element contains media & text pattern
   */
  private isMediaTextContainer(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<cheerio.Element>
  ): boolean {
    const img = $element.find('img');
    const text = $element.find('p, h1, h2, h3, h4, h5, h6');

    return img.length > 0 && text.length > 0 && $element.children().length === 2;
  }

  /**
   * Get text alignment
   */
  private getAlignment($element: cheerio.Cheerio<cheerio.Element>): string {
    const classes = $element.attr('class') || '';

    if (classes.includes('text-center') || classes.includes('center')) {
      return 'center';
    }
    if (classes.includes('text-right') || classes.includes('right')) {
      return 'right';
    }

    return 'left';
  }

  /**
   * Escape HTML for code blocks
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Serialize blocks to Gutenberg HTML format
   */
  private serializeBlocks(blocks: GutenbergBlock[]): string {
    return blocks.map(block => this.serializeBlock(block)).join('\n\n');
  }

  /**
   * Serialize single block
   */
  private serializeBlock(block: GutenbergBlock, indent: string = ''): string {
    const attrsStr = Object.keys(block.attrs).length > 0
      ? ` ${JSON.stringify(block.attrs)}`
      : '';

    if (block.innerBlocks && block.innerBlocks.length > 0) {
      const innerContent = block.innerBlocks
        .map(inner => this.serializeBlock(inner, indent + '  '))
        .join('\n\n');

      return `${indent}<!-- wp:${block.blockName}${attrsStr} -->
${indent}${block.innerHTML}
${innerContent}
${indent}<!-- /wp:${block.blockName} -->`;
    }

    return `${indent}<!-- wp:${block.blockName}${attrsStr} -->
${indent}${block.innerHTML}
${indent}<!-- /wp:${block.blockName} -->`;
  }

  /**
   * Generate import instructions
   */
  private generateInstructions(): string {
    return `# Gutenberg Import Instructions

Follow these steps to import the blocks into WordPress:

## Method 1: Direct Import (Recommended)

1. Log in to your WordPress admin panel
2. Go to **Pages > Add New** or **Posts > Add New**
3. Click the **three dots menu (⋮)** in the top right corner
4. Select **"Code editor"**
5. Delete any default content
6. Open the \`blocks.html\` file from this export
7. Copy ALL content from \`blocks.html\`
8. Paste into the WordPress code editor
9. Click **"Visual editor"** to return to the normal view
10. Publish or update your page/post

## Method 2: Block-by-Block Import

1. Create a new page/post
2. For each block in \`blocks.html\`:
   - Copy the block code (from \`<!-- wp:block-name -->\` to \`<!-- /wp:block-name -->\`)
   - Switch to Code editor in WordPress
   - Paste the block
   - Switch back to Visual editor
   - Verify the block appears correctly

## Adding Custom Styles

If your export includes custom CSS files:

1. Go to **Appearance > Customize > Additional CSS**
2. Open each CSS file from \`assets/css/\`
3. Copy the CSS content
4. Paste into the Additional CSS panel
5. Click **Publish**

## Adding Custom Scripts

If your export includes JavaScript files:

1. Install a plugin like "Simple Custom CSS and JS" or "Code Snippets"
2. Create a new snippet
3. Copy content from each JS file in \`assets/js/\`
4. Paste into the snippet
5. Save and activate

## Troubleshooting

- **Blocks don't appear**: Make sure you're using the Code editor, not the Classic editor
- **Styles don't match**: Add the custom CSS from the assets folder
- **Layout issues**: Check if your theme conflicts with block styles
- **Missing blocks**: Ensure you're running WordPress 5.0+ with Gutenberg editor

## Support

For help with WordPress Gutenberg blocks, visit:
- https://wordpress.org/support/article/wordpress-editor/
- https://wordpress.org/support/forum/how-to-and-troubleshooting/
`;
  }

  /**
   * Generate README
   */
  private generateReadme(): string {
    return `# Gutenberg Blocks Export

This export contains WordPress Gutenberg (Block Editor) blocks converted from your cloned website.

## What's Included

- \`blocks.html\` - Gutenberg blocks ready to import
- \`assets/css/\` - Custom CSS files
- \`assets/js/\` - Custom JavaScript files
- \`IMPORT_INSTRUCTIONS.md\` - Detailed import guide

## Features

- ✅ Native WordPress blocks
- ✅ No plugins required
- ✅ Fully editable in WordPress
- ✅ Responsive design
- ✅ Compatible with all WordPress themes
- ✅ Supports all major block types:
  - Headings
  - Paragraphs
  - Images
  - Buttons
  - Lists
  - Quotes
  - Code
  - Videos
  - Embeds (YouTube, Vimeo)
  - Columns
  - Groups
  - Cover blocks
  - Media & Text
  - Tables
  - Separators
  - Spacers

## Requirements

- WordPress 5.0 or higher
- Gutenberg editor (default in WordPress 5.0+)

## Quick Start

1. Read \`IMPORT_INSTRUCTIONS.md\`
2. Create a new page in WordPress
3. Switch to Code editor
4. Paste content from \`blocks.html\`
5. Switch back to Visual editor
6. Publish!

## Customization

All blocks can be edited directly in the WordPress editor:
- Click any block to edit
- Use the block toolbar for formatting
- Add/remove blocks as needed
- Adjust spacing and layout
- Change colors and typography

## Support

For WordPress Gutenberg support:
- Official docs: https://wordpress.org/support/article/wordpress-editor/
- Forums: https://wordpress.org/support/

---

**Generated by Website Cloner Pro**
`;
  }
}
