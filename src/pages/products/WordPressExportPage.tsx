import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Download, Check, Package, ArrowRight, Star, Blocks } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function WordPressExportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'WordPress Export - Support for 11 Page Builders | Website Cloner Pro';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Export any website to WordPress with one click. Support for Elementor, Gutenberg, Divi, Beaver Builder, and 7 more page builders. Perfect for WordPress developers and agencies.');
    }
  }, []);

  const builders = [
    {
      name: 'Elementor',
      status: 'Full Support',
      features: ['Complete JSON export', '10+ widget types', 'Sections & columns', 'Settings preserved'],
      color: 'bg-pink-500'
    },
    {
      name: 'Gutenberg',
      status: 'Full Support',
      features: ['Native block format', 'Easy import', 'Layout support', 'Content preserved'],
      color: 'bg-blue-500'
    },
    {
      name: 'Divi Builder',
      status: 'Supported',
      features: ['Shortcode export', 'Module support', 'Layout structure', 'Visual Builder ready'],
      color: 'bg-purple-500'
    },
    {
      name: 'Beaver Builder',
      status: 'Supported',
      features: ['JSON format', 'Module support', 'Responsive settings', 'Template ready'],
      color: 'bg-orange-500'
    },
    {
      name: 'Bricks Builder',
      status: 'Supported',
      features: ['Element export', 'Structure preserved', 'Custom CSS', 'Template format'],
      color: 'bg-red-500'
    },
    {
      name: 'Oxygen Builder',
      status: 'Supported',
      features: ['Component export', 'Element structure', 'Styling preserved', 'Template support'],
      color: 'bg-green-500'
    }
  ];

  const additionalBuilders = [
    'Brizy',
    'Crocoblock',
    'Kadence Blocks',
    'GenerateBlocks',
    'OptimizePress'
  ];

  const exportFeatures = [
    'One-click export to WordPress',
    'Automatic content conversion',
    'Layout structure preservation',
    'Styling and design maintained',
    'Image and media handling',
    'SEO metadata preserved',
    'Responsive breakpoints',
    'Custom CSS support'
  ];

  const workflow = [
    {
      step: '1',
      title: 'Clone Website',
      description: 'Start by cloning the website you want to migrate'
    },
    {
      step: '2',
      title: 'Choose Builder',
      description: 'Select your preferred WordPress page builder'
    },
    {
      step: '3',
      title: 'Export & Download',
      description: 'Get your builder-ready export file instantly'
    },
    {
      step: '4',
      title: 'Import to WordPress',
      description: 'Upload to WordPress and you\'re done!'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/products')}
            className="text-purple-100 hover:text-white mb-8 flex items-center gap-2 transition-colors"
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
                <span className="ml-2 text-purple-100">Trusted WordPress migration tool</span>
              </div>

              <h1 className="text-5xl font-bold mb-6 leading-tight">Export to WordPress in One Click</h1>
              <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                Migrate any website to WordPress instantly. Support for 11 major page builders including Elementor, Gutenberg, Divi, and more. Save weeks of manual work with automated content conversion.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate(user ? '/dashboard' : '/auth')}
                  className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                  size="lg"
                >
                  {user ? 'Export to WordPress' : 'Start Free Trial'} <ArrowRight className="ml-2" size={20} />
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-purple-700 text-white hover:bg-purple-600 px-8 py-4 text-lg font-semibold border-2 border-purple-400"
                  size="lg"
                >
                  Watch Demo
                </Button>
              </div>

              <div className="mt-8 flex items-center gap-8 text-sm text-purple-100">
                <div className="flex items-center gap-2">
                  <Check size={20} className="text-purple-300" />
                  <span>11 page builders</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={20} className="text-purple-300" />
                  <span>One-click export</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="bg-white rounded-lg p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <Blocks className="text-purple-600" size={32} />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">11 Page Builders</h3>
                      <p className="text-sm text-gray-600">Fully supported</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Elementor</span>
                      <Check className="text-green-600 ml-auto" size={18} />
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Gutenberg</span>
                      <Check className="text-green-600 ml-auto" size={18} />
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Divi Builder</span>
                      <Check className="text-green-600 ml-auto" size={18} />
                    </div>
                    <div className="text-center text-sm text-gray-600 mt-4">+ 8 more builders</div>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {workflow.map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-lg">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Supported Page Builders</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {builders.map((builder, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-3 h-3 ${builder.color} rounded-full`}></div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{builder.name}</h3>
                        <span className="text-xs text-green-600 font-medium">{builder.status}</span>
                      </div>
                    </div>
                    <ul className="space-y-1">
                      {builder.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-sm text-gray-600 flex items-start gap-2">
                          <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Builders</h2>
              <div className="flex flex-wrap gap-3">
                {additionalBuilders.map((builder, index) => (
                  <div key={index} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium flex items-center gap-2">
                    <Package size={14} />
                    {builder}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <h3 className="font-bold text-gray-900 mb-4">Export Features</h3>
              <ul className="space-y-3">
                {exportFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-bold text-gray-900 mb-3">Best For</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Web Developers</div>
                  <div className="text-gray-700">Migrate client sites to WordPress quickly</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Agencies</div>
                  <div className="text-gray-700">Speed up WordPress development workflow</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Designers</div>
                  <div className="text-gray-700">Convert designs to WordPress instantly</div>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
              <h3 className="text-2xl font-bold mb-4">Start Exporting Today</h3>
              <p className="text-purple-100 mb-6">
                Join hundreds of agencies and developers who've simplified their WordPress migration workflow.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-purple-300" />
                  <span>Elementor & Gutenberg support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-purple-300" />
                  <span>Divi, Beaver, & 7 more builders</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-purple-300" />
                  <span>One-click export</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-purple-300" />
                  <span>Layout preservation</span>
                </li>
              </ul>
              <Button
                onClick={() => navigate(user ? '/dashboard' : '/auth')}
                className="w-full bg-white text-purple-600 hover:bg-purple-50 font-semibold shadow-lg"
                size="lg"
              >
                {user ? 'Go to Dashboard' : 'Get Started Free'} <ArrowRight className="ml-2" size={20} />
              </Button>
            </Card>
          </div>
        </div>

        <Card className="p-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Why Choose Our WordPress Export?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">11</div>
              <div className="text-sm text-gray-600">Page Builders Supported</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">1-Click</div>
              <div className="text-sm text-gray-600">Export Process</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-sm text-gray-600">Layout Preservation</div>
            </div>
          </div>
        </Card>

        <div className="mt-20 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Migrate to WordPress the Easy Way</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Stop wasting hours on manual WordPress migrations. Export any website to your favorite page builder in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(user ? '/dashboard' : '/auth')}
              className="bg-purple-600 text-white hover:bg-purple-700 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              size="lg"
            >
              {user ? 'Start Exporting' : 'Start Free Trial'} <ArrowRight className="ml-2" size={20} />
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
