import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BarChart3, Check, Gauge, FileSearch, AlertTriangle, Lightbulb, ArrowRight, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function PerformanceAnalyzerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Performance Analyzer - Website Speed & Core Web Vitals Testing | Website Cloner Pro';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Analyze your website performance with Core Web Vitals tracking, Lighthouse scores, and actionable recommendations. Improve page speed, SEO, and user experience.');
    }
  }, []);

  const features = [
    {
      icon: Gauge,
      title: 'Lighthouse Scoring',
      description: 'Get comprehensive 0-100 performance scores just like Google Lighthouse with detailed breakdowns.'
    },
    {
      icon: FileSearch,
      title: 'File Size Analysis',
      description: 'Analyze HTML, CSS, JavaScript, and image sizes to identify optimization opportunities.'
    },
    {
      icon: AlertTriangle,
      title: 'Issue Detection',
      description: 'Automatically detect critical, high, medium, and low severity performance issues.'
    },
    {
      icon: Lightbulb,
      title: 'Smart Recommendations',
      description: 'Get actionable recommendations tailored to your website\'s specific performance bottlenecks.'
    }
  ];

  const metrics = [
    'Largest Contentful Paint (LCP)',
    'First Input Delay (FID)',
    'Cumulative Layout Shift (CLS)',
    'First Contentful Paint (FCP)',
    'Time to First Byte (TTFB)',
    'Total Blocking Time (TBT)',
    'Speed Index',
    'Time to Interactive (TTI)'
  ];

  const analysisAreas = [
    {
      title: 'File Sizes',
      items: ['HTML size tracking', 'CSS size analysis', 'JavaScript size breakdown', 'Image size totals', 'Total page weight']
    },
    {
      title: 'Resource Counts',
      items: ['Image count', 'External resources', 'Render-blocking scripts', 'Stylesheet count', 'Font loading']
    },
    {
      title: 'Issues & Problems',
      items: ['Missing viewport tags', 'Unoptimized images', 'Blocking resources', 'Large CSS/JS files', 'Accessibility issues']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/products')}
            className="text-green-100 hover:text-white mb-8 flex items-center gap-2 transition-colors"
          >
            ← Back to Products
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star className="text-yellow-400 fill-yellow-400" size={20} />
                <Star className="text-yellow-400 fill-yellow-400" size={20} />
                <Star className="text-yellow-400 fill-yellow-400" size={20} />
                <Star className="text-yellow-400 fill-yellow-400" size={20} />
                <Star className="text-yellow-400 fill-yellow-400" size={20} />
                <span className="ml-2 text-green-100">Trusted performance analysis tool</span>
              </div>

              <h1 className="text-5xl font-bold mb-6 leading-tight">Boost Website Performance by 50%</h1>
              <p className="text-xl text-green-100 mb-8 leading-relaxed">
                Get deep insights into Core Web Vitals, Lighthouse scores, and performance metrics. Identify bottlenecks and get actionable recommendations to improve page speed and SEO rankings.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate(user ? '/dashboard' : '/auth')}
                  className="bg-white text-green-600 hover:bg-green-50 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                  size="lg"
                >
                  {user ? 'Start Analyzing' : 'Try It Free'} <ArrowRight className="ml-2" size={20} />
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-green-700 text-white hover:bg-green-600 px-8 py-4 text-lg font-semibold border-2 border-green-400"
                  size="lg"
                >
                  View Demo
                </Button>
              </div>

              <div className="mt-8 flex items-center gap-8 text-sm text-green-100">
                <div className="flex items-center gap-2">
                  <Check size={20} className="text-green-300" />
                  <span>Real-time analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={20} className="text-green-300" />
                  <span>14-day free trial</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="bg-white rounded-lg p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="text-green-600" size={32} />
                    <div>
                      <h3 className="text-2xl font-bold text-green-600">93</h3>
                      <p className="text-sm text-gray-600">Performance Score</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-600">LCP</span>
                        <span className="text-xs font-semibold text-green-600">Good</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full w-4/5 bg-green-500"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-600">FID</span>
                        <span className="text-xs font-semibold text-green-600">Good</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-green-500"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-600">CLS</span>
                        <span className="text-xs font-semibold text-yellow-600">Needs Improvement</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full w-3/5 bg-yellow-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Scoring Algorithm</h2>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Base Score:</span>
                    <span className="font-semibold text-gray-900">100 points</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-gray-700 font-semibold mb-2">Deductions:</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• HTML &gt; 200KB: -10 points</li>
                      <li>• CSS &gt; 500KB: -15 points</li>
                      <li>• JS &gt; 1MB: -20 points</li>
                      <li>• Render-blocking &gt; 6: -15 points</li>
                      <li>• Images without lazy load: -10 points</li>
                      <li>• Missing viewport: -10 points</li>
                      <li>• Each detected issue: -1 to -10 points</li>
                    </ul>
                  </div>
                </div>
              </div>
              <p className="text-gray-600">
                Our algorithm provides accurate performance scores that help you understand exactly where your website stands and what needs improvement.
              </p>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="text-green-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Analyze</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analysisAreas.map((area, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-gray-900 mb-3">{area.title}</h3>
                    <ul className="space-y-2">
                      {area.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-sm text-gray-600 flex items-start gap-2">
                          <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <h3 className="font-bold text-gray-900 mb-4">Core Web Vitals Tracked</h3>
              <ul className="space-y-3">
                {metrics.map((metric, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{metric}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-bold text-gray-900 mb-3">Typical Improvements</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-gray-900">Performance Score:</span>
                  <span className="text-green-600 ml-2">+10-30 points</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Page Size:</span>
                  <span className="text-green-600 ml-2">-30-60% reduction</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Loading Speed:</span>
                  <span className="text-green-600 ml-2">20-50% faster</span>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-green-600 to-green-700 text-white">
              <h3 className="text-2xl font-bold mb-4">Start Optimizing Today</h3>
              <p className="text-green-100 mb-6">
                Get instant performance insights and start improving your website speed and search rankings.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-green-300" />
                  <span>Unlimited performance scans</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-green-300" />
                  <span>Detailed recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-green-300" />
                  <span>Export reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-green-300" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button
                onClick={() => navigate(user ? '/dashboard' : '/auth')}
                className="w-full bg-white text-green-600 hover:bg-green-50 font-semibold shadow-lg"
                size="lg"
              >
                {user ? 'Open Dashboard' : 'Get Started Free'} <ArrowRight className="ml-2" size={20} />
              </Button>
            </Card>
          </div>
        </div>

        <div className="mt-20 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Improve Your Website Performance?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start your free trial today and get instant insights into your website's performance metrics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(user ? '/dashboard' : '/auth')}
              className="bg-green-600 text-white hover:bg-green-700 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              size="lg"
            >
              {user ? 'Start Analyzing' : 'Start Free Trial'} <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button
              onClick={() => navigate('/products')}
              className="bg-gray-700 text-white hover:bg-gray-600 px-8 py-4 text-lg font-semibold"
              size="lg"
            >
              View All Products
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
