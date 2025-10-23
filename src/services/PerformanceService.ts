import type { PerformanceMetrics, PerformanceIssue } from '../types';
import { webVitalsService } from './WebVitalsService';

export class PerformanceService {
  async analyzePerformance(
    html: string,
    cssContent: string = '',
    jsContent: string = '',
    url?: string
  ): Promise<PerformanceMetrics> {
    const htmlSize = new Blob([html]).size;
    const cssSize = new Blob([cssContent]).size;
    const jsSize = new Blob([jsContent]).size;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const images = doc.querySelectorAll('img');
    const imageCount = images.length;

    let imageSize = 0;

    const externalResources = this.countExternalResources(doc);
    const renderBlockingResources = this.countRenderBlockingResources(doc);

    const totalSize = htmlSize + cssSize + jsSize + imageSize;

    const issues = this.detectIssues(doc, {
      htmlSize,
      cssSize,
      jsSize,
      imageCount,
      externalResources,
      renderBlockingResources,
    });

    const score = this.calculateScore({
      htmlSize,
      cssSize,
      jsSize,
      imageCount,
      externalResources,
      renderBlockingResources,
      imageSize,
      totalSize,
      issues,
    });

    const recommendations = this.generateRecommendations(issues);

    const coreWebVitals = url
      ? await webVitalsService.measureCoreWebVitals(url)
      : await this.getMockCoreWebVitals();

    const additionalMetrics = url
      ? await webVitalsService.measureAdditionalMetrics(url)
      : await this.getMockAdditionalMetrics();

    const resourceMetrics = await webVitalsService.measureResourceMetrics(url || '', doc);

    const performanceScore = webVitalsService.calculatePerformanceScore(
      coreWebVitals,
      additionalMetrics
    );

    return {
      score: Math.round((score + performanceScore) / 2),
      coreWebVitals,
      additionalMetrics,
      resourceMetrics,
      htmlSize,
      cssSize,
      jsSize,
      imageSize,
      totalSize,
      imageCount,
      externalResources,
      renderBlockingResources,
      issues,
      recommendations,
    };
  }

  private async getMockCoreWebVitals() {
    return {
      lcp: { value: 2000, rating: 'good' as const },
      inp: { value: 150, rating: 'good' as const, totalInteractions: 10 },
      cls: { value: 0.08, rating: 'good' as const, shifts: [] },
      fcp: { value: 1500, rating: 'good' as const },
      ttfb: { value: 600, rating: 'good' as const },
    };
  }

  private async getMockAdditionalMetrics() {
    return {
      tbt: { value: 180, rating: 'good' as const, longTasksCount: 3, totalBlockingDuration: 180 },
      speedIndex: { value: 3000, rating: 'good' as const },
      tti: { value: 3500, rating: 'good' as const },
    };
  }

  private calculateScore(metrics: {
    htmlSize: number;
    cssSize: number;
    jsSize: number;
    imageCount: number;
    externalResources: number;
    renderBlockingResources: number;
    imageSize: number;
    totalSize: number;
    issues: PerformanceIssue[];
  }): number {
    let score = 100;

    if (metrics.htmlSize > 100 * 1024) score -= 5;
    if (metrics.htmlSize > 200 * 1024) score -= 10;

    if (metrics.cssSize > 200 * 1024) score -= 10;
    if (metrics.cssSize > 500 * 1024) score -= 15;

    if (metrics.jsSize > 500 * 1024) score -= 15;
    if (metrics.jsSize > 1024 * 1024) score -= 20;

    if (metrics.externalResources > 20) score -= 5;
    if (metrics.externalResources > 50) score -= 10;

    if (metrics.renderBlockingResources > 3) score -= 10;
    if (metrics.renderBlockingResources > 6) score -= 15;

    if (metrics.imageCount > 30) score -= 5;
    if (metrics.imageCount > 50) score -= 10;

    for (const issue of metrics.issues) {
      score -= issue.impact;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private countExternalResources(doc: Document): number {
    const scripts = doc.querySelectorAll('script[src]');
    const stylesheets = doc.querySelectorAll('link[rel="stylesheet"]');
    const images = doc.querySelectorAll('img[src]');

    return scripts.length + stylesheets.length + images.length;
  }

  private countRenderBlockingResources(doc: Document): number {
    const blockingScripts = doc.querySelectorAll('script[src]:not([async]):not([defer])');
    const blockingStyles = doc.querySelectorAll('link[rel="stylesheet"]:not([media="print"])');

    return blockingScripts.length + blockingStyles.length;
  }

  private detectIssues(
    doc: Document,
    metrics: {
      htmlSize: number;
      cssSize: number;
      jsSize: number;
      imageCount: number;
      externalResources: number;
      renderBlockingResources: number;
    }
  ): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];

    const totalSize = metrics.htmlSize + metrics.cssSize + metrics.jsSize;

    if (totalSize > 5 * 1024 * 1024) {
      issues.push({
        severity: 'critical',
        title: 'Page size exceeds 5MB',
        description: `Total page size is ${(totalSize / (1024 * 1024)).toFixed(2)}MB, which is very large.`,
        impact: 10,
        fix: 'Compress and optimize all assets, consider lazy loading',
      });
    }

    if (metrics.renderBlockingResources > 6) {
      issues.push({
        severity: 'critical',
        title: 'Too many render-blocking resources',
        description: `Found ${metrics.renderBlockingResources} render-blocking resources.`,
        impact: 10,
        fix: 'Add async/defer to scripts, defer non-critical CSS',
      });
    }

    const viewport = doc.querySelector('meta[name="viewport"]');
    if (!viewport) {
      issues.push({
        severity: 'critical',
        title: 'Missing viewport meta tag',
        description: 'No viewport meta tag found, affecting mobile responsiveness.',
        impact: 10,
        fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
      });
    }

    const imagesWithoutLazy = doc.querySelectorAll('img:not([loading="lazy"])');
    if (imagesWithoutLazy.length > 10) {
      issues.push({
        severity: 'critical',
        title: 'Images missing lazy loading',
        description: `${imagesWithoutLazy.length} images don't have lazy loading.`,
        impact: 10,
        fix: 'Add loading="lazy" attribute to images below the fold',
      });
    }

    if (totalSize > 2 * 1024 * 1024) {
      issues.push({
        severity: 'high',
        title: 'Page size exceeds 2MB',
        description: `Total page size is ${(totalSize / (1024 * 1024)).toFixed(2)}MB.`,
        impact: 5,
        fix: 'Minify HTML, CSS, and JavaScript files',
      });
    }

    if (metrics.renderBlockingResources > 3) {
      issues.push({
        severity: 'high',
        title: 'Multiple render-blocking resources',
        description: `${metrics.renderBlockingResources} resources block initial render.`,
        impact: 5,
        fix: 'Defer or async load non-critical resources',
      });
    }

    if (metrics.cssSize > 500 * 1024) {
      issues.push({
        severity: 'high',
        title: 'Large CSS file size',
        description: `CSS size is ${(metrics.cssSize / 1024).toFixed(0)}KB.`,
        impact: 5,
        fix: 'Remove unused CSS, split into critical and non-critical',
      });
    }

    if (metrics.jsSize > 1024 * 1024) {
      issues.push({
        severity: 'high',
        title: 'Large JavaScript file size',
        description: `JavaScript size is ${(metrics.jsSize / (1024 * 1024)).toFixed(2)}MB.`,
        impact: 5,
        fix: 'Code split, remove unused code, use tree shaking',
      });
    }

    if (metrics.externalResources > 50) {
      issues.push({
        severity: 'high',
        title: 'Too many external resources',
        description: `Page loads ${metrics.externalResources} external resources.`,
        impact: 5,
        fix: 'Combine files, use HTTP/2, consider inline for small files',
      });
    }

    const imagesWithoutDimensions = doc.querySelectorAll('img:not([width]):not([height])');
    if (imagesWithoutDimensions.length > 3) {
      issues.push({
        severity: 'medium',
        title: 'Images missing dimensions',
        description: `${imagesWithoutDimensions.length} images lack width/height attributes.`,
        impact: 3,
        fix: 'Add explicit width and height to prevent layout shift',
      });
    }

    if (imagesWithoutLazy.length > 5 && imagesWithoutLazy.length <= 10) {
      issues.push({
        severity: 'medium',
        title: 'Some images missing lazy loading',
        description: `${imagesWithoutLazy.length} images could benefit from lazy loading.`,
        impact: 3,
        fix: 'Add loading="lazy" to below-the-fold images',
      });
    }

    if (metrics.externalResources > 20 && metrics.externalResources <= 50) {
      issues.push({
        severity: 'medium',
        title: 'Many external resources',
        description: `Page loads ${metrics.externalResources} external resources.`,
        impact: 3,
        fix: 'Consider reducing third-party dependencies',
      });
    }

    const fonts = doc.querySelectorAll('link[rel*="font"]');
    if (fonts.length > 0) {
      const fontsWithoutPreload = Array.from(fonts).filter(
        (f) => !doc.querySelector(`link[rel="preload"][href="${f.getAttribute('href')}"]`)
      );
      if (fontsWithoutPreload.length > 0) {
        issues.push({
          severity: 'medium',
          title: 'Fonts not preloaded',
          description: 'Font files could be preloaded for faster rendering.',
          impact: 3,
          fix: 'Add <link rel="preload" as="font"> for critical fonts',
        });
      }
    }

    const inlineScripts = doc.querySelectorAll('script:not([src])');
    if (inlineScripts.length > 5) {
      issues.push({
        severity: 'low',
        title: 'Multiple inline scripts',
        description: `Found ${inlineScripts.length} inline script tags.`,
        impact: 1,
        fix: 'Consolidate inline scripts or move to external files',
      });
    }

    const svgs = doc.querySelectorAll('svg');
    if (svgs.length > 5) {
      issues.push({
        severity: 'low',
        title: 'Unoptimized SVGs',
        description: `Found ${svgs.length} SVG elements that could be optimized.`,
        impact: 1,
        fix: 'Optimize SVGs with SVGO, remove unnecessary attributes',
      });
    }

    const imagesWithoutAlt = doc.querySelectorAll('img:not([alt])');
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        severity: 'low',
        title: 'Images missing alt attributes',
        description: `${imagesWithoutAlt.length} images lack alt text.`,
        impact: 1,
        fix: 'Add descriptive alt text for accessibility and SEO',
      });
    }

    return issues;
  }

  private generateRecommendations(issues: PerformanceIssue[]): string[] {
    const recommendations: string[] = [];

    const criticalIssues = issues.filter((i) => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push(`Fix ${criticalIssues.length} critical performance issues immediately`);
    }

    if (issues.some((i) => i.title.includes('lazy loading'))) {
      recommendations.push('Implement lazy loading for images below the fold');
    }

    if (issues.some((i) => i.title.includes('render-blocking'))) {
      recommendations.push('Defer non-critical CSS and JavaScript resources');
    }

    if (issues.some((i) => i.title.includes('size'))) {
      recommendations.push('Minify and compress all text-based assets (HTML, CSS, JS)');
    }

    if (issues.some((i) => i.title.includes('dimensions'))) {
      recommendations.push('Add explicit dimensions to images to prevent layout shift');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance looks good! Consider monitoring real user metrics.');
    }

    return recommendations;
  }
}

export const performanceService = new PerformanceService();
