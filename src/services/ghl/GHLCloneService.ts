import { loggingService } from '../LoggingService';
import type { GHLCloneScope, GHLCloneDestination, GHLCloneResult, GHLCustomCode, GHLAsset, GHLPage, GHLFunnel, GHLWebsite } from '../../types/ghl.types';

export class GHLCloneService {
  /**
   * Clone GHL page/funnel/website to another GHL account
   */
  async cloneGHL(
    scope: GHLCloneScope,
    destination: GHLCloneDestination
  ): Promise<GHLCloneResult> {
    loggingService.info('ghl-clone', `Starting GHL clone: ${scope.type} from ${scope.sourceUrl}`);

    try {
      // Step 1: Fetch the source content
      const { html, assets, customCodes } = await this.fetchGHLContent(scope.sourceUrl, scope.type);

      // Step 2: Parse pages based on scope
      const pages = await this.parsePages(html, scope);

      // Step 3: Clone assets
      const clonedAssets = await this.cloneAssets(assets);

      // Step 4: Process custom codes
      const processedCodes = await this.extractCustomCodes(html);

      // Step 5: Return result
      const result: GHLCloneResult = {
        success: true,
        sourceUrl: scope.sourceUrl,
        cloneScope: scope.type,
        destination,
        clonedPages: pages,
        customCodes: [...customCodes, ...processedCodes],
        assets: clonedAssets,
        warnings: [],
        errors: [],
        stats: {
          pagesCloned: pages.length,
          assetsCloned: clonedAssets.length,
          customCodesFound: customCodes.length + processedCodes.length,
          totalSize: this.calculateTotalSize(html, clonedAssets),
        },
      };

      loggingService.success('ghl-clone', `Successfully cloned ${pages.length} pages`);
      return result;
    } catch (error) {
      loggingService.error('ghl-clone', 'Clone failed', error);
      throw error;
    }
  }

  /**
   * Fetch content from GHL URL
   */
  private async fetchGHLContent(
    url: string,
    scopeType: GHLCloneScope['type']
  ): Promise<{ html: string; assets: GHLAsset[]; customCodes: GHLCustomCode[] }> {
    loggingService.info('ghl-clone', `Fetching content from ${url}`);

    try {
      // Use CORS proxy to fetch the URL
      const corsProxy = 'https://api.allorigins.win/raw?url=';
      const proxyUrl = `${corsProxy}${encodeURIComponent(url)}`;

      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
      }

      const html = await response.text();

      // Extract assets
      const assets = this.extractAssets(html, url);

      // Extract custom codes
      const customCodes = this.extractCustomCodes(html);

      return { html, assets, customCodes };
    } catch (error) {
      loggingService.error('ghl-clone', 'Failed to fetch content', error);
      throw error;
    }
  }

  /**
   * Parse pages based on clone scope
   */
  private async parsePages(html: string, scope: GHLCloneScope): Promise<GHLPage[]> {
    const pages: GHLPage[] = [];

    if (scope.type === 'single-page') {
      // Single page - just return the HTML as one page
      pages.push({
        id: `page-${Date.now()}`,
        name: this.extractPageTitle(html) || 'Cloned Page',
        url: scope.sourceUrl,
        html,
      });
    } else if (scope.type === 'entire-funnel') {
      // Entire funnel - extract links to other funnel pages
      const funnelPages = this.extractFunnelPages(html, scope.sourceUrl);

      for (const pageUrl of funnelPages) {
        try {
          const { html: pageHtml } = await this.fetchGHLContent(pageUrl, 'single-page');
          pages.push({
            id: `page-${Date.now()}-${pages.length}`,
            name: this.extractPageTitle(pageHtml) || `Page ${pages.length + 1}`,
            url: pageUrl,
            html: pageHtml,
          });
        } catch (error) {
          loggingService.warning('ghl-clone', `Failed to fetch funnel page: ${pageUrl}`);
        }
      }
    } else if (scope.type === 'entire-website') {
      // Entire website - extract all website pages
      const websitePages = this.extractWebsitePages(html, scope.sourceUrl);

      for (const pageUrl of websitePages) {
        try {
          const { html: pageHtml } = await this.fetchGHLContent(pageUrl, 'single-page');
          pages.push({
            id: `page-${Date.now()}-${pages.length}`,
            name: this.extractPageTitle(pageHtml) || `Page ${pages.length + 1}`,
            url: pageUrl,
            html: pageHtml,
          });
        } catch (error) {
          loggingService.warning('ghl-clone', `Failed to fetch website page: ${pageUrl}`);
        }
      }
    }

    return pages;
  }

  /**
   * Extract assets from HTML
   */
  private extractAssets(html: string, baseUrl: string): GHLAsset[] {
    const assets: GHLAsset[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract images
    const images = doc.querySelectorAll('img[src]');
    images.forEach((img) => {
      const src = (img as HTMLImageElement).src;
      if (src && !src.startsWith('data:')) {
        assets.push({
          originalUrl: this.resolveUrl(src, baseUrl),
          type: 'image',
          size: 0,
          optimized: false,
        });
      }
    });

    // Extract background images from inline styles
    const elementsWithBg = doc.querySelectorAll('[style*="background"]');
    elementsWithBg.forEach((el) => {
      const style = (el as HTMLElement).style.backgroundImage;
      const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (match && match[1] && !match[1].startsWith('data:')) {
        assets.push({
          originalUrl: this.resolveUrl(match[1], baseUrl),
          type: 'image',
          size: 0,
          optimized: false,
        });
      }
    });

    // Extract CSS files
    const cssLinks = doc.querySelectorAll('link[rel="stylesheet"]');
    cssLinks.forEach((link) => {
      const href = (link as HTMLLinkElement).href;
      if (href) {
        assets.push({
          originalUrl: this.resolveUrl(href, baseUrl),
          type: 'css',
          size: 0,
          optimized: false,
        });
      }
    });

    // Extract fonts
    const fonts = doc.querySelectorAll('link[rel*="font"], style');
    fonts.forEach((font) => {
      if (font.tagName === 'LINK') {
        const href = (font as HTMLLinkElement).href;
        if (href && href.includes('font')) {
          assets.push({
            originalUrl: this.resolveUrl(href, baseUrl),
            type: 'font',
            size: 0,
            optimized: false,
          });
        }
      }
    });

    return assets;
  }

  /**
   * Extract custom codes and tracking pixels
   */
  private extractCustomCodes(html: string): GHLCustomCode[] {
    const customCodes: GHLCustomCode[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract tracking pixels (common patterns)
    const trackingPatterns = [
      { name: 'Google Analytics', pattern: /gtag\(|GoogleAnalyticsObject|ga\('create'/ },
      { name: 'Facebook Pixel', pattern: /fbq\(|facebook\.com\/tr\?/ },
      { name: 'Google Tag Manager', pattern: /googletagmanager\.com\/gtm\.js/ },
      { name: 'Hotjar', pattern: /static\.hotjar\.com/ },
      { name: 'Intercom', pattern: /widget\.intercom\.io/ },
    ];

    // Extract scripts in head
    const headScripts = doc.head.querySelectorAll('script');
    headScripts.forEach((script) => {
      const content = script.textContent || script.innerHTML;
      const src = script.getAttribute('src');

      if (content || src) {
        const matchedPattern = trackingPatterns.find(p => p.pattern.test(content || src || ''));
        customCodes.push({
          type: matchedPattern ? 'tracking-pixel' : 'custom-script',
          code: src ? `<script src="${src}"></script>` : `<script>${content}</script>`,
          position: 'head',
          description: matchedPattern ? matchedPattern.name : 'Custom Script',
        });
      }
    });

    // Extract scripts in body
    const bodyScripts = doc.body.querySelectorAll('script');
    bodyScripts.forEach((script) => {
      const content = script.textContent || script.innerHTML;
      const src = script.getAttribute('src');

      if (content || src) {
        const matchedPattern = trackingPatterns.find(p => p.pattern.test(content || src || ''));
        customCodes.push({
          type: matchedPattern ? 'tracking-pixel' : 'custom-script',
          code: src ? `<script src="${src}"></script>` : `<script>${content}</script>`,
          position: 'body-end',
          description: matchedPattern ? matchedPattern.name : 'Custom Script',
        });
      }
    });

    // Extract noscript tags (often used for tracking pixels)
    const noscripts = doc.querySelectorAll('noscript');
    noscripts.forEach((noscript) => {
      const content = noscript.innerHTML;
      if (content) {
        customCodes.push({
          type: 'tracking-pixel',
          code: `<noscript>${content}</noscript>`,
          position: 'body-start',
          description: 'Tracking Pixel (noscript)',
        });
      }
    });

    return customCodes;
  }

  /**
   * Clone assets (placeholder - actual implementation would upload to GHL)
   */
  private async cloneAssets(assets: GHLAsset[]): Promise<GHLAsset[]> {
    // For now, just return the assets as-is
    // In production, this would upload assets to GHL storage
    return assets;
  }

  /**
   * Extract funnel pages from HTML
   */
  private extractFunnelPages(html: string, baseUrl: string): string[] {
    const pages: string[] = [baseUrl]; // Include current page
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract all links that might be funnel pages
    const links = doc.querySelectorAll('a[href]');
    const baseDomain = new URL(baseUrl).hostname;

    links.forEach((link) => {
      const href = (link as HTMLAnchorElement).href;
      try {
        const linkUrl = new URL(href);
        // Only include links from the same domain
        if (linkUrl.hostname === baseDomain && !pages.includes(href)) {
          pages.push(href);
        }
      } catch (error) {
        // Invalid URL, skip
      }
    });

    return pages;
  }

  /**
   * Extract website pages from HTML
   */
  private extractWebsitePages(html: string, baseUrl: string): string[] {
    // For websites, use the same logic as funnels
    return this.extractFunnelPages(html, baseUrl);
  }

  /**
   * Extract page title from HTML
   */
  private extractPageTitle(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const title = doc.querySelector('title');
    return title?.textContent || '';
  }

  /**
   * Resolve relative URL to absolute
   */
  private resolveUrl(url: string, baseUrl: string): string {
    try {
      return new URL(url, baseUrl).href;
    } catch (error) {
      return url;
    }
  }

  /**
   * Calculate total size
   */
  private calculateTotalSize(html: string, assets: GHLAsset[]): number {
    const htmlSize = new Blob([html]).size;
    const assetsSize = assets.reduce((sum, asset) => sum + asset.size, 0);
    return htmlSize + assetsSize;
  }
}

export const ghlCloneService = new GHLCloneService();
