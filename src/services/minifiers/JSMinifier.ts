export class JSMinifier {
  minify(js: string, options: {
    removeConsole?: boolean;
    removeDebugger?: boolean;
    removeComments?: boolean;
  } = {}): { code: string; originalSize: number; minifiedSize: number } {
    const opts = {
      removeConsole: true,
      removeDebugger: true,
      removeComments: true,
      ...options,
    };

    const originalSize = js.length;
    let minified = js;

    if (opts.removeComments) {
      minified = this.removeComments(minified);
    }

    if (opts.removeConsole) {
      minified = this.removeConsole(minified);
    }

    if (opts.removeDebugger) {
      minified = this.removeDebugger(minified);
    }

    minified = this.removeWhitespace(minified);
    minified = this.removeUnnecessarySemicolons(minified);

    return {
      code: minified,
      originalSize,
      minifiedSize: minified.length,
    };
  }

  private removeComments(js: string): string {
    js = js.replace(/\/\/.*$/gm, '');
    js = js.replace(/\/\*[\s\S]*?\*\//g, '');
    return js;
  }

  private removeConsole(js: string): string {
    return js.replace(/console\.(log|warn|error|info|debug|trace)\([^)]*\);?/g, '');
  }

  private removeDebugger(js: string): string {
    return js.replace(/debugger;?/g, '');
  }

  private removeWhitespace(js: string): string {
    return js
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}();,:])\s*/g, '$1')
      .replace(/\s*=\s*/g, '=')
      .replace(/\s*\+\s*/g, '+')
      .replace(/\s*-\s*/g, '-')
      .trim();
  }

  private removeUnnecessarySemicolons(js: string): string {
    return js.replace(/;}/g, '}');
  }
}
