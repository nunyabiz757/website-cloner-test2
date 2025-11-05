import axios from 'axios';

export interface PageData {
  url: string;
  title: string;
  html: string;
  elements: ElementData[];
  meta: PageMeta;
  screenshot?: string;
}

export interface ElementData {
  tag: string;
  classes: string;
  id: string;
  text: string;
  attributes: Record<string, string>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  styles: ComputedStyles;
  isVisible: boolean;
}

export interface ComputedStyles {
  display: string;
  position: string;
  backgroundColor: string;
  color: string;
  fontSize: string;
  fontWeight: string;
  textAlign: string;
  padding: string;
  margin: string;
  border: string;
  borderRadius: string;
  width: string;
  height: string;
}

export interface PageMeta {
  description: string;
  keywords: string;
  ogImage: string;
  ogTitle: string;
  viewport: { width: number; height: number };
}

export interface WordPressDetectionResult {
  isWordPress: boolean;
  apiUrl: string | null;
  pageBuilder: string | null;
  version: string | null;
}

/**
 * Playwright Parser Service
 *
 * Uses Railway backend with Playwright for browser automation.
 * Extracts computed styles, handles dynamic content, and provides
 * WordPress detection via browser context.
 */
export class PlaywrightParserService {
  private railwayEndpoint: string;
  private isProduction: boolean;

  constructor() {
    // Get Railway API endpoint from environment
    this.railwayEndpoint = import.meta.env.VITE_RAILWAY_API_URL ||
                          'https://website-cloner-pro-production.up.railway.app';
    this.isProduction = true;

    console.log('🚀 PlaywrightParserService initialized');
    console.log(`   Endpoint: ${this.railwayEndpoint}`);
  }

  /**
   * Load a page and extract all data via Railway backend
   */
  async loadPageData(url: string, options: {
    extractStyles?: boolean;
    takeScreenshot?: boolean;
    fullPage?: boolean;
  } = {}): Promise<PageData> {
    console.log(`📄 Loading page: ${url}`);
    console.log(`   Railway endpoint: ${this.railwayEndpoint}/api/capture`);

    try {
      console.log('   Sending request to Railway backend...');
      const startTime = Date.now();

      const response = await axios.post(`${this.railwayEndpoint}/api/capture`, {
        url,
        extractStyles: options.extractStyles !== false,
        takeScreenshot: options.takeScreenshot || false,
        fullPage: options.fullPage || false,
      }, {
        timeout: 60000, // Reduced to 1 minute to fail faster
        headers: {
          'Content-Type': 'application/json',
        },
        onDownloadProgress: (progressEvent) => {
          console.log(`   Receiving data... ${progressEvent.loaded} bytes`);
        },
      });

      const elapsed = Date.now() - startTime;
      console.log(`   Request completed in ${elapsed}ms`);

      const data = response.data;

      console.log('✓ Page loaded successfully');
      console.log(`   Title: ${data.title}`);
      console.log(`   Elements: ${data.elements?.length || 0}`);

      return {
        url: data.url || url,
        title: data.title || '',
        html: data.html || '',
        elements: data.elements || [],
        meta: data.meta || {
          description: '',
          keywords: '',
          ogImage: '',
          ogTitle: '',
          viewport: { width: 1920, height: 1080 },
        },
        screenshot: data.screenshot,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Railway API error:', error.message);

        if (error.code === 'ECONNABORTED') {
          console.error('   Request timeout - Railway backend took too long to respond');
          console.error('   This may indicate:');
          console.error('   - Railway backend is not deployed or offline');
          console.error('   - The target website is too complex/slow to process');
          console.error('   - Network connectivity issues');
          throw new Error(`Railway API timeout after 60s - backend may be offline or target site too slow`);
        }

        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
          console.error('   Cannot connect to Railway backend');
          console.error('   Railway endpoint:', this.railwayEndpoint);
          console.error('   Please verify:');
          console.error('   - Railway backend is deployed and running');
          console.error('   - VITE_RAILWAY_API_URL environment variable is correct');
          throw new Error(`Cannot reach Railway backend at ${this.railwayEndpoint}`);
        }

        if (error.response) {
          console.error('   Status:', error.response.status);
          console.error('   Data:', error.response.data);
          throw new Error(`Railway API failed (${error.response.status}): ${JSON.stringify(error.response.data)}`);
        }

        throw new Error(`Railway API failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Extract elements with computed styles
   */
  async extractElements(url: string): Promise<ElementData[]> {
    const data = await this.loadPageData(url, { extractStyles: true });
    return data.elements;
  }

  /**
   * Detect WordPress in browser context via Railway
   */
  async detectWordPress(url: string): Promise<WordPressDetectionResult> {
    console.log('[WordPress] Detecting via browser context...');

    try {
      const response = await axios.post(`${this.railwayEndpoint}/api/detect-wordpress`, {
        url,
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = response.data;

      console.log(`[WordPress] Detection result: ${result.isWordPress ? 'Yes' : 'No'}`);
      if (result.isWordPress) {
        console.log(`[WordPress] Version: ${result.version || 'Unknown'}`);
        console.log(`[WordPress] API URL: ${result.apiUrl || 'Not found'}`);
        console.log(`[WordPress] Page Builder: ${result.pageBuilder || 'None'}`);
      }

      return result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[WordPress] Detection error:', error.message);
      }

      // Return negative result on error
      return {
        isWordPress: false,
        apiUrl: null,
        pageBuilder: null,
        version: null,
      };
    }
  }

  /**
   * Take screenshot of page
   */
  async takeScreenshot(url: string, fullPage: boolean = false): Promise<string> {
    console.log('📸 Taking screenshot...');

    const data = await this.loadPageData(url, {
      takeScreenshot: true,
      fullPage,
    });

    if (!data.screenshot) {
      throw new Error('Screenshot not available');
    }

    console.log('✓ Screenshot captured');
    return data.screenshot;
  }

  /**
   * Get HTML content with JavaScript rendered
   */
  async getRenderedHTML(url: string): Promise<string> {
    const data = await this.loadPageData(url, { extractStyles: false });
    return data.html;
  }

  /**
   * Extract page meta information
   */
  async extractMeta(url: string): Promise<PageMeta> {
    const data = await this.loadPageData(url, { extractStyles: false });
    return data.meta;
  }

  /**
   * Health check - verify Railway backend is accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      console.log('🏥 Running Railway backend health check...');

      const response = await axios.get(`${this.railwayEndpoint}/`, {
        timeout: 10000,
      });

      if (response.status === 200) {
        console.log('✓ Railway backend health check passed');
        return true;
      }

      console.error('❌ Railway backend returned non-200 status:', response.status);
      return false;
    } catch (error) {
      console.error('❌ Railway backend health check failed:', error);
      return false;
    }
  }

  /**
   * Extract computed style for specific element (requires selector)
   */
  async getComputedStyle(url: string, selector: string): Promise<ComputedStyles | null> {
    try {
      const response = await axios.post(`${this.railwayEndpoint}/api/get-style`, {
        url,
        selector,
      }, {
        timeout: 30000,
      });

      return response.data.style || null;
    } catch (error) {
      console.error('Error getting computed style:', error);
      return null;
    }
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(url: string, selector: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.railwayEndpoint}/api/is-visible`, {
        url,
        selector,
      }, {
        timeout: 30000,
      });

      return response.data.visible || false;
    } catch (error) {
      console.error('Error checking element visibility:', error);
      return false;
    }
  }
}

/**
 * Export singleton instance
 */
export const playwrightParserService = new PlaywrightParserService();
