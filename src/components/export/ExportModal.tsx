import React, { useState } from 'react';
import { X, Download, FileCode, Globe, Box, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { WordPressExportService } from '../../services/wordpress/WordPressExportService';
import { exportService } from '../../services/ExportService';
import type { CloneProject } from '../../types';
import type { PageBuilder } from '../../types/wordpress-export.types';

interface ExportModalProps {
  project: CloneProject;
  onClose: () => void;
}

const WORDPRESS_BUILDERS = [
  { id: 'elementor', name: 'Elementor', popular: true, icon: '🎨' },
  { id: 'gutenberg', name: 'Gutenberg (Block Editor)', popular: true, icon: '📦' },
  { id: 'divi', name: 'Divi Builder', popular: true, icon: '🎯' },
  { id: 'beaver', name: 'Beaver Builder', popular: false, icon: '🦫' },
  { id: 'bricks', name: 'Bricks Builder', popular: false, icon: '🧱' },
  { id: 'oxygen', name: 'Oxygen Builder', popular: false, icon: '💨' },
  { id: 'brizy', name: 'Brizy', popular: false, icon: '⚡' },
  { id: 'crocoblock', name: 'Crocoblock (JetEngine)', popular: false, icon: '🐊' },
  { id: 'kadence', name: 'Kadence Blocks', popular: false, icon: '🔷' },
  { id: 'generateblocks', name: 'GenerateBlocks', popular: false, icon: '⚙️' },
  { id: 'optimizepress', name: 'OptimizePress', popular: false, icon: '🚀' },
];

export function ExportModal({ project, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<'html' | 'wordpress-builder' | 'wordpress-theme' | 'static-site' | 'react'>('wordpress-builder');
  const [selectedBuilder, setSelectedBuilder] = useState('elementor');
  const [includeAssets, setIncludeAssets] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const [showReports, setShowReports] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress('Initializing export...');

    try {
      if (format === 'html') {
        setExportProgress('Exporting HTML package...');
        await exportService.exportProject(project);
        alert('Website exported successfully as ZIP file with all assets!');
      } else if (format === 'wordpress-builder' && project.optimizedHtml) {
        // Map UI builder IDs to PageBuilder types
        const builderMap: Record<string, PageBuilder> = {
          'elementor': 'elementor',
          'gutenberg': 'gutenberg',
          'divi': 'divi',
          'beaver': 'beaver-builder',
          'bricks': 'bricks',
          'oxygen': 'oxygen',
          'brizy': 'brizy',
          'crocoblock': 'crocoblock',
          'kadence': 'kadence',
          'generateblocks': 'gutenberg', // GenerateBlocks is Gutenberg-based
          'optimizepress': 'optimizepress',
        };

        const pageBuilder = builderMap[selectedBuilder] || 'plugin-free';
        const wpExportService = new WordPressExportService();

        setExportProgress('Parsing HTML structure...');

        // Generate WordPress export with the selected builder
        setExportProgress(`Converting to ${WORDPRESS_BUILDERS.find(b => b.id === selectedBuilder)?.name}...`);
        const result = await wpExportService.generateWordPressExport({
          html: project.optimizedHtml,
          pageBuilder,
          embedAssets: includeAssets,
          eliminateDependencies: true,
          performanceValidation: false, // Skip validation for modal exports
          verifyPluginFree: false, // Skip verification for faster exports
          themeName: `${project.url.replace(/https?:\/\//, '').replace(/\W+/g, '-')}-theme`,
          themeDescription: `Cloned from ${project.url}`,
          themeAuthor: 'Website Cloner Pro',
        });

        if (!result.success) {
          throw new Error(result.error || 'Export failed');
        }

        // Download the ZIP file
        setExportProgress('Creating ZIP archive...');
        if (result.zipBlob) {
          const url = URL.createObjectURL(result.zipBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `wordpress-${pageBuilder}-export.zip`;
          a.click();
          URL.revokeObjectURL(url);
        }

        // Build reports summary
        const builderName = WORDPRESS_BUILDERS.find(b => b.id === selectedBuilder)?.name || pageBuilder;
        const instructions = result.installationInstructions || 'Import the files from the ZIP archive into your WordPress site.';

        let reportsSummary = '';

        // Asset Embedding Report
        if (result.assetEmbeddingReport) {
          reportsSummary += `\n📦 Asset Embedding:\n`;
          reportsSummary += `  • CSS Files: ${result.assetEmbeddingReport.cssInlined} inlined, ${result.assetEmbeddingReport.cssEmbedded} embedded\n`;
          reportsSummary += `  • JS Files: ${result.assetEmbeddingReport.jsInlined} inlined, ${result.assetEmbeddingReport.jsEmbedded} embedded\n`;
          reportsSummary += `  • Images: ${result.assetEmbeddingReport.imagesBase64} base64, ${result.assetEmbeddingReport.imagesWordPress} WordPress uploads\n`;
          reportsSummary += `  • Fonts: ${result.assetEmbeddingReport.fontsEmbedded} embedded\n`;
        }

        // Dependency Elimination Report
        if (result.dependencyEliminationReport) {
          reportsSummary += `\n🧹 Dependencies Removed:\n`;
          reportsSummary += `  • Shortcodes: ${result.dependencyEliminationReport.shortcodesRemoved}\n`;
          reportsSummary += `  • Plugin Classes: ${result.dependencyEliminationReport.pluginClassesRemoved}\n`;
          reportsSummary += `  • Plugin Scripts: ${result.dependencyEliminationReport.pluginScriptsRemoved}\n`;
        }

        // Plugin-Free Verification Report
        if (result.pluginFreeReport) {
          reportsSummary += `\n✅ Plugin-Free Score: ${result.pluginFreeReport.score}/100\n`;
          if (result.pluginFreeReport.remainingDependencies.length > 0) {
            reportsSummary += `  ⚠️ Remaining dependencies: ${result.pluginFreeReport.remainingDependencies.join(', ')}\n`;
          }
        }

        // Show success message with installation instructions and optional reports
        const fullMessage = `✅ Export successful!\n\nBuilder: ${builderName}\nFiles: ${result.filesGenerated.join(', ')}\n\n📋 Installation Instructions:\n${instructions}${reportsSummary ? '\n' + reportsSummary : ''}`;

        alert(fullMessage);
      } else if (format === 'wordpress-theme' && project.optimizedHtml) {
        // Export as plugin-free WordPress theme
        setExportProgress('Generating plugin-free theme...');
        const wpExportService = new WordPressExportService();

        const result = await wpExportService.generateWordPressExport({
          html: project.optimizedHtml,
          pageBuilder: 'plugin-free',
          embedAssets: includeAssets,
          eliminateDependencies: true,
          performanceValidation: false,
          verifyPluginFree: true,
          themeName: `${project.url.replace(/https?:\/\//, '').replace(/\W+/g, '-')}-theme`,
          themeDescription: `Cloned from ${project.url}`,
          themeAuthor: 'Website Cloner Pro',
        });

        if (!result.success) {
          throw new Error(result.error || 'Theme export failed');
        }

        // Download the ZIP file
        setExportProgress('Creating theme package...');
        if (result.zipBlob) {
          const url = URL.createObjectURL(result.zipBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'wordpress-theme.zip';
          a.click();
          URL.revokeObjectURL(url);
        }

        // Build reports summary for theme
        let reportsSummary = '';

        if (result.assetEmbeddingReport) {
          reportsSummary += `\n📦 Asset Embedding:\n`;
          reportsSummary += `  • CSS Files: ${result.assetEmbeddingReport.cssInlined} inlined, ${result.assetEmbeddingReport.cssEmbedded} embedded\n`;
          reportsSummary += `  • JS Files: ${result.assetEmbeddingReport.jsInlined} inlined, ${result.assetEmbeddingReport.jsEmbedded} embedded\n`;
          reportsSummary += `  • Images: ${result.assetEmbeddingReport.imagesBase64} base64, ${result.assetEmbeddingReport.imagesWordPress} WordPress uploads\n`;
        }

        if (result.pluginFreeReport) {
          reportsSummary += `\n✅ Plugin-Free Score: ${result.pluginFreeReport.score}/100\n`;
          if (result.pluginFreeReport.isPluginFree) {
            reportsSummary += `  ✓ 100% Plugin-Free Theme!\n`;
          } else if (result.pluginFreeReport.remainingDependencies.length > 0) {
            reportsSummary += `  ⚠️ Remaining dependencies: ${result.pluginFreeReport.remainingDependencies.join(', ')}\n`;
          }
        }

        const fullMessage = `✅ WordPress theme exported successfully!\n\n📋 Installation:\n${result.installationInstructions}${reportsSummary ? '\n' + reportsSummary : ''}`;

        alert(fullMessage);
      } else {
        alert('Export format not yet implemented.');
      }

      setIsExporting(false);
      setExportProgress('');
      onClose();
    } catch (error) {
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsExporting(false);
      setExportProgress('');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Fixed */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Export Project</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4 sm:py-6">
          <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Choose export format</label>
            <div className="space-y-3">
              <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                <input
                  type="radio"
                  name="format"
                  value="html"
                  checked={format === 'html'}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileCode size={20} className="text-gray-600" />
                    <span className="font-semibold text-gray-900">HTML Package (ZIP)</span>
                  </div>
                  <p className="text-sm text-gray-600">Optimized HTML with all assets</p>
                </div>
              </label>

              <label className="flex items-center gap-4 p-4 border-2 border-blue-600 rounded-lg cursor-pointer bg-blue-50">
                <input
                  type="radio"
                  name="format"
                  value="wordpress-builder"
                  checked={format === 'wordpress-builder'}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe size={20} className="text-blue-600" />
                    <span className="font-semibold text-gray-900">WordPress Page Builder</span>
                    <Badge variant="info" size="sm">
                      Popular
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">Export to Elementor, Gutenberg, Divi, and more</p>
                </div>
              </label>

              <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                <input
                  type="radio"
                  name="format"
                  value="wordpress-theme"
                  checked={format === 'wordpress-theme'}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Box size={20} className="text-gray-600" />
                    <span className="font-semibold text-gray-900">WordPress Theme</span>
                  </div>
                  <p className="text-sm text-gray-600">Complete WordPress theme package</p>
                </div>
              </label>

              <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                <input
                  type="radio"
                  name="format"
                  value="static-site"
                  checked={format === 'static-site'}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap size={20} className="text-gray-600" />
                    <span className="font-semibold text-gray-900">Static Site (Netlify/Vercel)</span>
                  </div>
                  <p className="text-sm text-gray-600">Deploy-ready static site</p>
                </div>
              </label>
            </div>
          </div>

          {format === 'wordpress-builder' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select WordPress builder
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {WORDPRESS_BUILDERS.map((builder) => (
                  <label
                    key={builder.id}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedBuilder === builder.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="builder"
                      value={builder.id}
                      checked={selectedBuilder === builder.id}
                      onChange={(e) => setSelectedBuilder(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-2xl">{builder.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">{builder.name}</div>
                      {builder.popular && (
                        <Badge variant="success" size="sm" className="mt-1">
                          Popular
                        </Badge>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">Export Options</h4>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={includeAssets}
                onChange={(e) => setIncludeAssets(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Include optimized assets</span>
            </label>
          </div>

          {selectedBuilder && format === 'wordpress-builder' && !isExporting && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm">Export Information</h4>
              <p className="text-sm text-blue-800">
                Your website will be converted to{' '}
                <strong>{WORDPRESS_BUILDERS.find((b) => b.id === selectedBuilder)?.name}</strong> format.
                After export, you'll receive a file that can be imported directly into your WordPress site.
              </p>
            </div>
          )}

          {isExporting && exportProgress && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <span className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-1 text-sm">Exporting Your Website</h4>
                  <p className="text-sm text-blue-700">{exportProgress}</p>
                  <div className="mt-2 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" style={{ width: '70%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Modal Footer - Fixed */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-t border-gray-200 flex gap-3 flex-shrink-0">
          <Button variant="ghost" onClick={onClose} disabled={isExporting} className="flex-1 text-sm sm:text-base">
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="flex-1 text-sm sm:text-base">
            {isExporting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <Download size={16} className="mr-2" />
                Export & Download
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
