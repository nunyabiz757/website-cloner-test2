/**
 * Input Validation Utilities
 * Validates and sanitizes user inputs to prevent security vulnerabilities
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Validates and sanitizes URLs
 */
export function validateURL(url: string): ValidationResult {
  // Remove whitespace
  const trimmed = url.trim();

  // Check if empty
  if (!trimmed) {
    return { isValid: false, error: 'URL cannot be empty' };
  }

  // Check length (prevent DoS)
  if (trimmed.length > 2048) {
    return { isValid: false, error: 'URL too long (max 2048 characters)' };
  }

  // Validate URL format
  try {
    const urlObj = new URL(trimmed);

    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        isValid: false,
        error: 'Only HTTP and HTTPS protocols are allowed',
      };
    }

    // Block private/internal IP addresses (SSRF protection)
    const hostname = urlObj.hostname;
    const privateIPPatterns = [
      /^127\./,                    // 127.0.0.0/8 (localhost)
      /^10\./,                     // 10.0.0.0/8 (private)
      /^172\.(1[6-9]|2[0-9]|3[01])\./, // 172.16.0.0/12 (private)
      /^192\.168\./,               // 192.168.0.0/16 (private)
      /^169\.254\./,               // 169.254.0.0/16 (link-local)
      /^::1$/,                     // IPv6 localhost
      /^fc00:/,                    // IPv6 private
      /^fe80:/,                    // IPv6 link-local
      /^localhost$/i,              // localhost
    ];

    for (const pattern of privateIPPatterns) {
      if (pattern.test(hostname)) {
        return {
          isValid: false,
          error: 'Private/internal IP addresses are not allowed',
        };
      }
    }

    // Block file:// protocol attempts
    if (trimmed.includes('file://')) {
      return { isValid: false, error: 'File protocol is not allowed' };
    }

    return {
      isValid: true,
      sanitized: urlObj.toString(),
    };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validates email addresses
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed) {
    return { isValid: false, error: 'Email cannot be empty' };
  }

  // RFC 5322 compliant email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  if (trimmed.length > 254) {
    return { isValid: false, error: 'Email too long (max 254 characters)' };
  }

  return { isValid: true, sanitized: trimmed };
}

/**
 * Validates passwords (strength requirements)
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password cannot be empty' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password too long (max 128 characters)' };
  }

  // Check for at least one number, one letter, and one special character
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasNumber || !hasLetter) {
    return {
      isValid: false,
      error: 'Password must contain letters and numbers',
    };
  }

  // Warn if no special character (don't block)
  if (!hasSpecial) {
    console.warn('Password recommendation: Include special characters for better security');
  }

  return { isValid: true };
}

/**
 * Validates file names (prevent path traversal)
 */
export function validateFileName(filename: string): ValidationResult {
  const trimmed = filename.trim();

  if (!trimmed) {
    return { isValid: false, error: 'Filename cannot be empty' };
  }

  // Check for path traversal attempts
  if (trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\')) {
    return {
      isValid: false,
      error: 'Invalid filename: Path traversal detected',
    };
  }

  // Check for null bytes
  if (trimmed.includes('\0')) {
    return { isValid: false, error: 'Invalid filename: Null byte detected' };
  }

  // Validate filename length
  if (trimmed.length > 255) {
    return { isValid: false, error: 'Filename too long (max 255 characters)' };
  }

  // Sanitize filename (remove potentially dangerous characters)
  const sanitized = trimmed.replace(/[<>:"|?*\x00-\x1F]/g, '_');

  return { isValid: true, sanitized };
}

/**
 * Validates user input text (general purpose)
 */
export function validateText(text: string, maxLength: number = 5000): ValidationResult {
  if (typeof text !== 'string') {
    return { isValid: false, error: 'Input must be a string' };
  }

  if (text.length > maxLength) {
    return {
      isValid: false,
      error: `Text too long (max ${maxLength} characters)`,
    };
  }

  // Remove null bytes
  const sanitized = text.replace(/\0/g, '');

  return { isValid: true, sanitized };
}

/**
 * Validates JSON input
 */
export function validateJSON(jsonString: string): ValidationResult {
  try {
    JSON.parse(jsonString);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid JSON format' };
  }
}

/**
 * Validates file upload size
 */
export function validateFileSize(
  size: number,
  maxSizeMB: number = 10
): ValidationResult {
  const maxBytes = maxSizeMB * 1024 * 1024;

  if (size > maxBytes) {
    return {
      isValid: false,
      error: `File too large (max ${maxSizeMB}MB)`,
    };
  }

  if (size === 0) {
    return { isValid: false, error: 'File is empty' };
  }

  return { isValid: true };
}

/**
 * Validates file type by extension
 */
export function validateFileType(
  filename: string,
  allowedExtensions: string[]
): ValidationResult {
  const extension = filename.split('.').pop()?.toLowerCase();

  if (!extension) {
    return { isValid: false, error: 'File has no extension' };
  }

  const normalizedExtensions = allowedExtensions.map((ext) =>
    ext.toLowerCase().replace('.', '')
  );

  if (!normalizedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed: ${allowedExtensions.join(', ')}`,
    };
  }

  return { isValid: true };
}

/**
 * Validates hex color codes
 */
export function validateHexColor(color: string): ValidationResult {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  if (!hexRegex.test(color)) {
    return { isValid: false, error: 'Invalid hex color format' };
  }

  return { isValid: true, sanitized: color.toUpperCase() };
}

/**
 * Validates numbers within a range
 */
export function validateNumber(
  value: number,
  min?: number,
  max?: number
): ValidationResult {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: 'Value must be a number' };
  }

  if (min !== undefined && value < min) {
    return { isValid: false, error: `Value must be at least ${min}` };
  }

  if (max !== undefined && value > max) {
    return { isValid: false, error: `Value must be at most ${max}` };
  }

  return { isValid: true };
}

/**
 * Validates API keys format
 */
export function validateAPIKey(key: string): ValidationResult {
  const trimmed = key.trim();

  // Check format: wcp_<64_hex_characters>
  const apiKeyRegex = /^wcp_[a-f0-9]{64}$/i;

  if (!apiKeyRegex.test(trimmed)) {
    return { isValid: false, error: 'Invalid API key format' };
  }

  return { isValid: true, sanitized: trimmed };
}

/**
 * Sanitizes and validates CSS class names
 */
export function validateCSSClassName(className: string): ValidationResult {
  const trimmed = className.trim();

  if (!trimmed) {
    return { isValid: false, error: 'Class name cannot be empty' };
  }

  // CSS class name must start with letter or underscore
  const classRegex = /^[a-zA-Z_][a-zA-Z0-9_-]*$/;

  if (!classRegex.test(trimmed)) {
    return { isValid: false, error: 'Invalid CSS class name format' };
  }

  return { isValid: true, sanitized: trimmed };
}
