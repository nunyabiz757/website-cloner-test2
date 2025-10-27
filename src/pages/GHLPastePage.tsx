import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, CheckCircle, AlertCircle, Zap, Save, Workflow, Download, ExternalLink, Code, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { loggingService } from '../services/LoggingService';
import { wordPressDetectionService } from '../services/wordpress/WordPressDetectionService';
import { wordPressParserService } from '../services/wordpress/WordPressParserService';
import { ghlConversionService } from '../services/ghl/GHLConversionService';
import { ghlCloneService } from '../services/ghl/GHLCloneService';
import { ghlAPIService } from '../services/ghl/GHLAPIService';
import type { GHLCloneScope, GHLCloneDestination, GHLCloneResult, GHLConversionResult, GHLLocation, GHLCustomCode } from '../types/ghl.types';

export function GHLPastePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mode selection
  const [mode, setMode] = useState<'wp-to-ghl' | 'ghl-to-ghl'>('ghl-to-ghl');

  // Input
  const [url, setUrl] = useState('');
  const [htmlInput, setHtmlInput] = useState('');

  // Clone scope (for GHL-to-GHL)
  const [cloneScope, setCloneScope] = useState<GHLCloneScope['type']>('single-page');

  // Destination
  const [destinationType, setDestinationType] = useState<GHLCloneDestination['type']>('download-only');
  const [locations, setLocations] = useState<GHLLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [funnelId, setFunnelId] = useState('');
  const [websiteId, setWebsiteId] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'processing' | 'results'>('input');

  // Results
  const [wpConversionResult, setWpConversionResult] = useState<GHLConversionResult | null>(null);
  const [ghlCloneResult, setGhlCloneResult] = useState<GHLCloneResult | null>(null);

  // Custom codes modal
  const [showCustomCodesModal, setShowCustomCodesModal] = useState(false);
  const [customCodes, setCustomCodes] = useState<GHLCustomCode[]>([]);

  // Copy states
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!user) {
    navigate('/login');
    return null;
  }

  // Load locations on mount
  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const locs = await ghlAPIService.getLocations();
      setLocations(locs);
      if (locs.length > 0) {
        setSelectedLocationId(locs[0].id);
      }
    } catch (error) {
      loggingService.warning('ghl-paste', 'Failed to load locations (using mock data)');
    }
  };

  const handleProcess = async () => {
    if (!url.trim() && !htmlInput.trim()) {
      alert('Please enter a URL or paste HTML');
      return;
    }

    try {
      setIsProcessing(true);
      setStep('processing');

      if (mode === 'wp-to-ghl') {
        await processWordPressToGHL();
      } else {
        await processGHLToGHL();
      }

      setStep('results');
    } catch (error) {
      loggingService.error('ghl-paste', 'Processing failed', error);
      alert(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStep('input');
    } finally {
      setIsProcessing(false);
    }
  };

  const processWordPressToGHL = async () => {
    loggingService.info('ghl-paste', 'Starting WordPress to GHL conversion');

    // Fetch HTML if URL provided
    let html = htmlInput;
    if (url.trim()) {
      const corsProxy = 'https://api.allorigins.win/raw?url=';
      const response = await fetch(`${corsProxy}${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error('Failed to fetch URL');
      html = await response.text();
    }

    // Detect WordPress
    const detection = await wordPressDetectionService.detectWordPress(html, url || 'pasted-html');

    // Parse WordPress
    const wpPage = await wordPressParserService.parsePage(html, url || 'pasted-html', detection);

    // Convert to GHL
    const result = await ghlConversionService.convertToGHL(wpPage);
    setWpConversionResult(result);
    setCustomCodes([]);

    loggingService.success('ghl-paste', 'WordPress to GHL conversion completed');
  };

  const processGHLToGHL = async () => {
    loggingService.info('ghl-paste', 'Starting GHL to GHL cloning');

    const scope: GHLCloneScope = {
      type: cloneScope,
      sourceUrl: url.trim() || 'pasted-html',
    };

    const destination: GHLCloneDestination = {
      type: destinationType,
      locationId: selectedLocationId,
      funnelId: funnelId || undefined,
      websiteId: websiteId || undefined,
    };

    const result = await ghlCloneService.cloneGHL(scope, destination);
    setGhlCloneResult(result);
    setCustomCodes(result.customCodes);

    loggingService.success('ghl-paste', `GHL to GHL cloning completed: ${result.stats.pagesCloned} pages`);
  };

  const handleImportToGHL = async () => {
    if (!ghlCloneResult) return;

    try {
      setIsProcessing(true);
      const result = await ghlAPIService.importGHLClone(ghlCloneResult);

      alert(`${result.message}\n\n${result.url ? `URL: ${result.url}` : ''}`);

      if (result.url) {
        window.open(result.url, '_blank');
      }
    } catch (error) {
      loggingService.error('ghl-paste', 'Import failed', error);
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadHTML = () => {
    const html = mode === 'wp-to-ghl'
      ? wpConversionResult?.ghlHTML
      : ghlCloneResult?.clonedPages[0]?.html;

    if (!html) return;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ghl-converted-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} className="mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">GoHighLevel Cloner & Converter</h1>
              <p className="text-gray-600 mt-1">Clone GHL sites or convert WordPress to GHL</p>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        {step === 'input' && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setMode('ghl-to-ghl')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  mode === 'ghl-to-ghl'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Workflow className={`w-12 h-12 mb-3 ${mode === 'ghl-to-ghl' ? 'text-blue-600' : 'text-gray-400'}`} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">GHL to GHL</h3>
                <p className="text-sm text-gray-600">Clone existing GoHighLevel pages, funnels, or websites</p>
              </button>

              <button
                onClick={() => setMode('wp-to-ghl')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  mode === 'wp-to-ghl'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Zap className={`w-12 h-12 mb-3 ${mode === 'wp-to-ghl' ? 'text-blue-600' : 'text-gray-400'}`} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">WordPress to GHL</h3>
                <p className="text-sm text-gray-600">Convert WordPress sites to GoHighLevel format</p>
              </button>
            </div>
          </Card>
        )}

        {/* Input Section */}
        {step === 'input' && (
          <>
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Source</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mode === 'ghl-to-ghl' ? 'GHL Page URL' : 'WordPress URL'}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste HTML
                </label>
                <textarea
                  value={htmlInput}
                  onChange={(e) => setHtmlInput(e.target.value)}
                  placeholder="Paste your HTML here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                />
              </div>
            </Card>

            {/* Clone Scope (GHL-to-GHL only) */}
            {mode === 'ghl-to-ghl' && (
              <Card className="p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Clone Scope</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="cloneScope"
                      value="single-page"
                      checked={cloneScope === 'single-page'}
                      onChange={(e) => setCloneScope(e.target.value as any)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Single Page</p>
                      <p className="text-sm text-gray-600">Clone only the specified page</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="cloneScope"
                      value="entire-funnel"
                      checked={cloneScope === 'entire-funnel'}
                      onChange={(e) => setCloneScope(e.target.value as any)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Entire Funnel</p>
                      <p className="text-sm text-gray-600">Clone all pages in the funnel</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="cloneScope"
                      value="entire-website"
                      checked={cloneScope === 'entire-website'}
                      onChange={(e) => setCloneScope(e.target.value as any)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Entire Website</p>
                      <p className="text-sm text-gray-600">Clone all pages in the website</p>
                    </div>
                  </label>
                </div>
              </Card>
            )}

            {/* Destination */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Destination</h2>

              {/* Location Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GHL Location
                </label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Select which GHL location to import to
                </p>
              </div>

              {/* Destination Type */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="destinationType"
                    value="new-funnel"
                    checked={destinationType === 'new-funnel'}
                    onChange={(e) => setDestinationType(e.target.value as any)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">New Funnel</p>
                    <p className="text-sm text-gray-600">Create a new funnel in your GHL account</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="destinationType"
                    value="existing-funnel"
                    checked={destinationType === 'existing-funnel'}
                    onChange={(e) => setDestinationType(e.target.value as any)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Existing Funnel</p>
                    <p className="text-sm text-gray-600">Add pages to an existing funnel</p>
                  </div>
                </label>

                {destinationType === 'existing-funnel' && (
                  <input
                    type="text"
                    value={funnelId}
                    onChange={(e) => setFunnelId(e.target.value)}
                    placeholder="Enter Funnel ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ml-7"
                  />
                )}

                <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="destinationType"
                    value="new-website"
                    checked={destinationType === 'new-website'}
                    onChange={(e) => setDestinationType(e.target.value as any)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">New Website</p>
                    <p className="text-sm text-gray-600">Create a new website in your GHL account</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="destinationType"
                    value="existing-website"
                    checked={destinationType === 'existing-website'}
                    onChange={(e) => setDestinationType(e.target.value as any)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Existing Website</p>
                    <p className="text-sm text-gray-600">Add pages to an existing website</p>
                  </div>
                </label>

                {destinationType === 'existing-website' && (
                  <input
                    type="text"
                    value={websiteId}
                    onChange={(e) => setWebsiteId(e.target.value)}
                    placeholder="Enter Website ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ml-7"
                  />
                )}

                <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="destinationType"
                    value="download-only"
                    checked={destinationType === 'download-only'}
                    onChange={(e) => setDestinationType(e.target.value as any)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Download Only</p>
                    <p className="text-sm text-gray-600">Download HTML files without importing to GHL</p>
                  </div>
                </label>
              </div>
            </Card>

            <Button onClick={handleProcess} disabled={isProcessing} size="lg" className="w-full">
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Workflow className="mr-2" size={18} />
                  {mode === 'wp-to-ghl' ? 'Convert to GHL' : 'Clone to GHL'}
                </>
              )}
            </Button>
          </>
        )}

        {/* Processing State */}
        {step === 'processing' && (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing...</h2>
            <p className="text-gray-600">
              {mode === 'wp-to-ghl' ? 'Converting WordPress to GHL format' : 'Cloning GHL content'}
            </p>
          </Card>
        )}

        {/* Results */}
        {step === 'results' && (wpConversionResult || ghlCloneResult) && (
          <>
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="text-green-600" size={28} />
                {mode === 'wp-to-ghl' ? 'Conversion Complete!' : 'Cloning Complete!'}
              </h2>

              {/* WP Conversion Stats */}
              {wpConversionResult && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Conversion Score</p>
                    <p className="text-2xl font-bold text-green-600">{wpConversionResult.conversionScore}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Elements Converted</p>
                    <p className="text-2xl font-bold">{wpConversionResult.stats.elementsConverted}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Styles Inlined</p>
                    <p className="text-2xl font-bold">{wpConversionResult.stats.stylesInlined}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Assets Found</p>
                    <p className="text-2xl font-bold">{wpConversionResult.assets.length}</p>
                  </div>
                </div>
              )}

              {/* GHL Clone Stats */}
              {ghlCloneResult && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Pages Cloned</p>
                    <p className="text-2xl font-bold">{ghlCloneResult.stats.pagesCloned}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Assets Found</p>
                    <p className="text-2xl font-bold">{ghlCloneResult.stats.assetsCloned}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Custom Codes</p>
                    <p className="text-2xl font-bold">{ghlCloneResult.stats.customCodesFound}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Size</p>
                    <p className="text-2xl font-bold">{Math.round(ghlCloneResult.stats.totalSize / 1024)}KB</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button onClick={handleDownloadHTML} variant="outline" className="flex-1">
                  <Download className="mr-2" size={18} />
                  Download HTML
                </Button>

                {customCodes.length > 0 && (
                  <Button onClick={() => setShowCustomCodesModal(true)} variant="outline" className="flex-1">
                    <Code className="mr-2" size={18} />
                    View Custom Codes ({customCodes.length})
                  </Button>
                )}

                {destinationType !== 'download-only' && (
                  <Button onClick={handleImportToGHL} className="flex-1">
                    <ExternalLink className="mr-2" size={18} />
                    Import to GHL
                  </Button>
                )}

                <Button onClick={() => setStep('input')} variant="outline">
                  Start Over
                </Button>
              </div>
            </Card>
          </>
        )}

        {/* Custom Codes Modal */}
        {showCustomCodesModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCustomCodesModal(false)}
          >
            <div
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Custom Codes & Tracking Pixels</h3>
                <button
                  onClick={() => setShowCustomCodesModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Copy and paste these codes into your GoHighLevel page settings. GHL has specific placement options for custom codes.
                </p>

                <div className="space-y-4">
                  {customCodes.map((code, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{code.description || code.type}</p>
                          <p className="text-sm text-gray-600">Position: {code.position}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyCode(code.code, `code-${index}`)}
                        >
                          {copiedCode === `code-${index}` ? (
                            <>
                              <CheckCircle size={16} className="mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={16} className="mr-2" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                        <code>{code.code}</code>
                      </pre>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t bg-gray-50">
                <Button onClick={() => setShowCustomCodesModal(false)} className="w-full">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
