import { loggingService } from './LoggingService';

export interface SEOAnalysisResult {
  score: number; // 0-100
  title: {
    content: string;
    length: number;
    optimal: boolean;
  };
  description: {
    content: string;
    length: number;
    optimal: boolean;
  };
  headings: {
    h1Count: number;
    h2Count: number;
    h3Count: number;
    hasMultipleH1: boolean;
  };
  images: {
    total: number;
    withAlt: number;
    withoutAlt: number;
    altCoverage: number; // percentage
  };
  links: {
    internal: number;
    external: number;
    broken: number;
  };
  openGraph: {
    hasOgTitle: boolean;
    hasOgDescription: boolean;
    hasOgImage: boolean;
    hasOgUrl: boolean;
    complete: boolean;
  };
  twitterCard: {
    hasCard: boolean;
    hasTitle: boolean;
    hasDescription: boolean;
    hasImage: boolean;
    complete: boolean;
  };
  structuredData: {
    found: boolean;
    types: string[];
    count: number;
  };
  robots: {
    hasRobotsTxt: boolean;
    isIndexable: boolean;
    hasMetaRobots: boolean;
  };
  sitemap: {
    found: boolean;
    url?: string;
  };
  canonicalUrl: {
    exists: boolean;
    url?: string;
  };
  recommendations: string[];
}

export class SEOAnalysisService {
  async analyzeSEO(url: string, htmlContent: string): Promise<SEOAnalysisResult> {
    loggingService.info('seo-analysis', `Starting SEO analysis for ${url}`);

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      // Analyze title
      const title = this.analyzeTitle(doc);

      // Analyze meta description
      const description = this.analyzeDescription(doc);

      // Analyze headings
      const headings = this.analyzeHeadings(doc);

      // Analyze images
      const images = this.analyzeImages(doc);

      // Analyze links
      const links = await this.analyzeLinks(doc, url);

      // Analyze Open Graph tags
      const openGraph = this.analyzeOpenGraph(doc);

      // Analyze Twitter Card tags
      const twitterCard = this.analyzeTwitterCard(doc);

      // Analyze structured data
      const structuredData = this.analyzeStructuredData(doc);

      // Analyze robots directives
      const robots = await this.analyzeRobots(doc, url);

      // Check for sitemap
      const sitemap = await this.checkSitemap(url);

      // Check canonical URL
      const canonicalUrl = this.analyzeCanonical(doc);

      // Calculate score
      const score = this.calculateSEOScore({
        title,
        description,
        headings,
        images,
        links,
        openGraph,
        twitterCard,
        structuredData,
        robots,
        sitemap,
        canonicalUrl,
      });

      // Generate recommendations
      const recommendations = this.generateRecommendations({
        title,
        description,
        headings,
        images,
        links,
        openGraph,
        twitterCard,
        structuredData,
        robots,
        sitemap,
        canonicalUrl,
      });

      const result: SEOAnalysisResult = {
        score,
        title,
        description,
        headings,
        images,
        links,
        openGraph,
        twitterCard,
        structuredData,
        robots,
        sitemap,
        canonicalUrl,
        recommendations,
      };

      loggingService.success('seo-analysis', `SEO analysis completed with score: ${score}/100`);
      return result;
    } catch (error) {
      loggingService.error('seo-analysis', 'Failed to analyze SEO', error);
      throw error;
    }
  }

  private analyzeTitle(doc: Document) {
    const titleElement = doc.querySelector('title');
    const content = titleElement?.textContent?.trim() || '';
    const length = content.length;
    const optimal = length >= 30 && length <= 60;

    return { content, length, optimal };
  }

  private analyzeDescription(doc: Document) {
    const metaDesc = doc.querySelector('meta[name="description"]');
    const content = metaDesc?.getAttribute('content')?.trim() || '';
    const length = content.length;
    const optimal = length >= 120 && length <= 160;

    return { content, length, optimal };
  }

  private analyzeHeadings(doc: Document) {
    const h1Count = doc.querySelectorAll('h1').length;
    const h2Count = doc.querySelectorAll('h2').length;
    const h3Count = doc.querySelectorAll('h3').length;
    const hasMultipleH1 = h1Count > 1;

    return { h1Count, h2Count, h3Count, hasMultipleH1 };
  }

  private analyzeImages(doc: Document) {
    const allImages = doc.querySelectorAll('img');
    const total = allImages.length;
    let withAlt = 0;
    let withoutAlt = 0;

    allImages.forEach(img => {
      const alt = img.getAttribute('alt');
      if (alt && alt.trim().length > 0) {
        withAlt++;
      } else {
        withoutAlt++;
      }
    });

    const altCoverage = total > 0 ? Math.round((withAlt / total) * 100) : 100;

    return { total, withAlt, withoutAlt, altCoverage };
  }

  private async analyzeLinks(doc: Document, baseUrl: string) {
    const allLinks = doc.querySelectorAll('a[href]');
    let internal = 0;
    let external = 0;
    const broken = 0; // Would require actual HTTP checks

    const parsedBaseUrl = new URL(baseUrl);

    allLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      try {
        if (href.startsWith('/') || href.startsWith('#') || href.startsWith('?')) {
          internal++;
        } else {
          const linkUrl = new URL(href, baseUrl);
          if (linkUrl.hostname === parsedBaseUrl.hostname) {
            internal++;
          } else {
            external++;
          }
        }
      } catch {
        // Invalid URL
      }
    });

    return { internal, external, broken };
  }

  private analyzeOpenGraph(doc: Document) {
    const hasOgTitle = !!doc.querySelector('meta[property="og:title"]');
    const hasOgDescription = !!doc.querySelector('meta[property="og:description"]');
    const hasOgImage = !!doc.querySelector('meta[property="og:image"]');
    const hasOgUrl = !!doc.querySelector('meta[property="og:url"]');
    const complete = hasOgTitle && hasOgDescription && hasOgImage && hasOgUrl;

    return { hasOgTitle, hasOgDescription, hasOgImage, hasOgUrl, complete };
  }

  private analyzeTwitterCard(doc: Document) {
    const hasCard = !!doc.querySelector('meta[name="twitter:card"]');
    const hasTitle = !!doc.querySelector('meta[name="twitter:title"]');
    const hasDescription = !!doc.querySelector('meta[name="twitter:description"]');
    const hasImage = !!doc.querySelector('meta[name="twitter:image"]');
    const complete = hasCard && hasTitle && hasDescription && hasImage;

    return { hasCard, hasTitle, hasDescription, hasImage, complete };
  }

  private analyzeStructuredData(doc: Document) {
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    const types: string[] = [];
    let count = 0;

    scripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        count++;

        if (data['@type']) {
          types.push(data['@type']);
        } else if (data['@graph']) {
          data['@graph'].forEach((item: any) => {
            if (item['@type']) types.push(item['@type']);
          });
        }
      } catch {
        // Invalid JSON
      }
    });

    return { found: count > 0, types: [...new Set(types)], count };
  }

  private async analyzeRobots(doc: Document, url: string) {
    let hasRobotsTxt = false;

    try {
      const robotsUrl = new URL('/robots.txt', url).toString();
      const response = await fetch(robotsUrl, { method: 'HEAD' });
      hasRobotsTxt = response.ok;
    } catch {
      hasRobotsTxt = false;
    }

    const metaRobots = doc.querySelector('meta[name="robots"]');
    const hasMetaRobots = !!metaRobots;
    const robotsContent = metaRobots?.getAttribute('content')?.toLowerCase() || '';
    const isIndexable = !robotsContent.includes('noindex');

    return { hasRobotsTxt, isIndexable, hasMetaRobots };
  }

  private async checkSitemap(url: string) {
    const commonSitemapPaths = ['/sitemap.xml', '/sitemap_index.xml', '/sitemap.php'];

    for (const path of commonSitemapPaths) {
      try {
        const sitemapUrl = new URL(path, url).toString();
        const response = await fetch(sitemapUrl, { method: 'HEAD' });
        if (response.ok) {
          return { found: true, url: sitemapUrl };
        }
      } catch {
        // Continue to next path
      }
    }

    return { found: false };
  }

  private analyzeCanonical(doc: Document) {
    const canonical = doc.querySelector('link[rel="canonical"]');
    const exists = !!canonical;
    const url = canonical?.getAttribute('href') || undefined;

    return { exists, url };
  }

  private calculateSEOScore(data: Omit<SEOAnalysisResult, 'score' | 'recommendations'>): number {
    let score = 0;

    // Title (15 points)
    if (data.title.content) score += 10;
    if (data.title.optimal) score += 5;

    // Description (15 points)
    if (data.description.content) score += 10;
    if (data.description.optimal) score += 5;

    // Headings (10 points)
    if (data.headings.h1Count === 1) score += 5;
    if (data.headings.h2Count > 0) score += 3;
    if (data.headings.h3Count > 0) score += 2;

    // Images (10 points)
    if (data.images.altCoverage === 100) {
      score += 10;
    } else if (data.images.altCoverage >= 80) {
      score += 7;
    } else if (data.images.altCoverage >= 50) {
      score += 5;
    }

    // Open Graph (15 points)
    if (data.openGraph.complete) {
      score += 15;
    } else {
      score += Object.values(data.openGraph).filter(v => v === true).length * 3;
    }

    // Twitter Card (10 points)
    if (data.twitterCard.complete) {
      score += 10;
    } else {
      score += Object.values(data.twitterCard).filter(v => v === true).length * 2;
    }

    // Structured Data (10 points)
    if (data.structuredData.found) score += 10;

    // Robots (5 points)
    if (data.robots.hasRobotsTxt) score += 2;
    if (data.robots.isIndexable) score += 3;

    // Sitemap (5 points)
    if (data.sitemap.found) score += 5;

    // Canonical (5 points)
    if (data.canonicalUrl.exists) score += 5;

    return Math.min(100, score);
  }

  private generateRecommendations(data: Omit<SEOAnalysisResult, 'score' | 'recommendations'>): string[] {
    const recommendations: string[] = [];

    if (!data.title.content) {
      recommendations.push('Add a title tag to your page');
    } else if (!data.title.optimal) {
      if (data.title.length < 30) {
        recommendations.push('Title is too short. Aim for 30-60 characters');
      } else {
        recommendations.push('Title is too long. Aim for 30-60 characters');
      }
    }

    if (!data.description.content) {
      recommendations.push('Add a meta description to improve click-through rates');
    } else if (!data.description.optimal) {
      if (data.description.length < 120) {
        recommendations.push('Meta description is too short. Aim for 120-160 characters');
      } else {
        recommendations.push('Meta description is too long. Aim for 120-160 characters');
      }
    }

    if (data.headings.h1Count === 0) {
      recommendations.push('Add an H1 heading to your page');
    } else if (data.headings.hasMultipleH1) {
      recommendations.push('Use only one H1 heading per page');
    }

    if (data.images.altCoverage < 100) {
      recommendations.push(`Add alt text to ${data.images.withoutAlt} images for better accessibility and SEO`);
    }

    if (!data.openGraph.complete) {
      const missing = [];
      if (!data.openGraph.hasOgTitle) missing.push('og:title');
      if (!data.openGraph.hasOgDescription) missing.push('og:description');
      if (!data.openGraph.hasOgImage) missing.push('og:image');
      if (!data.openGraph.hasOgUrl) missing.push('og:url');
      recommendations.push(`Add Open Graph tags: ${missing.join(', ')}`);
    }

    if (!data.twitterCard.complete) {
      recommendations.push('Add Twitter Card meta tags for better social sharing');
    }

    if (!data.structuredData.found) {
      recommendations.push('Add structured data (Schema.org) to help search engines understand your content');
    }

    if (!data.robots.hasRobotsTxt) {
      recommendations.push('Create a robots.txt file to guide search engine crawlers');
    }

    if (!data.sitemap.found) {
      recommendations.push('Create an XML sitemap to help search engines discover your pages');
    }

    if (!data.canonicalUrl.exists) {
      recommendations.push('Add a canonical URL to prevent duplicate content issues');
    }

    return recommendations;
  }
}

export const seoAnalysisService = new SEOAnalysisService();
