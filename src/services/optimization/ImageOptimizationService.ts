import sharp from 'sharp';
import axios from 'axios';
import { OptimizationOptions, ImageResult } from '../../types/optimization.types';

export class ImageOptimizationService {
  async optimizeImage(
    imageUrl: string,
    options: OptimizationOptions = {}
  ): Promise<ImageResult> {
    const defaults: OptimizationOptions = {
      quality: 85,
      format: 'original',
      progressive: true,
      stripMetadata: true,
      generateResponsive: false,
      convertToModernFormats: true,
    };

    const opts = { ...defaults, ...options };

    const { data: imageBuffer, size: originalSize } = await this.fetchImage(imageUrl);

    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    const original = {
      url: imageUrl,
      size: originalSize,
      format: metadata.format || 'unknown',
      width: metadata.width || 0,
      height: metadata.height || 0,
    };

    let optimizedImage = sharp(imageBuffer);

    if (opts.resize) {
      optimizedImage = optimizedImage.resize({
        width: opts.resize.width,
        height: opts.resize.height,
        fit: opts.resize.fit || 'cover',
        withoutEnlargement: true,
      });
    }

    if (opts.stripMetadata) {
      optimizedImage = optimizedImage.rotate();
    }

    let optimizedBuffer: Buffer;
    let outputFormat = opts.format === 'original' ? metadata.format : opts.format;

    switch (outputFormat) {
      case 'jpeg':
      case 'jpg':
        optimizedBuffer = await optimizedImage
          .jpeg({
            quality: opts.quality,
            progressive: opts.progressive,
            mozjpeg: true,
          })
          .toBuffer();
        break;

      case 'png':
        optimizedBuffer = await optimizedImage
          .png({
            quality: opts.quality,
            compressionLevel: 9,
            progressive: opts.progressive,
          })
          .toBuffer();
        break;

      case 'webp':
        optimizedBuffer = await optimizedImage
          .webp({ quality: opts.quality })
          .toBuffer();
        break;

      case 'avif':
        optimizedBuffer = await optimizedImage
          .avif({ quality: opts.quality })
          .toBuffer();
        break;

      default:
        if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
          optimizedBuffer = await optimizedImage
            .jpeg({ quality: opts.quality, progressive: true, mozjpeg: true })
            .toBuffer();
        } else if (metadata.format === 'png') {
          optimizedBuffer = await optimizedImage
            .png({ quality: opts.quality, compressionLevel: 9 })
            .toBuffer();
        } else {
          optimizedBuffer = imageBuffer;
        }
    }

    const optimizedMetadata = await sharp(optimizedBuffer).metadata();

    const result: ImageResult = {
      original,
      optimized: {
        data: optimizedBuffer,
        size: optimizedBuffer.length,
        format: outputFormat || metadata.format || 'unknown',
        width: optimizedMetadata.width || 0,
        height: optimizedMetadata.height || 0,
        base64: optimizedBuffer.toString('base64'),
      },
      savings: {
        bytes: originalSize - optimizedBuffer.length,
        percentage: ((originalSize - optimizedBuffer.length) / originalSize) * 100,
      },
    };

    if (opts.convertToModernFormats) {
      try {
        const webpBuffer = await sharp(imageBuffer)
          .webp({ quality: opts.quality })
          .toBuffer();

        result.webp = {
          data: webpBuffer,
          size: webpBuffer.length,
          base64: webpBuffer.toString('base64'),
        };
      } catch (error) {
        console.error('Failed to generate WebP:', error);
      }

      try {
        const avifBuffer = await sharp(imageBuffer)
          .avif({ quality: opts.quality })
          .toBuffer();

        result.avif = {
          data: avifBuffer,
          size: avifBuffer.length,
          base64: avifBuffer.toString('base64'),
        };
      } catch (error) {
        console.error('Failed to generate AVIF:', error);
      }
    }

    if (opts.generateResponsive && metadata.width) {
      const sizes = [320, 640, 768, 1024, 1280, 1920];
      const responsiveImages = [];

      for (const width of sizes) {
        if (width < metadata.width) {
          const resizedBuffer = await sharp(imageBuffer)
            .resize({ width, withoutEnlargement: true })
            .jpeg({ quality: opts.quality, progressive: true })
            .toBuffer();

          responsiveImages.push({
            width,
            data: resizedBuffer,
            size: resizedBuffer.length,
          });
        }
      }

      result.responsive = responsiveImages;
    }

    return result;
  }

  private async fetchImage(url: string): Promise<{
    data: Buffer;
    size: number;
  }> {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const data = Buffer.from(response.data);

    return {
      data,
      size: data.length,
    };
  }
}
