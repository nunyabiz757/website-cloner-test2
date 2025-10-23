import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Upload, BarChart3, Zap, Eye, Download, MousePointer, Globe2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
  const [url, setUrl] = useState('');

  const handleClone = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!url.trim()) return;
    navigate('/dashboard', { state: { cloneUrl: url } });
  };

  const features = [
    {
      icon: BarChart3,
      title: 'Performance Analysis',
      description: 'Comprehensive Core Web Vitals analysis with Lighthouse integration. Identify every optimization opportunity.',
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: Zap,
      title: 'Auto-Optimization',
      description: '50+ automated fixes for images, CSS, JS, fonts. Achieve 30%+ performance improvement guaranteed.',
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: Eye,
      title: 'Live Preview',
      description: 'Deploy to Vercel/Netlify instantly. Test both original and optimized versions side-by-side.',
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: Download,
      title: 'WordPress Export',
      description: 'Convert to Elementor, Gutenberg, Divi, or any builder. 100% plugin-free, performance-optimized.',
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: MousePointer,
      title: 'Element Selector',
      description: 'Clone specific sections or components. Perfect for landing pages and individual elements.',
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: Globe2,
      title: 'Multi-Page Crawling',
      description: 'Clone entire websites with multiple pages. Automatic asset extraction and optimization.',
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Clone, Optimize & Convert
          </h1>
          <h2 className="text-5xl md:text-6xl font-bold text-blue-600 mb-6">
            Any Website to WordPress
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            Professional website cloning with built-in performance analysis, automated
            optimization, and seamless WordPress page builder conversion - all plugin-free.
          </p>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            onClick={() => window.open('https://bolt.new', '_blank')}
          >
            <Globe className="mr-2" size={20} />
            Try Demo in bolt.new
          </Button>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('url')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'url'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Globe size={20} />
                Clone from URL
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'upload'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Upload size={20} />
                Upload Files
              </button>
            </div>

            {activeTab === 'url' && (
              <div>
                <div className="flex gap-3">
                  <Input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    label="Enter Website URL"
                    helperText="We'll extract all HTML, CSS, JavaScript, and assets from the website"
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleClone()}
                  />
                </div>
                <div className="mt-4">
                  <Button
                    onClick={handleClone}
                    disabled={!url.trim()}
                    className="bg-blue-500 hover:bg-blue-600 w-full"
                  >
                    Clone
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Drag & drop your files here</p>
                <p className="text-sm text-gray-500 mb-4">Supports: HTML, ZIP files</p>
                <Button variant="outline">Choose Files</Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={feature.iconColor} size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
