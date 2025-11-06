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

export interface InteractiveState {
  selector: string;
  states: {
    normal: Record<string, string>;
    hover?: Record<string, string>;
    focus?: Record<string, string>;
    active?: Record<string, string>;
    disabled?: Record<string, string>;
  };
  pseudoElements: {
    before?: Record<string, string>;
    after?: Record<string, string>;
  };
  elementType: string;
}

export interface InteractiveCaptureResult extends CaptureResult {
  interactiveElements: InteractiveState[];
  totalInteractive: number;
  statesDetected: {
    hover: number;
    focus: number;
    active: number;
    disabled: number;
  };
}

export interface AnimationReport {
  totalAnimatedElements: number;
  elementsWithAnimations: number;
  elementsWithTransitions: number;
  elementsWithTransforms: number;
  keyframes: Array<{
    name: string;
    rules: string;
  }>;
  animatedElements: Array<{
    selector: string;
    hasAnimation: boolean;
    hasTransition: boolean;
  }>;
}

export interface AnimationCaptureResult extends CaptureResult {
  animations: AnimationReport;
}

export interface StyleAnalysisResult extends CaptureResult {
  styleAnalysis: {
    colors: {
      palette: {
        primary: string[];
        backgrounds: string[];
        text: string[];
        borders: string[];
        allColors: string[];
      };
      totalUnique: number;
      mostUsed: string[];
    };
    typography: {
      fonts: Array<{
        fontFamily: string;
        src: string[];
        fontWeight?: string;
        fontStyle?: string;
      }>;
      scale: Record<string, string>;
      totalFonts: number;
    };
    visual: {
      elementsWithShadows: number;
      elementsWithFilters: number;
      elementsWithTransforms: number;
      maxZIndex: number;
    };
  };
}

export interface NavigationResult extends CaptureResult {
  navigation: {
    totalNavigations: number;
    byType: Record<string, number>;
    byMethod: Record<string, number>;
    components: Array<{
      selector: string;
      element: string;
      properties: {
        type: string;
        confidence: number;
        orientation?: string;
        hasDropdowns: boolean;
        hasHamburger: boolean;
        linkCount: number;
        levels: number;
        links: Array<{
          text: string;
          href: string;
          hasDropdown: boolean;
          isActive: boolean;
          level: number;
        }>;
        characteristics: string[];
      };
      detectionMethod: string;
    }>;
  };
}

export class BrowserService {
  /**
   * Check if browser automation is available
   * In Railway deployment, this always returns true since we run Playwright server-side
   */
  static isAvailable(): boolean {
    return true; // Always available via Railway backend
  }

  /**
   * Launch browser instance
   * This is a no-op since Railway backend handles browser lifecycle
   */
  async launch(options: BrowserOptions = {}): Promise<void> {
    console.log('✅ Browser service ready (using Railway Playwright backend)');
  }

  /**
   * Navigate to URL and capture full rendered content using Railway API
   */
  async capturePage(url: string, takeScreenshot: boolean = false): Promise<CaptureResult> {
    console.log(`🌐 Requesting browser capture for ${url}...`);

    try {
      // Call same-origin API endpoint (everything runs on Railway)
      const apiUrl = '/api/capture';

      console.log(`📡 Calling API: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, takeScreenshot }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const result: CaptureResult = await response.json();

      console.log('✅ Page captured successfully');
      console.log(`📄 HTML length: ${result.html.length} chars`);
      console.log(`🎨 CSS length: ${result.styles.length} chars`);
      console.log(`📦 Resources: ${result.resources.images.length} images, ${result.resources.fonts.length} fonts`);
      if (takeScreenshot && (result as any).screenshot) {
        console.log(`📸 Screenshot captured`);
      }

      return result;
    } catch (error) {
      console.error('❌ Failed to capture page:', error);
      throw new Error(
        `Browser automation failed: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
        'Please check that the Railway backend is running with Playwright installed.'
      );
    }
  }

  /**
   * Capture page at multiple breakpoints for responsive detection
   */
  async captureResponsive(
    url: string,
    breakpoints: Breakpoint[] = DEFAULT_BREAKPOINTS,
    takeScreenshot: boolean = false
  ): Promise<ResponsiveCaptureResult> {
    console.log(`📱 Requesting responsive capture for ${url} via API...`);

    try {
      // Call Railway API endpoint with responsive flag
      const apiUrl = '/api/capture';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          responsive: true,
          breakpoints,
          takeScreenshot
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
   * Capture interactive states for all interactive elements (hover, focus, active)
   */
  async captureInteractiveStates(url: string, takeScreenshot: boolean = false): Promise<InteractiveCaptureResult> {
    console.log(`🎨 Requesting interactive state capture for ${url} via API...`);

    try {
      const apiUrl = '/api/capture';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          interactive: true,
          takeScreenshot
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const result: InteractiveCaptureResult = await response.json();

      console.log('✅ Interactive capture completed');
      console.log(`🎨 Interactive elements: ${result.totalInteractive}`);
      console.log(`🎯 States detected:`, result.statesDetected);

      return result;
    } catch (error) {
      console.error('❌ Failed to capture interactive states:', error);
      throw new Error(
        `Interactive capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Capture page with animation detection (transitions, keyframes, transforms)
   */
  async captureWithAnimations(url: string, takeScreenshot: boolean = false): Promise<AnimationCaptureResult> {
    console.log(`🎬 Requesting animation detection for ${url} via API...`);

    try {
      const apiUrl = '/api/capture';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          animations: true,
          takeScreenshot
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const result: AnimationCaptureResult = await response.json();

      console.log('✅ Animation detection completed');
      console.log(`🎬 Animated elements: ${result.animations.totalAnimatedElements}`);
      console.log(`🔑 Keyframes: ${result.animations.keyframes.length}`);

      return result;
    } catch (error) {
      console.error('❌ Failed to detect animations:', error);
      throw new Error(
        `Animation detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Capture page with advanced style analysis (colors, typography, visual effects)
   */
  async captureWithStyleAnalysis(url: string, takeScreenshot: boolean = false): Promise<StyleAnalysisResult> {
    console.log(`🎨 Requesting style analysis for ${url} via API...`);

    try {
      const apiUrl = '/api/capture';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          styleAnalysis: true,
          takeScreenshot
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const result: StyleAnalysisResult = await response.json();

      console.log('✅ Style analysis completed');
      console.log(`🎨 Colors: ${result.styleAnalysis.colors.totalUnique} unique`);
      console.log(`📝 Fonts: ${result.styleAnalysis.typography.totalFonts}`);
      console.log(`✨ Shadows: ${result.styleAnalysis.visual.elementsWithShadows}`);

      return result;
    } catch (error) {
      console.error('❌ Failed to analyze styles:', error);
      throw new Error(
        `Style analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Capture page with navigation detection
   */
  async captureWithNavigation(url: string, takeScreenshot: boolean = false): Promise<NavigationResult> {
    console.log(`🧭 Requesting navigation detection for ${url} via API...`);

    try {
      const apiUrl = '/api/capture';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          navigation: true,
          takeScreenshot
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const result: NavigationResult = await response.json();

      console.log('✅ Navigation detection completed');
      console.log(`🧭 Total navigations: ${result.navigation.totalNavigations}`);
      console.log(`📊 By type:`, result.navigation.byType);

      return result;
    } catch (error) {
      console.error('❌ Failed to detect navigation:', error);
      throw new Error(
        `Navigation detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
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
