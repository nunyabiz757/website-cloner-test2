import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Copy, BarChart3, Zap, Download, ArrowRight } from 'lucide-react';

export function ProductsOverviewPage() {
  const navigate = useNavigate();

  const products = [
    {
      id: 'website-cloner',
      icon: Copy,
      title: 'Website Cloner',
      description: 'Clone any website instantly with intelligent HTML parsing, asset extraction, and structure preservation.',
      color: 'from-blue-600 to-blue-500',
      features: [
        'URL-based cloning',
        'File upload support',
        'Asset extraction (images, CSS, JS)',
        'Smart URL resolution',
        'Progress tracking'
      ]
    },
    {
      id: 'performance-analyzer',
      icon: BarChart3,
      title: 'Performance Analyzer',
      description: 'Get comprehensive performance insights with Lighthouse-style scoring, metrics tracking, and actionable recommendations.',
      color: 'from-green-600 to-green-500',
      features: [
        'Lighthouse scoring system',
        'Core Web Vitals tracking',
        'File size analysis',
        'Resource counting',
        'Issue detection'
      ]
    },
    {
      id: 'optimizer',
      icon: Zap,
      title: 'Website Optimizer',
      description: 'Apply 20+ optimization techniques automatically to boost performance, reduce file sizes, and improve loading speed.',
      color: 'from-yellow-600 to-yellow-500',
      features: [
        '20+ optimization techniques',
        'HTML/CSS/JS minification',
        'Image lazy loading',
        'Script optimization',
        'Performance boost 10-30pts'
      ]
    },
    {
      id: 'wordpress-export',
      icon: Download,
      title: 'WordPress Export',
      description: 'Export to 11 WordPress page builders including Elementor, Gutenberg, Divi, and more with one-click conversion.',
      color: 'from-purple-600 to-purple-500',
      features: [
        'Elementor full export',
        'Gutenberg blocks',
        'Divi Builder support',
        'Beaver Builder',
        '7 more builders'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Our Products
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive suite of tools to clone, analyze, optimize, and export websites with professional-grade results
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <Card key={product.id} className="p-8 hover:shadow-xl transition-shadow duration-300">
                <div className={`w-16 h-16 bg-gradient-to-r ${product.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <Icon className="text-white" size={32} />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {product.title}
                </h2>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {product.description}
                </p>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Key Features</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => navigate(`/products/${product.id}`)}
                  className={`w-full bg-gradient-to-r ${product.color} hover:opacity-90`}
                >
                  Learn More
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Card>
            );
          })}
        </div>

        <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Sign up now and get access to all our products in one powerful platform
            </p>
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Start Free Trial
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
