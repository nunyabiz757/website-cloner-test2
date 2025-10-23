import * as cheerio from 'cheerio';
import type { EmbeddingResult, AssetDecision } from '../../types/wordpress-export.types';

export class AssetEmbeddingService {
  private readonly DEFAULT_INLINE_THRESHOLD = 5 * 1024;
  private readonly DEFAULT_IMAGE_THRESHOLD = 50 * 1024;

  async processAssets(
    html: string,
    assets: Map<string, Buffer>,
    options: {
      inlineThreshold?: number;
      imageThreshold?: number;
      enableBase64?: boolean;
      enableInlineSVG?: boolean;
      uploadToWordPress?: boolean;
    } = {}
  ): Promise<EmbeddingResult> {
    const inlineThreshold = options.inlineThreshold || this.DEFAULT_INLINE_THRESHOLD;
    const imageThreshold = options.imageThreshold || this.DEFAULT_IMAGE_THRESHOLD;
    const enableBase64 = options.enableBase64 !== false;
    const enableInlineSVG = options.enableInlineSVG !== false;

    const $ = cheerio.load(html);
    const decisions: AssetDecision[] = [];
    const stats = {
      totalAssets: 0,
      inlinedAssets: 0,
      base64Assets: 0,
      wordPressAssets: 0,
      externalAssets: 0,
      originalSize: html.length,
      processedSize: 0,
      sizeIncrease: 0,
    };

    $('img').each((_, element) => {
      const $img = $(element);
      const src = $img.attr('src');
      if (!src) return;

      stats.totalAssets++;

      const asset = assets.get(src);
      if (asset) {
        const size = asset.length;
        const decision = this.makeAssetDecision(src, size, imageThreshold, enableBase64, 'image');
        decisions.push(decision);

        if (decision.decision === 'inline' && decision.method === 'base64') {
          const base64 = asset.toString('base64');
          const ext = src.split('.').pop()?.toLowerCase() || 'png';
          const mimeType = this.getMimeType(ext);
          $img.attr('src', `data:${mimeType};base64,${base64}`);
          stats.base64Assets++;
          stats.inlinedAssets++;
        } else if (decision.decision === 'wordpress') {
          stats.wordPressAssets++;
        } else {
          stats.externalAssets++;
        }
      }
    });

    $('link[rel="stylesheet"]').each((_, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      if (!href) return;

      stats.totalAssets++;

      const asset = assets.get(href);
      if (asset) {
        const size = asset.length;
        const decision = this.makeAssetDecision(href, size, inlineThreshold, false, 'css');
        decisions.push(decision);

        if (decision.decision === 'inline') {
          const content = asset.toString('utf-8');
          $link.replaceWith(`<style>${content}</style>`);
          stats.inlinedAssets++;
        } else if (decision.decision === 'wordpress') {
          stats.wordPressAssets++;
        } else {
          stats.externalAssets++;
        }
      }
    });

    $('script[src]').each((_, element) => {
      const $script = $(element);
      const src = $script.attr('src');
      if (!src) return;

      stats.totalAssets++;

      const asset = assets.get(src);
      if (asset) {
        const size = asset.length;
        const decision = this.makeAssetDecision(src, size, inlineThreshold, false, 'js');
        decisions.push(decision);

        if (decision.decision === 'inline') {
          const content = asset.toString('utf-8');
          $script.removeAttr('src');
          $script.html(content);
          stats.inlinedAssets++;
        } else if (decision.decision === 'wordpress') {
          stats.wordPressAssets++;
        } else {
          stats.externalAssets++;
        }
      }
    });

    const processedHtml = $.html();
    stats.processedSize = processedHtml.length;
    stats.sizeIncrease = ((stats.processedSize - stats.originalSize) / stats.originalSize) * 100;

    return {
      success: true,
      html: processedHtml,
      stats,
      decisions,
      recommendations: this.generateRecommendations(stats, decisions),
    };
  }

  private makeAssetDecision(
    path: string,
    size: number,
    threshold: number,
    enableBase64: boolean,
    type: 'image' | 'css' | 'js'
  ): AssetDecision {
    const sizeFormatted = this.formatBytes(size);

    if (size <= threshold && (type !== 'image' || enableBase64)) {
      return {
        path,
        size,
        sizeFormatted,
        decision: 'inline',
        reason: `Small asset (${sizeFormatted}) - inline for performance`,
        method: type === 'image' ? 'base64' : 'raw',
      };
    }

    if (size > threshold && size <= threshold * 5) {
      return {
        path,
        size,
        sizeFormatted,
        decision: 'wordpress',
        reason: `Medium asset (${sizeFormatted}) - upload to WordPress media library`,
      };
    }

    return {
      path,
      size,
      sizeFormatted,
      decision: 'external',
      reason: `Large asset (${sizeFormatted}) - keep as external reference`,
    };
  }

  private getMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      webp: 'image/webp',
    };
    return mimeTypes[ext] || 'image/png';
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  private generateRecommendations(stats: any, decisions: AssetDecision[]): string[] {
    const recommendations: string[] = [];

    if (stats.sizeIncrease > 50) {
      recommendations.push(`⚠️ HTML size increased by ${stats.sizeIncrease.toFixed(1)}% due to inline assets`);
      recommendations.push('Consider increasing inline threshold or using WordPress media library');
    } else if (stats.sizeIncrease > 20) {
      recommendations.push(`HTML size increased by ${stats.sizeIncrease.toFixed(1)}% - acceptable for performance`);
    } else {
      recommendations.push(`✅ HTML size increase minimal (${stats.sizeIncrease.toFixed(1)}%)`);
    }

    if (stats.inlinedAssets > 0) {
      recommendations.push(`✅ ${stats.inlinedAssets} assets inlined for reduced HTTP requests`);
    }

    if (stats.wordPressAssets > 0) {
      recommendations.push(`📁 ${stats.wordPressAssets} assets ready for WordPress media library`);
    }

    const largeAssets = decisions.filter(d => d.size > 100 * 1024);
    if (largeAssets.length > 0) {
      recommendations.push(`⚠️ ${largeAssets.length} large assets detected - consider compression`);
    }

    return recommendations;
  }

  generateReport(result: EmbeddingResult): string {
    const lines: string[] = [];

    lines.push('╔══════════════════════════════════════════════════════════════╗');
    lines.push('║         ASSET EMBEDDING REPORT                               ║');
    lines.push('╚══════════════════════════════════════════════════════════════╝');
    lines.push('');
    lines.push('Summary:');
    lines.push(`  Total Assets:      ${result.stats.totalAssets}`);
    lines.push(`  Inlined:           ${result.stats.inlinedAssets}`);
    lines.push(`  Base64:            ${result.stats.base64Assets}`);
    lines.push(`  WordPress Upload:  ${result.stats.wordPressAssets}`);
    lines.push(`  External:          ${result.stats.externalAssets}`);
    lines.push('');
    lines.push('Size Impact:');
    lines.push(`  Original:  ${this.formatBytes(result.stats.originalSize)}`);
    lines.push(`  Processed: ${this.formatBytes(result.stats.processedSize)}`);
    lines.push(`  Increase:  ${result.stats.sizeIncrease.toFixed(2)}%`);
    lines.push('');
    lines.push('Recommendations:');
    result.recommendations.forEach(rec => {
      lines.push(`  ${rec}`);
    });
    lines.push('');

    if (result.decisions.length > 0) {
      lines.push('Asset Decisions:');
      result.decisions.slice(0, 10).forEach(decision => {
        lines.push(`  ${decision.path}: ${decision.decision} (${decision.reason})`);
      });
      if (result.decisions.length > 10) {
        lines.push(`  ... and ${result.decisions.length - 10} more`);
      }
    }

    return lines.join('\n');
  }
}
