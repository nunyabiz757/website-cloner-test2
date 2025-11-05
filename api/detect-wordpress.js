import { chromium } from 'playwright';

export const config = {
  maxDuration: 60, // 1 minute timeout
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  let browser;

  try {
    console.log('[WordPress] Detecting WordPress at:', url);

    browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox',
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });

    const page = await context.newPage();

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Detect WordPress in browser context
    const wpInfo = await page.evaluate(() => {
      // Check for WordPress indicators
      const hasWP = !!(
        (window as any).wp ||
        document.querySelector('meta[name="generator"]')?.getAttribute('content')?.includes('WordPress') ||
        document.querySelector('link[rel="https://api.w.org/"]')
      );

      // Get REST API URL
      const apiLink = document.querySelector('link[rel="https://api.w.org/"]');
      const apiUrl = apiLink?.getAttribute('href') || null;

      // Detect page builder
      let pageBuilder = null;
      if (document.querySelector('link[href*="elementor"]') ||
          document.querySelector('[data-elementor-type]')) {
        pageBuilder = 'elementor';
      } else if (document.querySelector('[class*="et_pb_"]')) {
        pageBuilder = 'divi';
      } else if (document.querySelector('[class*="fl-builder"]')) {
        pageBuilder = 'beaver-builder';
      } else if (document.querySelector('[data-brx-element]')) {
        pageBuilder = 'bricks';
      } else if (document.querySelector('[class*="ct-section"]')) {
        pageBuilder = 'oxygen';
      } else if (document.querySelector('[class*="vc_"]')) {
        pageBuilder = 'wpbakery';
      } else if (document.querySelector('[class*="wp-block-"]')) {
        pageBuilder = 'gutenberg';
      }

      // Get WordPress version
      const generator = document.querySelector('meta[name="generator"]');
      const versionMatch = generator?.getAttribute('content')?.match(/WordPress\s+([\d.]+)/);
      const version = versionMatch ? versionMatch[1] : null;

      return {
        isWordPress: hasWP,
        apiUrl,
        pageBuilder,
        version,
      };
    });

    await browser.close();

    console.log('[WordPress] Detection complete:', wpInfo.isWordPress ? 'Yes' : 'No');
    if (wpInfo.isWordPress) {
      console.log(`[WordPress] Version: ${wpInfo.version || 'Unknown'}`);
      console.log(`[WordPress] Page Builder: ${wpInfo.pageBuilder || 'None'}`);
    }

    return res.status(200).json(wpInfo);
  } catch (error) {
    console.error('[WordPress] Detection error:', error);

    if (browser) {
      await browser.close();
    }

    return res.status(500).json({
      error: 'WordPress detection failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      isWordPress: false,
      apiUrl: null,
      pageBuilder: null,
      version: null,
    });
  }
}
