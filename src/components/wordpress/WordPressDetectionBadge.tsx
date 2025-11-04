import React from 'react';
import { Badge } from '../ui/Badge';
import { CheckCircle, Code, FileCode } from 'lucide-react';

interface WordPressDetectionBadgeProps {
  wordPressData?: {
    isWordPress: boolean;
    version?: string;
    siteName?: string;
    pageBuilder?: string;
    postsCloned?: number;
    pagesCloned?: number;
    blocksCount?: number;
  };
  compact?: boolean;
}

/**
 * WordPress Detection Badge Component
 *
 * Displays WordPress detection status with version, page builder, and clone statistics
 */
export function WordPressDetectionBadge({ wordPressData, compact = false }: WordPressDetectionBadgeProps) {
  if (!wordPressData?.isWordPress) {
    return null;
  }

  if (compact) {
    // Compact view for project cards
    return (
      <div className="flex flex-wrap gap-2">
        <Badge className="flex items-center gap-1 bg-blue-100 text-blue-700">
          <CheckCircle size={12} />
          <span className="text-xs font-semibold">WordPress {wordPressData.version || ''}</span>
        </Badge>
        {wordPressData.pageBuilder && wordPressData.pageBuilder !== 'unknown' && (
          <Badge className="flex items-center gap-1 bg-purple-100 text-purple-700">
            <Code size={12} />
            <span className="text-xs font-semibold">{wordPressData.pageBuilder}</span>
          </Badge>
        )}
        {wordPressData.blocksCount !== undefined && wordPressData.blocksCount > 0 && (
          <Badge className="flex items-center gap-1 bg-green-100 text-green-700">
            <FileCode size={12} />
            <span className="text-xs font-semibold">{wordPressData.blocksCount} blocks</span>
          </Badge>
        )}
      </div>
    );
  }

  // Detailed view for project details page
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <CheckCircle className="text-white" size={18} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">WordPress Site Detected</h3>
          {wordPressData.siteName && (
            <p className="text-sm text-gray-600">{wordPressData.siteName}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {wordPressData.version && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Version</p>
            <p className="text-sm font-semibold text-gray-900">{wordPressData.version}</p>
          </div>
        )}

        {wordPressData.pageBuilder && wordPressData.pageBuilder !== 'unknown' && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Page Builder</p>
            <p className="text-sm font-semibold text-gray-900 capitalize">{wordPressData.pageBuilder}</p>
          </div>
        )}

        {wordPressData.postsCloned !== undefined && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Posts Cloned</p>
            <p className="text-sm font-semibold text-gray-900">{wordPressData.postsCloned}</p>
          </div>
        )}

        {wordPressData.pagesCloned !== undefined && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Pages Cloned</p>
            <p className="text-sm font-semibold text-gray-900">{wordPressData.pagesCloned}</p>
          </div>
        )}

        {wordPressData.blocksCount !== undefined && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Total Blocks</p>
            <p className="text-sm font-semibold text-gray-900">{wordPressData.blocksCount}</p>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-blue-200">
        <p className="text-xs text-gray-600 flex items-center gap-2">
          <CheckCircle size={14} className="text-green-600" />
          Native WordPress blocks parsed via REST API
        </p>
      </div>
    </div>
  );
}
