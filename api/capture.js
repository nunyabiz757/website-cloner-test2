import { chromium } from 'playwright';

export const config = {
  maxDuration: 300, // 5 minutes - Railway has no strict timeout
};

const DEFAULT_BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 812, label: 'Mobile (iPhone X)' },
  { name: 'mobile-lg', width: 414, height: 896, label: 'Mobile (iPhone 11)' },
  { name: 'tablet', width: 768, height: 1024, label: 'Tablet (iPad)' },
  { name: 'tablet-lg', width: 834, height: 1194, label: 'Tablet (iPad Pro 11")' },
  { name: 'laptop', width: 1366, height: 768, label: 'Laptop' },
  { name: 'desktop', width: 1920, height: 1080, label: 'Desktop' },
  { name: 'desktop-4k', width: 2560, height: 1440, label: 'Desktop 4K' },
];

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, responsive = false, interactive = false, breakpoints = DEFAULT_BREAKPOINTS } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  let browser;

  try {
    console.log('Launching Chromium browser for:', url);

    // Launch full Chromium with Playwright (Railway supports this!)
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
      images: [],
      fonts: [],
      stylesheets: [],
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
      await new Promise((resolve) => {
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
        const sheet = link.sheet;
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
        .map((script) => script.src);
    });

    console.log('✅ Page captured successfully');
    console.log(`📄 HTML length: ${html.length} chars`);
    console.log(`🎨 CSS length: ${styles.length} chars`);
    console.log(`📦 Resources: ${resources.images.length} images, ${resources.fonts.length} fonts`);

    // If responsive capture is enabled, capture additional breakpoints
    let responsiveStyles = [];
    let mediaQueries = [];

    if (responsive) {
      console.log('📱 Starting responsive capture...');

      // Extract media queries first
      mediaQueries = await page.evaluate(() => {
        const queries = [];
        const styleSheets = Array.from(document.styleSheets);

        styleSheets.forEach((sheet) => {
          try {
            const rules = Array.from(sheet.cssRules || sheet.rules);
            rules.forEach((rule) => {
              if (rule instanceof CSSMediaRule) {
                const query = rule.conditionText || rule.media.mediaText;
                const innerRules = Array.from(rule.cssRules).map((r) => r.cssText);
                queries.push({ query, rules: innerRules });
              }
            });
          } catch (e) {
            // CORS blocked stylesheet
          }
        });

        return queries;
      });

      console.log(`📋 Found ${mediaQueries.length} media queries`);

      // Capture at each breakpoint
      for (const breakpoint of breakpoints) {
        console.log(`📱 Capturing ${breakpoint.label} (${breakpoint.width}px)...`);

        // Set viewport size
        await page.setViewportSize({
          width: breakpoint.width,
          height: breakpoint.height,
        });

        // Wait for responsive changes to apply
        await page.waitForTimeout(1000);

        // Capture computed styles for all elements
        const breakpointData = await page.evaluate(() => {
          const elements = document.querySelectorAll('*');
          const styles = {};
          const visible = [];
          const hidden = [];

          elements.forEach((el, index) => {
            const computed = window.getComputedStyle(el);

            // Create selector
            const tagName = el.tagName.toLowerCase();
            const id = el.id ? `#${el.id}` : '';
            const classes = el.className && typeof el.className === 'string'
              ? `.${el.className.split(' ').filter(c => c).join('.')}`
              : '';
            const selector = `${tagName}${id}${classes}`.slice(0, 100) || `element-${index}`;

            // Store relevant responsive properties
            styles[selector] = {
              display: computed.display,
              visibility: computed.visibility,
              width: computed.width,
              height: computed.height,
              fontSize: computed.fontSize,
              padding: computed.padding,
              margin: computed.margin,
              flexDirection: computed.flexDirection,
              gridTemplateColumns: computed.gridTemplateColumns,
              position: computed.position,
            };

            // Track visibility
            const isVisible =
              computed.display !== 'none' &&
              computed.visibility !== 'hidden' &&
              computed.opacity !== '0';

            const identifier = el.id || el.className || `element-${index}`;

            if (isVisible) {
              visible.push(identifier);
            } else {
              hidden.push(identifier);
            }
          });

          return { styles, visible, hidden };
        });

        // Take screenshot (optional, convert to base64)
        const screenshot = await page.screenshot({
          fullPage: false,  // Only viewport to reduce size
          type: 'png',
        });

        responsiveStyles.push({
          breakpoint: breakpoint.name,
          width: breakpoint.width,
          styles: breakpointData.styles,
          screenshot: screenshot.toString('base64'),
          visibleElements: breakpointData.visible,
          hiddenElements: breakpointData.hidden,
        });
      }

      console.log(`✅ Responsive capture complete: ${responsiveStyles.length} breakpoints`);
    }

    // If interactive capture is enabled, capture hover/focus/active states
    let interactiveElements = [];
    let totalInteractive = 0;
    let statesDetected = { hover: 0, focus: 0, active: 0, disabled: 0 };

    if (interactive) {
      console.log('🎨 Starting interactive state capture...');

      // Find all interactive elements
      const interactiveSelectors = await page.evaluate(() => {
        const elements = [];
        const interactiveTypes = [
          'button',
          'a',
          'input:not([type="hidden"])',
          'textarea',
          'select',
          '[role="button"]',
          '[onclick]',
          '.btn',
          '.button',
        ];

        interactiveTypes.forEach((type) => {
          const found = document.querySelectorAll(type);
          found.forEach((el, idx) => {
            const tag = el.tagName.toLowerCase();
            const id = el.id ? `#${el.id}` : '';
            const classes = el.className && typeof el.className === 'string'
              ? `.${el.className.split(' ').filter(c => c).join('.')}`
              : '';
            const selector = `${tag}${id}${classes}`.slice(0, 100) || `${tag}:nth-of-type(${idx + 1})`;

            elements.push({
              selector,
              type: tag,
              index: elements.length,
            });
          });
        });

        return elements;
      });

      totalInteractive = interactiveSelectors.length;
      console.log(`🎯 Found ${totalInteractive} interactive elements`);

      // Limit to first 30 elements for performance
      const elementsToCapture = interactiveSelectors.slice(0, 30);

      for (const { selector, type } of elementsToCapture) {
        try {
          // Get normal state
          const normalStyles = await page.evaluate((sel) => {
            const el = document.querySelector(sel);
            if (!el) return null;
            const computed = window.getComputedStyle(el);
            return {
              backgroundColor: computed.backgroundColor,
              color: computed.color,
              borderColor: computed.borderColor,
              transform: computed.transform,
              boxShadow: computed.boxShadow,
              opacity: computed.opacity,
              cursor: computed.cursor,
            };
          }, selector);

          if (!normalStyles) continue;

          const states = { normal: normalStyles };
          const pseudoElements = {};

          // Try to get hover state
          try {
            await page.hover(selector, { timeout: 1000 });
            await page.waitForTimeout(300);

            const hoverStyles = await page.evaluate((sel) => {
              const el = document.querySelector(sel);
              if (!el) return null;
              const computed = window.getComputedStyle(el);
              return {
                backgroundColor: computed.backgroundColor,
                color: computed.color,
                borderColor: computed.borderColor,
                transform: computed.transform,
                boxShadow: computed.boxShadow,
                opacity: computed.opacity,
                cursor: computed.cursor,
              };
            }, selector);

            // Check if hover actually changed anything
            if (hoverStyles && JSON.stringify(hoverStyles) !== JSON.stringify(normalStyles)) {
              states.hover = hoverStyles;
              statesDetected.hover++;
            }
          } catch (e) {
            // Element not hoverable
          }

          // Try to get focus state (for focusable elements)
          if (['input', 'textarea', 'button', 'a', 'select'].includes(type)) {
            try {
              await page.focus(selector, { timeout: 1000 });
              await page.waitForTimeout(300);

              const focusStyles = await page.evaluate((sel) => {
                const el = document.querySelector(sel);
                if (!el) return null;
                const computed = window.getComputedStyle(el);
                return {
                  outline: computed.outline,
                  outlineColor: computed.outlineColor,
                  outlineWidth: computed.outlineWidth,
                  boxShadow: computed.boxShadow,
                  borderColor: computed.borderColor,
                };
              }, selector);

              if (focusStyles && JSON.stringify(focusStyles) !== JSON.stringify(normalStyles)) {
                states.focus = focusStyles;
                statesDetected.focus++;
              }
            } catch (e) {
              // Element not focusable
            }
          }

          // Get pseudo-elements
          const pseudos = await page.evaluate((sel) => {
            const el = document.querySelector(sel);
            if (!el) return {};

            const before = window.getComputedStyle(el, '::before');
            const after = window.getComputedStyle(el, '::after');

            return {
              before: before.content !== 'none' && before.content !== ''
                ? {
                    content: before.content,
                    display: before.display,
                    color: before.color,
                    fontSize: before.fontSize,
                  }
                : null,
              after: after.content !== 'none' && after.content !== ''
                ? {
                    content: after.content,
                    display: after.display,
                    color: after.color,
                    fontSize: after.fontSize,
                  }
                : null,
            };
          }, selector);

          if (pseudos.before) pseudoElements.before = pseudos.before;
          if (pseudos.after) pseudoElements.after = pseudos.after;

          interactiveElements.push({
            selector,
            states,
            pseudoElements,
            elementType: type,
          });
        } catch (error) {
          console.warn(`⚠️ Could not capture states for ${selector}`);
        }
      }

      console.log(`✅ Interactive capture complete: ${interactiveElements.length} elements`);
      console.log(`🎯 States detected:`, statesDetected);
    }

    await browser.close();

    const response = {
      html,
      styles,
      scripts,
      resources,
    };

    // Add responsive data if captured
    if (responsive) {
      response.responsiveStyles = responsiveStyles;
      response.mediaQueries = mediaQueries;
    }

    // Add interactive data if captured
    if (interactive) {
      response.interactiveElements = interactiveElements;
      response.totalInteractive = totalInteractive;
      response.statesDetected = statesDetected;
    }

    return res.status(200).json(response);
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
