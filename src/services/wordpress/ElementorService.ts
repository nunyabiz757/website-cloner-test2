import type { ElementorSection, ElementorColumn, ElementorWidget, ElementorExport } from '../../types';

export class ElementorService {
  convertToElementor(html: string): ElementorExport {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const sections = this.detectSections(doc);

    return {
      content: sections,
      settings: {
        page_settings: {
          template: 'elementor_canvas',
        },
      },
      metadata: {
        version: '3.0.0',
        type: 'page',
        created: new Date().toISOString(),
      },
    };
  }

  private detectSections(doc: Document): ElementorSection[] {
    const sections: ElementorSection[] = [];

    const potentialSections = this.findSectionElements(doc);

    potentialSections.forEach((sectionEl, index) => {
      const section = this.createSection(sectionEl, `section-${index + 1}`);
      if (section) {
        sections.push(section);
      }
    });

    if (sections.length === 0) {
      const bodySection = this.createDefaultSection(doc.body);
      sections.push(bodySection);
    }

    return sections;
  }

  private findSectionElements(doc: Document): Element[] {
    const selectors = [
      'section',
      '[class*="section"]',
      '[class*="container"]',
      '.hero',
      '.banner',
      'header',
      'main > div',
      '[class*="wrapper"]',
    ];

    const elements: Element[] = [];
    const seen = new Set<Element>();

    selectors.forEach((selector) => {
      doc.querySelectorAll(selector).forEach((el) => {
        if (!seen.has(el) && this.isValidSection(el)) {
          elements.push(el);
          seen.add(el);
        }
      });
    });

    return elements;
  }

  private isValidSection(el: Element): boolean {
    const text = el.textContent?.trim() || '';
    const children = el.children.length;

    return text.length > 20 && children > 0;
  }

  private createSection(el: Element, id: string): ElementorSection | null {
    const columns = this.detectColumns(el);

    if (columns.length === 0) {
      return null;
    }

    const styles = window.getComputedStyle(el);
    const bgColor = this.rgbToHex(styles.backgroundColor);

    return {
      id,
      elType: 'section',
      settings: {
        layout: 'boxed',
        gap: 'default',
        background_background: bgColor !== '#ffffff' ? 'classic' : undefined,
        background_color: bgColor !== '#ffffff' ? bgColor : undefined,
        padding: {
          top: this.parsePadding(styles.paddingTop),
          right: this.parsePadding(styles.paddingRight),
          bottom: this.parsePadding(styles.paddingBottom),
          left: this.parsePadding(styles.paddingLeft),
        },
      },
      elements: columns,
    };
  }

  private createDefaultSection(body: Element): ElementorSection {
    const column = this.createColumnFromElement(body, 'column-1');

    return {
      id: 'section-1',
      elType: 'section',
      settings: {
        layout: 'boxed',
        gap: 'default',
      },
      elements: [column],
    };
  }

  private detectColumns(sectionEl: Element): ElementorColumn[] {
    const columns: ElementorColumn[] = [];

    const columnSelectors = [
      '[class*="col-"]',
      '[class*="column"]',
      '.grid > div',
      '[class*="grid"] > div',
    ];

    let columnElements: Element[] = [];

    for (const selector of columnSelectors) {
      const found = Array.from(sectionEl.querySelectorAll(selector));
      if (found.length > 0 && found.length <= 4) {
        columnElements = found;
        break;
      }
    }

    if (columnElements.length === 0) {
      const singleColumn = this.createColumnFromElement(sectionEl, `column-1`);
      return [singleColumn];
    }

    const columnSize = Math.floor(100 / columnElements.length);

    columnElements.forEach((colEl, index) => {
      const column = this.createColumnFromElement(colEl, `column-${index + 1}`, columnSize);
      columns.push(column);
    });

    return columns;
  }

  private createColumnFromElement(el: Element, id: string, size: number = 100): ElementorColumn {
    const widgets = this.detectWidgets(el);

    return {
      id,
      elType: 'column',
      settings: {
        _column_size: size,
      },
      elements: widgets,
    };
  }

  private detectWidgets(el: Element): ElementorWidget[] {
    const widgets: ElementorWidget[] = [];

    el.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading, index) => {
      widgets.push(this.createHeadingWidget(heading, `heading-${index + 1}`));
    });

    el.querySelectorAll('p').forEach((p, index) => {
      if (p.textContent && p.textContent.trim().length > 0) {
        widgets.push(this.createTextWidget(p, `text-${index + 1}`));
      }
    });

    el.querySelectorAll('img').forEach((img, index) => {
      widgets.push(this.createImageWidget(img, `image-${index + 1}`));
    });

    el.querySelectorAll('a.button, button, .btn, [class*="button"]').forEach((btn, index) => {
      widgets.push(this.createButtonWidget(btn, `button-${index + 1}`));
    });

    el.querySelectorAll('.icon-box, [class*="feature"], [class*="service"]').forEach((box, index) => {
      const iconBox = this.createIconBoxWidget(box, `iconbox-${index + 1}`);
      if (iconBox) widgets.push(iconBox);
    });

    el.querySelectorAll('.testimonial, [class*="review"], [class*="testimony"]').forEach((test, index) => {
      const testimonial = this.createTestimonialWidget(test, `testimonial-${index + 1}`);
      if (testimonial) widgets.push(testimonial);
    });

    el.querySelectorAll('[class*="counter"], [data-count]').forEach((counter, index) => {
      widgets.push(this.createCounterWidget(counter, `counter-${index + 1}`));
    });

    el.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]').forEach((video, index) => {
      widgets.push(this.createVideoWidget(video, `video-${index + 1}`));
    });

    return widgets;
  }

  private createHeadingWidget(el: Element, id: string): ElementorWidget {
    const styles = window.getComputedStyle(el);
    const textAlign = styles.textAlign;
    const color = this.rgbToHex(styles.color);

    return {
      id,
      elType: 'widget',
      widgetType: 'heading',
      settings: {
        title: el.textContent?.trim() || '',
        tag: el.tagName.toLowerCase(),
        align: textAlign === 'center' || textAlign === 'right' ? textAlign : 'left',
        color: color !== '#000000' ? color : undefined,
      },
    };
  }

  private createTextWidget(el: Element, id: string): ElementorWidget {
    return {
      id,
      elType: 'widget',
      widgetType: 'text-editor',
      settings: {
        editor: el.innerHTML,
      },
    };
  }

  private createImageWidget(el: Element, id: string): ElementorWidget {
    const img = el as HTMLImageElement;
    return {
      id,
      elType: 'widget',
      widgetType: 'image',
      settings: {
        image: {
          url: img.src,
          alt: img.alt,
        },
        caption: img.title || '',
        link: {
          url: img.closest('a')?.getAttribute('href') || '',
        },
      },
    };
  }

  private createButtonWidget(el: Element, id: string): ElementorWidget {
    const href = el.getAttribute('href') || '#';
    const text = el.textContent?.trim() || 'Button';
    const styles = window.getComputedStyle(el);

    return {
      id,
      elType: 'widget',
      widgetType: 'button',
      settings: {
        text,
        link: { url: href },
        align: styles.textAlign === 'center' ? 'center' : 'left',
        size: this.detectButtonSize(el),
      },
    };
  }

  private createIconBoxWidget(el: Element, id: string): ElementorWidget | null {
    const icon = el.querySelector('i, svg');
    const title = el.querySelector('h3, h4, .title');
    const description = el.querySelector('p, .description');

    if (!title) return null;

    return {
      id,
      elType: 'widget',
      widgetType: 'icon-box',
      settings: {
        icon: icon ? this.extractIcon(icon) : { value: 'fas fa-star' },
        title_text: title.textContent?.trim() || '',
        description_text: description?.textContent?.trim() || '',
        position: 'top',
      },
    };
  }

  private createTestimonialWidget(el: Element, id: string): ElementorWidget | null {
    const content = el.querySelector('p, .content, .quote');
    const name = el.querySelector('.name, .author');
    const image = el.querySelector('img');

    if (!content) return null;

    return {
      id,
      elType: 'widget',
      widgetType: 'testimonial',
      settings: {
        testimonial_content: content.textContent?.trim() || '',
        testimonial_name: name?.textContent?.trim() || '',
        testimonial_image: image ? { url: (image as HTMLImageElement).src } : undefined,
      },
    };
  }

  private createCounterWidget(el: Element, id: string): ElementorWidget {
    const count = el.getAttribute('data-count') || el.textContent?.match(/\d+/)?.[0] || '100';
    const title = el.querySelector('.title')?.textContent?.trim() || '';

    return {
      id,
      elType: 'widget',
      widgetType: 'counter',
      settings: {
        ending_number: parseInt(count, 10),
        title,
        duration: 2000,
        thousand_separator: ',',
      },
    };
  }

  private createVideoWidget(el: Element, id: string): ElementorWidget {
    let videoUrl = '';
    let videoType = 'hosted';

    if (el.tagName === 'VIDEO') {
      const source = el.querySelector('source');
      videoUrl = (el as HTMLVideoElement).src || source?.src || '';
    } else if (el.tagName === 'IFRAME') {
      videoUrl = (el as HTMLIFrameElement).src;
      if (videoUrl.includes('youtube')) {
        videoType = 'youtube';
        const match = videoUrl.match(/(?:embed\/|v=)([^&?]+)/);
        videoUrl = match ? match[1] : videoUrl;
      } else if (videoUrl.includes('vimeo')) {
        videoType = 'vimeo';
        const match = videoUrl.match(/vimeo\.com\/(\d+)/);
        videoUrl = match ? match[1] : videoUrl;
      }
    }

    return {
      id,
      elType: 'widget',
      widgetType: 'video',
      settings: {
        video_type: videoType,
        [videoType === 'youtube' ? 'youtube_url' : videoType === 'vimeo' ? 'vimeo_url' : 'hosted_url']: videoUrl,
        autoplay: el.hasAttribute('autoplay'),
        mute: el.hasAttribute('muted'),
      },
    };
  }

  private extractIcon(el: Element): { value: string; library: string } {
    if (el.tagName === 'I') {
      const classes = Array.from(el.classList);
      const iconClass = classes.find((c) => c.startsWith('fa-'));
      return {
        value: iconClass ? `fas ${iconClass}` : 'fas fa-star',
        library: 'fa-solid',
      };
    }

    return {
      value: 'fas fa-star',
      library: 'fa-solid',
    };
  }

  private detectButtonSize(el: Element): string {
    const classes = el.className;
    if (classes.includes('large') || classes.includes('lg')) return 'lg';
    if (classes.includes('small') || classes.includes('sm')) return 'sm';
    return 'md';
  }

  private rgbToHex(rgb: string): string {
    if (rgb.startsWith('#')) return rgb;

    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return '#000000';

    const r = parseInt(result[0], 10);
    const g = parseInt(result[1], 10);
    const b = parseInt(result[2], 10);

    return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
  }

  private parsePadding(padding: string): number {
    const num = parseInt(padding, 10);
    return isNaN(num) ? 0 : num;
  }

  exportAsJson(elementorData: ElementorExport): string {
    return JSON.stringify(elementorData, null, 2);
  }

  generateImportInstructions(): string {
    return `
# Elementor Import Instructions

1. Log in to your WordPress admin panel
2. Go to Pages > Add New
3. Click "Edit with Elementor"
4. Click the folder icon (Templates) in the left panel
5. Click "Import Templates"
6. Upload the exported JSON file
7. Click "Import Now"

Your page will be imported with all sections, columns, and widgets preserved.

## Note:
- Make sure you have Elementor Pro for advanced widgets
- Upload any images separately to your Media Library
- Update image URLs in the imported content
    `.trim();
  }
}

export const elementorService = new ElementorService();
