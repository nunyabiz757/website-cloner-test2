import type { VercelRequest, VercelResponse } from '@vercel/node';
import { chromium } from 'playwright';

export const config = {
  maxDuration: 60, // 60 seconds timeout
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  let browser;

  try {
    console.log('Launching browser for:', url);

    // Launch browser
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

    // Track resources
    const resources = {
      images: [] as string[],
      fonts: [] as string[],
      stylesheets: [] as string[],
    };

    page.on('request', (request) => {
      const resourceType = request.resourceType();
      const reqUrl = request.url();

      if (resourceType === 'image') {
        resources.images.push(reqUrl);
      } else if (resourceType === 'font') {
        resources.fonts.push(reqUrl);
      } else if (resourceType === 'stylesheet') {
        resources.stylesheets.push(reqUrl);
      }
    });

    console.log('Navigating to URL...');
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });

    // Wait for lazy-loaded content
    await page.waitForTimeout(2000);

    // Scroll to bottom to trigger lazy loading
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));

    // Extract HTML
    const html = await page.content();

    // Extract CSS
    const styles = await page.evaluate(() => {
      let allStyles = '';

      // Extract inline styles
      const styleElements = document.querySelectorAll('style');
      styleElements.forEach((style) => {
        allStyles += style.textContent + '\n';
      });

      // Extract linked stylesheets
      const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
      linkElements.forEach((link) => {
        const sheet = (link as HTMLLinkElement).sheet;
        if (sheet) {
          try {
            const rules = Array.from(sheet.cssRules);
            rules.forEach((rule) => {
              allStyles += rule.cssText + '\n';
            });
          } catch (e) {
            console.warn('Could not access stylesheet:', link);
          }
        }
      });

      return allStyles;
    });

    // Extract scripts
    const scripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]'))
        .map((script) => (script as HTMLScriptElement).src);
    });

    console.log('✅ Page captured successfully');
    console.log(`📄 HTML length: ${html.length} chars`);
    console.log(`🎨 CSS length: ${styles.length} chars`);
    console.log(`📦 Resources: ${resources.images.length} images, ${resources.fonts.length} fonts`);

    await browser.close();

    return res.status(200).json({
      html,
      styles,
      scripts,
      resources,
    });
  } catch (error) {
    console.error('❌ Failed to capture page:', error);

    if (browser) {
      await browser.close();
    }

    return res.status(500).json({
      error: 'Failed to capture page',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
