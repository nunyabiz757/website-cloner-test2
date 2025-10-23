import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { CloneForm, CloneOptions } from '../components/clone/CloneForm';
import { CloneProgress } from '../components/clone/CloneProgress';
import { ClonePreview } from '../components/clone/ClonePreview';
import { CloneService } from '../services/CloneService';
import { useProjectStore } from '../stores/projectStore';
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
  const { addProject } = useProjectStore();

  const [phase, setPhase] = useState<Phase>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      if (message.includes('startAnalysis') || message.includes('CloneService') || message.includes('fetchHtml')) {
        addLog(`[Service] ${message}`);
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

    try {
      // Extract CSS and JS from HTML
      const cssMatch = cloneResult.clonedHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
      const css = cssMatch ? cssMatch.map(s => s.replace(/<\/?style[^>]*>/gi, '')).join('\n\n') : '';

      const jsMatch = cloneResult.clonedHtml.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
      const js = jsMatch ? jsMatch.map(s => s.replace(/<\/?script[^>]*>/gi, '')).join('\n\n') : '';

      // Get project name from URL
      const projectName = new URL(cloneResult.originalUrl).hostname.replace('www.', '');

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

      // Download theme ZIP
      const themeUrl = URL.createObjectURL(themeBlob);
      const themeLink = document.createElement('a');
      themeLink.href = themeUrl;
      themeLink.download = `${projectName}-theme.zip`;
      document.body.appendChild(themeLink);
      themeLink.click();
      document.body.removeChild(themeLink);
      URL.revokeObjectURL(themeUrl);

      // Generate WXR export
      const wxrExporter = new WXRExporter();
      const wxr = wxrExporter.generateWXR({
        name: projectName,
        url: cloneResult.originalUrl,
        html: cloneResult.clonedHtml,
        detection: cloneResult.metadata as any,
      });

      // Download WXR file
      const wxrBlob = new Blob([wxr], { type: 'application/xml' });
      const wxrUrl = URL.createObjectURL(wxrBlob);
      const wxrLink = document.createElement('a');
      wxrLink.href = wxrUrl;
      wxrLink.download = `${projectName}-export.xml`;
      document.body.appendChild(wxrLink);
      wxrLink.click();
      document.body.removeChild(wxrLink);
      URL.revokeObjectURL(wxrUrl);

      alert(`WordPress export complete!\n\n2 files downloaded:\n1. ${projectName}-theme.zip (WordPress theme)\n2. ${projectName}-export.xml (WXR import file)\n\nInstall the theme and import the XML file in WordPress.`);
    } catch (error) {
      console.error('WordPress export error:', error);
      alert('Failed to export to WordPress. Please try again.');
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

        {/* Phase 1: Form */}
        {phase === 'form' && (
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
