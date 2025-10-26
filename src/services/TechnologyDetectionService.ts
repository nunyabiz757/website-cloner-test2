import { loggingService } from './LoggingService';

export interface TechnologyStack {
  frameworks: DetectedTechnology[];
  libraries: DetectedTechnology[];
  cms: DetectedTechnology[];
  analytics: DetectedTechnology[];
  hosting: DetectedTechnology[];
  cdns: DetectedTechnology[];
  javascript: DetectedTechnology[];
  css: DetectedTechnology[];
  fonts: DetectedTechnology[];
  buildTools: DetectedTechnology[];
  servers: DetectedTechnology[];
  databases: DetectedTechnology[];
}

export interface DetectedTechnology {
  name: string;
  version?: string;
  confidence: 'high' | 'medium' | 'low';
  category: string;
  description?: string;
}

export class TechnologyDetectionService {
  async detectTechnologies(url: string, htmlContent: string): Promise<TechnologyStack> {
    loggingService.info('tech-detection', `Starting technology detection for ${url}`);

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      const frameworks = this.detectFrameworks(doc, htmlContent);
      const libraries = this.detectLibraries(doc);
      const cms = this.detectCMS(doc, htmlContent);
      const analytics = this.detectAnalytics(doc);
      const hosting = this.detectHosting(url, doc);
      const cdns = this.detectCDNs(doc);
      const javascript = this.detectJavaScriptTools(doc);
      const css = this.detectCSSFrameworks(doc, htmlContent);
      const fonts = this.detectFonts(doc);
      const buildTools = this.detectBuildTools(doc, htmlContent);
      const servers = await this.detectServers(url);
      const databases = this.detectDatabases(doc, htmlContent);

      const result: TechnologyStack = {
        frameworks,
        libraries,
        cms,
        analytics,
        hosting,
        cdns,
        javascript,
        css,
        fonts,
        buildTools,
        servers,
        databases,
      };

      const totalDetected = Object.values(result).reduce((sum, arr) => sum + arr.length, 0);
      loggingService.success('tech-detection', `Detected ${totalDetected} technologies`);

      return result;
    } catch (error) {
      loggingService.error('tech-detection', 'Failed to detect technologies', error);
      throw error;
    }
  }

  private detectFrameworks(doc: Document, html: string): DetectedTechnology[] {
    const frameworks: DetectedTechnology[] = [];

    // React
    if (html.includes('react') || html.includes('_react') || doc.querySelector('[data-reactroot]') || doc.querySelector('[data-reactid]')) {
      frameworks.push({
        name: 'React',
        confidence: 'high',
        category: 'JavaScript Framework',
        description: 'A JavaScript library for building user interfaces',
      });
    }

    // Vue.js
    if (html.includes('vue') || doc.querySelector('[data-v-]') || doc.querySelector('[v-cloak]')) {
      frameworks.push({
        name: 'Vue.js',
        confidence: 'high',
        category: 'JavaScript Framework',
        description: 'Progressive JavaScript framework',
      });
    }

    // Angular
    if (html.includes('ng-version') || doc.querySelector('[ng-version]') || html.includes('angular')) {
      const version = doc.querySelector('[ng-version]')?.getAttribute('ng-version');
      frameworks.push({
        name: 'Angular',
        version,
        confidence: 'high',
        category: 'JavaScript Framework',
        description: 'Platform for building web applications',
      });
    }

    // Next.js
    if (html.includes('__NEXT_DATA__') || html.includes('_next/static')) {
      frameworks.push({
        name: 'Next.js',
        confidence: 'high',
        category: 'JavaScript Framework',
        description: 'React framework for production',
      });
    }

    // Nuxt.js
    if (html.includes('__NUXT__') || html.includes('_nuxt/')) {
      frameworks.push({
        name: 'Nuxt.js',
        confidence: 'high',
        category: 'JavaScript Framework',
        description: 'Vue.js framework for production',
      });
    }

    // Svelte
    if (html.includes('svelte') || doc.querySelector('[class*="svelte-"]')) {
      frameworks.push({
        name: 'Svelte',
        confidence: 'medium',
        category: 'JavaScript Framework',
        description: 'Cybernetically enhanced web apps',
      });
    }

    // Gatsby
    if (html.includes('gatsby') || doc.querySelector('[id="___gatsby"]')) {
      frameworks.push({
        name: 'Gatsby',
        confidence: 'high',
        category: 'Static Site Generator',
        description: 'React-based static site generator',
      });
    }

    // Ember.js
    if (html.includes('ember') || doc.querySelector('[class*="ember-"]')) {
      frameworks.push({
        name: 'Ember.js',
        confidence: 'medium',
        category: 'JavaScript Framework',
        description: 'Framework for ambitious web developers',
      });
    }

    return frameworks;
  }

  private detectLibraries(doc: Document): DetectedTechnology[] {
    const libraries: DetectedTechnology[] = [];
    const scripts = doc.querySelectorAll('script[src]');

    scripts.forEach(script => {
      const src = script.getAttribute('src') || '';

      // jQuery
      if (src.includes('jquery')) {
        const versionMatch = src.match(/jquery[.-](\d+\.\d+\.\d+)/);
        libraries.push({
          name: 'jQuery',
          version: versionMatch?.[1],
          confidence: 'high',
          category: 'JavaScript Library',
          description: 'Fast, small, and feature-rich JavaScript library',
        });
      }

      // Lodash
      if (src.includes('lodash')) {
        libraries.push({
          name: 'Lodash',
          confidence: 'high',
          category: 'JavaScript Library',
          description: 'Modern JavaScript utility library',
        });
      }

      // Axios
      if (src.includes('axios')) {
        libraries.push({
          name: 'Axios',
          confidence: 'high',
          category: 'JavaScript Library',
          description: 'Promise-based HTTP client',
        });
      }

      // Moment.js
      if (src.includes('moment')) {
        libraries.push({
          name: 'Moment.js',
          confidence: 'high',
          category: 'JavaScript Library',
          description: 'Date manipulation library',
        });
      }

      // Three.js
      if (src.includes('three')) {
        libraries.push({
          name: 'Three.js',
          confidence: 'high',
          category: 'JavaScript Library',
          description: '3D graphics library',
        });
      }

      // Chart.js
      if (src.includes('chart.js') || src.includes('chartjs')) {
        libraries.push({
          name: 'Chart.js',
          confidence: 'high',
          category: 'JavaScript Library',
          description: 'Simple yet flexible charting library',
        });
      }

      // D3.js
      if (src.includes('d3.')) {
        libraries.push({
          name: 'D3.js',
          confidence: 'high',
          category: 'JavaScript Library',
          description: 'Data visualization library',
        });
      }
    });

    return libraries;
  }

  private detectCMS(doc: Document, html: string): DetectedTechnology[] {
    const cms: DetectedTechnology[] = [];

    // WordPress
    if (html.includes('wp-content') || html.includes('wp-includes') || doc.querySelector('meta[name="generator"][content*="WordPress"]')) {
      const generator = doc.querySelector('meta[name="generator"]')?.getAttribute('content');
      const version = generator?.match(/WordPress\s+([\d.]+)/)?.[1];
      cms.push({
        name: 'WordPress',
        version,
        confidence: 'high',
        category: 'CMS',
        description: 'Popular content management system',
      });
    }

    // Drupal
    if (html.includes('drupal') || doc.querySelector('meta[name="generator"][content*="Drupal"]')) {
      cms.push({
        name: 'Drupal',
        confidence: 'high',
        category: 'CMS',
        description: 'Open-source content management platform',
      });
    }

    // Joomla
    if (html.includes('joomla') || doc.querySelector('meta[name="generator"][content*="Joomla"]')) {
      cms.push({
        name: 'Joomla',
        confidence: 'high',
        category: 'CMS',
        description: 'Content management system',
      });
    }

    // Shopify
    if (html.includes('shopify') || html.includes('cdn.shopify.com')) {
      cms.push({
        name: 'Shopify',
        confidence: 'high',
        category: 'E-commerce Platform',
        description: 'E-commerce platform',
      });
    }

    // Wix
    if (html.includes('wix.com') || html.includes('wixstatic.com')) {
      cms.push({
        name: 'Wix',
        confidence: 'high',
        category: 'Website Builder',
        description: 'Website builder platform',
      });
    }

    // Squarespace
    if (html.includes('squarespace') || html.includes('sqsp.')) {
      cms.push({
        name: 'Squarespace',
        confidence: 'high',
        category: 'Website Builder',
        description: 'Website builder and hosting',
      });
    }

    // Webflow
    if (html.includes('webflow') || doc.querySelector('meta[name="generator"][content*="Webflow"]')) {
      cms.push({
        name: 'Webflow',
        confidence: 'high',
        category: 'Website Builder',
        description: 'Visual web development platform',
      });
    }

    return cms;
  }

  private detectAnalytics(doc: Document): DetectedTechnology[] {
    const analytics: DetectedTechnology[] = [];
    const scripts = doc.querySelectorAll('script');

    scripts.forEach(script => {
      const src = script.getAttribute('src') || '';
      const content = script.textContent || '';

      // Google Analytics
      if (src.includes('google-analytics.com') || src.includes('googletagmanager.com') || content.includes('ga(') || content.includes('gtag(')) {
        analytics.push({
          name: 'Google Analytics',
          confidence: 'high',
          category: 'Analytics',
          description: 'Web analytics service',
        });
      }

      // Google Tag Manager
      if (src.includes('googletagmanager.com') || content.includes('GTM-')) {
        analytics.push({
          name: 'Google Tag Manager',
          confidence: 'high',
          category: 'Tag Manager',
          description: 'Tag management system',
        });
      }

      // Facebook Pixel
      if (src.includes('connect.facebook.net') || content.includes('fbq(')) {
        analytics.push({
          name: 'Facebook Pixel',
          confidence: 'high',
          category: 'Analytics',
          description: 'Facebook analytics and advertising',
        });
      }

      // Hotjar
      if (src.includes('hotjar.com') || content.includes('hotjar')) {
        analytics.push({
          name: 'Hotjar',
          confidence: 'high',
          category: 'Analytics',
          description: 'Behavior analytics and user feedback',
        });
      }

      // Mixpanel
      if (src.includes('mixpanel.com') || content.includes('mixpanel')) {
        analytics.push({
          name: 'Mixpanel',
          confidence: 'high',
          category: 'Analytics',
          description: 'Product analytics',
        });
      }
    });

    return analytics;
  }

  private detectHosting(url: string, doc: Document): DetectedTechnology[] {
    const hosting: DetectedTechnology[] = [];
    const html = doc.documentElement.outerHTML;

    // Vercel
    if (html.includes('vercel') || url.includes('vercel.app')) {
      hosting.push({
        name: 'Vercel',
        confidence: 'high',
        category: 'Hosting',
        description: 'Cloud platform for static sites',
      });
    }

    // Netlify
    if (html.includes('netlify') || url.includes('netlify.app')) {
      hosting.push({
        name: 'Netlify',
        confidence: 'high',
        category: 'Hosting',
        description: 'Web development platform',
      });
    }

    // GitHub Pages
    if (url.includes('github.io')) {
      hosting.push({
        name: 'GitHub Pages',
        confidence: 'high',
        category: 'Hosting',
        description: 'Static site hosting from GitHub',
      });
    }

    // AWS
    if (html.includes('amazonaws.com') || url.includes('amazonaws.com')) {
      hosting.push({
        name: 'Amazon Web Services',
        confidence: 'medium',
        category: 'Hosting',
        description: 'Cloud computing platform',
      });
    }

    return hosting;
  }

  private detectCDNs(doc: Document): DetectedTechnology[] {
    const cdns: DetectedTechnology[] = [];
    const scripts = doc.querySelectorAll('script[src], link[href]');

    scripts.forEach(element => {
      const src = element.getAttribute('src') || element.getAttribute('href') || '';

      // Cloudflare
      if (src.includes('cloudflare.com') || src.includes('cdnjs.cloudflare.com')) {
        cdns.push({
          name: 'Cloudflare',
          confidence: 'high',
          category: 'CDN',
          description: 'Content delivery network and security',
        });
      }

      // jsDelivr
      if (src.includes('jsdelivr.net')) {
        cdns.push({
          name: 'jsDelivr',
          confidence: 'high',
          category: 'CDN',
          description: 'Free CDN for open source projects',
        });
      }

      // unpkg
      if (src.includes('unpkg.com')) {
        cdns.push({
          name: 'unpkg',
          confidence: 'high',
          category: 'CDN',
          description: 'Fast global CDN for npm packages',
        });
      }

      // Google Fonts
      if (src.includes('fonts.googleapis.com') || src.includes('fonts.gstatic.com')) {
        cdns.push({
          name: 'Google Fonts',
          confidence: 'high',
          category: 'CDN',
          description: 'Font hosting service',
        });
      }
    });

    return [...new Map(cdns.map(item => [item.name, item])).values()];
  }

  private detectJavaScriptTools(doc: Document): DetectedTechnology[] {
    const tools: DetectedTechnology[] = [];
    const html = doc.documentElement.outerHTML;

    // Webpack
    if (html.includes('webpack') || html.includes('webpackJsonp')) {
      tools.push({
        name: 'Webpack',
        confidence: 'high',
        category: 'Build Tool',
        description: 'Module bundler',
      });
    }

    // Vite
    if (html.includes('/@vite/') || html.includes('vite')) {
      tools.push({
        name: 'Vite',
        confidence: 'medium',
        category: 'Build Tool',
        description: 'Next generation frontend tooling',
      });
    }

    // Parcel
    if (html.includes('parcel')) {
      tools.push({
        name: 'Parcel',
        confidence: 'medium',
        category: 'Build Tool',
        description: 'Zero configuration build tool',
      });
    }

    return tools;
  }

  private detectCSSFrameworks(doc: Document, html: string): DetectedTechnology[] {
    const frameworks: DetectedTechnology[] = [];

    // Bootstrap
    if (html.includes('bootstrap') || doc.querySelector('[class*="col-"]') || doc.querySelector('[class*="btn-"]')) {
      frameworks.push({
        name: 'Bootstrap',
        confidence: 'high',
        category: 'CSS Framework',
        description: 'Popular CSS framework',
      });
    }

    // Tailwind CSS
    if (html.includes('tailwind') || doc.querySelector('[class*="flex"]') && doc.querySelector('[class*="grid"]')) {
      frameworks.push({
        name: 'Tailwind CSS',
        confidence: 'medium',
        category: 'CSS Framework',
        description: 'Utility-first CSS framework',
      });
    }

    // Material-UI
    if (html.includes('material-ui') || doc.querySelector('[class*="MuiButton"]')) {
      frameworks.push({
        name: 'Material-UI',
        confidence: 'high',
        category: 'CSS Framework',
        description: 'React component library',
      });
    }

    // Foundation
    if (html.includes('foundation') || doc.querySelector('[class*="foundation"]')) {
      frameworks.push({
        name: 'Foundation',
        confidence: 'medium',
        category: 'CSS Framework',
        description: 'Responsive front-end framework',
      });
    }

    // Bulma
    if (html.includes('bulma') || doc.querySelector('[class*="column"]') && doc.querySelector('[class*="hero"]')) {
      frameworks.push({
        name: 'Bulma',
        confidence: 'medium',
        category: 'CSS Framework',
        description: 'Modern CSS framework',
      });
    }

    return frameworks;
  }

  private detectFonts(doc: Document): DetectedTechnology[] {
    const fonts: DetectedTechnology[] = [];
    const links = doc.querySelectorAll('link[href]');

    links.forEach(link => {
      const href = link.getAttribute('href') || '';

      // Google Fonts
      if (href.includes('fonts.googleapis.com')) {
        fonts.push({
          name: 'Google Fonts',
          confidence: 'high',
          category: 'Web Fonts',
          description: 'Font library from Google',
        });
      }

      // Adobe Fonts (Typekit)
      if (href.includes('typekit.net') || href.includes('use.typekit.net')) {
        fonts.push({
          name: 'Adobe Fonts',
          confidence: 'high',
          category: 'Web Fonts',
          description: 'Professional font service',
        });
      }

      // Font Awesome
      if (href.includes('fontawesome') || href.includes('font-awesome')) {
        fonts.push({
          name: 'Font Awesome',
          confidence: 'high',
          category: 'Icon Library',
          description: 'Icon font and toolkit',
        });
      }
    });

    return [...new Map(fonts.map(item => [item.name, item])).values()];
  }

  private detectBuildTools(doc: Document, html: string): DetectedTechnology[] {
    const tools: DetectedTechnology[] = [];

    // Check for source maps
    if (html.includes('sourceMappingURL')) {
      tools.push({
        name: 'Source Maps',
        confidence: 'high',
        category: 'Development Tool',
        description: 'Debug mapping for production code',
      });
    }

    return tools;
  }

  private async detectServers(url: string): Promise<DetectedTechnology[]> {
    const servers: DetectedTechnology[] = [];

    try {
      const response = await fetch(url, { method: 'HEAD' });

      const server = response.headers.get('server');
      if (server) {
        servers.push({
          name: server,
          confidence: 'high',
          category: 'Web Server',
          description: 'HTTP server software',
        });
      }

      const poweredBy = response.headers.get('x-powered-by');
      if (poweredBy) {
        servers.push({
          name: poweredBy,
          confidence: 'high',
          category: 'Server Technology',
          description: 'Server-side technology',
        });
      }
    } catch (error) {
      loggingService.warning('tech-detection', 'Unable to detect server info due to CORS', error);
    }

    return servers;
  }

  private detectDatabases(doc: Document, html: string): DetectedTechnology[] {
    const databases: DetectedTechnology[] = [];

    // These are harder to detect from client-side, but we can make educated guesses

    // WordPress typically uses MySQL
    if (html.includes('wp-content')) {
      databases.push({
        name: 'MySQL',
        confidence: 'medium',
        category: 'Database',
        description: 'Relational database (inferred from CMS)',
      });
    }

    return databases;
  }
}

export const technologyDetectionService = new TechnologyDetectionService();
