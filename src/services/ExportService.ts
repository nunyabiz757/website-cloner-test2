import JSZip from 'jszip';
import type { CloneProject, ClonedAsset } from '../types';
import { loggingService } from './LoggingService';

export class ExportService {
  async exportAsZip(project: CloneProject): Promise<Blob> {
    loggingService.info('export', `Starting ZIP export for project ${project.id}`);

    const zip = new JSZip();

    zip.file('index.html', project.originalHtml || '');

    if (project.assets && project.assets.length > 0) {
      await this.addAssetsToZip(zip, project.assets);
    }

    const metadata = {
      projectId: project.id,
      source: project.source,
      createdAt: project.createdAt,
      framework: project.metadata?.framework,
      responsive: project.metadata?.responsive,
      score: project.originalScore,
    };

    zip.file('metadata.json', JSON.stringify(metadata, null, 2));

    loggingService.info('export', `Generating ZIP file for project ${project.id}`);

    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    loggingService.success('export', `ZIP export completed for project ${project.id}`, {
      size: blob.size,
      assetCount: project.assets?.length || 0,
    });

    return blob;
  }

  private async addAssetsToZip(zip: JSZip, assets: ClonedAsset[]): Promise<void> {
    for (const asset of assets) {
      try {
        if (asset.content) {
          const path = asset.localPath.replace('./', '');

          if (asset.type === 'css' || asset.type === 'js') {
            zip.file(path, asset.content);
          } else if (asset.type === 'image' || asset.type === 'font') {
            if (asset.content.startsWith('data:')) {
              const base64Data = asset.content.split(',')[1];
              zip.file(path, base64Data, { base64: true });
            } else {
              zip.file(path, asset.content);
            }
          } else {
            zip.file(path, asset.content);
          }
        }
      } catch (error) {
        loggingService.warning('export', `Failed to add asset to ZIP: ${asset.localPath}`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    loggingService.info('export', `Download triggered: ${filename}`);
  }

  async exportProject(project: CloneProject): Promise<void> {
    try {
      const blob = await this.exportAsZip(project);
      const filename = `${this.sanitizeFilename(project.metadata?.title || 'website')}-clone.zip`;
      this.downloadBlob(blob, filename);
    } catch (error) {
      loggingService.error('export', 'Failed to export project', {
        projectId: project.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

export const exportService = new ExportService();
