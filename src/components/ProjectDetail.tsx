import React, { useState } from 'react';
import {
  ArrowLeft,
  Download,
  Eye,
  BarChart3,
  Code,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  PackageOpen,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { CircularProgress } from './ui/Progress';
import { ExportModal } from './export/ExportModal';
import { cloneService } from '../services/CloneService';
import type { CloneProject } from '../types';

interface ProjectDetailProps {
  project: CloneProject;
  onBack: () => void;
  onUpdate?: () => void;
}

export function ProjectDetail({ project, onBack, onUpdate }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'performance' | 'code'>('performance');
  const [showExportModal, setShowExportModal] = useState(false);
  const [isDownloadingAssets, setIsDownloadingAssets] = useState(false);

  const handleDownloadAssets = async () => {
    setIsDownloadingAssets(true);
    try {
      await cloneService.downloadAssets(project.id);
      if (onUpdate) onUpdate();
    } catch (error) {
      alert(`Failed to download assets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloadingAssets(false);
    }
  };

  const hasAssets = project.assets && project.assets.length > 0;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getScoreDiff = () => {
    if (project.originalScore && project.optimizedScore) {
      return project.optimizedScore - project.originalScore;
    }
    return 0;
  };

  const getSizeSavings = () => {
    if (project.metrics) {
      const originalSize = project.metrics.totalSize;
      const estimatedOptimizedSize = originalSize * 0.6;
      return Math.round(((originalSize - estimatedOptimizedSize) / originalSize) * 100);
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{project.source}</h1>
                <p className="text-sm text-gray-600">
                  Analyzed {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!hasAssets && (
                <Button
                  onClick={handleDownloadAssets}
                  disabled={isDownloadingAssets}
                  variant="outline"
                >
                  {isDownloadingAssets ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <PackageOpen size={16} className="mr-2" />
                      Download Assets
                    </>
                  )}
                </Button>
              )}
              <Button onClick={() => setShowExportModal(true)} disabled={!hasAssets}>
                <Download size={16} className="mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Original Score</p>
                <p className="text-3xl font-bold text-gray-900">{project.originalScore || 0}</p>
              </div>
              <CircularProgress value={project.originalScore || 0} size={80} strokeWidth={6} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Optimized Score</p>
                <p className="text-3xl font-bold text-green-600">{project.optimizedScore || 0}</p>
                {getScoreDiff() > 0 && (
                  <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                    <TrendingUp size={14} />
                    <span>+{getScoreDiff()} points</span>
                  </div>
                )}
              </div>
              <CircularProgress value={project.optimizedScore || 0} size={80} strokeWidth={6} />
            </div>
          </Card>

          <Card>
            <div>
              <p className="text-sm text-gray-600 mb-1">Size Reduction</p>
              <p className="text-3xl font-bold text-blue-600">{getSizeSavings()}%</p>
              <p className="text-sm text-gray-500 mt-1">
                {formatSize(project.metrics?.totalSize || 0)} total
              </p>
            </div>
          </Card>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex gap-2 p-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('performance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'performance'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 size={18} />
              Performance
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'preview' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Eye size={18} />
              Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'code' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Code size={18} />
              Code
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">HTML Size</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatSize(project.metrics?.htmlSize || 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">CSS Size</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatSize(project.metrics?.cssSize || 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">JS Size</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatSize(project.metrics?.jsSize || 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Images</p>
                      <p className="text-xl font-bold text-gray-900">{project.metrics?.imageCount || 0}</p>
                    </div>
                  </div>
                </div>

                {project.metrics && project.metrics.issues.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Issues Found ({project.metrics.issues.length})
                    </h3>
                    <div className="space-y-3">
                      {project.metrics.issues.map((issue, index) => (
                        <div
                          key={index}
                          className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                        >
                          <div className="flex-shrink-0 pt-0.5">
                            <AlertCircle
                              size={20}
                              className={
                                issue.severity === 'critical'
                                  ? 'text-red-500'
                                  : issue.severity === 'high'
                                  ? 'text-orange-500'
                                  : issue.severity === 'medium'
                                  ? 'text-yellow-500'
                                  : 'text-blue-500'
                              }
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                              <Badge
                                variant={
                                  issue.severity === 'critical'
                                    ? 'error'
                                    : issue.severity === 'high'
                                    ? 'warning'
                                    : 'info'
                                }
                                size="sm"
                              >
                                {issue.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                            {issue.fix && (
                              <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded">
                                <span className="font-medium">Fix:</span> {issue.fix}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {project.metrics && project.metrics.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                    <div className="space-y-2">
                      {project.metrics.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                          <CheckCircle2 size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-blue-900">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Original</h4>
                    <div className="aspect-video bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">Preview not available in demo</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Optimized</h4>
                    <div className="aspect-video bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">Preview not available in demo</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Optimized HTML</h4>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{project.optimizedHtml?.substring(0, 1000) || 'No HTML available'}...</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showExportModal && (
        <ExportModal project={project} onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
}
