import { useState, useEffect } from 'react';
import { ArrowLeft, Workflow, CheckCircle, AlertTriangle, Download, ExternalLink } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { loggingService } from '../services/LoggingService';
import { wordPressDetectionService } from '../services/wordpress/WordPressDetectionService';
import { wordPressParserService } from '../services/wordpress/WordPressParserService';
import { ghlConversionService } from '../services/ghl/GHLConversionService';
import { ghlAPIService } from '../services/ghl/GHLAPIService';
import type { WordPressDetection, WordPressPage } from '../types/wordpress.types';
import type { GHLConversionResult } from '../types/ghl.types';

export function GHLConverterPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  // Read URL from query parameters
  const queryParams = new URLSearchParams(window.location.search);
  const urlParam = queryParams.get('url');

  const [url, setUrl] = useState(urlParam || '');
  const [html, setHtml] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'detecting' | 'parsing' | 'converting' | 'preview' | 'importing'>('input');

  // WordPress detection results
  const [wpDetection, setWpDetection] = useState<WordPressDetection | null>(null);
  const [wpPage, setWpPage] = useState<WordPressPage | null>(null);

  // GHL conversion results
  const [ghlResult, setGhlResult] = useState<GHLConversionResult | null>(null);

  // GHL API settings
  const [apiKey, setApiKey] = useState('');
  const [locationId, setLocationId] = useState('');
  const [showAPISettings, setShowAPISettings] = useState(false);

  const handleConvert = async () => {
    if (!url.trim() && !html.trim()) {
      alert('Please enter a URL or paste HTML');
      return;
    }

    try {
      setIsProcessing(true);

      // Step 1: Fetch HTML if URL provided
      setStep('detecting');
      let pageHTML = html;

      if (url.trim()) {
        loggingService.info('ghl-converter', `Fetching HTML from ${url}`);
        const response = await fetch(`/api/fetch?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch URL');
        }
        pageHTML = await response.text();
      }

      // Step 2: Detect WordPress
      loggingService.info('ghl-converter', 'Detecting WordPress');
      const detection = await wordPressDetectionService.detectWordPress(pageHTML, url || 'pasted-html');
      setWpDetection(detection);

      if (!detection.isWordPress) {
        alert('This does not appear to be a WordPress website. Conversion may not work correctly.');
      }

      // Step 3: Parse WordPress structure
      setStep('parsing');
      loggingService.info('ghl-converter', `Parsing WordPress page (${detection.pageBuilder})`);
      const parsedPage = await wordPressParserService.parsePage(pageHTML, url || 'pasted-html', detection);
      setWpPage(parsedPage);

      // Step 4: Convert to GHL
      setStep('converting');
      loggingService.info('ghl-converter', 'Converting to GoHighLevel format');
      const conversionResult = await ghlConversionService.convertToGHL(parsedPage);
      setGhlResult(conversionResult);

      // Step 5: Show preview
      setStep('preview');
      loggingService.success('ghl-converter', `Conversion completed with ${conversionResult.conversionScore}% accuracy`);

    } catch (error) {
      loggingService.error('ghl-converter', 'Conversion failed', error);
      alert(`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStep('input');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportToGHL = async () => {
    if (!ghlResult) return;

    if (!apiKey || !locationId) {
      setShowAPISettings(true);
      alert('Please enter your GoHighLevel API credentials');
      return;
    }

    try {
      setStep('importing');

      // Set GHL API credentials
      ghlAPIService.setCredentials({ apiKey, locationId });

      // Import to GHL
      loggingService.info('ghl-converter', 'Importing to GoHighLevel');
      const result = await ghlAPIService.importWordPressConversion(ghlResult);

      loggingService.success('ghl-converter', `Imported to GHL: ${result.url}`);
      alert(`Successfully imported to GoHighLevel!\n\nFunnel ID: ${result.funnelId}\nPage ID: ${result.pageId}\nURL: ${result.url}`);

      setStep('preview');
    } catch (error) {
      loggingService.error('ghl-converter', 'Import failed', error);
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStep('preview');
    }
  };

  const handleDownloadHTML = () => {
    if (!ghlResult) return;

    const blob = new Blob([ghlResult.ghlHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ghl-converted-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStepStatus = (stepName: string): 'pending' | 'active' | 'completed' => {
    const steps = ['input', 'detecting', 'parsing', 'converting', 'preview'];
    const currentIndex = steps.indexOf(step);
    const stepIndex = steps.indexOf(stepName);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} className="mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">WordPress to GoHighLevel Converter</h1>
              <p className="text-gray-600">Clone WordPress sites and convert them to GHL-compatible format</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <Card className="mb-8 p-6">
          <div className="flex items-center justify-between">
            {[
              { id: 'input', label: 'Input URL/HTML' },
              { id: 'detecting', label: 'Detect WordPress' },
              { id: 'parsing', label: 'Parse Structure' },
              { id: 'converting', label: 'Convert to GHL' },
              { id: 'preview', label: 'Preview & Import' },
            ].map((stepItem, index) => {
              const status = getStepStatus(stepItem.id);
              return (
                <div key={stepItem.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                        status === 'completed'
                          ? 'bg-green-500 text-white'
                          : status === 'active'
                          ? 'bg-blue-500 text-white animate-pulse'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {status === 'completed' ? <CheckCircle size={20} /> : index + 1}
                    </div>
                    <span className="text-xs mt-2 text-gray-600">{stepItem.label}</span>
                  </div>
                  {index < 4 && (
                    <div
                      className={`w-24 h-1 mx-2 ${
                        status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Input Section */}
        {step === 'input' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Enter WordPress Website</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WordPress URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="text-center text-gray-500 my-4">OR</div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste HTML
              </label>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="Paste your WordPress HTML here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
              />
            </div>

            <Button onClick={handleConvert} disabled={isProcessing} size="lg" className="w-full">
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Converting...
                </>
              ) : (
                <>
                  <Workflow className="mr-2" size={18} />
                  Convert to GoHighLevel
                </>
              )}
            </Button>
          </Card>
        )}

        {/* Detection Results */}
        {wpDetection && step !== 'input' && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">WordPress Detection Results</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">WordPress Version</p>
                <p className="font-semibold">{wpDetection.version}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Page Builder</p>
                <p className="font-semibold capitalize">{wpDetection.pageBuilder}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Theme</p>
                <p className="font-semibold">{wpDetection.theme}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Confidence</p>
                <p className="font-semibold">{wpDetection.confidence}%</p>
              </div>
            </div>
            {wpDetection.plugins.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Detected Plugins:</p>
                <div className="flex flex-wrap gap-2">
                  {wpDetection.plugins.map((plugin) => (
                    <span key={plugin} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {plugin}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Conversion Results */}
        {ghlResult && step === 'preview' && (
          <>
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Conversion Results</h2>

              {/* Conversion Score */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Conversion Score</span>
                  <span className="text-2xl font-bold text-green-600">{ghlResult.conversionScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      ghlResult.conversionScore >= 80
                        ? 'bg-green-500'
                        : ghlResult.conversionScore >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${ghlResult.conversionScore}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Elements Converted</p>
                  <p className="font-semibold text-2xl">{ghlResult.stats.elementsConverted}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Elements Skipped</p>
                  <p className="font-semibold text-2xl">{ghlResult.stats.elementsSkipped}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Styles Inlined</p>
                  <p className="font-semibold text-2xl">{ghlResult.stats.stylesInlined}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Assets Found</p>
                  <p className="font-semibold text-2xl">{ghlResult.assets.length}</p>
                </div>
              </div>

              {/* Warnings */}
              {ghlResult.warnings.length > 0 && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="text-yellow-600 mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-yellow-900 mb-2">Warnings</p>
                      <ul className="list-disc list-inside space-y-1">
                        {ghlResult.warnings.map((warning, index) => (
                          <li key={index} className="text-sm text-yellow-800">{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Errors */}
              {ghlResult.errors.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="text-red-600 mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-red-900 mb-2">Errors</p>
                      <ul className="list-disc list-inside space-y-1">
                        {ghlResult.errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-800">{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button onClick={handleDownloadHTML} variant="outline" className="flex-1">
                  <Download className="mr-2" size={18} />
                  Download HTML
                </Button>
                <Button onClick={() => setShowAPISettings(!showAPISettings)} className="flex-1">
                  <ExternalLink className="mr-2" size={18} />
                  Import to GoHighLevel
                </Button>
              </div>
            </Card>

            {/* API Settings */}
            {showAPISettings && (
              <Card className="p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">GoHighLevel API Settings</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your GHL API key"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location ID
                  </label>
                  <input
                    type="text"
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    placeholder="Enter your GHL Location ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <Button onClick={handleImportToGHL} disabled={!apiKey || !locationId} className="w-full">
                  Import Now
                </Button>

                <p className="text-xs text-gray-500 mt-3">
                  Note: Using mock mode for testing. Set real credentials to import to your GHL account.
                </p>
              </Card>
            )}

            {/* HTML Preview */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">GHL HTML Preview</h2>
              <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {ghlResult.ghlHTML.substring(0, 1000)}...
                </pre>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
