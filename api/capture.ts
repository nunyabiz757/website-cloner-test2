import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  maxDuration: 10,
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

  try {
    console.log('Fetching URL via proxy:', url);

    // Use a simple fetch with a longer timeout to get rendered content
    // This is a fallback approach for Vercel free tier
    // For full browser automation, you'd need Vercel Pro or a dedicated service

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();

    // Basic resource extraction from HTML
    const resources = {
      images: extractUrls(html, /<img[^>]+src=["']([^"']+)["']/gi),
      fonts: extractUrls(html, /url\(["']?([^)"']+\.(?:woff2?|ttf|eot|otf))["']?\)/gi),
      stylesheets: extractUrls(html, /<link[^>]+href=["']([^"']+\.css)["']/gi),
    };

    console.log('✅ Page fetched successfully');
    console.log(`📄 HTML length: ${html.length} chars`);
    console.log(`📦 Resources: ${resources.images.length} images, ${resources.fonts.length} fonts, ${resources.stylesheets.length} stylesheets`);

    return res.status(200).json({
      html,
      styles: '', // CSS would need separate fetches
      scripts: extractUrls(html, /<script[^>]+src=["']([^"']+)["']/gi),
      resources,
      note: 'Using fallback fetch mode. For full browser automation with JavaScript execution, upgrade to Vercel Pro or use a dedicated browser automation service.',
    });
  } catch (error) {
    console.error('❌ Failed to fetch page:', error);

    return res.status(500).json({
      error: 'Failed to fetch page',
      message: error instanceof Error ? error.message : 'Unknown error',
      note: 'Browser automation requires Vercel Pro tier or external service like BrowserBase, Apify, or Bright Data.',
    });
  }
}

function extractUrls(html: string, regex: RegExp): string[] {
  const urls: string[] = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    if (match[1]) {
      urls.push(match[1]);
    }
  }

  return urls;
}
