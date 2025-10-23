import React, { useState } from 'react';
import { Globe, Upload, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import type { CloneOptions } from '../../types';

interface CloneInputProps {
  onClone: (options: CloneOptions) => void;
  isLoading?: boolean;
}

export function CloneInput({ onClone, isLoading = false }: CloneInputProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
  const [url, setUrl] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState({
    depth: 1,
    followLinks: false,
    respectRobots: true,
    includeAssets: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'url' && !url.trim()) {
      alert('Please enter a URL');
      return;
    }

    onClone({
      type: activeTab,
      source: url,
      ...options,
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Clone a Website</h2>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'url'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Globe size={20} />
            URL
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload size={20} />
            Upload
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === 'url' ? (
            <div className="mb-6">
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Files</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <Upload className="mx-auto mb-3 text-gray-400" size={48} />
                <p className="text-gray-600 mb-2">Drag and drop HTML files or ZIP archive</p>
                <p className="text-sm text-gray-500">or</p>
                <Button type="button" variant="outline" className="mt-3" disabled={isLoading}>
                  Browse Files
                </Button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <Settings size={16} />
            Advanced Options
            <span className="text-xs">{showAdvanced ? '▲' : '▼'}</span>
          </button>

          {showAdvanced && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={options.followLinks}
                  onChange={(e) => setOptions({ ...options, followLinks: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Follow internal links</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={options.respectRobots}
                  onChange={(e) => setOptions({ ...options, respectRobots: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Respect robots.txt</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={options.includeAssets}
                  onChange={(e) => setOptions({ ...options, includeAssets: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Download assets (images, CSS, JS)</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crawl depth: {options.depth}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={options.depth}
                  onChange={(e) => setOptions({ ...options, depth: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Single page</span>
                  <span>Deep crawl</span>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              'Analyze Website'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
