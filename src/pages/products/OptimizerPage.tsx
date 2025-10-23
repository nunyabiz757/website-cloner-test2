import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Zap, Check, FileCode, Image, Code, FileText, ArrowRight, Star, Rocket } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function OptimizerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Website Optimizer - 20+ Automatic Optimizations | Website Cloner Pro';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Optimize your website automatically with 20+ techniques. Minify HTML, CSS, JavaScript, lazy load images, and improve Core Web Vitals. Boost performance scores by 30 points.');
    }
  }, []);

  const optimizations = [
    {
      category: 'HTML Optimization',
      icon: FileText,
      techniques: [
        'HTML minification',
        'Comment removal',
        'Whitespace reduction',
        'Viewport meta tag addition',
        'Semantic structure preservation'
      ]
    },
    {
      category: 'CSS Optimization',
      icon: FileCode,
      techniques: [
        'CSS minification',
        'Inline CSS optimization',
        'Non-critical CSS deferring',
        'Unused CSS removal',
        'CSS compression'
      ]
    },
    {
      category: 'JavaScript Optimization',
      icon: Code,
      techniques: [
        'JS minification',
        'Script defer/async',
        'Console statement removal',
        'Dead code elimination',
        'Bundle optimization'
      ]
    },
    {
      category: 'Image Optimization',
      icon: Image,
      techniques: [
        'Lazy loading implementation',
        'Image dimensions addition',
        'Async decoding',
        'Priority hints for hero images',
        'Format optimization'
      ]
    }
  ];

  const benefits = [
    {
      title: 'Faster Loading',
      description: '20-50% improvement in page load times',
      impact: 'High'
    },
    {
      title: 'Better SEO',
      description: 'Improved Core Web Vitals boost search rankings',
      impact: 'High'
    },
    {
      title: 'Reduced Costs',
      description: 'Smaller file sizes mean lower bandwidth costs',
      impact: 'Medium'
    },
    {
      title: 'Better UX',
      description: 'Faster sites lead to better user experience',
      impact: 'High'
    }
  ];

  const additionalFeatures = [
    'Resource hints (DNS prefetch)',
    'Font preloading',
    'Iframe lazy loading',
    'Render-blocking elimination',
    'Critical path optimization',
    'Asset compression',
    'Code splitting',
    'Tree shaking'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-gradient-to-br from-yellow-600 via-orange-600 to-red-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/products')}
            className="text-yellow-100 hover:text-white mb-8 flex items-center gap-2 transition-colors"
          >
            ← Back to Products
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star className="text-yellow-300 fill-yellow-300" size={20} />
                <Star className="text-yellow-300 fill-yellow-300" size={20} />
                <Star className="text-yellow-300 fill-yellow-300" size={20} />
                <Star className="text-yellow-300 fill-yellow-300" size={20} />
                <Star className="text-yellow-300 fill-yellow-300" size={20} />
                <span className="ml-2 text-yellow-100">Professional optimization tool</span>
              </div>

              <h1 className="text-5xl font-bold mb-6 leading-tight">Increase Performance by 30 Points</h1>
              <p className="text-xl text-yellow-100 mb-8 leading-relaxed">
                Apply 20+ proven optimization techniques automatically. Minify code, lazy load images, eliminate render-blocking resources, and boost your Core Web Vitals scores instantly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate(user ? '/dashboard' : '/auth')}
                  className="bg-white text-orange-600 hover:bg-yellow-50 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                  size="lg"
                >
                  {user ? 'Optimize Now' : 'Start Free Trial'} <ArrowRight className="ml-2" size={20} />
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-orange-700 text-white hover:bg-orange-600 px-8 py-4 text-lg font-semibold border-2 border-orange-400"
                  size="lg"
                >
                  See Results
                </Button>
              </div>

              <div className="mt-8 flex items-center gap-8 text-sm text-yellow-100">
                <div className="flex items-center gap-2">
                  <Check size={20} className="text-yellow-300" />
                  <span>One-click optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={20} className="text-yellow-300" />
                  <span>Instant results</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="bg-white rounded-lg p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Before</p>
                      <div className="flex items-center gap-2">
                        <div className="text-3xl font-bold text-red-600">58</div>
                        <ArrowRight className="text-gray-400" size={24} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">After</p>
                      <div className="flex items-center gap-2">
                        <div className="text-3xl font-bold text-green-600">93</div>
                        <Rocket className="text-green-600" size={24} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-700">HTML Minified</span>
                      <Check className="text-green-600" size={20} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-700">Images Lazy Loaded</span>
                      <Check className="text-green-600" size={20} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-700">CSS Optimized</span>
                      <Check className="text-green-600" size={20} />
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
            <Card className="p-8 mb-8 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Automatic Optimization</h2>
              <p className="text-gray-700 mb-4">
                Our optimizer applies over 20 proven optimization techniques automatically, without any configuration needed.
                Just click optimize and watch your performance score jump by 10-30 points.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-600 mb-1">20+</div>
                  <div className="text-sm text-gray-600">Optimization Techniques</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-600 mb-1">30-60%</div>
                  <div className="text-sm text-gray-600">File Size Reduction</div>
                </div>
              </div>
            </Card>

            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Optimization Categories</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {optimizations.map((opt, index) => {
                  const Icon = opt.icon;
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                          <Icon className="text-yellow-600" size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-900">{opt.category}</h3>
                      </div>
                      <ul className="space-y-2">
                        {opt.techniques.map((technique, techIndex) => (
                          <li key={techIndex} className="text-sm text-gray-600 flex items-start gap-2">
                            <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{technique}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Benefits</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        benefit.impact === 'High' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {benefit.impact} Impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <h3 className="font-bold text-gray-900 mb-4">Additional Features</h3>
              <ul className="space-y-3">
                {additionalFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 bg-green-50 border-green-200">
              <h3 className="font-bold text-gray-900 mb-3">Expected Results</h3>
              <div className="space-y-4 text-sm">
                <div className="border-b border-green-200 pb-3">
                  <div className="font-semibold text-gray-900 mb-1">Performance Score</div>
                  <div className="text-gray-700">Increase by 10-30 points</div>
                </div>
                <div className="border-b border-green-200 pb-3">
                  <div className="font-semibold text-gray-900 mb-1">Page Size</div>
                  <div className="text-gray-700">30-60% reduction</div>
                </div>
                <div className="border-b border-green-200 pb-3">
                  <div className="font-semibold text-gray-900 mb-1">Load Time</div>
                  <div className="text-gray-700">20-50% faster</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Resources Blocked</div>
                  <div className="text-gray-700">3-10 eliminated</div>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-yellow-600 to-orange-600 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Optimize?</h3>
              <p className="text-yellow-100 mb-6">
                Join thousands who've boosted their website performance with one-click optimization.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-yellow-300" />
                  <span>20+ optimization techniques</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-yellow-300" />
                  <span>Automatic code minification</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-yellow-300" />
                  <span>Image lazy loading</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-yellow-300" />
                  <span>Export optimized files</span>
                </li>
              </ul>
              <Button
                onClick={() => navigate(user ? '/dashboard' : '/auth')}
                className="w-full bg-white text-orange-600 hover:bg-yellow-50 font-semibold shadow-lg"
                size="lg"
              >
                {user ? 'Go to Dashboard' : 'Start Optimizing'} <ArrowRight className="ml-2" size={20} />
              </Button>
            </Card>
          </div>
        </div>

        <div className="mt-20 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Boost Your Performance Score Today</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Apply professional-grade optimizations with one click. See immediate improvements in your Core Web Vitals and SEO rankings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(user ? '/dashboard' : '/auth')}
              className="bg-yellow-600 text-white hover:bg-yellow-700 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              size="lg"
            >
              {user ? 'Start Optimizing' : 'Get Started Free'} <ArrowRight className="ml-2" size={20} />
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
