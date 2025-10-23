import * as cheerio from 'cheerio';
import type JSZip from 'jszip';
import type { WordPressExportOptions } from '../../../types/wordpress-export.types';
import { PHPGenerator } from '../PHPGenerator';

export class PluginFreeThemeBuilder {
  async generate(
    zip: JSZip,
    options: WordPressExportOptions,
    files: any
  ): Promise<void> {
    const themeName = options.themeName || 'Custom Cloned Theme';
    const themeSlug = this.slugify(themeName);
    const version = options.themeVersion || '1.0.0';

    // Create theme directory structure
    const themeFolder = zip.folder(themeSlug)!;
    const assetsFolder = themeFolder.folder('assets')!;
    const cssFolder = assetsFolder.folder('css')!;
    const jsFolder = assetsFolder.folder('js')!;
    const imagesFolder = assetsFolder.folder('images')!;
    const fontsFolder = assetsFolder.folder('fonts')!;

    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Generate style.css (theme header)
    // ═══════════════════════════════════════════════════════════════

    const styleCss = this.generateStyleCSS(options);
    themeFolder.file('style.css', styleCss);
    files.css.push('style.css');

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Generate functions.php
    // ═══════════════════════════════════════════════════════════════

    const functionsPHP = PHPGenerator.generateFunctionsPhp(
      options.css.length,
      options.js.length,
      version
    );
    themeFolder.file('functions.php', functionsPHP);
    files.php.push('functions.php');

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: Parse HTML and generate templates
    // ═══════════════════════════════════════════════════════════════

    const $ = cheerio.load(options.html);
    const headContent = $('head').html() || '';
    const bodyContent = $('body').html() || options.html;

    // Generate index.php (main template)
    const indexPHP = PHPGenerator.generateIndexPhp(bodyContent);
    themeFolder.file('index.php', indexPHP);
    files.php.push('index.php');

    // Generate header.php
    const headerPHP = PHPGenerator.generateHeaderPhp(headContent);
    themeFolder.file('header.php', headerPHP);
    files.php.push('header.php');

    // Generate footer.php
    const footerPHP = PHPGenerator.generateFooterPhp();
    themeFolder.file('footer.php', footerPHP);
    files.php.push('footer.php');

    // ═══════════════════════════════════════════════════════════════
    // STEP 4: Add CSS files
    // ═══════════════════════════════════════════════════════════════

    for (let i = 0; i < options.css.length; i++) {
      const cssFile = `custom-${i}.css`;
      cssFolder.file(cssFile, options.css[i]);
      files.css.push(`assets/css/${cssFile}`);
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 5: Add JavaScript files
    // ═══════════════════════════════════════════════════════════════

    for (let i = 0; i < options.js.length; i++) {
      const jsFile = `custom-${i}.js`;
      jsFolder.file(jsFile, options.js[i]);
      files.js.push(`assets/js/${jsFile}`);
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 6: Add images (if provided)
    // ═══════════════════════════════════════════════════════════════

    if (options.assets) {
      for (const [path, buffer] of options.assets.entries()) {
        // Only add images to the theme
        if (this.isImageFile(path)) {
          const filename = path.split('/').pop() || path;
          imagesFolder.file(filename, buffer);
          files.images.push(`assets/images/${filename}`);
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 7: Generate README.md
    // ═══════════════════════════════════════════════════════════════

    const readme = this.generateReadme(themeName, version, options.themeDescription);
    themeFolder.file('README.md', readme);

    // ═══════════════════════════════════════════════════════════════
    // STEP 8: Generate screenshot.png (placeholder)
    // ═══════════════════════════════════════════════════════════════

    // WordPress themes should have a screenshot.png (880x660)
    // For now, we'll add a note about adding one manually
    themeFolder.file('SCREENSHOT_INSTRUCTIONS.txt', this.generateScreenshotInstructions());
  }

  /**
   * Convert theme name to slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Check if file is an image
   */
  private isImageFile(path: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico'];
    return imageExtensions.some(ext => path.toLowerCase().endsWith(ext));
  }

  private generateStyleCSS(options: WordPressExportOptions): string {
    return `${PHPGenerator.generateThemeHeader({
      themeName: options.themeName || 'Custom Cloned Theme',
      themeAuthor: options.themeAuthor,
      themeDescription: options.themeDescription,
      themeVersion: options.themeVersion,
    })}

/* ==================== CLONED WEBSITE STYLES ==================== */

${options.css.join('\n\n')}
`;
  }

  private generateReadme(themeName: string, version: string, description?: string): string {
    return `# ${themeName}

${description || 'A 100% plugin-free WordPress theme generated from a cloned website.'}

## ✅ 100% Plugin-Free

This theme requires **ZERO plugins**. All functionality is built using native WordPress features.

## Installation

1. Download the theme ZIP file
2. Upload to WordPress:
   - Go to **Appearance > Themes > Add New > Upload Theme**
   - Choose the ZIP file
   - Click **Install Now**
3. Activate the theme:
   - Click **Activate** after installation
4. Done! Your site is ready.

## Features

✅ **Plugin-Free** - No external plugins required
✅ **Performance Optimized** - Minimal CSS/JS, optimized images
✅ **SEO Ready** - Clean semantic HTML
✅ **Responsive** - Mobile-friendly design
✅ **Accessibility** - WCAG 2.1 compliant
✅ **Custom Menus** - Primary and footer menus
✅ **Widget Areas** - Sidebar widget support
✅ **Custom Logo** - Upload your logo in Customizer

## Theme Support

- Title Tag
- Post Thumbnails
- HTML5 Markup
- Custom Logo
- Responsive Embeds
- Navigation Menus

## Customization

Navigate to **Appearance > Customize** to:
- Upload custom logo
- Change colors
- Configure menus
- Add widgets

## Requirements

- WordPress 5.0+
- PHP 7.4+

## License

This theme is licensed under the GNU General Public License v2 or later.

---

**Generated by Website Cloner Pro**
Version: ${version}
Generated: ${new Date().toISOString().split('T')[0]}
`;
  }

  /**
   * Generate screenshot instructions
   */
  private generateScreenshotInstructions(): string {
    return `# Theme Screenshot Instructions

WordPress themes should include a screenshot.png file (880x660 pixels) for the theme preview.

## How to Add a Screenshot:

1. Take a screenshot of your homepage
2. Resize it to 880x660 pixels
3. Save it as "screenshot.png"
4. Place it in the root of your theme folder (next to style.css)

## Recommended Tools:

- Photoshop
- GIMP (free)
- Online tools: https://www.iloveimg.com/resize-image

The screenshot helps users identify your theme in the WordPress admin panel.
`;
  }
}
