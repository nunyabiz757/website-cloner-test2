import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { validateURL } from '../../utils/security/validator';

export interface CloneOptions {
  optimizeImages: boolean;
  minifyCSS: boolean;
  minifyJS: boolean;
  inlineCSS: boolean;
  removeComments: boolean;
  lazyLoadImages: boolean;
  generateSitemap: boolean;
  exportToWordPress: boolean;
  useBrowserAutomation: boolean;
  captureResponsive: boolean;
  captureInteractive: boolean;
  captureAnimations: boolean;
}

interface CloneFormProps {
  onSubmit: (url: string, options: CloneOptions) => void;
  isLoading?: boolean;
}

export function CloneForm({ onSubmit, isLoading = false }: CloneFormProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const [options, setOptions] = useState<CloneOptions>({
    optimizeImages: true,
    minifyCSS: true,
    minifyJS: true,
    inlineCSS: false,
    removeComments: true,
    lazyLoadImages: true,
    generateSitemap: false,
    exportToWordPress: false,
    useBrowserAutomation: false,
    captureResponsive: true,
    captureInteractive: true,
    captureAnimations: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate URL
    const validation = validateURL(url);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid URL');
      return;
    }

    onSubmit(validation.sanitized || url, options);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError('');
  };

  const optionsConfig = [
    {
      key: 'useBrowserAutomation' as keyof CloneOptions,
      label: '🚀 Browser Automation (Recommended)',
      description: 'Use Playwright to clone React/Vue/Angular apps with JavaScript execution',
      className: 'bg-green-50 hover:bg-green-100 border-2 border-green-300',
    },
    {
      key: 'captureResponsive' as keyof CloneOptions,
      label: '📱 Responsive Detection (Phase 2)',
      description: 'Capture mobile, tablet & desktop breakpoints with media queries (+2-3 seconds)',
      className: 'bg-purple-50 hover:bg-purple-100 border-2 border-purple-300',
    },
    {
      key: 'captureInteractive' as keyof CloneOptions,
      label: '🎨 Interactive States (Phase 3)',
      description: 'Capture hover, focus, active effects and pseudo-elements (+1-2 seconds)',
      className: 'bg-orange-50 hover:bg-orange-100 border-2 border-orange-300',
    },
    {
      key: 'captureAnimations' as keyof CloneOptions,
      label: '🎬 Animation Detection (Phase 4)',
      description: 'Detect CSS animations, transitions & keyframes (+1 second)',
      className: 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-300',
    },
    {
      key: 'optimizeImages' as keyof CloneOptions,
      label: 'Optimize Images',
      description: 'Compress and resize images for faster loading',
      className: 'bg-gray-50 hover:bg-gray-100 border border-gray-200',
    },
    {
      key: 'minifyCSS' as keyof CloneOptions,
      label: 'Minify CSS',
      description: 'Remove whitespace and comments from CSS files',
      className: 'bg-gray-50 hover:bg-gray-100 border border-gray-200',
    },
    {
      key: 'minifyJS' as keyof CloneOptions,
      label: 'Minify JavaScript',
      description: 'Compress JavaScript for smaller file sizes',
      className: 'bg-gray-50 hover:bg-gray-100 border border-gray-200',
    },
    {
      key: 'inlineCSS' as keyof CloneOptions,
      label: 'Inline Critical CSS',
      description: 'Embed critical CSS in HTML for faster rendering',
      className: 'bg-gray-50 hover:bg-gray-100 border border-gray-200',
    },
    {
      key: 'removeComments' as keyof CloneOptions,
      label: 'Remove Comments',
      description: 'Strip HTML comments from the source code',
      className: 'bg-gray-50 hover:bg-gray-100 border border-gray-200',
    },
    {
      key: 'lazyLoadImages' as keyof CloneOptions,
      label: 'Lazy Load Images',
      description: 'Load images only when they enter viewport',
      className: 'bg-gray-50 hover:bg-gray-100 border border-gray-200',
    },
    {
      key: 'generateSitemap' as keyof CloneOptions,
      label: 'Generate Sitemap',
      description: 'Create XML sitemap for SEO',
      className: 'bg-gray-50 hover:bg-gray-100 border border-gray-200',
    },
    {
      key: 'exportToWordPress' as keyof CloneOptions,
      label: 'Export to WordPress',
      description: 'Convert to WordPress theme with page builder support',
      className: 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-200',
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border border-gray-200 shadow-lg p-6">
      {/* URL Input Section */}
      <div>
        <Input
          type="url"
          label="Website URL"
          value={url}
          onChange={handleUrlChange}
          placeholder="https://example.com"
          error={error}
          helperText="Enter the full URL of the website you want to clone"
          disabled={isLoading}
          required
        />
      </div>

      {/* Clone Options Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clone Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {optionsConfig.map((option) => (
            <label
              key={option.key}
              className={`${option.className} rounded-lg p-4 cursor-pointer transition-all ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={options[option.key]}
                  onChange={(e) =>
                    setOptions({ ...options, [option.key]: e.target.checked })
                  }
                  disabled={isLoading}
                  className="w-5 h-5 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!url.trim() || isLoading}
        loading={isLoading}
      >
        Start Cloning
      </Button>
    </form>
  );
}
