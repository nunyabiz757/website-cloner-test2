export interface BrowserOptions {
  headless?: boolean;
  timeout?: number;
  viewport?: { width: number; height: number };
}

export interface Breakpoint {
  name: string;
  width: number;
  height: number;
  label: string;
}

export const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  { name: 'mobile', width: 375, height: 812, label: 'Mobile (iPhone X)' },
  { name: 'mobile-lg', width: 414, height: 896, label: 'Mobile (iPhone 11)' },
  { name: 'tablet', width: 768, height: 1024, label: 'Tablet (iPad)' },
  { name: 'tablet-lg', width: 834, height: 1194, label: 'Tablet (iPad Pro 11")' },
  { name: 'laptop', width: 1366, height: 768, label: 'Laptop' },
  { name: 'desktop', width: 1920, height: 1080, label: 'Desktop' },
  { name: 'desktop-4k', width: 2560, height: 1440, label: 'Desktop 4K' },
];

export interface ResponsiveStyles {
  breakpoint: string;
  width: number;
  styles: Record<string, any>;
  screenshot?: string; // Base64 encoded
  visibleElements: string[];
  hiddenElements: string[];
}

export interface MediaQuery {
  query: string;
  rules: string[];
}

export interface CaptureResult {
  html: string;
  styles: string;
  scripts: string[];
  resources: {
    images: string[];
    fonts: string[];
    stylesheets: string[];
  };
}

export interface ResponsiveCaptureResult extends CaptureResult {
  responsiveStyles: ResponsiveStyles[];
  mediaQueries: MediaQuery[];
}

export class BrowserService {
  /**
   * Check if browser automation is available
   * In Vercel deployment, this always returns true since we use serverless functions
   */
  static isAvailable(): boolean {
    return true; // Always available via Vercel API endpoint
  }

  /**
   * Launch browser instance
   * This is a no-op since Vercel handles browser lifecycle
   */
  async launch(options: BrowserOptions = {}): Promise<void> {
    console.log('✅ Browser service ready (using Vercel serverless function)');
  }

  /**
   * Navigate to URL and capture full rendered content using Vercel API
   */
  async capturePage(url: string): Promise<CaptureResult> {
    console.log(`🌐 Requesting browser capture for ${url} via Vercel API...`);

    try {
      // Call Vercel serverless function
      const apiUrl = '/api/capture';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const result: CaptureResult = await response.json();

      console.log('✅ Page captured successfully via Vercel API');
      console.log(`📄 HTML length: ${result.html.length} chars`);
      console.log(`🎨 CSS length: ${result.styles.length} chars`);
      console.log(`📦 Resources: ${result.resources.images.length} images, ${result.resources.fonts.length} fonts`);

      return result;
    } catch (error) {
      console.error('❌ Failed to capture page via Vercel API:', error);
      throw new Error(
        `Browser automation failed: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
        'Please ensure your Vercel deployment has Playwright installed.'
      );
    }
  }

  /**
   * Capture page at multiple breakpoints for responsive detection
   */
  async captureResponsive(
    url: string,
    breakpoints: Breakpoint[] = DEFAULT_BREAKPOINTS
  ): Promise<ResponsiveCaptureResult> {
    console.log(`📱 Requesting responsive capture for ${url} via API...`);

    try {
      // Call API endpoint with responsive flag
      const apiUrl = '/api/capture';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          responsive: true,
          breakpoints
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const result: ResponsiveCaptureResult = await response.json();

      console.log('✅ Responsive capture completed');
      console.log(`📱 Breakpoints captured: ${result.responsiveStyles.length}`);
      console.log(`📋 Media queries found: ${result.mediaQueries.length}`);

      return result;
    } catch (error) {
      console.error('❌ Failed to capture responsive styles:', error);
      throw new Error(
        `Responsive capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Close browser instance
   * This is a no-op since Railway API handles browser cleanup automatically
   */
  async close(): Promise<void> {
    console.log('✅ Browser service closed (Railway handles cleanup)');
  }
}
