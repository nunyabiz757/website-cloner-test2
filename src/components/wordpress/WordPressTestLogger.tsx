import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { wordPressAPIService } from '../../services/wordpress/WordPressAPIService';

interface TestLog {
  timestamp: string;
  level: 'info' | 'success' | 'error' | 'warning';
  step: string;
  message: string;
  data?: any;
}

interface TestResult {
  url: string;
  logs: TestLog[];
  status: 'running' | 'success' | 'error' | 'idle';
  detection?: any;
  cloneResult?: any;
  startTime?: number;
  endTime?: number;
}

const TEST_URLS = [
  { url: 'https://wordpress.org/news', name: 'WordPress.org News', type: 'Official WordPress' },
  { url: 'https://techcrunch.com', name: 'TechCrunch', type: 'Large Publication' },
  { url: 'https://www.smashingmagazine.com', name: 'Smashing Magazine', type: 'WordPress Magazine' },
  { url: 'https://css-tricks.com', name: 'CSS-Tricks', type: 'Web Dev Blog' },
  { url: 'https://example.com', name: 'Example.com', type: 'Non-WordPress' },
];

// Helper function to extract block types
const getBlockTypes = (content: any[]): string[] => {
  const types = new Set<string>();
  content.forEach(item => {
    if (item.blocks) {
      item.blocks.forEach((block: any) => {
        types.add(`${block.namespace}/${block.name}`);
      });
    }
  });
  return Array.from(types).slice(0, 10);
};

/**
 * WordPress Test Logger Component
 *
 * Comprehensive testing and logging for WordPress REST API integration
 * Shows detailed step-by-step progress for Phase 7 testing
 */
export function WordPressTestLogger() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<TestResult | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());

  const addLog = (log: Omit<TestLog, 'timestamp'>) => {
    if (currentTest) {
      const newLog: TestLog = {
        ...log,
        timestamp: new Date().toLocaleTimeString(),
      };

      setCurrentTest({
        ...currentTest,
        logs: [...currentTest.logs, newLog],
      });
    }
  };

  const testWordPressSite = async (url: string) => {
    const test: TestResult = {
      url,
      logs: [],
      status: 'running',
      startTime: Date.now(),
    };

    setCurrentTest(test);

    try {
      // Step 1: WordPress Detection
      addLog({
        level: 'info',
        step: 'Detection',
        message: `Starting WordPress detection for ${url}`,
      });

      const detection = await wordPressAPIService.detectWordPress(url);

      test.detection = detection;

      if (detection.isWordPress) {
        addLog({
          level: 'success',
          step: 'Detection',
          message: `✓ WordPress detected: ${detection.siteInfo?.name || 'Unknown'}`,
          data: {
            version: detection.version,
            apiUrl: detection.apiUrl,
            confidence: detection.confidence,
            pageBuilder: detection.pageBuilder?.name,
          },
        });

        // Step 2: Test REST API Endpoints
        addLog({
          level: 'info',
          step: 'API Test',
          message: 'Testing WordPress REST API endpoints...',
        });

        if (detection.apiUrl) {
          // Step 3: Fetch Posts
          addLog({
            level: 'info',
            step: 'Fetch Posts',
            message: 'Fetching posts from REST API...',
          });

          const posts = await wordPressAPIService.fetchPosts(detection.apiUrl, 10);

          addLog({
            level: 'success',
            step: 'Fetch Posts',
            message: `✓ Fetched ${posts.length} posts`,
            data: {
              count: posts.length,
              samples: posts.slice(0, 3).map(p => ({
                id: p.id,
                title: p.title.rendered,
                hasBlocks: !!p.content.raw,
              })),
            },
          });

          // Step 4: Fetch Pages
          addLog({
            level: 'info',
            step: 'Fetch Pages',
            message: 'Fetching pages from REST API...',
          });

          const pages = await wordPressAPIService.fetchPages(detection.apiUrl, 10);

          addLog({
            level: 'success',
            step: 'Fetch Pages',
            message: `✓ Fetched ${pages.length} pages`,
            data: {
              count: pages.length,
            },
          });

          // Step 5: Test Block Parsing
          addLog({
            level: 'info',
            step: 'Parse Blocks',
            message: 'Testing WordPress block parsing...',
          });

          let totalBlocks = 0;
          const allContent = [...posts, ...pages];

          for (const content of allContent) {
            const rawContent = content.content.raw || content.content.rendered;
            if (rawContent) {
              const blocks = wordPressAPIService.parseWordPressBlocks(rawContent);
              content.blocks = blocks;
              totalBlocks += blocks.length;
            }
          }

          addLog({
            level: 'success',
            step: 'Parse Blocks',
            message: `✓ Parsed ${totalBlocks} blocks from ${allContent.length} items`,
            data: {
              totalBlocks,
              totalItems: allContent.length,
              averageBlocksPerItem: (totalBlocks / allContent.length).toFixed(2),
              blockTypes: getBlockTypes(allContent),
            },
          });

          // Step 6: Clone Summary
          addLog({
            level: 'success',
            step: 'Clone Complete',
            message: `✓ WordPress clone test successful`,
            data: {
              posts: posts.length,
              pages: pages.length,
              blocks: totalBlocks,
              pageBuilder: detection.pageBuilder?.name || 'none',
            },
          });

          test.cloneResult = {
            success: true,
            postsCloned: posts.length,
            pagesCloned: pages.length,
            blocksCount: totalBlocks,
          };
        }

        test.status = 'success';
      } else {
        addLog({
          level: 'warning',
          step: 'Detection',
          message: 'Not a WordPress site or REST API is disabled',
          data: detection.errors,
        });
        test.status = 'error';
      }
    } catch (error: any) {
      addLog({
        level: 'error',
        step: 'Error',
        message: `❌ Test failed: ${error.message}`,
        data: error,
      });
      test.status = 'error';
    }

    test.endTime = Date.now();
    setTestResults([...testResults, { ...currentTest!, ...test }]);
    setCurrentTest(null);
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedResults(newExpanded);
  };

  const getLogIcon = (level: TestLog['level']) => {
    switch (level) {
      case 'success':
        return <CheckCircle size={14} className="text-green-600" />;
      case 'error':
        return <XCircle size={14} className="text-red-600" />;
      case 'warning':
        return <AlertCircle size={14} className="text-yellow-600" />;
      default:
        return <Loader size={14} className="text-blue-600" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          WordPress REST API Test Logger
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Phase 7: Testing & Validation - Comprehensive logging for WordPress detection and cloning
        </p>

        {/* Test URL Suggestions */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Test URLs:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {TEST_URLS.map((test) => (
              <button
                key={test.url}
                onClick={() => testWordPressSite(test.url)}
                disabled={currentTest !== null}
                className="text-left p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="font-medium text-sm text-gray-900">{test.name}</div>
                <div className="text-xs text-gray-500">{test.type}</div>
                <div className="text-xs text-blue-600 mt-1 truncate">{test.url}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom URL Test */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Test Custom URL:</h3>
          <div className="flex gap-2">
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://your-wordpress-site.com"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={currentTest !== null}
            />
            <Button
              onClick={() => testWordPressSite(customUrl)}
              disabled={!customUrl.trim() || currentTest !== null}
            >
              {currentTest ? 'Testing...' : 'Test URL'}
            </Button>
          </div>
        </div>

        {/* Current Test Progress */}
        {currentTest && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Loader className="animate-spin text-blue-600" size={20} />
              <h3 className="font-semibold text-blue-900">Testing: {currentTest.url}</h3>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {currentTest.logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 text-sm bg-white rounded p-2">
                  <span className="text-xs text-gray-500 w-20 flex-shrink-0">{log.timestamp}</span>
                  {getLogIcon(log.level)}
                  <div className="flex-1">
                    <span className="font-medium text-gray-700">[{log.step}]</span>
                    <span className="text-gray-600 ml-2">{log.message}</span>
                    {log.data && (
                      <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Test Results ({testResults.length})
            </h3>
            <div className="space-y-3">
              {testResults.map((result, index) => {
                const isExpanded = expandedResults.has(index);
                const duration = result.endTime && result.startTime
                  ? ((result.endTime - result.startTime) / 1000).toFixed(2)
                  : 'N/A';

                return (
                  <div
                    key={index}
                    className={`border rounded-lg overflow-hidden ${
                      result.status === 'success'
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="w-full p-4 flex items-center gap-3 hover:bg-opacity-80 transition-colors"
                    >
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      {result.status === 'success' ? (
                        <CheckCircle className="text-green-600" size={20} />
                      ) : (
                        <XCircle className="text-red-600" size={20} />
                      )}
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900">{result.url}</div>
                        <div className="text-sm text-gray-600">
                          {result.logs.length} steps • {duration}s
                          {result.cloneResult && (
                            <span className="ml-2">
                              • {result.cloneResult.postsCloned} posts • {result.cloneResult.pagesCloned} pages • {result.cloneResult.blocksCount} blocks
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-white p-4">
                        <div className="space-y-2">
                          {result.logs.map((log, logIndex) => (
                            <div key={logIndex} className="flex items-start gap-2 text-sm">
                              <span className="text-xs text-gray-500 w-20 flex-shrink-0">
                                {log.timestamp}
                              </span>
                              {getLogIcon(log.level)}
                              <div className="flex-1">
                                <span className="font-medium text-gray-700">[{log.step}]</span>
                                <span className="text-gray-600 ml-2">{log.message}</span>
                                {log.data && (
                                  <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(log.data, null, 2)}
                                  </pre>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
