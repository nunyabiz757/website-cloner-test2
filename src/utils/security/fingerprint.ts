/**
 * Session Fingerprinting Utilities
 * Creates unique device/browser fingerprints to detect session hijacking
 */

import CryptoJS from 'crypto-js';

export interface DeviceFingerprint {
  hash: string;
  components: FingerprintComponents;
  timestamp: number;
}

export interface FingerprintComponents {
  userAgent: string;
  language: string;
  colorDepth: number;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  screenResolution: string;
  timezone: string;
  platform: string;
  plugins: string[];
  canvas?: string;
  webgl?: string;
}

/**
 * Generate device fingerprint
 */
export async function generateFingerprint(): Promise<DeviceFingerprint> {
  const components = await collectFingerprintComponents();
  const hash = hashComponents(components);

  return {
    hash,
    components,
    timestamp: Date.now(),
  };
}

/**
 * Collect browser/device information for fingerprinting
 */
async function collectFingerprintComponents(): Promise<FingerprintComponents> {
  const navigator = window.navigator;
  const screen = window.screen;

  // Basic components
  const components: FingerprintComponents = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    colorDepth: screen.colorDepth,
    screenResolution: `${screen.width}x${screen.height}x${screen.pixelDepth}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
    plugins: getPluginsList(),
  };

  // Modern browser features
  if ('deviceMemory' in navigator) {
    components.deviceMemory = (navigator as any).deviceMemory;
  }

  if ('hardwareConcurrency' in navigator) {
    components.hardwareConcurrency = navigator.hardwareConcurrency;
  }

  // Canvas fingerprint
  components.canvas = getCanvasFingerprint();

  // WebGL fingerprint
  components.webgl = getWebGLFingerprint();

  return components;
}

/**
 * Get list of installed plugins
 */
function getPluginsList(): string[] {
  const plugins: string[] = [];

  if (navigator.plugins && navigator.plugins.length > 0) {
    for (let i = 0; i < navigator.plugins.length; i++) {
      plugins.push(navigator.plugins[i].name);
    }
  }

  return plugins.sort();
}

/**
 * Generate canvas fingerprint
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    canvas.width = 200;
    canvas.height = 50;

    // Draw text with various properties
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Browser Fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Browser Fingerprint', 4, 17);

    return canvas.toDataURL();
  } catch (error) {
    return '';
  }
}

/**
 * Generate WebGL fingerprint
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) return '';

    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return '';

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    return `${vendor}~${renderer}`;
  } catch (error) {
    return '';
  }
}

/**
 * Hash fingerprint components into a unique identifier
 */
function hashComponents(components: FingerprintComponents): string {
  const componentString = JSON.stringify({
    userAgent: components.userAgent,
    language: components.language,
    colorDepth: components.colorDepth,
    deviceMemory: components.deviceMemory,
    hardwareConcurrency: components.hardwareConcurrency,
    screenResolution: components.screenResolution,
    timezone: components.timezone,
    platform: components.platform,
    plugins: components.plugins.join(','),
    canvas: components.canvas ? CryptoJS.SHA256(components.canvas).toString() : '',
    webgl: components.webgl,
  });

  return CryptoJS.SHA256(componentString).toString();
}

/**
 * Compare two fingerprints to detect changes
 */
export function compareFingerprin(fp1: string, fp2: string): {
  match: boolean;
  similarity: number;
} {
  const match = fp1 === fp2;

  // If exact match, similarity is 100%
  if (match) {
    return { match: true, similarity: 100 };
  }

  // Calculate similarity (simple approach - could be enhanced)
  let similarChars = 0;
  const minLength = Math.min(fp1.length, fp2.length);

  for (let i = 0; i < minLength; i++) {
    if (fp1[i] === fp2[i]) {
      similarChars++;
    }
  }

  const similarity = (similarChars / Math.max(fp1.length, fp2.length)) * 100;

  return { match: false, similarity };
}

/**
 * Validate fingerprint (check if it's recent and valid)
 */
export function validateFingerprint(
  fingerprint: DeviceFingerprint,
  maxAge: number = 30 * 24 * 60 * 60 * 1000 // 30 days
): boolean {
  const now = Date.now();
  const age = now - fingerprint.timestamp;

  // Check if fingerprint is too old
  if (age > maxAge) {
    return false;
  }

  // Check if hash is valid SHA-256 (64 hex characters)
  if (!/^[a-f0-9]{64}$/i.test(fingerprint.hash)) {
    return false;
  }

  return true;
}

/**
 * Store fingerprint in localStorage
 */
export function storeFingerprint(fingerprint: DeviceFingerprint): void {
  try {
    localStorage.setItem('device_fingerprint', JSON.stringify(fingerprint));
  } catch (error) {
    console.error('Error storing fingerprint:', error);
  }
}

/**
 * Retrieve fingerprint from localStorage
 */
export function retrieveFingerprint(): DeviceFingerprint | null {
  try {
    const stored = localStorage.getItem('device_fingerprint');
    if (!stored) return null;

    const fingerprint = JSON.parse(stored) as DeviceFingerprint;

    // Validate before returning
    if (!validateFingerprint(fingerprint)) {
      localStorage.removeItem('device_fingerprint');
      return null;
    }

    return fingerprint;
  } catch (error) {
    console.error('Error retrieving fingerprint:', error);
    return null;
  }
}

/**
 * Get or create fingerprint
 */
export async function getOrCreateFingerprint(): Promise<DeviceFingerprint> {
  let fingerprint = retrieveFingerprint();

  if (!fingerprint) {
    fingerprint = await generateFingerprint();
    storeFingerprint(fingerprint);
  }

  return fingerprint;
}

/**
 * Detect suspicious fingerprint changes
 */
export async function detectSuspiciousChange(): Promise<{
  suspicious: boolean;
  reason?: string;
  oldFingerprint?: DeviceFingerprint;
  newFingerprint: DeviceFingerprint;
}> {
  const oldFingerprint = retrieveFingerprint();
  const newFingerprint = await generateFingerprint();

  if (!oldFingerprint) {
    storeFingerprint(newFingerprint);
    return { suspicious: false, newFingerprint };
  }

  // Compare fingerprints
  const comparison = compareFingerprin(oldFingerprint.hash, newFingerprint.hash);

  // If exact match, no issues
  if (comparison.match) {
    return { suspicious: false, newFingerprint };
  }

  // Check which components changed
  const changes: string[] = [];

  if (oldFingerprint.components.userAgent !== newFingerprint.components.userAgent) {
    changes.push('User Agent');
  }

  if (oldFingerprint.components.platform !== newFingerprint.components.platform) {
    changes.push('Platform');
  }

  if (oldFingerprint.components.screenResolution !== newFingerprint.components.screenResolution) {
    changes.push('Screen Resolution');
  }

  // Minor changes (browser updates, screen resolution) are acceptable
  if (changes.length === 0 || (changes.length === 1 && changes[0] === 'User Agent')) {
    // Update stored fingerprint
    storeFingerprint(newFingerprint);
    return { suspicious: false, newFingerprint };
  }

  // Multiple changes = suspicious (possible session hijacking)
  return {
    suspicious: true,
    reason: `Multiple device characteristics changed: ${changes.join(', ')}`,
    oldFingerprint,
    newFingerprint,
  };
}

/**
 * Get simplified fingerprint (less sensitive to changes)
 */
export function getSimplifiedFingerprint(): string {
  const components = {
    userAgent: navigator.userAgent.substring(0, 50), // Only first 50 chars
    language: navigator.language,
    platform: navigator.platform,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  return CryptoJS.SHA256(JSON.stringify(components)).toString();
}

/**
 * Check if user is in incognito/private mode
 */
export async function detectIncognitoMode(): Promise<boolean> {
  // Different browsers have different ways to detect incognito
  // This is not 100% reliable but provides a good indication

  // Chrome detection
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const { quota } = await navigator.storage.estimate();
      // In incognito, quota is usually very limited
      if (quota && quota < 120000000) {
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  // Safari detection
  try {
    localStorage.setItem('test', '1');
    localStorage.removeItem('test');
    return false;
  } catch (error) {
    return true;
  }
}
