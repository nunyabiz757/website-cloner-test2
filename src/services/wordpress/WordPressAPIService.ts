import axios, { AxiosError } from 'axios';
import { loggingService } from '../LoggingService';
import type {
  WordPressBlock,
  WordPressPost,
  WordPressSiteInfo,
  WordPressDetectionResult,
  WordPressPageBuilder,
  WordPressCloneResult,
  WordPressCloneOptions,
  WordPressAPIResponse,
} from '../../types/wordpress';

/**
 * WordPress REST API Service
 *
 * This service provides native WordPress block detection and cloning via the REST API.
 * It's the KEY to solving WordPress block detection - instead of reverse-engineering
 * HTML with Cheerio, we parse native block comments like <!-- wp:heading {"level":2} -->
 */
export class WordPressAPIService {
  /**
   * Fast WordPress detection (under 2 seconds)
   *
   * Uses multiple detection methods:
   * 1. REST API endpoint (best - allows native block parsing)
   * 2. HTML meta tags and content (fallback - BuiltWith method)
   *
   * @param url - URL to detect
   * @param providedHtml - Optional pre-fetched HTML (avoids CORS issues)
   */
  async detectWordPress(url: string, providedHtml?: string): Promise<WordPressDetectionResult> {
    loggingService.info('wp-api', `Detecting WordPress at ${url}`);

    const result: WordPressDetectionResult = {
      isWordPress: false,
      confidence: 0,
      errors: [],
    };

    const siteUrl = this.normalizeUrl(url);

    // Method 1: Try REST API first (best method - allows block parsing)
    try {
      const apiUrl = `${siteUrl}/wp-json/`;

      const response = await axios.get<WordPressSiteInfo>(apiUrl, {
        timeout: 5000,
        validateStatus: (status) => status === 200,
      });

      // Check if response has WordPress indicators
      if (
        response.data.namespaces &&
        response.data.namespaces.includes('wp/v2')
      ) {
        result.isWordPress = true;
        result.apiUrl = apiUrl;
        result.siteInfo = response.data;
        result.confidence = 100;

        loggingService.success(
          'wp-api',
          `✓ WordPress detected via REST API: ${response.data.name}`
        );

        // Detect page builder
        try {
          result.pageBuilder = await this.detectPageBuilder(siteUrl);
        } catch (error) {
          loggingService.warning('wp-api', 'Could not detect page builder');
        }

        return result;
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      console.log('[WordPress] REST API not accessible - trying HTML detection...');
      loggingService.warning('wp-api', 'REST API not accessible - trying HTML detection');
      result.errors?.push(`REST API: ${axiosError.message || 'Not accessible'}`);
    }

    // Method 2: HTML-based detection (fallback - BuiltWith method)
    try {
      console.log('[WordPress] Attempting HTML-based WordPress detection...');
      loggingService.info('wp-api', 'Attempting HTML-based WordPress detection...');

      let html: string;

      if (providedHtml) {
        console.log('[WordPress] Using pre-fetched HTML (bypassing CORS)');
        console.log(`[WordPress] HTML length: ${providedHtml.length} characters`);
        html = providedHtml;
      } else {
        console.log('[WordPress] Fetching HTML via axios...');
        const htmlResponse = await axios.get(siteUrl, {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        html = htmlResponse.data;
        console.log(`[WordPress] HTML length: ${html.length} characters`);
      }

      // Debug: Log sample of HTML for analysis
      const htmlSample = html.substring(0, 2000);
      console.log('[WordPress] HTML sample (first 2000 chars):', htmlSample);

      let confidence = 0;
      const indicators: string[] = [];

      // Check for WordPress meta generator tag (can be spoofed, so lower weight)
      if (html.includes('generator" content="WordPress')) {
        confidence += 30;
        indicators.push('meta generator tag');

        // Extract version
        const versionMatch = html.match(/WordPress\s+([\d.]+)/);
        if (versionMatch) {
          result.version = versionMatch[1];
        }
      }

      // Check for wp-content path (hardest to hide, higher weight)
      if (html.includes('/wp-content/') || html.includes('wp-content')) {
        confidence += 25;
        indicators.push('wp-content directory');
      }

      // Check for wp-includes path (hardest to hide, higher weight)
      if (html.includes('/wp-includes/') || html.includes('wp-includes')) {
        confidence += 25;
        indicators.push('wp-includes directory');
      }

      // Check for WordPress classes (common in themes)
      if (html.includes('class="wp-') || html.includes('wp-block-') || html.includes('id="wp-')) {
        confidence += 15;
        indicators.push('WordPress CSS classes/IDs');
      }

      // Check for WordPress JavaScript variables
      if (html.includes('var wp_') || html.includes('window.wp') || html.includes('wpApiSettings')) {
        confidence += 15;
        indicators.push('WordPress JavaScript');
      }

      // Check for WordPress body classes (very common, hard to hide)
      if (html.includes('class="home') || html.includes('class="page') || html.includes('class="post-type-')) {
        // These are common WordPress body class patterns
        if (html.includes('wp-') || html.includes('wordpress')) {
          confidence += 10;
          indicators.push('WordPress body classes');
        }
      }

      // Check for common WordPress patterns
      if (html.includes('wp-json') || html.includes('wp_') || html.includes('/xmlrpc.php')) {
        confidence += 10;
        indicators.push('WordPress identifiers');
      }

      // Check for WordPress emoji script (common in default WP)
      if (html.includes('wp-emoji') || html.includes('wpemoji')) {
        confidence += 10;
        indicators.push('WordPress emoji script');
      }

      // Log what we found
      console.log(`[WordPress] HTML analysis complete: ${confidence}% confidence`);
      if (indicators.length > 0) {
        console.log(`[WordPress] Indicators found: ${indicators.join(', ')}`);
      } else {
        console.log('[WordPress] No WordPress indicators found in HTML');
      }

      // If confidence is high enough, mark as WordPress
      if (confidence >= 50) {
        result.isWordPress = true;
        result.confidence = confidence;

        console.log(`[WordPress] ✓ WordPress detected via HTML analysis (${confidence}% confidence)`);
        console.log(`[WordPress] Indicators found: ${indicators.join(', ')}`);
        loggingService.success(
          'wp-api',
          `✓ WordPress detected via HTML analysis (${confidence}% confidence): ${indicators.join(', ')}`
        );

        // Note: REST API not available
        console.log('[WordPress] Note: REST API is disabled - will use HTML parsing instead of native blocks');
        loggingService.warning(
          'wp-api',
          'Note: REST API is disabled - will use HTML parsing instead of native blocks'
        );

        // Try to detect page builder even without REST API
        try {
          result.pageBuilder = await this.detectPageBuilder(siteUrl);
        } catch (error) {
          loggingService.warning('wp-api', 'Could not detect page builder');
        }

        return result;
      } else {
        console.log(`[WordPress] Not enough WordPress indicators found (${confidence}% confidence, need 50%)`);
        loggingService.info('wp-api', `Not enough WordPress indicators (${confidence}% confidence)`);
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMsg = axiosError.message || 'HTML fetch failed';
      console.log(`[WordPress] HTML detection error: ${errorMsg}`);
      result.errors?.push(`HTML Detection: ${errorMsg}`);
      loggingService.error('wp-api', `HTML detection failed: ${errorMsg}`);
    }

    // Not WordPress
    console.log('[WordPress] Not a WordPress site (no REST API, HTML detection failed or confidence too low)');
    loggingService.info('wp-api', 'Not a WordPress site');
    return result;
  }

  /**
   * Clone WordPress site via REST API
   *
   * This is the main method that fetches all posts, pages, and parses their blocks
   */
  async cloneWordPressSite(
    apiUrl: string,
    options: WordPressCloneOptions = {}
  ): Promise<WordPressCloneResult> {
    loggingService.info('wp-api', 'Starting WordPress clone via REST API');

    const result: WordPressCloneResult = {
      success: false,
      postsCloned: 0,
      pagesCloned: 0,
      blocksCount: 0,
      posts: [],
      errors: [],
      warnings: [],
    };

    try {
      // Fetch site info
      const siteInfoResponse = await axios.get<WordPressSiteInfo>(apiUrl, {
        timeout: 5000,
      });
      result.siteInfo = siteInfoResponse.data;

      loggingService.info(
        'wp-api',
        `Cloning WordPress site: ${result.siteInfo.name}`
      );

      // Detect page builder if requested
      if (options.detectPageBuilder !== false) {
        const siteUrl = this.normalizeUrl(result.siteInfo.url);
        result.pageBuilder = await this.detectPageBuilder(siteUrl);
      }

      // Fetch posts
      const posts = await this.fetchPosts(apiUrl, options.maxPosts || 100);
      result.postsCloned = posts.length;

      // Fetch pages
      const pages = await this.fetchPages(apiUrl, options.maxPages || 100);
      result.pagesCloned = pages.length;

      // Combine and parse blocks
      const allContent = [...posts, ...pages];

      for (const content of allContent) {
        // Parse WordPress blocks from raw content
        const rawContent = content.content.raw || content.content.rendered;

        if (rawContent) {
          content.blocks = this.parseWordPressBlocks(
            rawContent,
            options.blockOptions
          );
          result.blocksCount += this.countBlocks(content.blocks);
        }

        result.posts.push(content);
      }

      result.success = true;

      loggingService.success(
        'wp-api',
        `✓ WordPress clone complete: ${result.postsCloned} posts, ${result.pagesCloned} pages, ${result.blocksCount} blocks`
      );
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMsg = axiosError.message || 'Unknown error during clone';
      result.errors?.push(errorMsg);
      result.success = false;

      loggingService.error('wp-api', `Clone failed: ${errorMsg}`);
    }

    return result;
  }

  /**
   * Fetch posts from WordPress REST API with pagination
   */
  async fetchPosts(
    apiUrl: string,
    maxPosts: number = 100
  ): Promise<WordPressPost[]> {
    loggingService.info('wp-api', `Fetching WordPress posts (max: ${maxPosts})`);

    const posts: WordPressPost[] = [];
    const perPage = 100; // WordPress REST API max
    let page = 1;

    try {
      while (posts.length < maxPosts) {
        const url = `${apiUrl}wp/v2/posts?per_page=${perPage}&page=${page}&context=edit`;

        const response = await axios.get<WordPressPost[]>(url, {
          timeout: 10000,
        });

        if (response.data.length === 0) break;

        posts.push(...response.data);
        page++;

        // Check if we've reached the last page
        const totalPages = parseInt(
          response.headers['x-wp-totalpages'] || '1',
          10
        );
        if (page > totalPages) break;
      }

      loggingService.success('wp-api', `✓ Fetched ${posts.length} posts`);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 401) {
        loggingService.warning(
          'wp-api',
          'Could not fetch posts: authentication required (trying public endpoint)'
        );

        // Retry without context=edit (public endpoint)
        try {
          const url = `${apiUrl}wp/v2/posts?per_page=${perPage}`;
          const response = await axios.get<WordPressPost[]>(url, {
            timeout: 10000,
          });
          posts.push(...response.data);
        } catch (retryError) {
          loggingService.error('wp-api', 'Failed to fetch posts');
        }
      } else {
        loggingService.error('wp-api', `Error fetching posts: ${axiosError.message}`);
      }
    }

    return posts.slice(0, maxPosts);
  }

  /**
   * Fetch pages from WordPress REST API with pagination
   */
  async fetchPages(
    apiUrl: string,
    maxPages: number = 100
  ): Promise<WordPressPost[]> {
    loggingService.info('wp-api', `Fetching WordPress pages (max: ${maxPages})`);

    const pages: WordPressPost[] = [];
    const perPage = 100;
    let page = 1;

    try {
      while (pages.length < maxPages) {
        const url = `${apiUrl}wp/v2/pages?per_page=${perPage}&page=${page}&context=edit`;

        const response = await axios.get<WordPressPost[]>(url, {
          timeout: 10000,
        });

        if (response.data.length === 0) break;

        pages.push(...response.data);
        page++;

        const totalPages = parseInt(
          response.headers['x-wp-totalpages'] || '1',
          10
        );
        if (page > totalPages) break;
      }

      loggingService.success('wp-api', `✓ Fetched ${pages.length} pages`);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 401) {
        loggingService.warning(
          'wp-api',
          'Could not fetch pages: authentication required (trying public endpoint)'
        );

        try {
          const url = `${apiUrl}wp/v2/pages?per_page=${perPage}`;
          const response = await axios.get<WordPressPost[]>(url, {
            timeout: 10000,
          });
          pages.push(...response.data);
        } catch (retryError) {
          loggingService.error('wp-api', 'Failed to fetch pages');
        }
      } else {
        loggingService.error('wp-api', `Error fetching pages: ${axiosError.message}`);
      }
    }

    return pages.slice(0, maxPages);
  }

  /**
   * Parse WordPress block comments into structured blocks
   *
   * THIS IS THE KEY METHOD - parses native block syntax like:
   * <!-- wp:heading {"level":2} -->
   * <h2>My Title</h2>
   * <!-- /wp:heading -->
   *
   * This gives us perfect block hierarchy and all attributes without
   * reverse-engineering HTML with Cheerio.
   */
  parseWordPressBlocks(
    content: string,
    options: any = {}
  ): WordPressBlock[] {
    if (!content || typeof content !== 'string') {
      return [];
    }

    const blocks: WordPressBlock[] = [];

    // Pattern to match WordPress block comments
    // Matches: <!-- wp:namespace/blockname {"attr":"value"} -->content<!-- /wp:namespace/blockname -->
    // Also matches self-closing: <!-- wp:blockname /-->
    const blockPattern =
      /<!--\s*wp:([a-z][a-z0-9-]*\/)?([a-z][a-z0-9-]*)\s*(\{[^}]*\})?\s*(\/)?-->([\s\S]*?)(?:<!--\s*\/wp:(?:\1)?(?:\2)?\s*-->|$)/gi;

    let match;
    const maxDepth = options.maxDepth || 10;

    while ((match = blockPattern.exec(content)) !== null) {
      const [
        fullMatch,
        namespace,
        blockName,
        attributes,
        selfClosing,
        innerHTML,
      ] = match;

      // Skip if we're filtering for specific block types
      if (
        options.blockTypes &&
        !options.blockTypes.includes(blockName)
      ) {
        continue;
      }

      const block: WordPressBlock = {
        namespace: namespace ? namespace.replace('/', '') : 'core',
        name: blockName,
        attributes: attributes ? this.safeJSONParse(attributes) : {},
        innerHTML: innerHTML?.trim() || '',
        innerBlocks: [],
      };

      // Skip empty blocks if requested
      if (
        options.skipEmpty &&
        !block.innerHTML &&
        Object.keys(block.attributes).length === 0
      ) {
        continue;
      }

      // Recursively parse inner blocks (respecting max depth)
      if (block.innerHTML && !selfClosing && maxDepth > 0) {
        block.innerBlocks = this.parseWordPressBlocks(block.innerHTML, {
          ...options,
          maxDepth: maxDepth - 1,
        });
      }

      blocks.push(block);
    }

    return blocks;
  }

  /**
   * Detect page builder (Elementor, Divi, etc.)
   */
  async detectPageBuilder(siteUrl: string): Promise<WordPressPageBuilder> {
    const result: WordPressPageBuilder = {
      name: 'unknown',
      isActive: false,
    };

    try {
      // Fetch homepage to check for page builder indicators
      const response = await axios.get(siteUrl, {
        timeout: 5000,
        maxRedirects: 5,
      });

      const html = response.data;

      // Elementor
      if (
        html.includes('elementor') ||
        html.includes('data-elementor-type') ||
        html.includes('elementor-element')
      ) {
        result.name = 'elementor';
        result.isActive = true;

        // Try to extract version
        const versionMatch = html.match(
          /elementor[^\d]*?(\d+\.\d+\.\d+)/i
        );
        if (versionMatch) {
          result.version = versionMatch[1];
        }
      }
      // Divi
      else if (
        html.includes('et_pb_') ||
        html.includes('et-db') ||
        html.includes('Divi')
      ) {
        result.name = 'divi';
        result.isActive = true;
      }
      // Beaver Builder
      else if (
        html.includes('fl-builder') ||
        html.includes('fl-module') ||
        html.includes('fl-node')
      ) {
        result.name = 'beaver';
        result.isActive = true;
      }
      // Bricks
      else if (html.includes('brxe-') || html.includes('bricks-')) {
        result.name = 'bricks';
        result.isActive = true;
      }
      // Oxygen
      else if (html.includes('ct-section') || html.includes('oxygen-')) {
        result.name = 'oxygen';
        result.isActive = true;
      }
      // WPBakery
      else if (
        html.includes('vc_') ||
        html.includes('wpb_') ||
        html.includes('vc_row')
      ) {
        result.name = 'wpbakery';
        result.isActive = true;
      }
      // Gutenberg (native WordPress)
      else if (
        html.includes('wp-block-') ||
        html.includes('<!-- wp:')
      ) {
        result.name = 'gutenberg';
        result.isActive = true;
      }

      if (result.isActive) {
        loggingService.success(
          'wp-api',
          `✓ Page builder detected: ${result.name}`
        );
      }
    } catch (error) {
      loggingService.warning('wp-api', 'Could not detect page builder');
    }

    return result;
  }

  /**
   * Normalize URL (remove trailing slashes, add protocol)
   */
  private normalizeUrl(url: string): string {
    let normalized = url.trim();

    // Add protocol if missing
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }

    // Remove trailing slash
    normalized = normalized.replace(/\/$/, '');

    return normalized;
  }

  /**
   * Safe JSON parse (handles malformed JSON)
   */
  private safeJSONParse(jsonString: string): Record<string, any> {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      loggingService.warning('wp-api', `Failed to parse block attributes: ${jsonString}`);
      return {};
    }
  }

  /**
   * Count total blocks (including nested blocks)
   */
  private countBlocks(blocks: WordPressBlock[]): number {
    let count = blocks.length;

    for (const block of blocks) {
      if (block.innerBlocks && block.innerBlocks.length > 0) {
        count += this.countBlocks(block.innerBlocks);
      }
    }

    return count;
  }
}

/**
 * Export singleton instance
 */
export const wordPressAPIService = new WordPressAPIService();
