export class HTMLMinifier {
  minify(html: string, options: {
    removeComments?: boolean;
    collapseWhitespace?: boolean;
    removeAttributeQuotes?: boolean;
  } = {}): { code: string; originalSize: number; minifiedSize: number } {
    const opts = {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: false,
      ...options,
    };

    const originalSize = html.length;
    let minified = html;

    if (opts.removeComments) {
      minified = this.removeComments(minified);
    }

    if (opts.collapseWhitespace) {
      minified = this.collapseWhitespace(minified);
    }

    if (opts.removeAttributeQuotes) {
      minified = this.removeAttributeQuotes(minified);
    }

    return {
      code: minified,
      originalSize,
      minifiedSize: minified.length,
    };
  }

  private removeComments(html: string): string {
    return html.replace(/<!--(?!\[if\s)[\s\S]*?-->/g, '');
  }

  private collapseWhitespace(html: string): string {
    return html
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/\s+>/g, '>')
      .replace(/<\s+/g, '<')
      .trim();
  }

  private removeAttributeQuotes(html: string): string {
    return html.replace(/(\w+)="([a-zA-Z0-9-_]+)"/g, '$1=$2');
  }
}
