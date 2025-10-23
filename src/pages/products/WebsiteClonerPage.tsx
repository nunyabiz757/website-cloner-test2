import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Copy, Check, Zap, Globe, FileCode, Image, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function WebsiteClonerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Website Cloner - Clone Any Website Instantly | Website Cloner Pro';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Clone any website with our intelligent website cloner. Extract HTML, CSS, JavaScript, and assets automatically. Perfect for web developers, designers, and migration projects.');
    }
  }, []);

  const features = [
    {
      icon: Globe,
      title: 'URL-Based Cloning',
      description: 'Simply paste any website URL and clone it instantly with all its structure and content preserved.'
    },
    {
      icon: FileCode,
      title: 'Smart HTML Parsing',
      description: 'Advanced DOMParser extracts every element, attribute, and piece of content with precision.'
    },
    {
      icon: Image,
      title: 'Asset Extraction',
      description: 'Automatically detects and extracts images, CSS, JavaScript, fonts, and other resources.'
    },
    {
      icon: Zap,
      title: 'Real-Time Progress',
      description: 'Watch the cloning process in real-time with detailed progress indicators and status updates.'
    }
  ];

  const capabilities = [
    'Clone any public website',
    'Extract all HTML structure',
    'Download images, CSS, and JS files',
    'Resolve relative and absolute URLs',
    'Preserve original styling',
    'Maintain content hierarchy',
    'Handle complex layouts',
    'Support for modern frameworks'
  ];

  const useCases = [
    {
      title: 'Web Development',
      description: 'Clone client websites for redesign and modernization projects'
    },
    {
      title: 'Design Inspiration',
      description: 'Study and learn from well-designed websites by examining their structure'
    },
    {
      title: 'Migration Projects',
      description: 'Move websites between platforms while preserving their design and content'
    },
    {
      title: 'Template Creation',
      description: 'Create reusable templates from existing websites for faster development'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/products')}
            className="text-blue-100 hover:text-white mb-8 flex items-center gap-2 transition-colors"
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
                <span className="ml-2 text-blue-100">Trusted by 10,000+ developers</span>
              </div>

              <h1 className="text-5xl font-bold mb-6 leading-tight">Clone Any Website in Seconds</h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Extract HTML, CSS, JavaScript, and all assets automatically. Perfect for web developers, designers, and migration projects. Start cloning websites with intelligent parsing technology.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate(user ? '/dashboard' : '/auth')}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                  size="lg"
                >
                  {user ? 'Go to Dashboard' : 'Start Free Trial'} <ArrowRight className="ml-2" size={20} />
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-blue-700 text-white hover:bg-blue-600 px-8 py-4 text-lg font-semibold border-2 border-blue-400"
                  size="lg"
                >
                  View Demo
                </Button>
              </div>

              <div className="mt-8 flex items-center gap-8 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <Check size={20} className="text-green-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={20} className="text-green-400" />
                  <span>Free 14-day trial</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="bg-white rounded-lg p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <Copy className="text-blue-600" size={24} />
                        <div className="flex-1">
                          <div className="h-3 bg-blue-200 rounded w-1/2 mb-2"></div>
                          <div className="h-2 bg-blue-100 rounded w-3/4"></div>
                        </div>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Enter URL</h3>
                    <p className="text-gray-600">Paste the website URL you want to clone into the input field</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Parse & Extract</h3>
                    <p className="text-gray-600">Our engine parses the HTML and extracts all assets automatically</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Review & Export</h3>
                    <p className="text-gray-600">Review the cloned website and export in your preferred format</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="text-blue-600" size={24} />
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
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <h3 className="font-bold text-gray-900 mb-4">What You Can Clone</h3>
              <ul className="space-y-3">
                {capabilities.map((capability, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{capability}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Use Cases</h3>
              <div className="space-y-4">
                {useCases.map((useCase, index) => (
                  <div key={index}>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{useCase.title}</h4>
                    <p className="text-sm text-gray-600">{useCase.description}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Start Cloning?</h3>
              <p className="text-blue-100 mb-6">
                Join thousands of developers who trust Website Cloner Pro for their web migration and development projects.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-green-300" />
                  <span>Unlimited website cloning</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-green-300" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-green-300" />
                  <span>Advanced export options</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-green-300" />
                  <span>Cancel anytime</span>
                </li>
              </ul>
              <Button
                onClick={() => navigate(user ? '/dashboard' : '/auth')}
                className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
                size="lg"
              >
                {user ? 'Go to Dashboard' : 'Start Free Trial'} <ArrowRight className="ml-2" size={20} />
              </Button>
            </Card>
          </div>
        </div>

        <div className="mt-20 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Start Cloning Websites Today</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            No credit card required. Get started with our free 14-day trial and experience the power of intelligent website cloning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(user ? '/dashboard' : '/auth')}
              className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              size="lg"
            >
              {user ? 'Open Dashboard' : 'Sign Up Free'} <ArrowRight className="ml-2" size={20} />
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
