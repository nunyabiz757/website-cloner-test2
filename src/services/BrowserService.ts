export interface BrowserOptions {
  headless?: boolean;
  timeout?: number;
  viewport?: { width: number; height: number };
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
   * Close browser instance
   * This is a no-op since Vercel handles browser cleanup automatically
   */
  async close(): Promise<void> {
    console.log('✅ Browser service closed (Vercel handles cleanup)');
  }
}
