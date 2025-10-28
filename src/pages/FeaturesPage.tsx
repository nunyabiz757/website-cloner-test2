import { useNavigate } from 'react-router-dom';
import { Globe, Workflow, Zap, BarChart3, Shield, Cpu, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function FeaturesPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Globe,
      title: 'Website Cloning',
      description: 'Clone any website with pixel-perfect accuracy. Capture HTML, CSS, JavaScript, and all assets in seconds.',
      path: '/features/website-cloning',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Workflow,
      title: 'WordPress to GoHighLevel',
      description: 'Convert WordPress sites to GoHighLevel format. Supports Elementor, Divi, Gutenberg, and more.',
      path: '/features/wordpress-to-ghl',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Zap,
      title: 'Performance Optimization',
      description: 'Apply 50+ optimization techniques to improve page speed, Core Web Vitals, and user experience.',
      path: '/features/performance-optimization',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: BarChart3,
      title: 'SEO Analysis',
      description: 'Comprehensive SEO audits with actionable recommendations to improve search rankings.',
      path: '/features/seo-analysis',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Shield,
      title: 'Security Scanning',
      description: 'Detect vulnerabilities, security issues, and compliance problems before they become threats.',
      path: '/features/security-scanning',
      gradient: 'from-red-500 to-rose-500',
    },
    {
      icon: Cpu,
      title: 'Technology Detection',
      description: 'Identify CMS, frameworks, analytics, and all technologies used on any website.',
      path: '/features/technology-detection',
      gradient: 'from-indigo-500 to-blue-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Powerful Features for Web Professionals</h1>
          <p className="text-xl md:text-2xl text-blue-50 mb-8 max-w-3xl mx-auto">
            Everything you need to clone, analyze, optimize, and convert websites faster than ever before.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/signup')}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Start Free Trial
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.path}
                className="p-8 hover:shadow-xl transition-shadow cursor-pointer group"
                onClick={() => navigate(feature.path)}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                <button className="text-blue-600 font-semibold flex items-center group-hover:gap-3 transition-all">
                  Learn More
                  <ArrowRight className="ml-2 group-hover:ml-0 transition-all" size={20} />
                </button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Speed Up Your Workflow?
          </h2>
          <p className="text-xl text-blue-50 mb-8">
            Join thousands of developers and agencies using Website Cloner Pro to save time and deliver better results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/signup')}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Get Started Free
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/documentation')}
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
