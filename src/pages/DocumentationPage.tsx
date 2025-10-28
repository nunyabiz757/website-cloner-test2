import { useState } from 'react';
import { Book, Search, ChevronRight, Globe, Zap, BarChart3, Download, Workflow, Code, Shield, Cpu } from 'lucide-react';
import { Card } from '../components/ui/Card';

export function DocumentationPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Book,
      color: 'text-blue-600 bg-blue-50',
      topics: [
        { title: 'Introduction', description: 'Learn about Website Cloner Pro features and capabilities' },
        { title: 'Quick Start Guide', description: 'Get up and running in 5 minutes' },
        { title: 'Dashboard Overview', description: 'Understanding the main dashboard interface' },
      ]
    },
    {
      id: 'cloning',
      title: 'Website Cloning',
      icon: Globe,
      color: 'text-green-600 bg-green-50',
      topics: [
        { title: 'Clone from URL', description: 'Clone any website by entering its URL' },
        { title: 'Clone Options', description: 'Advanced cloning options and configurations' },
        { title: 'Browser Automation', description: 'Using Playwright for dynamic content capture' },
        { title: 'Asset Management', description: 'Managing images, fonts, and other assets' },
      ]
    },
    {
      id: 'analysis',
      title: 'Website Analysis',
      icon: BarChart3,
      color: 'text-purple-600 bg-purple-50',
      topics: [
        { title: 'Performance Analysis', description: 'Lighthouse and Core Web Vitals testing' },
        { title: 'SEO Analysis', description: 'Meta tags, headings, and SEO optimization' },
        { title: 'Security Scanning', description: 'Vulnerability detection and security checks' },
        { title: 'Technology Detection', description: 'Identify frameworks, libraries, and CMSs' },
      ]
    },
    {
      id: 'optimization',
      title: 'Optimization',
      icon: Zap,
      color: 'text-yellow-600 bg-yellow-50',
      topics: [
        { title: 'Auto-Optimization', description: 'Apply 50+ performance optimizations automatically' },
        { title: 'Image Optimization', description: 'Compress and convert images' },
        { title: 'Code Minification', description: 'Minify HTML, CSS, and JavaScript' },
        { title: 'Caching Strategies', description: 'Implement browser and CDN caching' },
      ]
    },
    {
      id: 'ghl-conversion',
      title: 'GoHighLevel Conversion',
      icon: Workflow,
      color: 'text-orange-600 bg-orange-50',
      topics: [
        { title: 'WordPress to GHL', description: 'Convert WordPress sites to GoHighLevel format' },
        { title: 'Page Builder Support', description: 'Elementor, Divi, Gutenberg, WPBakery, Beaver Builder' },
        { title: 'API Configuration', description: 'Setting up GoHighLevel API credentials' },
        { title: 'Import to GHL', description: 'Importing converted pages to your GHL account' },
      ]
    },
    {
      id: 'export',
      title: 'Export & Integration',
      icon: Download,
      color: 'text-indigo-600 bg-indigo-50',
      topics: [
        { title: 'Export Formats', description: 'HTML, WordPress, React, Vue, and more' },
        { title: 'WordPress Export', description: 'Export to Elementor, Gutenberg, or Divi' },
        { title: 'Code Generation', description: 'Generate clean, production-ready code' },
        { title: 'GitHub Integration', description: 'Push projects directly to GitHub' },
      ]
    }
  ];

  const filteredSections = sections.map(section => ({
    ...section,
    topics: section.topics.filter(topic =>
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.topics.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Documentation</h1>
          <p className="text-lg text-gray-600">
            Everything you need to know about Website Cloner Pro
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8 p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documentation..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div
            onClick={() => document.getElementById('getting-started')?.scrollIntoView({ behavior: 'smooth' })}
            className="p-4 bg-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500 rounded-lg border border-gray-200 hover:border-transparent transition-all duration-200 cursor-pointer transform hover:scale-105 hover:shadow-lg group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 group-hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors duration-200">
                <Book className="text-blue-600 group-hover:text-white transition-colors duration-200" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-white transition-colors duration-200">Getting Started</h3>
            </div>
            <p className="text-sm text-gray-600 group-hover:text-white transition-colors duration-200">New to Website Cloner Pro? Start here.</p>
          </div>

          <div
            onClick={() => document.getElementById('export')?.scrollIntoView({ behavior: 'smooth' })}
            className="p-4 bg-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500 rounded-lg border border-gray-200 hover:border-transparent transition-all duration-200 cursor-pointer transform hover:scale-105 hover:shadow-lg group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 group-hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors duration-200">
                <Code className="text-green-600 group-hover:text-white transition-colors duration-200" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-white transition-colors duration-200">API Reference</h3>
            </div>
            <p className="text-sm text-gray-600 group-hover:text-white transition-colors duration-200">Detailed API documentation and examples.</p>
          </div>

          <div
            onClick={() => document.getElementById('optimization')?.scrollIntoView({ behavior: 'smooth' })}
            className="p-4 bg-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500 rounded-lg border border-gray-200 hover:border-transparent transition-all duration-200 cursor-pointer transform hover:scale-105 hover:shadow-lg group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 group-hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors duration-200">
                <Shield className="text-purple-600 group-hover:text-white transition-colors duration-200" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-white transition-colors duration-200">Best Practices</h3>
            </div>
            <p className="text-sm text-gray-600 group-hover:text-white transition-colors duration-200">Tips and tricks for optimal results.</p>
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="space-y-6">
          {filteredSections.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No documentation found matching your search.</p>
            </Card>
          ) : (
            filteredSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.id} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 ${section.color} rounded-lg flex items-center justify-center`}>
                      <Icon size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                  </div>

                  <div className="space-y-3">
                    {section.topics.map((topic, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                      >
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{topic.title}</h3>
                          <p className="text-sm text-gray-600">{topic.description}</p>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:text-gray-600 transition-colors" size={20} />
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <Card className="mt-8 p-6 bg-blue-50 border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Cpu className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-700 mb-3">
                Can't find what you're looking for? Our support team is here to help you get the most out of Website Cloner Pro.
              </p>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Contact Support →
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
