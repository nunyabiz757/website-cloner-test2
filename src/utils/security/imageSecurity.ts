/**
 * Image Security Utilities
 * Validates and secures image uploads to prevent exploits
 */

import { validateFileSize, validateFileType } from './validator';
import { sanitizeSVG } from './sanitizer';

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
  metadata?: ImageMetadata;
}

export interface ImageMetadata {
  filename: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
  hasExif?: boolean;
}

/**
 * Allowed image formats
 */
export const ALLOWED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];

/**
 * Maximum image size (10MB)
 */
export const MAX_IMAGE_SIZE_MB = 10;

/**
 * Validate image file
 */
export function validateImage(file: File): ImageValidationResult {
  const warnings: string[] = [];

  // Validate file size
  const sizeValidation = validateFileSize(file.size, MAX_IMAGE_SIZE_MB);
  if (!sizeValidation.isValid) {
    return { isValid: false, error: sizeValidation.error };
  }

  // Validate file type
  const typeValidation = validateFileType(file.name, ALLOWED_IMAGE_FORMATS);
  if (!typeValidation.isValid) {
    return { isValid: false, error: typeValidation.error };
  }

  // Check MIME type
  const mimeType = file.type;
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/x-icon',
  ];

  if (mimeType && !allowedMimeTypes.includes(mimeType)) {
    return {
      isValid: false,
      error: `MIME type ${mimeType} not allowed`,
    };
  }

  // Warn about SVG files (potential XSS risk)
  if (file.name.toLowerCase().endsWith('.svg') || mimeType === 'image/svg+xml') {
    warnings.push('SVG files will be sanitized to remove scripts');
  }

  // Check for suspiciously large files
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > 5) {
    warnings.push(`Large file size: ${sizeMB.toFixed(2)}MB`);
  }

  const metadata: ImageMetadata = {
    filename: file.name,
    size: file.size,
    type: file.type || 'unknown',
  };

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
    metadata,
  };
}

/**
 * Read image dimensions
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Validate image dimensions
 */
export async function validateImageDimensions(
  file: File,
  maxWidth: number = 4096,
  maxHeight: number = 4096
): Promise<ImageValidationResult> {
  try {
    const { width, height } = await getImageDimensions(file);

    if (width > maxWidth || height > maxHeight) {
      return {
        isValid: false,
        error: `Image dimensions too large (max ${maxWidth}x${maxHeight}, got ${width}x${height})`,
      };
    }

    return {
      isValid: true,
      metadata: {
        filename: file.name,
        size: file.size,
        type: file.type,
        width,
        height,
      },
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to read image dimensions',
    };
  }
}

/**
 * Sanitize SVG file content
 */
export async function sanitizeSVGFile(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) {
        reject(new Error('Failed to read file'));
        return;
      }

      // Sanitize SVG content
      const sanitized = sanitizeSVG(content);

      // Create new blob
      const blob = new Blob([sanitized], { type: 'image/svg+xml' });
      resolve(blob);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Check for EXIF data in image
 */
export async function hasEXIFData(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer);

      // Check for JPEG EXIF marker (FF E1 followed by Exif)
      if (arr.length > 10 && arr[0] === 0xff && arr[1] === 0xd8) {
        for (let i = 2; i < arr.length - 6; i++) {
          if (arr[i] === 0xff && arr[i + 1] === 0xe1) {
            // Check for "Exif" marker
            const marker = String.fromCharCode(arr[i + 4], arr[i + 5], arr[i + 6], arr[i + 7]);
            if (marker === 'Exif') {
              resolve(true);
              return;
            }
          }
        }
      }

      resolve(false);
    };

    reader.onerror = () => {
      resolve(false);
    };

    reader.readAsArrayBuffer(file.slice(0, 64 * 1024)); // Read first 64KB
  });
}

/**
 * Strip EXIF data from image (creates a new canvas copy)
 */
export async function stripEXIFData(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw image (this removes EXIF data)
      ctx.drawImage(img, 0, 0);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        file.type,
        0.95 // Quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Verify image file signature (magic bytes)
 */
export async function verifyImageSignature(file: File): Promise<{
  valid: boolean;
  detectedType?: string;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer);

      // Check magic bytes for different image formats
      const signatures: { [key: string]: number[] } = {
        jpeg: [0xff, 0xd8, 0xff],
        png: [0x89, 0x50, 0x4e, 0x47],
        gif: [0x47, 0x49, 0x46],
        webp: [0x52, 0x49, 0x46, 0x46], // RIFF
        bmp: [0x42, 0x4d],
        ico: [0x00, 0x00, 0x01, 0x00],
      };

      for (const [type, signature] of Object.entries(signatures)) {
        let match = true;
        for (let i = 0; i < signature.length; i++) {
          if (arr[i] !== signature[i]) {
            match = false;
            break;
          }
        }

        if (match) {
          resolve({ valid: true, detectedType: type });
          return;
        }
      }

      // Check for SVG (text-based)
      const text = new TextDecoder().decode(arr.slice(0, 100));
      if (text.includes('<svg') || text.includes('<?xml')) {
        resolve({ valid: true, detectedType: 'svg' });
        return;
      }

      resolve({ valid: false });
    };

    reader.onerror = () => {
      resolve({ valid: false });
    };

    reader.readAsArrayBuffer(file.slice(0, 100)); // Read first 100 bytes
  });
}

/**
 * Comprehensive image security scan
 */
export async function scanImage(file: File): Promise<ImageValidationResult> {
  const warnings: string[] = [];

  // Basic validation
  const basicValidation = validateImage(file);
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  if (basicValidation.warnings) {
    warnings.push(...basicValidation.warnings);
  }

  // Verify file signature
  const signatureCheck = await verifyImageSignature(file);
  if (!signatureCheck.valid) {
    return {
      isValid: false,
      error: 'Invalid image file signature (possible file extension mismatch)',
    };
  }

  // Check dimensions (skip for SVG)
  if (signatureCheck.detectedType !== 'svg') {
    const dimensionsValidation = await validateImageDimensions(file);
    if (!dimensionsValidation.isValid) {
      return dimensionsValidation;
    }

    if (dimensionsValidation.metadata) {
      basicValidation.metadata = {
        ...basicValidation.metadata!,
        ...dimensionsValidation.metadata,
      };
    }
  }

  // Check for EXIF data
  if (signatureCheck.detectedType === 'jpeg') {
    const hasExif = await hasEXIFData(file);
    if (hasExif) {
      warnings.push('Image contains EXIF metadata (may include location data)');
      basicValidation.metadata!.hasExif = true;
    }
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
    metadata: basicValidation.metadata,
  };
}

/**
 * Process image with security measures
 */
export async function processImageSecurely(file: File): Promise<{
  success: boolean;
  blob?: Blob;
  error?: string;
  warnings?: string[];
}> {
  // Scan image
  const scanResult = await scanImage(file);

  if (!scanResult.isValid) {
    return {
      success: false,
      error: scanResult.error,
    };
  }

  // Detect image type
  const signatureCheck = await verifyImageSignature(file);

  try {
    // Handle SVG separately
    if (signatureCheck.detectedType === 'svg') {
      const sanitizedBlob = await sanitizeSVGFile(file);
      return {
        success: true,
        blob: sanitizedBlob,
        warnings: scanResult.warnings,
      };
    }

    // For other images, strip EXIF if present
    if (scanResult.metadata?.hasExif) {
      const strippedBlob = await stripEXIFData(file);
      return {
        success: true,
        blob: strippedBlob,
        warnings: [...(scanResult.warnings || []), 'EXIF data has been removed'],
      };
    }

    // Return original file if no processing needed
    return {
      success: true,
      blob: file,
      warnings: scanResult.warnings,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process image',
    };
  }
}
