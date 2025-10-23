import type {
  RecognizedComponent,
  ElementorWidget,
  ElementorExport,
  ElementorSection,
  ElementorColumn,
} from '../../types/detection.types';

export class ElementorMapper {
  mapToWidget(component: RecognizedComponent): ElementorWidget {
    const widgetType = this.getWidgetType(component.componentType);
    const settings = this.mapSettings(component);

    return {
      id: this.generateId(),
      elType: 'widget',
      widgetType,
      settings,
    };
  }

  private getWidgetType(componentType: string): string {
    const mapping: Record<string, string> = {
      // Basic
      button: 'button',
      heading: 'heading',
      text: 'text-editor',
      paragraph: 'text-editor',
      image: 'image',
      icon: 'icon',
      spacer: 'spacer',
      divider: 'divider',

      // Content
      'icon-box': 'icon-box',
      'star-rating': 'star-rating',
      testimonial: 'testimonial',
      'pricing-table': 'pricing-table',
      cta: 'button',
      'feature-box': 'icon-box',
      'team-member': 'image-box',
      'blog-card': 'post',
      'product-card': 'woocommerce-product',

      // Form
      form: 'form',
      input: 'text-field',
      textarea: 'textarea',
      select: 'select',
      checkbox: 'checkbox',
      radio: 'radio',
      'file-upload': 'file-upload',

      // Interactive
      modal: 'popup',
      accordion: 'accordion',
      tabs: 'tabs',
      toggle: 'toggle',
      carousel: 'image-carousel',
      gallery: 'image-gallery',
      alert: 'alert',
      'flip-box': 'flip-box',

      // Media
      video: 'video',
      'video-embed': 'video',
      maps: 'google_maps',
      'social-feed': 'social-feed',

      // Navigation
      breadcrumbs: 'breadcrumbs',
      pagination: 'pagination',
      'search-bar': 'search-form',

      // Data
      table: 'table',
      list: 'icon-list',
      'progress-bar': 'progress',
      counter: 'counter',
      countdown: 'countdown',

      // Text
      blockquote: 'blockquote',
      'code-block': 'code',

      // Social
      'social-icons': 'social-icons',
      'social-share': 'share-buttons',

      // Unknown
      unknown: 'html',
    };

    return mapping[componentType] || 'html';
  }

  private mapSettings(component: RecognizedComponent): Record<string, any> {
    switch (component.componentType) {
      case 'button':
        return this.mapButton(component);
      case 'heading':
        return this.mapHeading(component);
      case 'image':
        return this.mapImage(component);
      case 'icon-box':
        return this.mapIconBox(component);
      case 'testimonial':
        return this.mapTestimonial(component);
      default:
        return this.mapGeneric(component);
    }
  }

  private mapButton(component: RecognizedComponent): Record<string, any> {
    const styles = component.element.styles;

    return {
      text: component.props.textContent || 'Button',
      link: component.props.href ? {
        url: component.props.href,
        is_external: component.props.target === '_blank' ? 'on' : '',
        nofollow: '',
      } : {},
      button_background_color: styles.backgroundColor,
      button_text_color: styles.color,
      typography_font_size: styles.fontSize ? { size: parseFloat(styles.fontSize), unit: 'px' } : undefined,
      typography_font_weight: styles.fontWeight,
      button_padding: styles.padding ? {
        top: styles.padding.top,
        right: styles.padding.right,
        bottom: styles.padding.bottom,
        left: styles.padding.left,
        unit: 'px',
        isLinked: false,
      } : undefined,
      border_radius: styles.borderRadius ? {
        size: parseFloat(styles.borderRadius.topLeft),
        unit: 'px',
      } : undefined,
      align: styles.textAlign,
    };
  }

  private mapHeading(component: RecognizedComponent): Record<string, any> {
    const styles = component.element.styles;
    const tagName = component.element.tagName.toLowerCase();

    return {
      title: component.element.textContent || '',
      header_size: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName) ? tagName : 'h2',
      title_color: styles.color,
      typography_font_size: styles.fontSize ? { size: parseFloat(styles.fontSize), unit: 'px' } : undefined,
      typography_font_family: styles.fontFamily,
      typography_font_weight: styles.fontWeight,
      typography_line_height: styles.lineHeight ? { size: parseFloat(styles.lineHeight), unit: '' } : undefined,
      align: styles.textAlign,
    };
  }

  private mapImage(component: RecognizedComponent): Record<string, any> {
    const styles = component.element.styles;

    return {
      image: component.props.src ? {
        url: component.props.src,
        id: '',
      } : {},
      image_alt: component.props.alt || '',
      image_size: 'custom',
      image_custom_dimension: styles.width ? {
        width: parseFloat(styles.width),
        height: parseFloat(styles.height || '0'),
      } : undefined,
      image_border_radius: styles.borderRadius ? {
        size: parseFloat(styles.borderRadius.topLeft),
        unit: 'px',
      } : undefined,
      link: component.props.href ? {
        url: component.props.href,
        is_external: component.props.target === '_blank' ? 'on' : '',
      } : {},
    };
  }

  private mapIconBox(component: RecognizedComponent): Record<string, any> {
    const icon = this.extractIcon(component);
    const title = this.extractTitle(component);
    const description = this.extractDescription(component);

    return {
      selected_icon: {
        value: icon,
        library: this.detectIconLibrary(icon),
      },
      icon_color: '#000000',
      icon_size: { size: 50, unit: 'px' },
      title_text: title,
      title_color: '#000000',
      typography_font_size: { size: 24, unit: 'px' },
      description_text: description,
      description_color: '#666666',
      position: 'top',
    };
  }

  private mapTestimonial(component: RecognizedComponent): Record<string, any> {
    const content = this.extractDescription(component);
    const name = this.extractTitle(component);

    return {
      testimonial_content: content,
      testimonial_name: name,
      testimonial_job: '',
      testimonial_image: {},
      testimonial_alignment: 'center',
    };
  }

  private mapGeneric(component: RecognizedComponent): Record<string, any> {
    return {
      html: component.element.innerHTML || '',
    };
  }

  private extractIcon(component: RecognizedComponent): string {
    const html = component.element.innerHTML || '';

    const faMatch = html.match(/<i[^>]*class="[^"]*fa-([^"\s]+)/);
    if (faMatch) return `fas fa-${faMatch[1]}`;

    if (html.includes('<svg')) return html.match(/<svg[^>]*>.*?<\/svg>/)?.[0] || '';

    return 'fas fa-star';
  }

  private extractTitle(component: RecognizedComponent): string {
    const html = component.element.innerHTML || '';
    const titleMatch = html.match(/<h[2-6][^>]*>(.*?)<\/h[2-6]>/);
    return titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '') : '';
  }

  private extractDescription(component: RecognizedComponent): string {
    const html = component.element.innerHTML || '';
    const descMatch = html.match(/<p[^>]*>(.*?)<\/p>/);
    return descMatch ? descMatch[1].replace(/<[^>]*>/g, '') : '';
  }

  private detectIconLibrary(icon: string): string {
    if (icon.startsWith('fas')) return 'fa-solid';
    if (icon.startsWith('far')) return 'fa-regular';
    if (icon.startsWith('fab')) return 'fa-brands';
    if (icon.startsWith('<svg')) return 'svg';
    return 'fa-solid';
  }

  buildExport(widgets: ElementorWidget[], title: string): ElementorExport {
    const sections = this.groupIntoSections(widgets);

    return {
      version: '3.16.0',
      title,
      type: 'page',
      content: sections,
    };
  }

  private groupIntoSections(widgets: ElementorWidget[]): ElementorSection[] {
    const column: ElementorColumn = {
      id: this.generateId(),
      elType: 'column',
      settings: { _column_size: 100 },
      elements: widgets,
    };

    const section: ElementorSection = {
      id: this.generateId(),
      elType: 'section',
      settings: {
        layout: 'boxed',
        gap: 'default',
      },
      elements: [column],
    };

    return [section];
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }
}

export default new ElementorMapper();
