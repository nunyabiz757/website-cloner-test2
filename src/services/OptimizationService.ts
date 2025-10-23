import type { Optimization } from '../types';
import { loggingService } from './LoggingService';

export class OptimizationService {
  private appliedOptimizations: Map<string, Optimization[]> = new Map();

  optimizeHtml(html: string, projectId: string): { html: string; optimizations: Optimization[] } {
    loggingService.info('optimize', `Starting optimization for project ${projectId}`, { htmlSize: html.length });

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const optimizations: Optimization[] = [];

    try {
      this.addViewportMeta(doc, optimizations);
      this.optimizeImages(doc, optimizations);
      this.optimizeScripts(doc, optimizations);
      this.optimizeStyles(doc, optimizations);
      this.addResourceHints(doc, optimizations);
      this.removeComments(doc, optimizations);
      this.optimizeIframes(doc, optimizations);

      const serializer = new XMLSerializer();
      let optimizedHtml = serializer.serializeToString(doc);

      optimizedHtml = this.minifyHtml(optimizedHtml, optimizations);

      this.appliedOptimizations.set(projectId, optimizations);

      loggingService.success('optimize', `Optimization completed for project ${projectId}`, {
        optimizationsCount: optimizations.length,
        originalSize: html.length,
        optimizedSize: optimizedHtml.length,
        reduction: ((html.length - optimizedHtml.length) / html.length * 100).toFixed(2) + '%'
      });

      return { html: optimizedHtml, optimizations };
    } catch (error) {
      loggingService.error('optimize', `Optimization failed for project ${projectId}`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private addViewportMeta(doc: Document, optimizations: Optimization[]): void {
    if (!doc.querySelector('meta[name="viewport"]')) {
      const meta = doc.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1';
      doc.head?.appendChild(meta);

      optimizations.push({
        id: 'viewport-meta',
        name: 'Added viewport meta tag',
        description: 'Ensures proper mobile responsiveness',
        category: 'html',
        applied: true,
        impact: 'high',
        savings: { score: 10 },
      });
    }
  }

  private optimizeImages(doc: Document, optimizations: Optimization[]): void {
    const images = doc.querySelectorAll('img');
    let lazyLoadCount = 0;
    let dimensionsAddedCount = 0;
    let decodingAddedCount = 0;

    images.forEach((img, index) => {
      if (!img.hasAttribute('loading') && index > 2) {
        img.setAttribute('loading', 'lazy');
        lazyLoadCount++;
      }

      if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
        dimensionsAddedCount++;
      }

      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
        decodingAddedCount++;
      }

      if (!img.hasAttribute('alt')) {
        img.setAttribute('alt', '');
      }

      if (index === 0 && !img.hasAttribute('fetchpriority')) {
        img.setAttribute('fetchpriority', 'high');
      }
    });

    if (lazyLoadCount > 0) {
      optimizations.push({
        id: 'lazy-loading',
        name: `Added lazy loading to ${lazyLoadCount} images`,
        description: 'Defers loading of below-the-fold images',
        category: 'images',
        applied: true,
        impact: 'high',
        savings: { score: 5 + Math.min(lazyLoadCount, 10) },
      });
    }

    if (dimensionsAddedCount > 0) {
      optimizations.push({
        id: 'image-dimensions',
        name: `Optimized dimensions for ${dimensionsAddedCount} images`,
        description: 'Prevents cumulative layout shift (CLS)',
        category: 'images',
        applied: true,
        impact: 'medium',
        savings: { score: 3 },
      });
    }

    if (decodingAddedCount > 0) {
      optimizations.push({
        id: 'image-decoding',
        name: `Added async decoding to ${decodingAddedCount} images`,
        description: 'Improves perceived loading performance',
        category: 'images',
        applied: true,
        impact: 'low',
        savings: { score: 1 },
      });
    }
  }

  private optimizeScripts(doc: Document, optimizations: Optimization[]): void {
    const scripts = doc.querySelectorAll('script[src]');
    let deferCount = 0;
    let asyncCount = 0;

    scripts.forEach((script) => {
      if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
        const src = script.getAttribute('src') || '';

        if (src.includes('analytics') || src.includes('gtag') || src.includes('facebook')) {
          script.setAttribute('async', '');
          asyncCount++;
        } else {
          script.setAttribute('defer', '');
          deferCount++;
        }
      }
    });

    if (deferCount > 0) {
      optimizations.push({
        id: 'defer-scripts',
        name: `Added defer to ${deferCount} scripts`,
        description: 'Prevents scripts from blocking page render',
        category: 'js',
        applied: true,
        impact: 'high',
        savings: { score: 10 },
      });
    }

    if (asyncCount > 0) {
      optimizations.push({
        id: 'async-scripts',
        name: `Added async to ${asyncCount} third-party scripts`,
        description: 'Loads third-party scripts without blocking',
        category: 'js',
        applied: true,
        impact: 'medium',
        savings: { score: 5 },
      });
    }

    const inlineScripts = doc.querySelectorAll('script:not([src])');
    let removedConsoleCount = 0;

    inlineScripts.forEach((script) => {
      if (script.textContent) {
        const original = script.textContent;
        const cleaned = original
          .replace(/console\.(log|debug|info|warn|error)\([^)]*\);?/g, '')
          .replace(/debugger;?/g, '');

        if (cleaned !== original) {
          script.textContent = cleaned;
          removedConsoleCount++;
        }
      }
    });

    if (removedConsoleCount > 0) {
      optimizations.push({
        id: 'remove-console',
        name: `Removed console statements from ${removedConsoleCount} scripts`,
        description: 'Cleans up development code',
        category: 'js',
        applied: true,
        impact: 'low',
        savings: { score: 1 },
      });
    }
  }

  private optimizeStyles(doc: Document, optimizations: Optimization[]): void {
    const stylesheets = doc.querySelectorAll('link[rel="stylesheet"]');
    let optimizedCount = 0;

    stylesheets.forEach((link, index) => {
      if (index > 1 && !link.hasAttribute('media')) {
        const newLink = link.cloneNode(true) as HTMLLinkElement;
        newLink.setAttribute('media', 'print');
        newLink.setAttribute('onload', "this.media='all'");

        link.parentNode?.replaceChild(newLink, link);
        optimizedCount++;
      }
    });

    if (optimizedCount > 0) {
      optimizations.push({
        id: 'defer-css',
        name: `Deferred ${optimizedCount} non-critical CSS files`,
        description: 'Loads non-critical styles after initial render',
        category: 'css',
        applied: true,
        impact: 'high',
        savings: { score: 8 },
      });
    }

    const inlineStyles = doc.querySelectorAll('style');
    let minifiedStylesCount = 0;

    inlineStyles.forEach((style) => {
      if (style.textContent) {
        const minified = this.minifyCss(style.textContent);
        if (minified.length < style.textContent.length) {
          style.textContent = minified;
          minifiedStylesCount++;
        }
      }
    });

    if (minifiedStylesCount > 0) {
      optimizations.push({
        id: 'minify-inline-css',
        name: `Minified ${minifiedStylesCount} inline style blocks`,
        description: 'Reduces CSS size',
        category: 'css',
        applied: true,
        impact: 'low',
        savings: { score: 2 },
      });
    }
  }

  private addResourceHints(doc: Document, optimizations: Optimization[]): void {
    const externalDomains = new Set<string>();

    doc.querySelectorAll('[src], [href]').forEach((el) => {
      const url = el.getAttribute('src') || el.getAttribute('href');
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        try {
          const domain = new URL(url).origin;
          const currentOrigin = doc.location?.origin || '';
          if (domain !== currentOrigin) {
            externalDomains.add(domain);
          }
        } catch {}
      }
    });

    let hintsAdded = 0;
    externalDomains.forEach((domain) => {
      if (!doc.querySelector(`link[rel="dns-prefetch"][href="${domain}"]`)) {
        const link = doc.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = domain;
        doc.head?.appendChild(link);
        hintsAdded++;
      }
    });

    if (hintsAdded > 0) {
      optimizations.push({
        id: 'resource-hints',
        name: `Added DNS prefetch for ${hintsAdded} external domains`,
        description: 'Speeds up external resource loading',
        category: 'performance',
        applied: true,
        impact: 'medium',
        savings: { score: 3 },
      });
    }

    const criticalFonts = doc.querySelectorAll('link[rel*="font"]');
    let preloadedFonts = 0;

    criticalFonts.forEach((font, index) => {
      if (index === 0) {
        const href = font.getAttribute('href');
        if (href && !doc.querySelector(`link[rel="preload"][href="${href}"]`)) {
          const preload = doc.createElement('link');
          preload.rel = 'preload';
          preload.as = 'font';
          preload.href = href;
          preload.setAttribute('crossorigin', 'anonymous');
          doc.head?.insertBefore(preload, doc.head.firstChild);
          preloadedFonts++;
        }
      }
    });

    if (preloadedFonts > 0) {
      optimizations.push({
        id: 'preload-fonts',
        name: `Preloaded ${preloadedFonts} critical fonts`,
        description: 'Eliminates font loading delay',
        category: 'performance',
        applied: true,
        impact: 'medium',
        savings: { score: 3 },
      });
    }
  }

  private removeComments(doc: Document, optimizations: Optimization[]): void {
    const removeCommentsFromNode = (node: Node): number => {
      let count = 0;
      const nodesToRemove: Node[] = [];

      node.childNodes.forEach((child) => {
        if (child.nodeType === Node.COMMENT_NODE) {
          nodesToRemove.push(child);
          count++;
        } else {
          count += removeCommentsFromNode(child);
        }
      });

      nodesToRemove.forEach((n) => n.parentNode?.removeChild(n));
      return count;
    };

    const removedCount = removeCommentsFromNode(doc);

    if (removedCount > 0) {
      optimizations.push({
        id: 'remove-comments',
        name: `Removed ${removedCount} HTML comments`,
        description: 'Reduces HTML file size',
        category: 'html',
        applied: true,
        impact: 'low',
        savings: { size: removedCount * 20, score: 1 },
      });
    }
  }

  private optimizeIframes(doc: Document, optimizations: Optimization[]): void {
    const iframes = doc.querySelectorAll('iframe');
    let optimizedCount = 0;

    iframes.forEach((iframe) => {
      if (!iframe.hasAttribute('loading')) {
        iframe.setAttribute('loading', 'lazy');
        optimizedCount++;
      }
    });

    if (optimizedCount > 0) {
      optimizations.push({
        id: 'lazy-iframes',
        name: `Added lazy loading to ${optimizedCount} iframes`,
        description: 'Defers iframe loading until needed',
        category: 'performance',
        applied: true,
        impact: 'medium',
        savings: { score: 5 },
      });
    }
  }

  private minifyHtml(html: string, optimizations: Optimization[]): string {
    const originalSize = html.length;

    let minified = html
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/\s+>/g, '>')
      .replace(/<\s+/g, '<')
      .trim();

    const newSize = minified.length;
    const savings = originalSize - newSize;

    if (savings > 0) {
      optimizations.push({
        id: 'minify-html',
        name: 'Minified HTML',
        description: `Reduced HTML size by ${(savings / 1024).toFixed(2)}KB`,
        category: 'html',
        applied: true,
        impact: 'medium',
        savings: { size: savings, score: 3 },
      });
    }

    return minified;
  }

  private minifyCss(css: string): string {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}:;,])\s*/g, '$1')
      .replace(/;}/g, '}')
      .replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3')
      .trim();
  }

  getOptimizations(projectId: string): Optimization[] {
    return this.appliedOptimizations.get(projectId) || [];
  }
}

export const optimizationService = new OptimizationService();
