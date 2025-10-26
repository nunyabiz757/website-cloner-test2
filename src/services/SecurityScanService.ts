import { loggingService } from './LoggingService';

export interface SecurityScanResult {
  score: number; // 0-100
  https: {
    enabled: boolean;
    valid: boolean;
  };
  mixedContent: {
    found: boolean;
    count: number;
    resources: string[];
  };
  headers: {
    hasStrictTransportSecurity: boolean;
    hasContentSecurityPolicy: boolean;
    hasXFrameOptions: boolean;
    hasXContentTypeOptions: boolean;
    hasReferrerPolicy: boolean;
    hasPermissionsPolicy: boolean;
  };
  contentSecurityPolicy: {
    exists: boolean;
    directives: string[];
    isStrict: boolean;
  };
  cookies: {
    secure: number;
    insecure: number;
    withHttpOnly: number;
    withSameSite: number;
  };
  forms: {
    total: number;
    withHttps: number;
    withHttpPost: number;
    secureSubmission: number;
  };
  vulnerabilities: {
    inlineScripts: number;
    externalScripts: number;
    iframes: number;
    outdatedLibraries: string[];
  };
  privacyPolicy: {
    found: boolean;
    url?: string;
  };
  recommendations: string[];
  threats: string[];
}

export class SecurityScanService {
  async scanSecurity(url: string, htmlContent: string): Promise<SecurityScanResult> {
    loggingService.info('security-scan', `Starting security scan for ${url}`);

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      // Check HTTPS
      const https = this.checkHTTPS(url);

      // Check for mixed content
      const mixedContent = this.checkMixedContent(doc, url);

      // Analyze security headers (requires actual HTTP response)
      const headers = await this.analyzeSecurityHeaders(url);

      // Analyze Content Security Policy
      const contentSecurityPolicy = this.analyzeCSP(headers);

      // Analyze cookies (limited in browser context)
      const cookies = this.analyzeCookies();

      // Analyze forms
      const forms = this.analyzeForms(doc, url);

      // Check for vulnerabilities
      const vulnerabilities = this.checkVulnerabilities(doc);

      // Check for privacy policy
      const privacyPolicy = this.checkPrivacyPolicy(doc);

      // Calculate score
      const score = this.calculateSecurityScore({
        https,
        mixedContent,
        headers,
        contentSecurityPolicy,
        cookies,
        forms,
        vulnerabilities,
        privacyPolicy,
      });

      // Generate recommendations
      const recommendations = this.generateRecommendations({
        https,
        mixedContent,
        headers,
        contentSecurityPolicy,
        cookies,
        forms,
        vulnerabilities,
        privacyPolicy,
      });

      // Identify threats
      const threats = this.identifyThreats({
        https,
        mixedContent,
        headers,
        vulnerabilities,
      });

      const result: SecurityScanResult = {
        score,
        https,
        mixedContent,
        headers,
        contentSecurityPolicy,
        cookies,
        forms,
        vulnerabilities,
        privacyPolicy,
        recommendations,
        threats,
      };

      loggingService.success('security-scan', `Security scan completed with score: ${score}/100`);
      return result;
    } catch (error) {
      loggingService.error('security-scan', 'Failed to perform security scan', error);
      throw error;
    }
  }

  private checkHTTPS(url: string) {
    const urlObj = new URL(url);
    const enabled = urlObj.protocol === 'https:';
    const valid = enabled; // In browser context, if we can load it, it's valid

    return { enabled, valid };
  }

  private checkMixedContent(doc: Document, baseUrl: string) {
    const urlObj = new URL(baseUrl);
    const isHttps = urlObj.protocol === 'https:';

    if (!isHttps) {
      return { found: false, count: 0, resources: [] };
    }

    const resources: string[] = [];

    // Check images
    doc.querySelectorAll('img[src]').forEach(img => {
      const src = img.getAttribute('src');
      if (src && src.startsWith('http://')) {
        resources.push(src);
      }
    });

    // Check scripts
    doc.querySelectorAll('script[src]').forEach(script => {
      const src = script.getAttribute('src');
      if (src && src.startsWith('http://')) {
        resources.push(src);
      }
    });

    // Check stylesheets
    doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('http://')) {
        resources.push(href);
      }
    });

    // Check iframes
    doc.querySelectorAll('iframe[src]').forEach(iframe => {
      const src = iframe.getAttribute('src');
      if (src && src.startsWith('http://')) {
        resources.push(src);
      }
    });

    return {
      found: resources.length > 0,
      count: resources.length,
      resources: resources.slice(0, 10), // Limit to first 10
    };
  }

  private async analyzeSecurityHeaders(url: string) {
    const headers = {
      hasStrictTransportSecurity: false,
      hasContentSecurityPolicy: false,
      hasXFrameOptions: false,
      hasXContentTypeOptions: false,
      hasReferrerPolicy: false,
      hasPermissionsPolicy: false,
    };

    try {
      const response = await fetch(url, { method: 'HEAD' });

      headers.hasStrictTransportSecurity = response.headers.has('strict-transport-security');
      headers.hasContentSecurityPolicy = response.headers.has('content-security-policy');
      headers.hasXFrameOptions = response.headers.has('x-frame-options');
      headers.hasXContentTypeOptions = response.headers.has('x-content-type-options');
      headers.hasReferrerPolicy = response.headers.has('referrer-policy');
      headers.hasPermissionsPolicy = response.headers.has('permissions-policy') || response.headers.has('feature-policy');
    } catch (error) {
      loggingService.warning('security-scan', 'Unable to fetch headers due to CORS', error);
    }

    return headers;
  }

  private analyzeCSP(headers: { hasContentSecurityPolicy: boolean }) {
    // In browser context, we can't read the actual CSP header value due to CORS
    // This is a simplified check
    const exists = headers.hasContentSecurityPolicy;
    const directives: string[] = [];
    const isStrict = false;

    return { exists, directives, isStrict };
  }

  private analyzeCookies() {
    // In browser context, we have limited access to cookies
    // This is a placeholder that would work better in a server context
    const cookies = document.cookie.split(';');

    return {
      secure: 0,
      insecure: 0,
      withHttpOnly: 0, // Can't detect in browser
      withSameSite: 0, // Can't detect in browser
    };
  }

  private analyzeForms(doc: Document, baseUrl: string) {
    const forms = doc.querySelectorAll('form');
    const total = forms.length;
    let withHttps = 0;
    let withHttpPost = 0;
    let secureSubmission = 0;

    const urlObj = new URL(baseUrl);
    const pageIsHttps = urlObj.protocol === 'https:';

    forms.forEach(form => {
      const action = form.getAttribute('action');
      const method = (form.getAttribute('method') || 'get').toLowerCase();

      // Check if form action uses HTTPS
      if (!action || action.startsWith('/') || action.startsWith('#')) {
        // Form submits to same page
        if (pageIsHttps) {
          withHttps++;
        }
      } else if (action.startsWith('https://')) {
        withHttps++;
      }

      // Check if form uses POST
      if (method === 'post') {
        withHttpPost++;

        // Secure submission = HTTPS + POST
        if (!action || action.startsWith('/') || action.startsWith('#')) {
          if (pageIsHttps) secureSubmission++;
        } else if (action.startsWith('https://')) {
          secureSubmission++;
        }
      }
    });

    return { total, withHttps, withHttpPost, secureSubmission };
  }

  private checkVulnerabilities(doc: Document) {
    const inlineScripts = doc.querySelectorAll('script:not([src])').length;
    const externalScripts = doc.querySelectorAll('script[src]').length;
    const iframes = doc.querySelectorAll('iframe').length;
    const outdatedLibraries: string[] = [];

    // Check for common outdated libraries
    const scripts = doc.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const src = script.getAttribute('src') || '';

      // Check for old jQuery versions
      if (src.includes('jquery') && (src.includes('1.') || src.includes('2.'))) {
        outdatedLibraries.push('jQuery 1.x/2.x (outdated)');
      }

      // Check for old Bootstrap versions
      if (src.includes('bootstrap') && src.includes('3.')) {
        outdatedLibraries.push('Bootstrap 3.x (outdated)');
      }

      // Check for old Angular versions
      if (src.includes('angular.js') || src.includes('angular.min.js')) {
        outdatedLibraries.push('AngularJS 1.x (outdated)');
      }
    });

    return {
      inlineScripts,
      externalScripts,
      iframes,
      outdatedLibraries: [...new Set(outdatedLibraries)],
    };
  }

  private checkPrivacyPolicy(doc: Document) {
    const privacyLinks = doc.querySelectorAll('a[href*="privacy"]');
    let found = false;
    let url: string | undefined;

    privacyLinks.forEach(link => {
      const href = link.getAttribute('href');
      const text = link.textContent?.toLowerCase() || '';

      if (text.includes('privacy') && href) {
        found = true;
        if (!url) url = href;
      }
    });

    return { found, url };
  }

  private calculateSecurityScore(data: Omit<SecurityScanResult, 'score' | 'recommendations' | 'threats'>): number {
    let score = 0;

    // HTTPS (25 points)
    if (data.https.enabled && data.https.valid) {
      score += 25;
    }

    // No mixed content (15 points)
    if (!data.mixedContent.found) {
      score += 15;
    } else {
      score += Math.max(0, 15 - data.mixedContent.count);
    }

    // Security headers (30 points total, 5 each)
    if (data.headers.hasStrictTransportSecurity) score += 6;
    if (data.headers.hasContentSecurityPolicy) score += 6;
    if (data.headers.hasXFrameOptions) score += 6;
    if (data.headers.hasXContentTypeOptions) score += 6;
    if (data.headers.hasReferrerPolicy) score += 3;
    if (data.headers.hasPermissionsPolicy) score += 3;

    // Forms (15 points)
    if (data.forms.total === 0) {
      score += 15;
    } else {
      const formScore = (data.forms.secureSubmission / data.forms.total) * 15;
      score += formScore;
    }

    // Vulnerabilities (10 points)
    let vulnScore = 10;
    if (data.vulnerabilities.inlineScripts > 5) vulnScore -= 3;
    if (data.vulnerabilities.iframes > 3) vulnScore -= 2;
    if (data.vulnerabilities.outdatedLibraries.length > 0) vulnScore -= 3;
    score += Math.max(0, vulnScore);

    // Privacy policy (5 points)
    if (data.privacyPolicy.found) score += 5;

    return Math.min(100, Math.round(score));
  }

  private generateRecommendations(data: Omit<SecurityScanResult, 'score' | 'recommendations' | 'threats'>): string[] {
    const recommendations: string[] = [];

    if (!data.https.enabled) {
      recommendations.push('Enable HTTPS to encrypt data in transit');
    }

    if (data.mixedContent.found) {
      recommendations.push(`Fix ${data.mixedContent.count} mixed content resources to use HTTPS`);
    }

    if (!data.headers.hasStrictTransportSecurity) {
      recommendations.push('Add Strict-Transport-Security header to enforce HTTPS');
    }

    if (!data.headers.hasContentSecurityPolicy) {
      recommendations.push('Implement Content Security Policy to prevent XSS attacks');
    }

    if (!data.headers.hasXFrameOptions) {
      recommendations.push('Add X-Frame-Options header to prevent clickjacking');
    }

    if (!data.headers.hasXContentTypeOptions) {
      recommendations.push('Add X-Content-Type-Options header to prevent MIME-sniffing');
    }

    if (!data.headers.hasReferrerPolicy) {
      recommendations.push('Add Referrer-Policy header to control referrer information');
    }

    if (!data.headers.hasPermissionsPolicy) {
      recommendations.push('Add Permissions-Policy header to control browser features');
    }

    if (data.forms.total > 0 && data.forms.secureSubmission < data.forms.total) {
      recommendations.push('Ensure all forms use HTTPS and POST method for sensitive data');
    }

    if (data.vulnerabilities.inlineScripts > 0) {
      recommendations.push('Move inline scripts to external files for better CSP compliance');
    }

    if (data.vulnerabilities.outdatedLibraries.length > 0) {
      recommendations.push(`Update outdated libraries: ${data.vulnerabilities.outdatedLibraries.join(', ')}`);
    }

    if (!data.privacyPolicy.found) {
      recommendations.push('Add a privacy policy page to comply with privacy regulations');
    }

    return recommendations;
  }

  private identifyThreats(data: Pick<SecurityScanResult, 'https' | 'mixedContent' | 'headers' | 'vulnerabilities'>): string[] {
    const threats: string[] = [];

    if (!data.https.enabled) {
      threats.push('Man-in-the-middle attacks due to unencrypted connection');
    }

    if (data.mixedContent.found) {
      threats.push('Mixed content vulnerabilities exposing secure pages');
    }

    if (!data.headers.hasContentSecurityPolicy) {
      threats.push('Cross-site scripting (XSS) attacks');
    }

    if (!data.headers.hasXFrameOptions) {
      threats.push('Clickjacking attacks');
    }

    if (data.vulnerabilities.outdatedLibraries.length > 0) {
      threats.push('Known vulnerabilities in outdated libraries');
    }

    if (data.vulnerabilities.inlineScripts > 10) {
      threats.push('Increased XSS attack surface from inline scripts');
    }

    return threats;
  }
}

export const securityScanService = new SecurityScanService();
