import type { CloneOptions, CloneProject, ClonedAsset, WebsiteMetadata } from '../types';
import { loggingService } from './LoggingService';
import { performanceService } from './PerformanceService';
import { lighthouseService } from './LighthouseService';
import { supabase } from '../lib/supabase';
import { validateURL } from '../utils/security/validator';
import { sanitizeHTML } from '../utils/security/sanitizer';
import { cloneLimiter } from '../utils/security/rateLimiter';
import { securityLogger } from './SecurityLogger';
import { ComponentDetector } from './detection/ComponentDetector';

export class CloneService {
  private projects: Map<string, CloneProject> = new Map();
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

  async cloneWebsite(options: CloneOptions): Promise<CloneProject> {
    console.log('CloneService.cloneWebsite called with options:', options);

    // Validate URL
    const urlValidation = validateURL(options.source);
    if (!urlValidation.isValid) {
      await securityLogger.logValidationFailed('clone_url', urlValidation.error || 'Invalid');
      throw new Error(urlValidation.error || 'Invalid URL');
    }

    // Check rate limit (10 clones per hour)
    const rateLimitCheck = cloneLimiter.check('clone');
    if (!rateLimitCheck.allowed) {
      await securityLogger.logRateLimitExceeded('clone');
      throw new Error('Too many clone requests. Please try again later.');
    }

    // Use sanitized URL
    const sanitizedURL = urlValidation.sanitized || options.source;

    loggingService.info('clone', `Starting analysis for ${sanitizedURL}`, { options });

    const projectId = this.generateId();
    console.log('Generated project ID:', projectId);

    const project: CloneProject = {
      id: projectId,
      source: sanitizedURL,
      type: options.type,
      status: 'analyzing',
      progress: 0,
      currentStep: 'Initializing',
      createdAt: new Date(),
      assets: [],
    };

    this.projects.set(projectId, project);
    console.log('Project added to map, starting analysis...');

    try {
      await this.startAnalysis(projectId, options, project);
      console.log('Analysis completed successfully');
    } catch (error) {
      console.error('Analysis failed with error:', error);
      project.status = 'error';
      project.currentStep = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;

      loggingService.error('clone', `Analysis failed for ${options.source}`, {
        projectId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    console.log('Returning project:', project);
    return project;
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  private async startAnalysis(projectId: string, options: CloneOptions, project: CloneProject): Promise<void> {
    try {
      console.log('startAnalysis: Step 1 - Fetching HTML');
      project.progress = 10;
      project.currentStep = 'Fetching HTML';

      const html = await this.fetchHtml(options.source);
      console.log('startAnalysis: HTML fetched, length:', html.length);
      project.originalHtml = html;

      console.log('startAnalysis: Step 2 - Parsing HTML');
      project.progress = 30;
      project.currentStep = 'Parsing HTML structure';

      const parsedData = this.parseHtml(html, options.source);
      console.log('startAnalysis: HTML parsed');

      console.log('startAnalysis: Step 3 - Extracting metadata');
      project.progress = 50;
      project.currentStep = 'Extracting metadata';

      const metadata = this.extractMetadata(parsedData, html);
      project.metadata = metadata;
      console.log('startAnalysis: Metadata extracted:', metadata);

      loggingService.info('clone', `Detected framework: ${metadata.framework}`, { projectId });

      console.log('startAnalysis: Step 4 - Detecting page builder components');
      project.progress = 40;
      project.currentStep = 'Detecting page builder components';

      const detector = new ComponentDetector();
      const detection = detector.detect(html);
      project.detection = detection;
      console.log('startAnalysis: Component detection completed:', {
        builder: detection.builder,
        components: detection.components.length,
        confidence: detection.confidence,
      });

      loggingService.info('clone', `Detected builder: ${detection.builder || 'none'}`, {
        projectId,
        componentsCount: detection.components.length
      });

      // Download assets if requested
      if (options.includeAssets !== false) {
        console.log('startAnalysis: Step 5 - Downloading CSS');
        project.progress = 50;
        project.currentStep = 'Downloading CSS files';

        const cssAssets = await this.extractAndDownloadCSS(parsedData, options.source);

        console.log('startAnalysis: Step 6 - Downloading images');
        project.progress = 60;
        project.currentStep = 'Downloading images';

        const imageAssets = await this.extractAndDownloadImages(parsedData, options.source);

        console.log('startAnalysis: Step 7 - Downloading fonts');
        project.progress = 65;
        project.currentStep = 'Downloading fonts';

        const fontAssets = await this.extractAndDownloadFonts(parsedData, options.source);

        const allAssets = [...cssAssets, ...imageAssets, ...fontAssets];
        project.assets = allAssets;

        console.log(`startAnalysis: Downloaded ${allAssets.length} assets`);
        loggingService.info('clone', `Downloaded ${allAssets.length} assets`, { projectId });

        console.log('startAnalysis: Step 8 - Embedding assets in HTML');
        project.progress = 70;
        project.currentStep = 'Embedding assets in HTML';

        const rewrittenHtml = this.rewriteHtmlWithLocalPaths(html, allAssets);
        project.originalHtml = rewrittenHtml;

        metadata.totalSize = this.calculateTotalSize(allAssets);
        metadata.assetCount = allAssets.length;
      }

      console.log('startAnalysis: Step 9 - Analyzing performance');
      project.progress = 75;
      project.currentStep = 'Analyzing performance metrics';

      const metrics = await performanceService.analyzePerformance(html, '', '', options.source);
      project.originalScore = metrics.score;
      project.metrics = metrics;
      console.log('startAnalysis: Performance analyzed, score:', metrics.score);

      console.log('startAnalysis: Step 10 - Running Lighthouse audit');
      project.progress = 90;
      project.currentStep = 'Running Lighthouse audit';

      try {
        const lighthouseResults = await lighthouseService.runAuditWithRetry(options.source);
        metrics.lighthouse = lighthouseResults;
        project.originalScore = Math.round((metrics.score + lighthouseResults.performanceScore) / 2);
        console.log('startAnalysis: Lighthouse completed, score:', lighthouseResults.performanceScore);

        loggingService.success('clone', `Lighthouse audit completed - Score: ${lighthouseResults.performanceScore}`, {
          projectId,
          lighthouseScore: lighthouseResults.performanceScore,
        });
      } catch (error) {
        console.log('startAnalysis: Lighthouse failed, using custom metrics only');
        loggingService.warning('clone', 'Lighthouse audit failed, continuing with custom metrics', {
          projectId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      console.log('startAnalysis: Step 11 - Saving project');
      project.progress = 100;
      project.currentStep = 'Analysis completed';
      project.status = 'completed';

      await this.saveProject(project);
      console.log('startAnalysis: Project saved successfully');

      loggingService.success('clone', `Successfully analyzed ${options.source}`, {
        projectId,
        score: metrics.score,
      });
    } catch (error) {
      console.error('startAnalysis: Error occurred:', error);
      project.status = 'error';
      project.currentStep = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      await this.saveProject(project).catch(() => {});

      loggingService.error('clone', 'Analysis process error', {
        projectId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async downloadAssets(projectId: string): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (!project.originalHtml) {
      throw new Error('No HTML to process');
    }

    loggingService.info('clone', `Starting asset download for project ${projectId}`);

    try {
      project.status = 'cloning';
      project.progress = 0;
      project.currentStep = 'Downloading assets';

      const parsedData = this.parseHtml(project.originalHtml, project.source);

      project.progress = 20;
      project.currentStep = 'Downloading CSS files';

      const cssAssets = await this.extractAndDownloadCSS(parsedData, project.source);

      project.progress = 40;
      project.currentStep = 'Downloading JavaScript files';

      const jsAssets = await this.extractAndDownloadJS(parsedData, project.source);

      project.progress = 60;
      project.currentStep = 'Downloading images';

      const imageAssets = await this.extractAndDownloadImages(parsedData, project.source);

      project.progress = 80;
      project.currentStep = 'Downloading fonts';

      const fontAssets = await this.extractAndDownloadFonts(parsedData, project.source);

      const allAssets = [...cssAssets, ...jsAssets, ...imageAssets, ...fontAssets];
      project.assets = allAssets;

      loggingService.info('clone', `Downloaded ${allAssets.length} assets`, { projectId });

      project.progress = 90;
      project.currentStep = 'Rewriting HTML with local paths';

      const rewrittenHtml = this.rewriteHtmlWithLocalPaths(project.originalHtml, allAssets);
      project.originalHtml = rewrittenHtml;

      if (project.metadata) {
        project.metadata.totalSize = this.calculateTotalSize(allAssets);
        project.metadata.assetCount = allAssets.length;
      }

      project.progress = 100;
      project.currentStep = 'Download completed';
      project.status = 'completed';

      await this.saveProject(project);

      loggingService.success('clone', `Successfully downloaded assets for project ${projectId}`);
    } catch (error) {
      project.status = 'error';
      project.currentStep = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      await this.saveProject(project).catch(() => {});

      loggingService.error('clone', 'Asset download error', {
        projectId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private async startCloning(projectId: string, options: CloneOptions, project: CloneProject): Promise<void> {
    try {
      project.progress = 10;
      project.currentStep = 'Fetching HTML';

      const html = await this.fetchHtml(options.source);
      project.originalHtml = html;

      project.progress = 20;
      project.currentStep = 'Parsing HTML structure';

      const parsedData = this.parseHtml(html, options.source);

      project.progress = 30;
      project.currentStep = 'Extracting metadata';

      const metadata = this.extractMetadata(parsedData, html);
      project.metadata = metadata;

      loggingService.info('clone', `Detected framework: ${metadata.framework}`, { projectId });

      if (options.includeAssets !== false) {
        project.progress = 40;
        project.currentStep = 'Extracting CSS files';

        const cssAssets = await this.extractAndDownloadCSS(parsedData, options.source);

        project.progress = 50;
        project.currentStep = 'Extracting JavaScript files';

        const jsAssets = await this.extractAndDownloadJS(parsedData, options.source);

        project.progress = 60;
        project.currentStep = 'Extracting images';

        const imageAssets = await this.extractAndDownloadImages(parsedData, options.source);

        project.progress = 70;
        project.currentStep = 'Extracting fonts';

        const fontAssets = await this.extractAndDownloadFonts(parsedData, options.source);

        const allAssets = [...cssAssets, ...jsAssets, ...imageAssets, ...fontAssets];
        project.assets = allAssets;

        loggingService.info('clone', `Extracted ${allAssets.length} assets`, { projectId });

        project.progress = 75;
        project.currentStep = 'Rewriting HTML with local paths';

        const rewrittenHtml = this.rewriteHtmlWithLocalPaths(html, allAssets);
        project.originalHtml = rewrittenHtml;

        metadata.totalSize = this.calculateTotalSize(allAssets);
        metadata.assetCount = allAssets.length;
      }

      project.progress = 80;
      project.currentStep = 'Analyzing performance metrics';

      const metrics = await performanceService.analyzePerformance(html, '', '', options.source);
      project.originalScore = metrics.score;
      project.metrics = metrics;

      project.progress = 90;
      project.currentStep = 'Running Lighthouse audit';

      try {
        const lighthouseResults = await lighthouseService.runAuditWithRetry(options.source);
        metrics.lighthouse = lighthouseResults;
        project.originalScore = Math.round((metrics.score + lighthouseResults.performanceScore) / 2);

        loggingService.success('clone', `Lighthouse audit completed - Score: ${lighthouseResults.performanceScore}`, {
          projectId,
          lighthouseScore: lighthouseResults.performanceScore,
        });
      } catch (error) {
        loggingService.warning('clone', 'Lighthouse audit failed, continuing with custom metrics', {
          projectId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      project.progress = 100;
      project.currentStep = 'Clone completed';
      project.status = 'completed';

      await this.saveProject(project);

      loggingService.success('clone', `Successfully cloned ${options.source}`, {
        projectId,
        score: metrics.score,
      });
    } catch (error) {
      project.status = 'error';
      project.currentStep = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      await this.saveProject(project).catch(() => {});

      loggingService.error('clone', 'Clone process error', {
        projectId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private async fetchHtml(url: string): Promise<string> {
    // List of CORS proxies to try in order
    const corsProxies = [
      { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, name: 'AllOrigins' },
      { url: `https://corsproxy.io/?${encodeURIComponent(url)}`, name: 'CorsProxy.io' },
      { url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`, name: 'CodeTabs' },
      { url: `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(url)}`, name: 'ThingProxy' },
      { url: url, name: 'Direct (no proxy)' }, // Last resort - direct fetch
    ];

    let lastError: Error | null = null;

    for (let i = 0; i < corsProxies.length; i++) {
      const proxy = corsProxies[i];
      const proxyUrl = proxy.url;
      const proxyName = proxy.name;

      try {
        console.log(`fetchHtml: Attempting proxy ${i + 1}/${corsProxies.length} (${proxyName})`);
        loggingService.debug('clone', `Fetching HTML from ${url} via ${proxyName}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch(proxyUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': this.userAgent,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.log(`fetchHtml: Proxy ${proxyName} returned status ${response.status}`);
          throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();

        if (!html || html.length < 100) {
          console.log(`fetchHtml: Proxy ${proxyName} returned insufficient data (${html.length} bytes)`);
          throw new Error('Response too small, likely empty');
        }

        console.log(`fetchHtml: Success with ${proxyName} - ${html.length} bytes fetched`);
        loggingService.debug('clone', `Successfully fetched HTML from ${url} via ${proxyName}`, {
          size: html.length,
        });
        return html;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.log(`fetchHtml: Proxy ${proxyName} failed:`, lastError.message);

        // If this isn't the last proxy, continue to the next one
        if (i < corsProxies.length - 1) {
          console.log(`fetchHtml: Trying next proxy...`);
          continue;
        }
      }
    }

    // All proxies failed
    const errorMsg = `All CORS proxies failed. Last error: ${lastError?.message || 'Unknown'}`;
    console.error('fetchHtml: All proxies exhausted');
    loggingService.error('clone', `Failed to fetch URL after trying all proxies: ${url}`, {
      error: lastError?.message,
      proxiesAttempted: corsProxies.length,
    });

    throw new Error(errorMsg);
  }

  private parseHtml(html: string, baseUrl: string): ParsedHTML {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const images = Array.from(doc.querySelectorAll('img')).map((img) => ({
      src: this.resolveUrl(img.getAttribute('src') || '', baseUrl),
      alt: img.getAttribute('alt') || '',
      width: parseInt(img.getAttribute('width') || '0'),
      height: parseInt(img.getAttribute('height') || '0'),
      element: img,
    }));

    const stylesheets = Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map(
      (link) => ({
        href: this.resolveUrl(link.getAttribute('href') || '', baseUrl),
        element: link,
      })
    );

    const inlineStyles = Array.from(doc.querySelectorAll('style')).map((style) => ({
      content: style.textContent || '',
      element: style,
    }));

    const scripts = Array.from(doc.querySelectorAll('script[src]')).map((script) => ({
      src: this.resolveUrl(script.getAttribute('src') || '', baseUrl),
      element: script,
    }));

    const inlineScripts = Array.from(doc.querySelectorAll('script:not([src])')).map((script) => ({
      content: script.textContent || '',
      element: script,
    }));

    const fonts = this.extractFontsFromStyles(doc, baseUrl);

    const backgroundImages = this.extractBackgroundImages(doc, baseUrl);

    return {
      document: doc,
      images,
      stylesheets,
      inlineStyles,
      scripts,
      inlineScripts,
      fonts,
      backgroundImages,
    };
  }

  private extractFontsFromStyles(doc: Document, baseUrl: string): Array<{ href: string }> {
    const fonts: Array<{ href: string }> = [];

    const fontLinks = Array.from(doc.querySelectorAll('link[rel*="font"]'));
    fontLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        fonts.push({ href: this.resolveUrl(href, baseUrl) });
      }
    });

    const styles = Array.from(doc.querySelectorAll('style'));
    styles.forEach(style => {
      const content = style.textContent || '';
      const fontFaceRegex = /@font-face\s*{[^}]*src:\s*url\(['"]?([^'"()]+)['"]?\)/g;
      let match;
      while ((match = fontFaceRegex.exec(content)) !== null) {
        fonts.push({ href: this.resolveUrl(match[1], baseUrl) });
      }
    });

    return fonts;
  }

  private extractBackgroundImages(doc: Document, baseUrl: string): Array<{ src: string }> {
    const bgImages: Array<{ src: string }> = [];

    const elementsWithStyle = Array.from(doc.querySelectorAll('[style*="background"]'));
    elementsWithStyle.forEach(el => {
      const style = el.getAttribute('style') || '';
      const urlMatch = style.match(/url\(['"]?([^'"()]+)['"]?\)/);
      if (urlMatch && urlMatch[1]) {
        bgImages.push({ src: this.resolveUrl(urlMatch[1], baseUrl) });
      }
    });

    return bgImages;
  }

  private extractMetadata(parsed: ParsedHTML, html: string): WebsiteMetadata {
    const doc = parsed.document;

    const title = doc.querySelector('title')?.textContent || 'Untitled Website';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content');
    const favicon = doc.querySelector('link[rel="icon"]')?.getAttribute('href') ||
                    doc.querySelector('link[rel="shortcut icon"]')?.getAttribute('href');

    const framework = this.detectFramework(html, doc);
    const responsive = this.checkResponsive(doc, parsed.inlineStyles);

    return {
      title,
      description,
      favicon,
      framework,
      responsive,
      totalSize: 0,
      assetCount: 0,
      pageCount: 1,
    };
  }

  private detectFramework(html: string, doc: Document): string {
    if (html.includes('__NEXT_DATA__') || html.includes('_next/static')) {
      return 'Next.js';
    }
    if (html.includes('react') || html.includes('data-reactroot') || html.includes('data-reactid')) {
      return 'React';
    }
    if (html.includes('__NUXT__')) {
      return 'Nuxt.js';
    }
    if (html.includes('v-cloak') || html.includes('v-if') || html.includes('v-for')) {
      return 'Vue';
    }
    if (html.includes('ng-version') || html.includes('ng-app') || html.includes('ngApp')) {
      return 'Angular';
    }
    if (doc.querySelector('script[src*="jquery"]')) {
      return 'jQuery';
    }
    if (html.includes('svelte-') || doc.querySelector('script[src*="svelte"]')) {
      return 'Svelte';
    }
    return 'Vanilla';
  }

  private checkResponsive(doc: Document, inlineStyles: Array<{ content: string }>): boolean {
    const viewport = doc.querySelector('meta[name="viewport"]');
    if (viewport) return true;

    for (const style of inlineStyles) {
      if (style.content.includes('@media')) {
        return true;
      }
    }

    return false;
  }

  private async extractAndDownloadCSS(parsed: ParsedHTML, baseUrl: string): Promise<ClonedAsset[]> {
    const assets: ClonedAsset[] = [];

    for (const stylesheet of parsed.stylesheets.slice(0, 10)) {
      if (stylesheet.href) {
        const asset = await this.downloadTextAsset(stylesheet.href, 'css');
        if (asset) assets.push(asset);
      }
    }

    for (let i = 0; i < parsed.inlineStyles.length; i++) {
      const style = parsed.inlineStyles[i];
      if (style.content) {
        assets.push({
          type: 'css',
          originalUrl: `inline-style-${i}`,
          localPath: `./assets/css/inline-${i}.css`,
          size: new Blob([style.content]).size,
          content: style.content,
          format: 'css',
        });
      }
    }

    return assets;
  }

  private async extractAndDownloadJS(parsed: ParsedHTML, baseUrl: string): Promise<ClonedAsset[]> {
    const assets: ClonedAsset[] = [];

    for (const script of parsed.scripts.slice(0, 10)) {
      if (script.src) {
        const asset = await this.downloadTextAsset(script.src, 'js');
        if (asset) assets.push(asset);
      }
    }

    for (let i = 0; i < parsed.inlineScripts.length; i++) {
      const script = parsed.inlineScripts[i];
      if (script.content) {
        assets.push({
          type: 'js',
          originalUrl: `inline-script-${i}`,
          localPath: `./assets/js/inline-${i}.js`,
          size: new Blob([script.content]).size,
          content: script.content,
          format: 'js',
        });
      }
    }

    return assets;
  }

  private async extractAndDownloadImages(parsed: ParsedHTML, baseUrl: string): Promise<ClonedAsset[]> {
    const assets: ClonedAsset[] = [];

    for (const img of parsed.images.slice(0, 30)) {
      if (img.src && !img.src.startsWith('data:')) {
        const asset = await this.downloadBinaryAsset(img.src, 'image');
        if (asset) {
          if (img.width && img.height) {
            asset.dimensions = { width: img.width, height: img.height };
          }
          assets.push(asset);
        }
      }
    }

    for (const bgImg of parsed.backgroundImages.slice(0, 10)) {
      if (bgImg.src && !bgImg.src.startsWith('data:')) {
        const asset = await this.downloadBinaryAsset(bgImg.src, 'image');
        if (asset) assets.push(asset);
      }
    }

    return assets;
  }

  private async extractAndDownloadFonts(parsed: ParsedHTML, baseUrl: string): Promise<ClonedAsset[]> {
    const assets: ClonedAsset[] = [];

    for (const font of parsed.fonts.slice(0, 10)) {
      if (font.href) {
        const asset = await this.downloadBinaryAsset(font.href, 'font');
        if (asset) assets.push(asset);
      }
    }

    return assets;
  }

  private async downloadTextAsset(url: string, type: 'css' | 'js'): Promise<ClonedAsset | null> {
    try {
      const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const response = await fetch(corsProxyUrl, {
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        loggingService.debug('clone', `Failed to download ${type}: ${url} (${response.status})`);
        return null;
      }

      const content = await response.text();
      const size = new Blob([content]).size;

      const asset: ClonedAsset = {
        type,
        originalUrl: url,
        localPath: this.generateLocalPath(url, type),
        size,
        content,
        format: type,
      };

      loggingService.debug('clone', `Downloaded ${type}: ${url} (${size} bytes)`);
      return asset;
    } catch (error) {
      loggingService.debug('clone', `Error downloading ${type}: ${url}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  private async downloadBinaryAsset(url: string, type: 'image' | 'font'): Promise<ClonedAsset | null> {
    try {
      const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const response = await fetch(corsProxyUrl, {
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        loggingService.debug('clone', `Failed to download ${type}: ${url} (${response.status})`);
        return null;
      }

      const blob = await response.blob();
      const size = blob.size;

      const base64Content = await this.blobToBase64(blob);

      const asset: ClonedAsset = {
        type,
        originalUrl: url,
        localPath: this.generateLocalPath(url, type === 'image' ? 'images' : 'fonts'),
        size,
        content: base64Content,
        format: this.getFileExtension(url),
      };

      loggingService.debug('clone', `Downloaded ${type}: ${url} (${size} bytes)`);
      return asset;
    } catch (error) {
      loggingService.debug('clone', `Error downloading ${type}: ${url}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private resolveUrl(url: string, baseUrl: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('data:')) return url;

    try {
      return new URL(url, baseUrl).href;
    } catch {
      return url;
    }
  }

  private generateLocalPath(url: string, folder: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() || 'file';
      const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      return `./assets/${folder}/${sanitized}`;
    } catch {
      return `./assets/${folder}/${Date.now()}`;
    }
  }

  private getFileExtension(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const ext = pathname.split('.').pop() || '';
      return ext.toLowerCase();
    } catch {
      return '';
    }
  }

  private rewriteHtmlWithLocalPaths(html: string, assets: ClonedAsset[]): string {
    let rewrittenHtml = html;

    for (const asset of assets) {
      if (asset.originalUrl.startsWith('inline-')) continue;

      const escapedUrl = asset.originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedUrl, 'g');

      if (asset.type === 'image' && asset.content?.startsWith('data:')) {
        rewrittenHtml = rewrittenHtml.replace(regex, asset.content);
      } else {
        rewrittenHtml = rewrittenHtml.replace(regex, asset.localPath);
      }
    }

    loggingService.debug('clone', `Rewrote HTML with ${assets.length} local paths`);
    return rewrittenHtml;
  }

  private calculateTotalSize(assets: ClonedAsset[]): number {
    return assets.reduce((total, asset) => total + asset.size, 0);
  }

  async saveProject(project: CloneProject): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('projects')
        .upsert({
          id: project.id,
          user_id: user.id,
          source: project.source,
          type: project.type,
          status: project.status,
          progress: project.progress,
          current_step: project.currentStep,
          original_html: project.originalHtml,
          optimized_html: project.optimizedHtml,
          original_score: project.originalScore,
          optimized_score: project.optimizedScore,
          metrics: project.metrics || {},
          assets: project.assets || [],
          metadata: project.metadata || {},
          created_at: project.createdAt.toISOString(),
        });

      if (error) throw error;
      loggingService.info('clone', `Saved project ${project.id} to database`);
    } catch (error) {
      loggingService.error('clone', 'Failed to save project', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getProject(id: string): Promise<CloneProject | null> {
    const cached = this.projects.get(id);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const project = this.mapDatabaseToProject(data);
      this.projects.set(id, project);
      return project;
    } catch (error) {
      loggingService.error('clone', 'Failed to get project', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  async getAllProjects(): Promise<CloneProject[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projects = (data || []).map(row => this.mapDatabaseToProject(row));
      projects.forEach(project => this.projects.set(project.id, project));
      return projects;
    } catch (error) {
      loggingService.error('clone', 'Failed to get all projects', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return Array.from(this.projects.values());
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      this.projects.delete(id);
      loggingService.info('clone', `Deleted project ${id}`);
      return true;
    } catch (error) {
      loggingService.error('clone', 'Failed to delete project', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  async archiveProject(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ archived: true })
        .eq('id', id);

      if (error) throw error;

      const project = this.projects.get(id);
      if (project) {
        project.archived = true;
        this.projects.set(id, project);
      }

      loggingService.info('clone', `Archived project ${id}`);
      return true;
    } catch (error) {
      loggingService.error('clone', 'Failed to archive project', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  async unarchiveProject(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ archived: false })
        .eq('id', id);

      if (error) throw error;

      const project = this.projects.get(id);
      if (project) {
        project.archived = false;
        this.projects.set(id, project);
      }

      loggingService.info('clone', `Unarchived project ${id}`);
      return true;
    } catch (error) {
      loggingService.error('clone', 'Failed to unarchive project', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  private mapDatabaseToProject(row: any): CloneProject {
    return {
      id: row.id,
      source: row.source,
      type: row.type,
      status: row.status,
      progress: row.progress,
      currentStep: row.current_step,
      createdAt: new Date(row.created_at),
      originalHtml: row.original_html,
      optimizedHtml: row.optimized_html,
      originalScore: row.original_score,
      optimizedScore: row.optimized_score,
      metrics: row.metrics,
      assets: row.assets,
      archived: row.archived || false,
      metadata: row.metadata,
    };
  }
}

interface ParsedHTML {
  document: Document;
  images: Array<{ src: string; alt: string; width: number; height: number; element: Element }>;
  stylesheets: Array<{ href: string; element: Element }>;
  inlineStyles: Array<{ content: string; element: Element }>;
  scripts: Array<{ src: string; element: Element }>;
  inlineScripts: Array<{ content: string; element: Element }>;
  fonts: Array<{ href: string }>;
  backgroundImages: Array<{ src: string }>;
}

export const cloneService = new CloneService();
