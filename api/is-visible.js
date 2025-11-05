import { chromium } from 'playwright';

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, selector } = req.body;

  if (!url || !selector) {
    return res.status(400).json({ error: 'URL and selector are required' });
  }

  let browser;

  try {
    console.log(`Checking visibility of ${selector} at ${url}`);

    browser = await chromium.launch({
      headless: true,
      args: ['--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox'],
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    const visible = await page.$eval(selector, (el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden'
      );
    });

    await browser.close();

    return res.status(200).json({ visible });
  } catch (error) {
    console.error('Is visible error:', error);

    if (browser) {
      await browser.close();
    }

    return res.status(500).json({
      error: 'Failed to check visibility',
      message: error instanceof Error ? error.message : 'Unknown error',
      visible: false,
    });
  }
}
