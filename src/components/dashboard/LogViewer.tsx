import { useState, useEffect } from 'react';
import { X, AlertCircle, Info, CheckCircle, AlertTriangle, Bug, Trash2, RefreshCw, Filter } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { loggingService, LogEntry, LogLevel } from '../../services/LoggingService';

interface LogViewerProps {
  onClose: () => void;
}

export function LogViewer({ onClose }: LogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [useDatabase, setUseDatabase] = useState(false);

  const loadLogs = async () => {
    if (useDatabase) {
      const dbLogs = await loggingService.getDatabaseLogs();
      setLogs(dbLogs);
    } else {
      setLogs(loggingService.getLocalLogs());
    }
  };

  useEffect(() => {
    loadLogs();
  }, [useDatabase]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadLogs();
    }, 2000);

    return () => clearInterval(interval);
  }, [autoRefresh, useDatabase]);

  const handleClearLogs = async () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      if (useDatabase) {
        await loggingService.clearDatabaseLogs();
      } else {
        loggingService.clearLocalLogs();
      }
      loadLogs();
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.level !== filter) return false;
    if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
    return true;
  });

  const categories = Array.from(new Set(logs.map(log => log.category)));

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'debug': return <Bug size={16} />;
      case 'info': return <Info size={16} />;
      case 'warning': return <AlertTriangle size={16} />;
      case 'error': return <AlertCircle size={16} />;
      case 'success': return <CheckCircle size={16} />;
    }
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'debug': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'info': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'warning': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'error': return 'bg-red-100 text-red-700 border-red-300';
      case 'success': return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-6xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Fixed */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Application Logs</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Monitor errors and track system activity
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        {/* Filters Section - Fixed */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 space-y-3 sm:space-y-4 flex-shrink-0">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Level:</span>
              {(['all', 'debug', 'info', 'warning', 'error', 'success'] as const).map(level => (
                <Button
                  key={level}
                  variant={filter === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(level)}
                >
                  {level === 'all' ? 'All' : getLevelIcon(level as LogLevel)}
                  <span className="ml-1 capitalize">{level}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUseDatabase(!useDatabase)}
              >
                <Filter size={16} className="mr-1" />
                {useDatabase ? 'Database' : 'Local'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw size={16} className={`mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={loadLogs}
              >
                <RefreshCw size={16} className="mr-1" />
                Refresh
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleClearLogs}
              >
                <Trash2 size={16} className="mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Logs Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Info size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No logs found</h3>
              <p className="text-gray-600">
                {filter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Logs will appear here as you use the application'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Badge className={`${getLevelColor(log.level)} border mt-0.5`}>
                      {getLevelIcon(log.level)}
                    </Badge>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {log.category}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-900 font-medium mb-1">
                        {log.message}
                      </p>

                      {log.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-700">
                            View Details
                          </summary>
                          <pre className="mt-2 p-3 bg-white rounded border border-gray-200 text-xs overflow-x-auto">
                            {typeof log.details === 'string'
                              ? log.details
                              : JSON.stringify(JSON.parse(log.details), null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer - Fixed */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 text-center text-xs sm:text-sm text-gray-600 flex-shrink-0">
          Showing {filteredLogs.length} of {logs.length} logs
        </div>
      </Card>
    </div>
  );
}
