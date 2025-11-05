import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { CloneForm, CloneOptions } from '../components/clone/CloneForm';
import { CloneProgress } from '../components/clone/CloneProgress';
import { ClonePreview } from '../components/clone/ClonePreview';
import { CloneService } from '../services/CloneService';
import { useProjectStore } from '../stores/projectStore';
import type { CloneProject } from '../types';
import JSZip from 'jszip';
import { ThemeGenerator } from '../services/wordpress/ThemeGenerator';
import { WXRExporter } from '../services/wordpress/WXRExporter';

type Phase = 'form' | 'progress' | 'preview';

interface CloneResult {
  originalUrl: string;
  clonedHtml: string;
  metadata?: {
    title?: string;
    description?: string;
    favicon?: string;
  };
}

export function Clone() {
  const navigate = useNavigate();
  const { addProject, currentProject, projects, loadProjects } = useProjectStore();

  const [selectedProject, setSelectedProject] = useState<CloneProject | null>(currentProject);
  const [showProjectSelector, setShowProjectSelector] = useState(!currentProject);
  const [phase, setPhase] = useState<Phase>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load projects on mount and set current project if available
  useEffect(() => {
    loadProjects();
    if (currentProject) {
      setSelectedProject(currentProject);
      setShowProjectSelector(false);
    }
  }, [loadProjects, currentProject]);

  // Progress state
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | undefined>();

  // Result state
  const [cloneResult, setCloneResult] = useState<CloneResult | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleFormSubmit = async (url: string, options: CloneOptions) => {
    setError('');
    setLoading(true);
    setPhase('progress');
    setProgress(0);
    setLogs([]);
    setCurrentStep('Initializing...');
    addLog('Starting clone process...');
    addLog(`Target URL: ${url}`);

    const startTime = Date.now();

    // Intercept console.log to capture service logs
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.log = (...args) => {
      originalConsoleLog(...args);
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
      if (message.includes('startAnalysis') || message.includes('CloneService') || message.includes('fetchHtml') || message.includes('[WordPress]')) {
        addLog(message.includes('[Service]') ? message : message);
      }
    };

    console.error = (...args) => {
      originalConsoleError(...args);
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
      addLog(`[ERROR] ${message}`);
    };

    console.warn = (...args) => {
      originalConsoleWarn(...args);
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
      addLog(`[WARNING] ${message}`);
    };

    try {
      const cloneService = new CloneService();

      const result = await cloneService.cloneWebsite({
        source: url,
        type: 'url',
        includeAssets: true, // Enable asset downloading
        useBrowserAutomation: options.useBrowserAutomation, // Enable Playwright for dynamic content
        onProgress: (p, step) => {
          setProgress(p);
          setCurrentStep(step);
          addLog(step);

          // Calculate estimated time remaining
          if (p > 0 && p < 100) {
            const elapsed = (Date.now() - startTime) / 1000;
            const estimated = (elapsed / p) * (100 - p);
            setEstimatedTimeRemaining(Math.round(estimated));
          }
        },
      });

      setProgress(90);
      setCurrentStep('Saving project...');
      addLog('Saving project...');

      // Log HTML size for debugging
      const htmlSize = result.originalHtml ? new Blob([result.originalHtml]).size : 0;
      addLog(`HTML size: ${htmlSize} bytes (${(htmlSize / 1024).toFixed(2)} KB)`);

      if (htmlSize === 0) {
        addLog('WARNING: HTML size is 0 bytes - clone may have failed');
        console.warn('Clone result has empty HTML:', result);
      }

      // Save to store
      addProject({
        name: result.metadata?.title || new URL(url).hostname,
        url: url,
        html: result.originalHtml || '',
        css: '',
        metadata: result.metadata,
      });

      setProgress(100);
      setCurrentStep('Clone completed!');
      addLog('Clone completed successfully!');
      setEstimatedTimeRemaining(undefined);

      // Store result and move to preview
      setCloneResult({
        originalUrl: url,
        clonedHtml: result.originalHtml || '',
        metadata: result.metadata,
      });

      // Wait 1 second before showing preview
      setTimeout(() => {
        setPhase('preview');
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to clone website');
      addLog(`Error: ${err.message}`);
      setLoading(false);
      // Stay on progress phase to show error in logs
    } finally {
      // Restore original console methods
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    }
  };

  const handleDownload = async () => {
    if (!cloneResult) return;

    try {
      // Create ZIP with HTML, CSS, JS
      const zip = new JSZip();
      zip.file('index.html', cloneResult.clonedHtml);

      // Add CSS if available (extracted from HTML)
      const cssMatch = cloneResult.clonedHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
      if (cssMatch) {
        const css = cssMatch.map(s => s.replace(/<\/?style[^>]*>/gi, '')).join('\n\n');
        zip.file('styles.css', css);
      }

      // Add JS if available (extracted from HTML)
      const jsMatch = cloneResult.clonedHtml.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
      if (jsMatch) {
        const js = jsMatch.map(s => s.replace(/<\/?script[^>]*>/gi, '')).join('\n\n');
        if (js.trim()) {
          zip.file('script.js', js);
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `website-clone-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download. Please try again.');
    }
  };

  const handleExportToWordPress = async () => {
    if (!cloneResult) return;

    let themeDownloaded = false;
    let wxrDownloaded = false;
    let projectName = '';

    try {
      // Extract CSS and JS from HTML
      const cssMatch = cloneResult.clonedHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
      const css = cssMatch ? cssMatch.map(s => s.replace(/<\/?style[^>]*>/gi, '')).join('\n\n') : '';

      const jsMatch = cloneResult.clonedHtml.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
      const js = jsMatch ? jsMatch.map(s => s.replace(/<\/?script[^>]*>/gi, '')).join('\n\n') : '';

      // Get project name from URL
      projectName = new URL(cloneResult.originalUrl).hostname.replace('www.', '');

      console.log('Generating WordPress theme...');
      // Generate WordPress theme
      const themeGenerator = new ThemeGenerator();
      const themeBlob = await themeGenerator.generateTheme({
        name: projectName,
        url: cloneResult.originalUrl,
        html: cloneResult.clonedHtml,
        css: css || undefined,
        js: js || undefined,
        detection: cloneResult.metadata as any,
      });

      console.log('Downloading theme ZIP...');
      // Download theme ZIP
      const themeUrl = URL.createObjectURL(themeBlob);
      const themeLink = document.createElement('a');
      themeLink.href = themeUrl;
      themeLink.download = `${projectName}-theme.zip`;
      document.body.appendChild(themeLink);
      themeLink.click();
      document.body.removeChild(themeLink);
      URL.revokeObjectURL(themeUrl);
      themeDownloaded = true;

      console.log('Generating WXR export...');
      // Generate WXR export
      const wxrExporter = new WXRExporter();
      const wxr = wxrExporter.generateWXR({
        name: projectName,
        url: cloneResult.originalUrl,
        html: cloneResult.clonedHtml,
        detection: cloneResult.metadata as any,
      });

      console.log('Downloading WXR file...');
      // Download WXR file with small delay to prevent browser blocking
      await new Promise(resolve => setTimeout(resolve, 100));

      const wxrBlob = new Blob([wxr], { type: 'application/xml' });
      const wxrUrl = URL.createObjectURL(wxrBlob);
      const wxrLink = document.createElement('a');
      wxrLink.href = wxrUrl;
      wxrLink.download = `${projectName}-export.xml`;
      document.body.appendChild(wxrLink);
      wxrLink.click();
      document.body.removeChild(wxrLink);
      URL.revokeObjectURL(wxrUrl);
      wxrDownloaded = true;

      console.log('WordPress export completed successfully');

      // Use setTimeout to show alert after downloads complete
      setTimeout(() => {
        alert(`WordPress export complete!\n\n2 files downloaded:\n1. ${projectName}-theme.zip (WordPress theme)\n2. ${projectName}-export.xml (WXR import file)\n\nInstall the theme and import the XML file in WordPress.`);
      }, 300);

    } catch (error) {
      console.error('WordPress export error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Build more informative error message based on what succeeded
      let statusMessage = '';
      if (themeDownloaded && wxrDownloaded) {
        statusMessage = 'Both files were downloaded successfully, but an error occurred afterwards.';
      } else if (themeDownloaded) {
        statusMessage = 'Theme ZIP was downloaded, but WXR export failed.';
      } else {
        statusMessage = 'Export failed before downloads could complete.';
      }

      alert(`Failed to export to WordPress.\n\nStatus: ${statusMessage}\nError: ${errorMessage}\n\nPlease check the browser console for more details.`);
    }
  };

  const calculateStats = () => {
    if (!cloneResult) return { htmlSize: 0, imagesCount: 0, linksCount: 0 };

    const html = cloneResult.clonedHtml;
    const htmlSize = new Blob([html]).size;
    const imagesCount = (html.match(/<img/gi) || []).length;
    const linksCount = (html.match(/<a/gi) || []).length;

    return { htmlSize, imagesCount, linksCount };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Clone Website</h1>
          <p className="text-gray-600">
            {phase === 'form' && 'Enter the URL and configure your clone options'}
            {phase === 'progress' && 'Cloning in progress...'}
            {phase === 'preview' && 'Preview and export your cloned website'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert type="error" className="mb-6" onClose={() => setError('')}>
            <strong>Error:</strong> {error}
          </Alert>
        )}

        {/* Project Selector (when accessed from navigation) */}
        {showProjectSelector && phase === 'form' && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Select a Project to Clone</h2>
            <p className="text-gray-600 mb-6">
              Choose an analyzed project below, or enter a new URL to clone
            </p>

            {projects.filter(p => p.status === 'completed').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {projects.filter(p => p.status === 'completed').map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => {
                      setSelectedProject(proj);
                      setShowProjectSelector(false);
                    }}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2 truncate">{proj.source}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Analyzed: {new Date(proj.createdAt).toLocaleDateString()}
                    </p>
                    <Button size="sm" className="w-full">Clone This Project</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg mb-6">
                <p className="text-gray-600">No analyzed projects yet</p>
              </div>
            )}

            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setShowProjectSelector(false)}
              >
                Or Enter New URL Below
              </Button>
            </div>
          </div>
        )}

        {/* Selected Project Info */}
        {selectedProject && !showProjectSelector && phase === 'form' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Selected Project:</p>
                <p className="text-gray-900 font-semibold">{selectedProject.source}</p>
                <p className="text-sm text-gray-600">
                  Score: {selectedProject.originalScore || 'N/A'} • Analyzed: {new Date(selectedProject.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedProject(null);
                  setShowProjectSelector(true);
                }}
              >
                Change
              </Button>
            </div>
          </div>
        )}

        {/* Phase 1: Form */}
        {phase === 'form' && !showProjectSelector && (
          <CloneForm onSubmit={handleFormSubmit} isLoading={loading} />
        )}

        {/* Phase 2: Progress */}
        {phase === 'progress' && (
          <CloneProgress
            progress={progress}
            currentStep={currentStep}
            logs={logs}
            estimatedTimeRemaining={estimatedTimeRemaining}
          />
        )}

        {/* Phase 3: Preview */}
        {phase === 'preview' && cloneResult && (
          <div className="space-y-6">
            <ClonePreview
              originalUrl={cloneResult.originalUrl}
              clonedHtml={cloneResult.clonedHtml}
              onDownload={handleDownload}
              onExportToWordPress={handleExportToWordPress}
              stats={calculateStats()}
              logs={logs}
            />

            {/* Back to Dashboard Button */}
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
