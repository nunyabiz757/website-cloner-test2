import * as cheerio from 'cheerio';
import type { Framework, FrameworkAnalysis } from '../../types/detection.types';

export class FrameworkDetector {
  private readonly frameworkPatterns = {
    react: {
      html: ['data-reactroot', 'data-reactid', '_reactRootContainer'],
      js: ['React.createElement', 'ReactDOM.render', 'useState', 'useEffect', '__REACT'],
      files: ['react.js', 'react.min.js', 'react-dom'],
    },
    vue: {
      html: ['v-if', 'v-for', 'v-bind', 'v-model', 'v-on', ':class', '@click'],
      js: ['Vue.component', 'new Vue', 'createApp', '__VUE__'],
      files: ['vue.js', 'vue.min.js'],
    },
    angular: {
      html: ['ng-app', 'ng-controller', 'ng-model', '*ngIf', '*ngFor'],
      js: ['angular.module', 'Angular', '@angular/core', '__NG__'],
      files: ['angular.js', '@angular'],
    },
    nextjs: {
      html: ['__NEXT_DATA__', '__next'],
      js: ['next/router', 'next/link', '__NEXT__'],
      files: ['_next/', 'next.js'],
    },
    svelte: {
      html: ['svelte-', 'class:'],
      js: ['SvelteComponent', 'svelte', '__SVELTE__'],
      files: ['svelte'],
    },
    jquery: {
      html: ['data-toggle', 'data-target'],
      js: ['jQuery', '$', '$.fn', 'jquery'],
      files: ['jquery.js', 'jquery.min.js'],
    },
  };

  private readonly cssFrameworks = {
    bootstrap: ['bootstrap', 'container', 'row', 'col-', 'btn-', 'navbar'],
    tailwind: ['tailwind', 'flex', 'grid', 'bg-', 'text-', 'px-', 'py-'],
    materialui: ['material-ui', 'MuiButton', 'MuiTextField'],
    bulma: ['bulma', 'columns', 'column', 'is-primary'],
    foundation: ['foundation', 'grid-x', 'cell'],
  };

  async detectFrameworks(
    htmlContent: string,
    jsContent?: string[],
    cssContent?: string[]
  ): Promise<FrameworkAnalysis> {
    const frameworks = this.detectJSFrameworks(htmlContent, jsContent);
    const cssFrameworks = this.detectCSSFrameworks(htmlContent, cssContent);
    const libraries = this.detectLibraries(htmlContent, jsContent);
    const recommendations = this.generateRecommendations(frameworks, cssFrameworks);

    return {
      frameworks,
      cssFrameworks,
      libraries,
      recommendations,
    };
  }

  private detectJSFrameworks(htmlContent: string, jsContent?: string[]): Framework[] {
    const detected: Framework[] = [];
    const $ = cheerio.load(htmlContent);

    for (const [name, patterns] of Object.entries(this.frameworkPatterns)) {
      let score = 0;
      const indicators: string[] = [];

      for (const pattern of patterns.html) {
        if (htmlContent.includes(pattern)) {
          score += 20;
          indicators.push(`HTML: ${pattern}`);
        }
      }

      $('*').each((_, el) => {
        const attrs = Object.keys(el.attribs || {});
        for (const attr of attrs) {
          if (patterns.html.some((p) => attr.includes(p.replace(/[[\]]/g, '')))) {
            score += 10;
          }
        }
      });

      if (jsContent) {
        for (const js of jsContent) {
          for (const pattern of patterns.js) {
            if (js.includes(pattern)) {
              score += 25;
              indicators.push(`JS: ${pattern}`);
            }
          }
        }
      }

      for (const filePattern of patterns.files) {
        if (htmlContent.includes(filePattern)) {
          score += 15;
          indicators.push(`File: ${filePattern}`);
        }
      }

      const version = this.extractVersion(htmlContent, jsContent, name);

      if (score > 30) {
        detected.push({
          name,
          version,
          confidence: Math.min(score, 100),
          indicators,
        });
      }
    }

    return detected;
  }

  private detectCSSFrameworks(htmlContent: string, cssContent?: string[]): string[] {
    const detected: string[] = [];

    for (const [name, keywords] of Object.entries(this.cssFrameworks)) {
      let score = 0;

      for (const keyword of keywords) {
        const regex = new RegExp(`class=["'][^"']*${keyword}`, 'gi');
        if (regex.test(htmlContent)) {
          score += 10;
        }
      }

      if (cssContent) {
        for (const css of cssContent) {
          for (const keyword of keywords) {
            if (css.includes(keyword)) score += 5;
          }
        }
      }

      if (score > 20) detected.push(name);
    }

    return detected;
  }

  private detectLibraries(htmlContent: string, jsContent?: string[]): string[] {
    const libraries: string[] = [];
    const libraryPatterns = {
      lodash: ['lodash', '_.'],
      gsap: ['gsap', 'TweenMax', 'TimelineMax'],
      'chart.js': ['Chart.js', 'new Chart'],
      d3: ['d3.js', 'd3.select'],
      axios: ['axios'],
    };

    for (const [name, patterns] of Object.entries(libraryPatterns)) {
      for (const pattern of patterns) {
        if (htmlContent.includes(pattern) || jsContent?.some(js => js.includes(pattern))) {
          libraries.push(name);
          break;
        }
      }
    }

    return libraries;
  }

  private extractVersion(htmlContent: string, jsContent: string[] | undefined, framework: string): string | undefined {
    const versionPatterns: Record<string, RegExp> = {
      react: /react@(\d+\.\d+\.\d+)/i,
      vue: /vue@(\d+\.\d+\.\d+)/i,
      angular: /@angular\/core@(\d+\.\d+\.\d+)/i,
    };

    const pattern = versionPatterns[framework];
    if (!pattern) return undefined;

    const htmlMatch = htmlContent.match(pattern);
    if (htmlMatch) return htmlMatch[1];

    if (jsContent) {
      for (const js of jsContent) {
        const jsMatch = js.match(pattern);
        if (jsMatch) return jsMatch[1];
      }
    }

    return undefined;
  }

  private generateRecommendations(frameworks: Framework[], cssFrameworks: string[]): string[] {
    const recommendations: string[] = [];

    if (frameworks.some(f => f.name === 'react')) {
      recommendations.push('Consider Gutenberg blocks for React-based content');
    }

    if (cssFrameworks.includes('bootstrap')) {
      recommendations.push('Bootstrap classes can be mapped to Elementor column widths');
    }

    if (cssFrameworks.includes('tailwind')) {
      recommendations.push('Tailwind utility classes map well to Elementor inline styles');
    }

    return recommendations;
  }
}

export default new FrameworkDetector();
