import { useState } from 'react';
import { Button } from '../ui/Button';

export interface ClonePreviewProps {
  originalUrl: string;
  clonedHtml: string;
  onDownload: () => void;
  onExportToWordPress: () => void;
  stats: {
    htmlSize: number;
    imagesCount: number;
    linksCount: number;
  };
  logs?: string[];
}

export function ClonePreview({
  originalUrl,
  clonedHtml,
  onDownload,
  onExportToWordPress,
  stats,
  logs = []
}: ClonePreviewProps) {
  const [viewMode, setViewMode] = useState<'split' | 'original' | 'cloned'>('split');
  const [showLogs, setShowLogs] = useState(false);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6 bg-white rounded-xl border border-gray-200 shadow-lg p-6">
      {/* Header with Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview & Export</h3>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">HTML Size</p>
                <p className="text-2xl font-bold text-blue-900">{formatSize(stats.htmlSize)}</p>
              </div>
              <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Images</p>
                <p className="text-2xl font-bold text-green-900">{stats.imagesCount}</p>
              </div>
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Links</p>
                <p className="text-2xl font-bold text-purple-900">{stats.linksCount}</p>
              </div>
              <svg className="w-10 h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={onDownload} variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download HTML
          </Button>
          <Button onClick={onExportToWordPress}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Export to WordPress
          </Button>
          <Button onClick={() => setShowLogs(!showLogs)} variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {showLogs ? 'Hide Logs' : 'View Logs'}
          </Button>
        </div>
      </div>

      {/* Logs Panel (Expandable) */}
      {showLogs && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 text-white text-sm font-medium flex items-center justify-between">
            <span>Clone Process Logs</span>
            <span className="text-xs text-gray-400">{logs.length} entries</span>
          </div>
          <div className="bg-gray-900 p-4 max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">No logs available</p>
            ) : (
              <div className="space-y-1 font-mono text-xs">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`${
                      log.toLowerCase().includes('error')
                        ? 'text-red-400'
                        : log.toLowerCase().includes('warning')
                        ? 'text-yellow-400'
                        : log.toLowerCase().includes('completed') || log.toLowerCase().includes('success')
                        ? 'text-green-400'
                        : 'text-gray-300'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Mode Selector */}
      <div>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('split')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'split'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'original'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Original
          </button>
          <button
            onClick={() => setViewMode('cloned')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'cloned'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Cloned
          </button>
        </div>

        {/* Preview Iframes */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {viewMode === 'split' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-gray-200">
              {/* Original Website */}
              <div className="bg-gray-50">
                <div className="bg-gray-800 px-4 py-2 text-white text-sm font-medium">
                  Original
                </div>
                <div className="h-[600px] overflow-hidden">
                  <iframe
                    src={originalUrl}
                    className="w-full h-full border-0 bg-white"
                    title="Original Website"
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              </div>

              {/* Cloned Website */}
              <div className="bg-gray-50">
                <div className="bg-blue-600 px-4 py-2 text-white text-sm font-medium">
                  Cloned
                </div>
                <div className="h-[600px] overflow-hidden">
                  <iframe
                    srcDoc={clonedHtml}
                    className="w-full h-full border-0 bg-white"
                    title="Cloned Website"
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              </div>
            </div>
          ) : viewMode === 'original' ? (
            <div>
              <div className="bg-gray-800 px-4 py-2 text-white text-sm font-medium">
                Original Website
              </div>
              <div className="h-[600px] overflow-hidden">
                <iframe
                  src={originalUrl}
                  className="w-full h-full border-0 bg-white"
                  title="Original Website"
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-blue-600 px-4 py-2 text-white text-sm font-medium">
                Cloned Website
              </div>
              <div className="h-[600px] overflow-hidden">
                <iframe
                  srcDoc={clonedHtml}
                  className="w-full h-full border-0 bg-white"
                  title="Cloned Website"
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
