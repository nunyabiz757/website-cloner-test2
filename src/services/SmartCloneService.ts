import { PlaywrightParserService, PageData } from './parsers/PlaywrightParserService';
import { wordPressAPIService } from './wordpress/WordPressAPIService';
import type { WordPressCloneResult } from '../types/wordpress';

export interface CloneResult {
  success: boolean;
  source: 'wordpress-rest-api' | 'playwright' | 'wordpress-playwright' | 'error';
  isWordPress: boolean;
  url: string;
  data?: any;
  error?: string;
  metadata?: {
    postsCloned?: number;
    pagesCloned?: number;
    blocksCount?: number;
    elementsExtracted?: number;
    hasNativeBlocks?: boolean;
    pageBuilder?: string;
    version?: string;
  };
}

/**
 * Smart Clone Service
 *
 * Intelligently chooses the best cloning method:
 * 1. WordPress REST API (best - native blocks)
 * 2. Playwright for WordPress (fallback when API blocked)
 * 3. Playwright for non-WordPress (standard)
 */
export class SmartCloneService {
  private playwrightParser: PlaywrightParserService;

  constructor() {
    this.playwrightParser = new PlaywrightParserService();
  }

  /**
   * Smart clone - automatically chooses best method
   */
  async clone(url: string, options: {
    preferREST?: boolean;
    forcePlaywright?: boolean;
  } = {}): Promise<CloneResult> {
    console.log(`🎯 Starting smart clone for: ${url}`);
    console.log('═'.repeat(60));

    try {
      // If forced to use Playwright, skip WordPress detection
      if (options.forcePlaywright) {
        console.log('⚡ Force Playwright mode enabled');
        return await this.cloneViaPlaywright(url);
      }

      // STEP 1: Quick WordPress detection via REST API
      console.log('STEP 1: Checking for WordPress via REST API...');
      const wpDetection = await wordPressAPIService.detectWordPress(url);

      if (wpDetection.isWordPress) {
        console.log('✓ WordPress detected!');
        console.log(`   Version: ${wpDetection.version || 'Unknown'}`);
        console.log(`   API URL: ${wpDetection.apiUrl || 'N/A'}`);
        console.log(`   Confidence: ${wpDetection.confidence}%`);

        // STEP 2: Try REST API clone (best method if available)
        if (wpDetection.apiUrl && options.preferREST !== false) {
          console.log('\nSTEP 2: Attempting clone via REST API...');
          try {
            const wpResult = await wordPressAPIService.cloneWordPressSite(
              wpDetection.apiUrl,
              {
                maxPosts: 50,
                maxPages: 50,
                detectPageBuilder: true,
                blockOptions: {
                  includeHTML: true,
                  maxDepth: 10,
                },
              }
            );

            if (wpResult.success) {
              console.log('✓ Successfully cloned via WordPress REST API');
              console.log(`   Posts: ${wpResult.postsCloned}`);
              console.log(`   Pages: ${wpResult.pagesCloned}`);
              console.log(`   Blocks: ${wpResult.blocksCount}`);
              console.log('═'.repeat(60));

              return {
                success: true,
                source: 'wordpress-rest-api',
                isWordPress: true,
                url,
                data: wpResult,
                metadata: {
                  postsCloned: wpResult.postsCloned,
                  pagesCloned: wpResult.pagesCloned,
                  blocksCount: wpResult.blocksCount,
                  hasNativeBlocks: true,
                  pageBuilder: wpResult.pageBuilder?.name,
                  version: wpDetection.version,
                },
              };
            }
          } catch (apiError) {
            console.warn('⚠️ REST API clone failed:', apiError);
            console.log('   Falling back to Playwright...');
          }
        }

        // STEP 3: WordPress detected but API failed - use Playwright
        console.log('\nSTEP 3: Using Playwright for WordPress site...');
        const wpPlaywrightResult = await this.cloneWordPressViaPlaywright(url, wpDetection);
        return wpPlaywrightResult;
      }

      // STEP 2: Not WordPress - use Playwright
      console.log('ℹ️ Not a WordPress site');
      console.log('\nSTEP 2: Using Playwright for non-WordPress site...');
      const playwrightResult = await this.cloneViaPlaywright(url);
      return playwrightResult;

    } catch (error) {
      console.error('❌ Clone failed:', error);
      console.log('═'.repeat(60));

      return {
        success: false,
        source: 'error',
        isWordPress: false,
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Clone WordPress site via Playwright (fallback when API blocked)
   */
  private async cloneWordPressViaPlaywright(url: string, wpInfo?: any): Promise<CloneResult> {
    try {
      // Load page data with Playwright
      const pageData = await this.playwrightParser.loadPageData(url, {
        extractStyles: true,
        takeScreenshot: false,
      });

      // Detect WordPress via browser if not already detected
      if (!wpInfo) {
        wpInfo = await this.playwrightParser.detectWordPress(url);
      }

      console.log(`   WordPress version: ${wpInfo.version || 'Unknown'}`);
      console.log(`   Page builder: ${wpInfo.pageBuilder || 'None'}`);

      // Try to detect blocks in rendered HTML
      // This is a simplified detection - not as good as REST API
      const wpBlockPattern = /wp-block-([a-z-]+)/g;
      const blockMatches = pageData.html.match(wpBlockPattern) || [];
      const uniqueBlocks = [...new Set(blockMatches)];

      console.log(`   Detected ${uniqueBlocks.length} WordPress block types in HTML`);
      console.log(`   Extracted ${pageData.elements.length} elements with computed styles`);
      console.log('✓ Clone via Playwright complete');
      console.log('═'.repeat(60));

      return {
        success: true,
        source: 'wordpress-playwright',
        isWordPress: true,
        url,
        data: {
          html: pageData.html,
          detectedBlocks: uniqueBlocks,
          elements: pageData.elements,
          meta: pageData.meta,
          wordPressInfo: wpInfo,
        },
        metadata: {
          hasNativeBlocks: false,
          elementsExtracted: pageData.elements.length,
          pageBuilder: wpInfo.pageBuilder,
          version: wpInfo.version,
        },
      };
    } catch (error) {
      throw new Error(`Playwright WordPress clone failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clone non-WordPress site via Playwright
   */
  private async cloneViaPlaywright(url: string): Promise<CloneResult> {
    try {
      // Extract all page data
      const pageData = await this.playwrightParser.loadPageData(url, {
        extractStyles: true,
        takeScreenshot: false,
      });

      console.log(`   Title: ${pageData.title}`);
      console.log(`   Elements: ${pageData.elements.length}`);
      console.log(`   HTML size: ${Math.round(pageData.html.length / 1024)}KB`);
      console.log('✓ Clone via Playwright complete');
      console.log('═'.repeat(60));

      return {
        success: true,
        source: 'playwright',
        isWordPress: false,
        url,
        data: pageData,
        metadata: {
          elementsExtracted: pageData.elements.length,
          hasNativeBlocks: false,
        },
      };
    } catch (error) {
      throw new Error(`Playwright clone failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get rendered HTML via Playwright
   */
  async getRenderedHTML(url: string): Promise<string> {
    console.log(`📄 Fetching rendered HTML for: ${url}`);
    return await this.playwrightParser.getRenderedHTML(url);
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(url: string, fullPage: boolean = false): Promise<string> {
    console.log(`📸 Taking screenshot of: ${url}`);
    return await this.playwrightParser.takeScreenshot(url, fullPage);
  }

  /**
   * Extract elements with computed styles
   */
  async extractElements(url: string): Promise<any[]> {
    console.log(`🎨 Extracting elements with computed styles from: ${url}`);
    return await this.playwrightParser.extractElements(url);
  }

  /**
   * Health check - verify Railway backend is accessible
   */
  async healthCheck(): Promise<boolean> {
    return await this.playwrightParser.healthCheck();
  }

  /**
   * Detect WordPress via browser context
   */
  async detectWordPress(url: string): Promise<any> {
    return await this.playwrightParser.detectWordPress(url);
  }
}

/**
 * Export singleton instance
 */
export const smartCloneService = new SmartCloneService();
