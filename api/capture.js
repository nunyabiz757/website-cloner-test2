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

  const {
    url,
    responsive = false,
    interactive = false,
    animations = false,
    styleAnalysis = false,
    navigation = false,
    extractStyles = true,
    takeScreenshot = false,
    fullPage = false,
    breakpoints = DEFAULT_BREAKPOINTS
  } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  let browser;

  try {
    console.log('🚀 [CAPTURE] Starting capture for:', url);
    console.log('⚙️  [CAPTURE] Options:', { responsive, interactive, animations, styleAnalysis, navigation, extractStyles, takeScreenshot, fullPage });

    const startTime = Date.now();
    console.log('🌐 [BROWSER] Launching Chromium browser...');

    // Launch full Chromium with Playwright (Railway supports this!)
    browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox',
      ],
    });
    console.log(`✅ [BROWSER] Browser launched in ${Date.now() - startTime}ms`);

    const contextStart = Date.now();
    console.log('📱 [BROWSER] Creating browser context...');
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });
    console.log(`✅ [BROWSER] Context created in ${Date.now() - contextStart}ms`);

    const pageStart = Date.now();
    console.log('📄 [BROWSER] Creating new page...');
    const page = await context.newPage();
    console.log(`✅ [BROWSER] Page created in ${Date.now() - pageStart}ms`);

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

    const navStart = Date.now();
    console.log('🌍 [NAVIGATE] Navigating to URL:', url);
    console.log('⏱️  [NAVIGATE] Timeout set to 60s, waiting for networkidle...');

    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    console.log(`✅ [NAVIGATE] Page loaded in ${Date.now() - navStart}ms`);

    console.log('⏳ [WAIT] Waiting 2s for lazy-loaded content...');
    const waitStart = Date.now();
    await page.waitForTimeout(2000);
    console.log(`✅ [WAIT] Wait completed in ${Date.now() - waitStart}ms`);

    console.log('🖼️  [IMAGES] Waiting for images to fully load...');
    const imgStart = Date.now();
    const imgResult = await page.evaluate(() => {
      const totalImages = document.images.length;
      const incompleteImages = Array.from(document.images).filter(img => !img.complete);

      console.log(`[IMAGES] Total images: ${totalImages}, Incomplete: ${incompleteImages.length}`);

      // Wait for images with a 5-second timeout
      return Promise.race([
        // Try to load all incomplete images
        Promise.all(
          incompleteImages.map((img, index) => new Promise(resolve => {
            const timeout = setTimeout(() => {
              console.log(`[IMAGES] Timeout waiting for image ${index + 1}: ${img.src?.substring(0, 100)}`);
              resolve('timeout');
            }, 5000);

            img.onload = () => {
              clearTimeout(timeout);
              resolve('loaded');
            };
            img.onerror = () => {
              clearTimeout(timeout);
              console.log(`[IMAGES] Failed to load image ${index + 1}: ${img.src?.substring(0, 100)}`);
              resolve('error');
            };
          }))
        ),
        // Or timeout after 5 seconds total
        new Promise(resolve => setTimeout(() => {
          console.log('[IMAGES] 5-second overall timeout reached');
          resolve('overall-timeout');
        }, 5000))
      ]).then(() => ({
        total: totalImages,
        incomplete: incompleteImages.length
      }));
    });
    console.log(`✅ [IMAGES] ${imgResult.total} total images (${imgResult.incomplete} were incomplete) - completed in ${Date.now() - imgStart}ms`);

    console.log('📜 [SCROLL] Scrolling to trigger lazy loading...');
    const scrollStart = Date.now();
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
    console.log(`✅ [SCROLL] Scrolling completed in ${Date.now() - scrollStart}ms`);

    console.log('⬆️  [SCROLL] Scrolling back to top...');
    await page.evaluate(() => window.scrollTo(0, 0));

    console.log('📝 [EXTRACT] Extracting HTML...');
    const htmlStart = Date.now();
    const html = await page.evaluate(() => {
      // Convert all SVGs to inline to preserve them
      document.querySelectorAll('svg').forEach(svg => {
        svg.setAttribute('data-svg-preserved', 'true');
      });

      // Mark all logo elements for better detection
      const logoSelectors = [
        'img[alt*="logo" i]',
        'img[class*="logo" i]',
        'img[id*="logo" i]',
        'a[class*="logo" i] img',
        '.header img',
        '.navbar-brand img',
        '.site-logo img',
        'svg[class*="logo" i]',
        'svg[id*="logo" i]'
      ];

      logoSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          el.setAttribute('data-detected-logo', 'true');
        });
      });

      // Mark menu icons
      const menuIconSelectors = [
        '.menu-icon',
        '.hamburger',
        '[class*="menu-toggle"]',
        '[class*="nav-toggle"]',
        'button[aria-label*="menu" i]',
        'button[aria-label*="navigation" i]',
        '.mobile-menu-button',
        '.navbar-toggler'
      ];

      menuIconSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          el.setAttribute('data-detected-menu-icon', 'true');
        });
      });

      return document.documentElement.outerHTML;
    });
    console.log(`✅ [EXTRACT] HTML extracted (${(html.length / 1024).toFixed(2)} KB) in ${Date.now() - htmlStart}ms`);

    console.log('🎨 [EXTRACT] Extracting CSS styles...');
    const cssStart = Date.now();
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
    console.log(`✅ [EXTRACT] CSS extracted (${(styles.length / 1024).toFixed(2)} KB) in ${Date.now() - cssStart}ms`);

    console.log('📜 [EXTRACT] Extracting scripts...');
    const scriptsStart = Date.now();
    const scripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]'))
        .map((script) => script.src);
    });
    console.log(`✅ [EXTRACT] ${scripts.length} scripts extracted in ${Date.now() - scriptsStart}ms`);

    console.log('🖼️  [EXTRACT] Extracting background images...');
    const bgStart = Date.now();
    const backgroundImages = await page.evaluate(() => {
      const bgImages = [];
      const elements = document.querySelectorAll('*');

      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const bgImage = style.backgroundImage;

        if (bgImage && bgImage !== 'none') {
          const urlMatch = bgImage.match(/url\(['"]?([^'"()]+)['"]?\)/g);
          if (urlMatch) {
            urlMatch.forEach(match => {
              const url = match.replace(/url\(['"]?/, '').replace(/['"]?\)/, '');
              bgImages.push({
                url,
                element: el.tagName,
                classes: el.className
              });
            });
          }
        }
      });

      return bgImages;
    });
    console.log(`✅ [EXTRACT] ${backgroundImages.length} background images extracted in ${Date.now() - bgStart}ms`);

    console.log('🎨 [EXTRACT] Detecting icon fonts...');
    const iconStart = Date.now();
    const iconFonts = await page.evaluate(() => {
      const fonts = new Set();
      const elements = document.querySelectorAll('*');

      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const fontFamily = style.fontFamily.toLowerCase();

        // Check for common icon fonts
        if (fontFamily.includes('fontawesome') ||
            fontFamily.includes('material icons') ||
            fontFamily.includes('icomoon') ||
            fontFamily.includes('ionicons') ||
            fontFamily.includes('linearicons') ||
            el.classList.toString().match(/\b(fa|icon|material-icons|mi|ion)\b/i)) {
          fonts.add(fontFamily);
        }
      });

      return Array.from(fonts);
    });
    console.log(`✅ [EXTRACT] ${iconFonts.length} icon fonts detected in ${Date.now() - iconStart}ms`);

    // Extract elements with computed styles if requested
    let elements = [];
    let pageTitle = '';
    let pageMeta = {};

    if (extractStyles) {
      console.log('🔍 [ELEMENTS] Extracting elements with computed styles...');
      const elemStart = Date.now();

      const extractionResult = await page.evaluate(() => {
        const allElements = Array.from(document.querySelectorAll('body *'));

        const elementData = allElements
          .filter((el) => {
            const tag = el.tagName.toLowerCase();
            if (tag === 'script' || tag === 'style' || tag === 'noscript') {
              return false;
            }
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden') {
              return false;
            }
            return true;
          })
          .slice(0, 500) // Limit to 500 elements for performance
          .map((el) => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);

            const attributes = {};
            Array.from(el.attributes).forEach((attr) => {
              attributes[attr.name] = attr.value;
            });

            return {
              tag: el.tagName.toLowerCase(),
              classes: el.className,
              id: el.id,
              text: el.textContent?.trim().substring(0, 200) || '',
              attributes,
              position: {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
              },
              styles: {
                display: style.display,
                position: style.position,
                backgroundColor: style.backgroundColor,
                color: style.color,
                fontSize: style.fontSize,
                fontWeight: style.fontWeight,
                textAlign: style.textAlign,
                padding: style.padding,
                margin: style.margin,
                border: style.border,
                borderRadius: style.borderRadius,
                width: style.width,
                height: style.height,
              },
              isVisible: rect.width > 0 && rect.height > 0,
            };
          });

        // Extract page meta
        const getMetaContent = (name) => {
          const meta = document.querySelector(`meta[name="${name}"]`);
          return meta?.getAttribute('content') || '';
        };

        const getOgContent = (property) => {
          const meta = document.querySelector(`meta[property="${property}"]`);
          return meta?.getAttribute('content') || '';
        };

        return {
          elements: elementData,
          title: document.title,
          meta: {
            description: getMetaContent('description'),
            keywords: getMetaContent('keywords'),
            ogImage: getOgContent('og:image'),
            ogTitle: getOgContent('og:title'),
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight,
            },
          },
        };
      });

      elements = extractionResult.elements;
      pageTitle = extractionResult.title;
      pageMeta = extractionResult.meta;

      console.log(`✅ [ELEMENTS] Extracted ${elements.length} elements in ${Date.now() - elemStart}ms`);
    }

    // Take screenshot if requested
    let screenshot = null;
    if (takeScreenshot) {
      console.log('📸 [SCREENSHOT] Taking screenshot...');
      const screenshotStart = Date.now();
      const screenshotBuffer = await page.screenshot({
        type: 'png',
        fullPage: fullPage,
      });
      screenshot = screenshotBuffer.toString('base64');
      console.log(`✅ [SCREENSHOT] Screenshot captured (${(screenshot.length / 1024).toFixed(2)} KB) in ${Date.now() - screenshotStart}ms`);
    }

    const totalTime = Date.now() - startTime;
    console.log('');
    console.log('🎉 ===== CAPTURE COMPLETE =====');
    console.log(`⏱️  Total time: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
    console.log(`📄 HTML length: ${html.length} chars`);
    console.log(`🎨 CSS length: ${styles.length} chars`);
    console.log(`📦 Resources: ${resources.images.length} images, ${resources.fonts.length} fonts`);
    console.log(`🖼️  Background images: ${backgroundImages.length}`);
    console.log(`🎭 Icon fonts detected: ${iconFonts.join(', ') || 'none'}`);

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

    // If animation detection is enabled, extract keyframes and animated elements
    let animationData = null;

    if (animations) {
      console.log('🎬 Starting animation detection...');

      // Extract keyframes and find animated elements
      const animationReport = await page.evaluate(() => {
        const keyframes = [];
        const animatedElements = [];

        // Extract @keyframes from stylesheets
        const styleSheets = Array.from(document.styleSheets);
        styleSheets.forEach((sheet) => {
          try {
            const rules = Array.from(sheet.cssRules || sheet.rules);
            rules.forEach((rule) => {
              if (rule instanceof CSSKeyframesRule) {
                keyframes.push({
                  name: rule.name,
                  rules: rule.cssText,
                });
              }
            });
          } catch (e) {
            // CORS blocked stylesheet
          }
        });

        // Find elements with animations or transitions
        const allElements = document.querySelectorAll('*');
        allElements.forEach((el, index) => {
          const computed = window.getComputedStyle(el);

          const animationName = computed.animationName;
          const hasAnimation = animationName && animationName !== 'none';

          const transitionProperty = computed.transitionProperty;
          const hasTransition = transitionProperty && transitionProperty !== 'none';

          const transform = computed.transform;
          const hasTransform = transform && transform !== 'none';

          if (hasAnimation || hasTransition || hasTransform) {
            const tag = el.tagName.toLowerCase();
            const id = el.id ? `#${el.id}` : '';
            const classes = el.className && typeof el.className === 'string'
              ? `.${el.className.split(' ').filter(c => c).join('.')}`
              : '';
            const selector = `${tag}${id}${classes}`.slice(0, 100) || `${tag}:nth-of-type(${index + 1})`;

            animatedElements.push({
              selector,
              elementType: tag,
              hasAnimation,
              hasTransition,
              animation: hasAnimation ? {
                name: animationName,
                duration: computed.animationDuration,
                timingFunction: computed.animationTimingFunction,
                delay: computed.animationDelay,
                iterationCount: computed.animationIterationCount,
              } : undefined,
              transitions: hasTransition ? [{
                property: transitionProperty,
                duration: computed.transitionDuration,
                timingFunction: computed.transitionTimingFunction,
                delay: computed.transitionDelay,
              }] : undefined,
              transform: hasTransform ? transform : undefined,
            });
          }
        });

        return {
          keyframes,
          animatedElements,
          totalAnimatedElements: animatedElements.length,
          elementsWithAnimations: animatedElements.filter(e => e.hasAnimation).length,
          elementsWithTransitions: animatedElements.filter(e => e.hasTransition).length,
          elementsWithTransforms: animatedElements.filter(e => e.transform).length,
        };
      });

      animationData = animationReport;
      console.log(`✅ Animation detection complete`);
      console.log(`🎬 Total animated: ${animationData.totalAnimatedElements}`);
      console.log(`🔑 Keyframes: ${animationData.keyframes.length}`);
    }

    // If style analysis is enabled, extract colors, typography, and visual effects
    let styleAnalysisData = null;

    if (styleAnalysis) {
      console.log('🎨 Starting advanced style analysis...');

      const analysisResult = await page.evaluate(() => {
        // Helper function to normalize colors to HEX
        const rgbToHex = (rgb) => {
          const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (match) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
          }
          return rgb;
        };

        const normalizeColor = (color) => {
          if (!color || color === 'transparent' || color === 'inherit') return color;
          if (color.startsWith('#')) return color.toUpperCase();
          if (color.startsWith('rgb')) return rgbToHex(color);
          return color;
        };

        // Extract color palette
        const elements = Array.from(document.querySelectorAll('*'));
        const backgrounds = [];
        const textColors = [];
        const borderColors = [];
        const allColors = new Set();

        elements.forEach((el) => {
          const computed = window.getComputedStyle(el);

          const bg = normalizeColor(computed.backgroundColor);
          if (bg && bg !== 'transparent') {
            backgrounds.push(bg);
            allColors.add(bg);
          }

          const text = normalizeColor(computed.color);
          if (text) {
            textColors.push(text);
            allColors.add(text);
          }

          const border = normalizeColor(computed.borderColor);
          if (border && border !== 'transparent') {
            borderColors.push(border);
            allColors.add(border);
          }
        });

        // Find most used colors
        const colorCounts = new Map();
        [...backgrounds, ...textColors].forEach((color) => {
          colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
        });

        const mostUsed = Array.from(colorCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([color]) => color);

        // Extract typography scale
        const typographyScale = {};
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((tag) => {
          const element = document.querySelector(tag);
          if (element) {
            const computed = window.getComputedStyle(element);
            typographyScale[tag] = computed.fontSize;
          }
        });

        const body = document.querySelector('body');
        if (body) {
          typographyScale.body = window.getComputedStyle(body).fontSize;
        }

        // Count visual effects
        let elementsWithShadows = 0;
        let elementsWithFilters = 0;
        let elementsWithTransforms = 0;
        let maxZIndex = 0;

        elements.forEach((el) => {
          const computed = window.getComputedStyle(el);

          if (computed.boxShadow && computed.boxShadow !== 'none') {
            elementsWithShadows++;
          }

          if (computed.filter && computed.filter !== 'none') {
            elementsWithFilters++;
          }

          if (computed.transform && computed.transform !== 'none') {
            elementsWithTransforms++;
          }

          const zIndex = parseInt(computed.zIndex);
          if (!isNaN(zIndex) && zIndex > maxZIndex) {
            maxZIndex = zIndex;
          }
        });

        return {
          colors: {
            palette: {
              primary: mostUsed.slice(0, 5),
              backgrounds: [...new Set(backgrounds)].slice(0, 10),
              text: [...new Set(textColors)].slice(0, 10),
              borders: [...new Set(borderColors)].slice(0, 10),
              allColors: Array.from(allColors),
            },
            totalUnique: allColors.size,
            mostUsed,
          },
          typography: {
            scale: typographyScale,
          },
          visual: {
            elementsWithShadows,
            elementsWithFilters,
            elementsWithTransforms,
            maxZIndex,
          },
        };
      });

      // Extract @font-face rules from CSS
      const cssText = await page.evaluate(() => {
        let css = '';
        try {
          const styleSheets = Array.from(document.styleSheets);
          styleSheets.forEach((sheet) => {
            try {
              const rules = Array.from(sheet.cssRules || sheet.rules);
              rules.forEach((rule) => {
                if (rule instanceof CSSFontFaceRule) {
                  css += rule.cssText + '\n';
                }
              });
            } catch (e) {
              // CORS blocked
            }
          });
        } catch (e) {
          // Error
        }
        return css;
      });

      // Parse @font-face rules
      const fonts = [];
      const fontFaceRegex = /@font-face\s*\{([^}]+)\}/g;
      let match;

      while ((match = fontFaceRegex.exec(cssText)) !== null) {
        const rules = match[1];

        const familyMatch = rules.match(/font-family:\s*['"]?([^'";\n]+)['"]?/);
        const fontFamily = familyMatch ? familyMatch[1].trim() : '';

        const srcMatches = rules.matchAll(/url\(['"]?([^'")\n]+)['"]?\)/g);
        const src = Array.from(srcMatches).map((m) => m[1]);

        const weightMatch = rules.match(/font-weight:\s*(\d+|normal|bold)/);
        const fontWeight = weightMatch ? weightMatch[1] : undefined;

        const styleMatch = rules.match(/font-style:\s*(normal|italic|oblique)/);
        const fontStyle = styleMatch ? styleMatch[1] : undefined;

        if (fontFamily && src.length > 0) {
          fonts.push({
            fontFamily,
            src,
            fontWeight,
            fontStyle,
          });
        }
      }

      analysisResult.typography.fonts = fonts;
      analysisResult.typography.totalFonts = fonts.length;

      styleAnalysisData = analysisResult;
      console.log(`✅ Style analysis complete`);
      console.log(`🎨 Colors: ${styleAnalysisData.colors.totalUnique} unique`);
      console.log(`📝 Fonts: ${styleAnalysisData.typography.totalFonts}`);
      console.log(`✨ Shadows: ${styleAnalysisData.visual.elementsWithShadows}`);
    }

    // If navigation detection is enabled, detect all navigation components
    let navigationData = null;

    if (navigation) {
      console.log('🧭 Starting navigation detection...');

      navigationData = await page.evaluate(() => {
        // Navigation patterns
        const NAV_PATTERNS = {
          semantic: ['nav'],
          aria: ['navigation', 'menubar', 'menu'],
          classes: [
            'nav', 'navbar', 'navigation', 'menu', 'main-nav', 'primary-nav',
            'site-nav', 'header-nav', 'top-nav', 'mobile-nav', 'sidebar-nav',
            'nav-menu', 'nav-list', 'menubar', 'main-menu', 'primary-menu'
          ],
          dropdown: [
            'dropdown', 'submenu', 'sub-menu', 'mega-menu', 'dropdown-menu',
            'nav-dropdown', 'has-dropdown', 'menu-item-has-children'
          ],
          hamburger: [
            'hamburger', 'burger', 'menu-toggle', 'nav-toggle', 'mobile-toggle',
            'menu-icon', 'nav-icon', 'toggle-menu', 'menu-button'
          ]
        };

        const detectedSelectors = new Set();
        const navComponents = [];

        // Helper: Generate unique selector
        const generateSelector = (element, base, index) => {
          const id = element.id;
          if (id) return `#${id}`;

          const classes = Array.from(element.classList).filter(c => c.length > 0);
          if (classes.length > 0) return `.${classes[0]}`;

          return index === 0 ? base : `${base}:nth-of-type(${index + 1})`;
        };

        // Helper: Extract links
        const extractLinks = (element) => {
          const links = [];
          const anchorElements = element.querySelectorAll('a');

          anchorElements.forEach((anchor) => {
            const href = anchor.getAttribute('href') || '#';
            const text = anchor.textContent?.trim() || '';
            const parent = anchor.parentElement;

            const hasDropdown = parent
              ? parent.querySelectorAll('ul, ol').length > 0 ||
                /dropdown|submenu|has-children/.test(parent.classList.toString())
              : false;

            const isActive = anchor.classList.contains('active') ||
                            anchor.classList.contains('current') ||
                            anchor.getAttribute('aria-current') === 'page';

            let level = 0;
            let currentParent = anchor.parentElement;
            while (currentParent && currentParent !== element) {
              if (currentParent.tagName === 'UL' || currentParent.tagName === 'OL') {
                level++;
              }
              currentParent = currentParent.parentElement;
            }

            links.push({
              text,
              href,
              hasDropdown,
              isActive,
              level: Math.max(1, level)
            });
          });

          return links;
        };

        // Helper: Detect orientation
        const detectOrientation = (element) => {
          const firstLevelItems = element.querySelectorAll(':scope > ul > li, :scope > ol > li, :scope > li');
          if (firstLevelItems.length === 0) return undefined;

          const computed = window.getComputedStyle(element);
          const flexDirection = computed.flexDirection;

          if (flexDirection === 'row' || flexDirection === 'row-reverse') return 'horizontal';
          if (flexDirection === 'column' || flexDirection === 'column-reverse') return 'vertical';
          if (computed.display === 'flex' || computed.display === 'inline-flex') return 'horizontal';

          if (firstLevelItems.length >= 2) {
            const firstRect = firstLevelItems[0].getBoundingClientRect();
            const secondRect = firstLevelItems[1].getBoundingClientRect();

            if (Math.abs(firstRect.top - secondRect.top) < 10) return 'horizontal';
            if (Math.abs(firstRect.left - secondRect.left) < 10) return 'vertical';
          }

          return undefined;
        };

        // Helper: Check for dropdowns
        const hasDropdownMenus = (element) => {
          const hasDropdownClass = NAV_PATTERNS.dropdown.some((className) =>
            element.querySelector(`.${className}`) !== null
          );
          if (hasDropdownClass) return true;

          const nestedLists = element.querySelectorAll('ul ul, ol ul, ul ol, ol ol');
          if (nestedLists.length > 0) return true;

          return element.querySelector('[aria-haspopup="true"]') !== null;
        };

        // Helper: Check for hamburger
        const hasHamburgerMenu = (element) => {
          const parent = element.parentElement;
          if (!parent) return false;

          return NAV_PATTERNS.hamburger.some((className) =>
            parent.querySelector(`.${className}`) !== null ||
            element.querySelector(`.${className}`) !== null
          );
        };

        // Helper: Count nesting levels
        const countNestingLevels = (element) => {
          let maxDepth = 0;

          const countDepth = (el, depth) => {
            maxDepth = Math.max(maxDepth, depth);
            const childLists = el.querySelectorAll(':scope > li > ul, :scope > li > ol');
            childLists.forEach((child) => countDepth(child, depth + 1));
          };

          const topLists = element.querySelectorAll(':scope > ul, :scope > ol');
          topLists.forEach((list) => countDepth(list, 1));

          return maxDepth || 1;
        };

        // Helper: Analyze navigation
        const analyzeNavigation = (element, baseConfidence) => {
          const links = extractLinks(element);
          const characteristics = [];

          const orientation = detectOrientation(element);
          if (orientation) characteristics.push(`${orientation} orientation`);

          const hasDropdowns = hasDropdownMenus(element);
          if (hasDropdowns) characteristics.push('has dropdowns');

          const hasHamburger = hasHamburgerMenu(element);
          if (hasHamburger) characteristics.push('has hamburger menu');

          const levels = countNestingLevels(element);
          if (levels > 1) characteristics.push(`${levels} levels deep`);

          const computed = window.getComputedStyle(element);
          if (computed.position === 'fixed' || computed.position === 'sticky') {
            characteristics.push('fixed/sticky positioning');
          }

          // Determine type
          let type = 'navigation-menu';
          if (hasHamburger) type = 'hamburger-menu';
          else if (hasDropdowns) type = 'dropdown-menu';
          else if (orientation === 'horizontal') type = 'horizontal-nav';
          else if (orientation === 'vertical') type = 'vertical-nav';

          // Calculate confidence
          let confidence = baseConfidence;
          if (links.length >= 5) confidence += 5;
          if (hasDropdowns) confidence += 3;
          if (orientation) confidence += 2;
          confidence = Math.min(100, confidence);

          return {
            type,
            confidence,
            orientation,
            hasDropdowns,
            hasHamburger,
            linkCount: links.length,
            levels,
            links,
            characteristics
          };
        };

        // Level 1: Semantic <nav> tags
        document.querySelectorAll('nav').forEach((nav, index) => {
          const selector = generateSelector(nav, 'nav', index);
          if (detectedSelectors.has(selector)) return;
          detectedSelectors.add(selector);

          const properties = analyzeNavigation(nav, 95);
          navComponents.push({
            selector,
            element: nav.tagName.toLowerCase(),
            properties,
            detectionMethod: 'semantic'
          });
        });

        // Level 2: ARIA role
        document.querySelectorAll('[role="navigation"], [role="menubar"], [role="menu"]').forEach((element, index) => {
          const selector = generateSelector(element, `[role="${element.getAttribute('role')}"]`, index);
          if (detectedSelectors.has(selector)) return;
          detectedSelectors.add(selector);

          const baseConfidence = element.getAttribute('role') === 'navigation' ? 90 : 85;
          const properties = analyzeNavigation(element, baseConfidence);
          navComponents.push({
            selector,
            element: element.tagName.toLowerCase(),
            properties,
            detectionMethod: 'aria'
          });
        });

        // Level 3: Common CSS classes
        NAV_PATTERNS.classes.forEach((className) => {
          document.querySelectorAll(`.${className}`).forEach((element, index) => {
            const linkCount = element.querySelectorAll('a').length;
            if (linkCount < 2) return;

            const selector = generateSelector(element, `.${className}`, index);
            if (detectedSelectors.has(selector)) return;
            detectedSelectors.add(selector);

            const properties = analyzeNavigation(element, 85);
            navComponents.push({
              selector,
              element: element.tagName.toLowerCase(),
              properties,
              detectionMethod: 'class'
            });
          });
        });

        // Level 4: Structural patterns
        const structuralSelectors = ['header ul li a', 'header ol li a', '.header ul li a', '#header ul li a'];
        structuralSelectors.forEach((selector) => {
          const links = document.querySelectorAll(selector);
          if (links.length < 3) return;

          const parentList = links[0]?.closest('ul, ol');
          if (!parentList) return;

          const listSelector = generateSelector(parentList, selector, 0);
          if (detectedSelectors.has(listSelector)) return;
          detectedSelectors.add(listSelector);

          const properties = analyzeNavigation(parentList, 70);
          navComponents.push({
            selector: listSelector,
            element: parentList.tagName.toLowerCase(),
            properties,
            detectionMethod: 'structural'
          });
        });

        // Level 5: Context-based
        document.querySelectorAll('header, footer, aside, .sidebar').forEach((context) => {
          context.querySelectorAll('ul, ol').forEach((list, index) => {
            const links = list.querySelectorAll('a');
            if (links.length < 3) return;

            const selector = generateSelector(list, `${context.tagName.toLowerCase()} ul`, index);
            if (detectedSelectors.has(selector)) return;
            detectedSelectors.add(selector);

            const properties = analyzeNavigation(list, 60);
            navComponents.push({
              selector,
              element: list.tagName.toLowerCase(),
              properties,
              detectionMethod: 'contextual'
            });
          });
        });

        return {
          totalNavigations: navComponents.length,
          byType: navComponents.reduce((acc, c) => {
            acc[c.properties.type] = (acc[c.properties.type] || 0) + 1;
            return acc;
          }, {}),
          byMethod: navComponents.reduce((acc, c) => {
            acc[c.detectionMethod] = (acc[c.detectionMethod] || 0) + 1;
            return acc;
          }, {}),
          components: navComponents
        };
      });

      console.log(`✅ Navigation detection complete`);
      console.log(`🧭 Total navigations: ${navigationData.totalNavigations}`);
      console.log(`📊 By type:`, navigationData.byType);
    }

    await browser.close();

    const response = {
      url,
      title: pageTitle || '',
      html,
      styles,
      scripts,
      resources,
      backgroundImages,
      iconFonts,
      elements: elements || [],
      meta: pageMeta || {},
      screenshot: screenshot || null,
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

    // Add animation data if captured
    if (animations) {
      response.animations = animationData;
    }

    // Add style analysis if captured
    if (styleAnalysis) {
      response.styleAnalysis = styleAnalysisData;
    }

    // Add navigation data if captured
    if (navigation) {
      response.navigation = navigationData;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('');
    console.error('❌ ===== CAPTURE FAILED =====');
    console.error('Error:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('URL:', url);
    console.error('============================');
    console.error('');

    if (browser) {
      console.log('🧹 Closing browser...');
      await browser.close();
      console.log('✅ Browser closed');
    }

    return res.status(500).json({
      error: 'Failed to capture page',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
