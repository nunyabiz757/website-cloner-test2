export class GutenbergService {
  convertToGutenberg(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    let gutenbergContent = '';

    doc.body.childNodes.forEach((node) => {
      gutenbergContent += this.convertNode(node);
    });

    return gutenbergContent;
  }

  private convertNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      return text ? `<!-- wp:paragraph -->\n<p>${text}</p>\n<!-- /wp:paragraph -->\n\n` : '';
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    const el = node as Element;
    const tagName = el.tagName.toLowerCase();

    switch (tagName) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return this.convertHeading(el);

      case 'p':
        return this.convertParagraph(el);

      case 'img':
        return this.convertImage(el);

      case 'a':
        if (this.isButton(el)) {
          return this.convertButton(el);
        }
        return this.convertParagraph(el);

      case 'button':
        return this.convertButton(el);

      case 'ul':
      case 'ol':
        return this.convertList(el);

      case 'blockquote':
        return this.convertQuote(el);

      case 'video':
        return this.convertVideo(el);

      case 'div':
      case 'section':
        return this.convertContainer(el);

      default:
        let content = '';
        el.childNodes.forEach((child) => {
          content += this.convertNode(child);
        });
        return content;
    }
  }

  private convertHeading(el: Element): string {
    const level = parseInt(el.tagName[1], 10);
    const text = el.textContent?.trim() || '';
    const align = this.getAlignment(el);

    const attrs = JSON.stringify({ level, textAlign: align !== 'left' ? align : undefined });

    return `<!-- wp:heading ${attrs} -->\n<${el.tagName.toLowerCase()} class="wp-block-heading${align !== 'left' ? ` has-text-align-${align}` : ''}">${text}</${el.tagName.toLowerCase()}>\n<!-- /wp:heading -->\n\n`;
  }

  private convertParagraph(el: Element): string {
    const text = el.innerHTML.trim();
    if (!text) return '';

    return `<!-- wp:paragraph -->\n<p>${text}</p>\n<!-- /wp:paragraph -->\n\n`;
  }

  private convertImage(el: Element): string {
    const img = el as HTMLImageElement;
    const attrs = JSON.stringify({
      id: undefined,
      sizeSlug: 'large',
      linkDestination: 'none',
    });

    return `<!-- wp:image ${attrs} -->\n<figure class="wp-block-image size-large"><img src="${img.src}" alt="${img.alt || ''}"/></figure>\n<!-- /wp:image -->\n\n`;
  }

  private convertButton(el: Element): string {
    const text = el.textContent?.trim() || 'Button';
    const href = el.getAttribute('href') || '#';
    const align = this.getAlignment(el);

    return `<!-- wp:button {"align":"${align}"} -->\n<div class="wp-block-button align${align}"><a class="wp-block-button__link" href="${href}">${text}</a></div>\n<!-- /wp:button -->\n\n`;
  }

  private convertList(el: Element): string {
    const type = el.tagName.toLowerCase() === 'ul' ? 'list' : 'list';
    const ordered = el.tagName.toLowerCase() === 'ol';

    let content = `<!-- wp:list ${JSON.stringify({ ordered })} -->\n<${el.tagName.toLowerCase()}>\n`;

    el.querySelectorAll('li').forEach((li) => {
      content += `<li>${li.innerHTML}</li>\n`;
    });

    content += `</${el.tagName.toLowerCase()}>\n<!-- /wp:list -->\n\n`;

    return content;
  }

  private convertQuote(el: Element): string {
    const text = el.innerHTML.trim();

    return `<!-- wp:quote -->\n<blockquote class="wp-block-quote"><p>${text}</p></blockquote>\n<!-- /wp:quote -->\n\n`;
  }

  private convertVideo(el: Element): string {
    const video = el as HTMLVideoElement;
    const src = video.src || video.querySelector('source')?.src || '';

    return `<!-- wp:video -->\n<figure class="wp-block-video"><video controls src="${src}"></video></figure>\n<!-- /wp:video -->\n\n`;
  }

  private convertContainer(el: Element): string {
    const children = Array.from(el.children);

    if (children.length > 1 && this.looksLikeColumns(children)) {
      return this.convertColumns(children);
    }

    if (this.looksLikeGroup(el)) {
      return this.convertGroup(el);
    }

    let content = '';
    el.childNodes.forEach((child) => {
      content += this.convertNode(child);
    });
    return content;
  }

  private convertColumns(columns: Element[]): string {
    let content = `<!-- wp:columns -->\n<div class="wp-block-columns">\n`;

    columns.forEach((col) => {
      content += `<!-- wp:column -->\n<div class="wp-block-column">\n`;

      col.childNodes.forEach((child) => {
        content += this.convertNode(child);
      });

      content += `</div>\n<!-- /wp:column -->\n\n`;
    });

    content += `</div>\n<!-- /wp:columns -->\n\n`;

    return content;
  }

  private convertGroup(el: Element): string {
    let content = `<!-- wp:group -->\n<div class="wp-block-group">\n`;

    el.childNodes.forEach((child) => {
      content += this.convertNode(child);
    });

    content += `</div>\n<!-- /wp:group -->\n\n`;

    return content;
  }

  private looksLikeColumns(children: Element[]): boolean {
    if (children.length < 2 || children.length > 6) return false;

    const classes = Array.from(children[0].classList).join(' ');
    return classes.includes('col') || classes.includes('column');
  }

  private looksLikeGroup(el: Element): boolean {
    const classes = Array.from(el.classList).join(' ');
    return classes.includes('group') || classes.includes('wrapper') || classes.includes('container');
  }

  private isButton(el: Element): boolean {
    const classes = Array.from(el.classList).join(' ');
    return classes.includes('button') || classes.includes('btn');
  }

  private getAlignment(el: Element): string {
    const styles = window.getComputedStyle(el);
    const textAlign = styles.textAlign;

    if (textAlign === 'center') return 'center';
    if (textAlign === 'right') return 'right';
    return 'left';
  }

  generateImportInstructions(): string {
    return `
# Gutenberg Import Instructions

1. Log in to your WordPress admin panel
2. Go to Pages > Add New or Posts > Add New
3. Click the three dots menu (⋮) in the top right
4. Select "Code editor"
5. Delete any default content
6. Paste the exported Gutenberg blocks
7. Click "Visual editor" to return to the normal view
8. Publish or update your page/post

The content will be imported as native Gutenberg blocks that you can edit directly.
    `.trim();
  }
}

export const gutenbergService = new GutenbergService();
