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
    console.log(`Getting computed style for ${selector} at ${url}`);

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

    const style = await page.$eval(selector, (el) => {
      const computed = window.getComputedStyle(el);
      return {
        display: computed.display,
        position: computed.position,
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        textAlign: computed.textAlign,
        padding: computed.padding,
        margin: computed.margin,
        border: computed.border,
        borderRadius: computed.borderRadius,
        width: computed.width,
        height: computed.height,
      };
    });

    await browser.close();

    return res.status(200).json({ style });
  } catch (error) {
    console.error('Get style error:', error);

    if (browser) {
      await browser.close();
    }

    return res.status(500).json({
      error: 'Failed to get computed style',
      message: error instanceof Error ? error.message : 'Unknown error',
      style: null,
    });
  }
}
