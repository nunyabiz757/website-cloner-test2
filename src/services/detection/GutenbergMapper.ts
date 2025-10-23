import type {
  RecognizedComponent,
  GutenbergBlock,
  GutenbergExport,
} from '../../types/detection.types';

export class GutenbergMapper {
  mapToBlock(component: RecognizedComponent): GutenbergBlock {
    const blockName = this.getBlockName(component.componentType);
    const attrs = this.mapAttributes(component);
    const innerHTML = this.generateInnerHTML(component);

    return {
      blockName,
      attrs,
      innerHTML,
      innerBlocks: [],
    };
  }

  private getBlockName(componentType: string): string {
    const mapping: Record<string, string> = {
      // Basic
      button: 'core/button',
      heading: 'core/heading',
      paragraph: 'core/paragraph',
      text: 'core/paragraph',
      image: 'core/image',
      spacer: 'core/spacer',
      divider: 'core/separator',

      // Content
      blockquote: 'core/quote',
      testimonial: 'core/quote',
      'code-block': 'core/code',

      // Media
      gallery: 'core/gallery',
      video: 'core/video',
      'video-embed': 'core/embed',

      // Data
      table: 'core/table',
      list: 'core/list',

      // Navigation
      'search-bar': 'core/search',
      'social-share': 'core/social-links',
      'social-icons': 'core/social-links',

      // Form
      form: 'core/html',
      input: 'core/html',
      textarea: 'core/html',
      select: 'core/html',

      // Interactive (use HTML block for complex components)
      accordion: 'core/html',
      tabs: 'core/html',
      carousel: 'core/html',
      modal: 'core/html',
      alert: 'core/html',

      // Content blocks
      'icon-box': 'core/group',
      'feature-box': 'core/group',
      'pricing-table': 'core/table',
      'team-member': 'core/group',
      'blog-card': 'core/group',
      'product-card': 'core/group',
      card: 'core/group',

      // Data components
      'progress-bar': 'core/html',
      counter: 'core/html',
      countdown: 'core/html',
      'star-rating': 'core/html',

      // Unknown
      unknown: 'core/html',
    };

    return mapping[componentType] || 'core/html';
  }

  private mapAttributes(component: RecognizedComponent): Record<string, any> {
    switch (component.componentType) {
      case 'button':
        return this.mapButton(component);
      case 'heading':
        return this.mapHeading(component);
      case 'paragraph':
      case 'text':
        return this.mapParagraph(component);
      case 'image':
        return this.mapImage(component);
      case 'spacer':
        return this.mapSpacer(component);
      default:
        return {};
    }
  }

  private mapButton(component: RecognizedComponent): Record<string, any> {
    const styles = component.element.styles;

    return {
      url: component.props.href || '',
      text: component.element.textContent || 'Button',
      linkTarget: component.props.target === '_blank' ? '_blank' : undefined,
      backgroundColor: this.extractColorName(styles.backgroundColor),
      textColor: this.extractColorName(styles.color),
      className: component.element.classes.join(' '),
    };
  }

  private mapHeading(component: RecognizedComponent): Record<string, any> {
    const tagName = component.element.tagName.toLowerCase();
    const level = parseInt(tagName.replace('h', '')) || 2;

    return {
      level,
      content: component.element.textContent || '',
      textAlign: component.element.styles.textAlign,
      className: component.element.classes.join(' '),
    };
  }

  private mapParagraph(component: RecognizedComponent): Record<string, any> {
    return {
      content: component.element.innerHTML || component.element.textContent || '',
      align: component.element.styles.textAlign,
      className: component.element.classes.join(' '),
    };
  }

  private mapImage(component: RecognizedComponent): Record<string, any> {
    return {
      url: component.props.src || '',
      alt: component.props.alt || '',
      caption: '',
      className: component.element.classes.join(' '),
    };
  }

  private mapSpacer(component: RecognizedComponent): Record<string, any> {
    const height = parseInt(component.element.styles.height || '50');

    return {
      height,
    };
  }

  private generateInnerHTML(component: RecognizedComponent): string {
    switch (component.componentType) {
      case 'button':
        return `<div class="wp-block-button"><a class="wp-block-button__link" href="${component.props.href || ''}">${component.element.textContent || 'Button'}</a></div>`;

      case 'heading':
        const level = component.element.tagName.toLowerCase();
        return `<${level} class="wp-block-heading">${component.element.textContent || ''}</${level}>`;

      case 'paragraph':
      case 'text':
        return `<p>${component.element.textContent || ''}</p>`;

      case 'image':
        return `<figure class="wp-block-image"><img src="${component.props.src || ''}" alt="${component.props.alt || ''}"/></figure>`;

      default:
        return component.element.innerHTML || '';
    }
  }

  private extractColorName(color?: string): string | undefined {
    if (!color) return undefined;

    const colorMap: Record<string, string> = {
      'rgb(0, 123, 255)': 'primary',
      'rgb(108, 117, 125)': 'secondary',
      'rgb(40, 167, 69)': 'success',
      'rgb(220, 53, 69)': 'danger',
      'rgb(255, 193, 7)': 'warning',
      'rgb(23, 162, 184)': 'info',
    };

    return colorMap[color];
  }

  buildExport(components: RecognizedComponent[], title: string): GutenbergExport {
    const blocks = components.map(c => this.mapToBlock(c));
    const content = this.generateGutenbergHTML(blocks);

    return {
      title,
      content,
      blocks,
    };
  }

  private generateGutenbergHTML(blocks: GutenbergBlock[]): string {
    return blocks.map(block => {
      const attrsString = Object.keys(block.attrs).length > 0
        ? ' ' + JSON.stringify(block.attrs)
        : '';

      return `<!-- wp:${block.blockName}${attrsString} -->
${block.innerHTML || ''}
<!-- /wp:${block.blockName} -->`;
    }).join('\n\n');
  }
}

export default new GutenbergMapper();
