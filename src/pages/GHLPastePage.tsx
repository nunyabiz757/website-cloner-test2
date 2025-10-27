import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, CheckCircle, AlertCircle, Zap, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cloneService } from '../services/CloneService';
import { loggingService } from '../services/LoggingService';
import type { CloneProject } from '../types';

export function GHLPastePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [htmlInput, setHtmlInput] = useState('');
  const [converted, setConverted] = useState(false);
  const [ghlCode, setGhlCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [sourceUrl, setSourceUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleConvert = () => {
    const optimizedHtml = optimizeForGHL(htmlInput);
    setGhlCode(optimizedHtml);
    setConverted(true);
    setSaved(false); // Reset saved state when converting new code
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(ghlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProject = async () => {
    if (!ghlCode || !converted) return;

    try {
      setIsSaving(true);
      loggingService.info('ghl-paste', 'Saving GHL conversion as project');

      const project: CloneProject = {
        id: crypto.randomUUID(),
        source: sourceUrl || 'Manual HTML Input',
        type: 'ghl-conversion',
        status: 'completed',
        progress: 100,
        currentStep: 'GHL Conversion Completed',
        createdAt: new Date(),
        originalHtml: htmlInput,
        optimizedHtml: ghlCode,
        metadata: {
          title: sourceUrl ? new URL(sourceUrl).hostname : 'GHL Conversion',
          framework: 'GoHighLevel',
          responsive: true,
          totalSize: new Blob([ghlCode]).size,
          assetCount: 0,
          pageCount: 1,
        },
      };

      await cloneService.saveProject(project);
      setSaved(true);
      loggingService.success('ghl-paste', 'GHL conversion saved as project', { projectId: project.id });

      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      loggingService.error('ghl-paste', 'Failed to save GHL conversion', error);
      alert(`Failed to save project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">GoHighLevel Funnel Builder</h1>
              <p className="text-gray-600 mt-1">Paste your HTML and get GHL-optimized code</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your HTML Code</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source URL (Optional)
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com (helps identify the project later)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder="Paste your HTML code here..."
              className="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="mt-4 flex gap-3">
              <Button
                onClick={handleConvert}
                disabled={!htmlInput.trim()}
                className="flex-1"
              >
                <Zap size={18} className="mr-2" />
                Convert for GHL
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setHtmlInput('');
                  setConverted(false);
                  setGhlCode('');
                  setSourceUrl('');
                  setSaved(false);
                }}
              >
                Clear
              </Button>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">GHL-Optimized Code</h2>
              {converted && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                  >
                    {copied ? (
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
                  <Button
                    size="sm"
                    onClick={handleSaveProject}
                    disabled={isSaving}
                  >
                    {saved ? (
                      <>
                        <CheckCircle size={16} className="mr-2" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        {isSaving ? 'Saving...' : 'Save as Project'}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {converted ? (
              <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-auto">
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {ghlCode}
                </pre>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">Your optimized code will appear here</p>
              </div>
            )}

            {converted && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">Ready to paste!</h3>
                    <p className="text-sm text-green-700">
                      This code is optimized for GoHighLevel's funnel builder. Simply copy and paste it into your GHL custom HTML element.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Zap size={24} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">GHL-Specific Optimization</h3>
            <p className="text-sm text-gray-600">
              Removes incompatible tags and optimizes for GHL's custom HTML editor
            </p>
          </Card>

          <Card>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle size={24} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Clean Code Output</h3>
            <p className="text-sm text-gray-600">
              Removes unnecessary attributes and ensures compatibility
            </p>
          </Card>

          <Card>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Copy size={24} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">One-Click Copy</h3>
            <p className="text-sm text-gray-600">
              Copy and paste directly into your GHL funnel builder
            </p>
          </Card>
        </div>

        <Card className="mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Tips for GHL Funnels</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
              <span>Use inline styles instead of external CSS files</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
              <span>Avoid using script tags with external sources</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
              <span>Test your funnel on mobile devices</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
              <span>Keep images hosted on reliable CDNs</span>
            </li>
          </ul>
        </Card>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Need More Features?</h3>
              <p className="text-sm text-blue-700 mb-3">
                For advanced GHL integration, including form mapping, automation triggers, and dynamic content, check out our premium features.
              </p>
              <Button variant="outline" size="sm">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function optimizeForGHL(html: string): string {
  let optimized = html;

  optimized = optimized.replace(/<head>[\s\S]*?<\/head>/gi, '');
  optimized = optimized.replace(/<html[^>]*>/gi, '');
  optimized = optimized.replace(/<\/html>/gi, '');
  optimized = optimized.replace(/<body[^>]*>/gi, '<div class="ghl-wrapper">');
  optimized = optimized.replace(/<\/body>/gi, '</div>');
  optimized = optimized.replace(/<script\s+src=[^>]*><\/script>/gi, '');
  optimized = optimized.replace(/<link\s+[^>]*stylesheet[^>]*>/gi, '');

  optimized = optimized.replace(/class="([^"]*)"/g, (match, classes) => {
    const cleanClasses = classes.split(' ').filter((c: string) => c.trim()).join(' ');
    return `class="${cleanClasses}"`;
  });

  optimized = optimized.replace(/\s{2,}/g, ' ');
  optimized = optimized.replace(/>\s+</g, '><');

  optimized = optimized.replace(/<img\s+/gi, '<img loading="lazy" ');

  optimized = `<!-- GHL-Optimized Code -->
<!-- Paste this into your GoHighLevel Custom HTML element -->

${optimized}

<style>
  .ghl-wrapper {
    max-width: 100%;
    margin: 0 auto;
  }

  .ghl-wrapper img {
    max-width: 100%;
    height: auto;
  }
</style>`;

  return optimized;
}
