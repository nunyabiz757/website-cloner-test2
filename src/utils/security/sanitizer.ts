/**
 * XSS Sanitization Utilities
 * Prevents Cross-Site Scripting attacks by sanitizing HTML and user inputs
 */

import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export function sanitizeHTML(html: string, options?: DOMPurify.Config): string {
  const defaultConfig: DOMPurify.Config = {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u', 'p', 'br', 'span', 'div',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'code', 'pre', 'blockquote',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id',
      'width', 'height', 'style',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true,
    RETURN_TRUSTED_TYPE: false,
  };

  const config = { ...defaultConfig, ...options };
  return DOMPurify.sanitize(html, config);
}

/**
 * Sanitizes HTML for rich text editors (more permissive)
 */
export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u', 's', 'strike', 'p', 'br', 'span', 'div',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'code', 'pre', 'blockquote', 'hr',
      'sub', 'sup', 'small', 'mark',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id',
      'width', 'height', 'style', 'target', 'rel',
      'colspan', 'rowspan',
    ],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitizes HTML to plain text (strips all tags)
 */
export function sanitizeToPlainText(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitizes SVG content
 */
export function sanitizeSVG(svgContent: string): string {
  const cleaned = DOMPurify.sanitize(svgContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['use', 'g', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon'],
    ADD_ATTR: ['xmlns', 'viewBox', 'fill', 'stroke', 'stroke-width', 'd', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'link', 'style'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });

  // Remove javascript: URLs
  return cleaned.replace(/javascript:/gi, '');
}

/**
 * Escapes HTML special characters
 */
export function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Unescapes HTML entities
 */
export function unescapeHTML(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || '';
}

/**
 * Sanitizes URLs to prevent XSS in href/src attributes
 */
export function sanitizeURL(url: string): string {
  // Remove javascript: and data: URIs that could contain scripts
  if (/^(javascript|data|vbscript|file):/i.test(url)) {
    return '';
  }

  // Only allow http, https, mailto, tel protocols
  const allowedProtocols = /^(https?|mailto|tel):/i;
  if (url.includes(':') && !allowedProtocols.test(url)) {
    return '';
  }

  return url;
}

/**
 * Sanitizes CSS to prevent CSS injection attacks
 */
export function sanitizeCSS(css: string): string {
  // Remove potentially dangerous CSS
  let cleaned = css;

  // Remove @import statements
  cleaned = cleaned.replace(/@import\s+/gi, '');

  // Remove javascript: and expression() in CSS
  cleaned = cleaned.replace(/javascript:/gi, '');
  cleaned = cleaned.replace(/expression\s*\(/gi, '');

  // Remove behavior property (IE-specific)
  cleaned = cleaned.replace(/behavior\s*:/gi, '');

  // Remove -moz-binding (Firefox-specific)
  cleaned = cleaned.replace(/-moz-binding\s*:/gi, '');

  return cleaned;
}

/**
 * Sanitizes user input for display
 */
export function sanitizeUserInput(input: string): string {
  // First escape HTML
  let sanitized = escapeHTML(input);

  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
}

/**
 * Sanitizes object keys to prevent prototype pollution
 */
export function sanitizeObjectKeys<T extends Record<string, any>>(obj: T): T {
  const dangerous = ['__proto__', 'constructor', 'prototype'];
  const sanitized = { ...obj };

  dangerous.forEach((key) => {
    if (key in sanitized) {
      delete sanitized[key];
    }
  });

  return sanitized;
}

/**
 * Sanitizes file content based on type
 */
export function sanitizeFileContent(content: string, fileType: string): string {
  switch (fileType.toLowerCase()) {
    case 'html':
    case 'htm':
      return sanitizeHTML(content);

    case 'svg':
      return sanitizeSVG(content);

    case 'css':
      return sanitizeCSS(content);

    case 'txt':
    case 'md':
      return sanitizeToPlainText(content);

    default:
      return content;
  }
}

/**
 * Validates and sanitizes attributes for React components
 */
export function sanitizeAttributes(attributes: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  Object.entries(attributes).forEach(([key, value]) => {
    // Skip dangerous attributes
    if (key.startsWith('on') || key === 'dangerouslySetInnerHTML') {
      return;
    }

    // Sanitize string values
    if (typeof value === 'string') {
      if (key === 'href' || key === 'src') {
        sanitized[key] = sanitizeURL(value);
      } else if (key === 'style') {
        sanitized[key] = sanitizeCSS(value);
      } else {
        sanitized[key] = escapeHTML(value);
      }
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
}

/**
 * Removes script tags and event handlers from HTML
 */
export function removeScripts(html: string): string {
  let cleaned = html;

  // Remove <script> tags and their content
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (onclick, onerror, etc.)
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: URLs
  cleaned = cleaned.replace(/javascript:/gi, '');

  return cleaned;
}

/**
 * Sanitizes JSON strings to prevent injection
 */
export function sanitizeJSON(jsonString: string): string {
  try {
    // Parse and re-stringify to remove any malicious content
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(sanitizeObjectKeys(parsed));
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
}

/**
 * Create a safe HTML string for React dangerouslySetInnerHTML
 */
export function createSafeHTML(html: string): { __html: string } {
  return {
    __html: sanitizeHTML(html),
  };
}

/**
 * Sanitize form data
 */
export function sanitizeFormData(formData: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  Object.entries(formData).forEach(([key, value]) => {
    const sanitizedKey = escapeHTML(key);

    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeUserInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[sanitizedKey] = sanitizeObjectKeys(value);
    } else {
      sanitized[sanitizedKey] = value;
    }
  });

  return sanitized;
}

/**
 * Configuration presets for different contexts
 */
export const SanitizePresets = {
  STRICT: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  },
  NORMAL: {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u', 'p', 'br', 'span', 'div',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a',
    ],
    ALLOWED_ATTR: ['href', 'title', 'class'],
    KEEP_CONTENT: true,
  },
  PERMISSIVE: {
    ALLOWED_TAGS: DOMPurify.Config.ALLOWED_TAGS,
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'style'],
    KEEP_CONTENT: true,
  },
} as const;
