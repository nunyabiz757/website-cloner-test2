import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function GHLPastePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [htmlInput, setHtmlInput] = useState('');
  const [converted, setConverted] = useState(false);
  const [ghlCode, setGhlCode] = useState('');
  const [copied, setCopied] = useState(false);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleConvert = () => {
    const optimizedHtml = optimizeForGHL(htmlInput);
    setGhlCode(optimizedHtml);
    setConverted(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(ghlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder="Paste your HTML code here..."
              className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
