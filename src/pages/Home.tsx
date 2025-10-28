import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import {
  Copy, Zap, Shield, Search, Cpu, RefreshCw, Globe, Download,
  CheckCircle, ArrowRight, BarChart3, Lock, Gauge, Code,
  Users, Briefcase, ShoppingCart, Palette, TrendingUp,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const advancedFeatures = [
    {
      title: 'Website Cloning',
      description: 'Clone any website instantly with pixel-perfect accuracy. Our advanced cloning engine captures HTML, CSS, JavaScript, images, fonts, and all assets in seconds.',
      icon: Copy,
      color: 'bg-blue-500',
      link: '/features/website-cloning'
    },
    {
      title: 'Performance Optimization',
      description: 'Automatically optimize cloned websites with 50+ performance techniques. Image compression, code minification, lazy loading, and Core Web Vitals improvements.',
      icon: Zap,
      color: 'bg-yellow-500',
      link: '/features/performance-optimization'
    },
    {
      title: 'SEO Preservation',
      description: 'Maintain search engine rankings with comprehensive SEO analysis. Preserve meta tags, heading structure, schema markup, and generate 301 redirect maps.',
      icon: Search,
      color: 'bg-green-500',
      link: '/features/seo-analysis'
    },
    {
      title: 'Security Scanning',
      description: 'Detect vulnerabilities, malware, and security issues before deployment. OWASP Top 10 checks, dependency scanning, and compliance validation.',
      icon: Shield,
      color: 'bg-red-500',
      link: '/features/security-scanning'
    },
    {
      title: 'Technology Detection',
      description: 'Identify frameworks, libraries, CMS platforms, and tech stacks automatically. Detect 1,500+ technologies across 70+ categories for migration planning.',
      icon: Cpu,
      color: 'bg-cyan-500',
      link: '/features/technology-detection'
    },
    {
      title: 'WordPress to GHL',
      description: 'Convert WordPress sites to GoHighLevel format seamlessly. Support for 11 page builders including Elementor, Divi, Gutenberg, WPBakery, and Beaver Builder.',
      icon: RefreshCw,
      color: 'bg-purple-500',
      link: '/features/wordpress-to-ghl'
    },
    {
      title: 'GHL to GHL Cloning',
      description: 'Duplicate GoHighLevel funnels and websites between sub-accounts. Multi-account deployment, variable replacement, and bulk cloning capabilities.',
      icon: Globe,
      color: 'bg-indigo-500',
      link: '/features/ghl-to-ghl'
    },
    {
      title: 'Multiple Export Formats',
      description: 'Export to WordPress, HTML, React, Vue, or GoHighLevel. Clean, production-ready code generation with framework-specific optimizations.',
      icon: Download,
      color: 'bg-orange-500',
      link: '/features'
    },
  ];

  const howItWorksSteps = [
    {
      step: '1',
      title: 'Enter Website URL',
      description: 'Simply paste the URL of any website you want to clone. Our system supports public websites, landing pages, sales funnels, and more.'
    },
    {
      step: '2',
      title: 'Select Clone Options',
      description: 'Choose what to clone: images, fonts, JavaScript, CSS. Enable performance optimization, SEO analysis, security scanning, and technology detection.'
    },
    {
      step: '3',
      title: 'AI Processing & Analysis',
      description: 'Our advanced engine clones the website, analyzes performance, detects components, scans for security issues, and optimizes assets automatically.'
    },
    {
      step: '4',
      title: 'Export & Deploy',
      description: 'Download your cloned website or export directly to WordPress, GoHighLevel, or other platforms. Deploy with one click to Vercel or Netlify.'
    },
  ];

  const useCases = [
    {
      title: 'Digital Marketing Agencies',
      description: 'Clone client websites for redesigns, migrate WordPress sites to GoHighLevel, create landing page templates, and replicate successful campaigns across multiple clients.',
      icon: Briefcase,
      benefits: ['Template Replication', 'Multi-Client Deployment', 'Brand Consistency', 'Time Savings']
    },
    {
      title: 'Web Developers',
      description: 'Analyze competitor websites, extract design patterns, migrate legacy sites to modern frameworks, and accelerate development by cloning UI components.',
      icon: Code,
      benefits: ['Code Analysis', 'Framework Migration', 'Component Extraction', 'Development Speed']
    },
    {
      title: 'E-Commerce Businesses',
      description: 'Clone product pages for A/B testing, migrate Shopify to custom platforms, preserve SEO during platform changes, and duplicate successful store designs.',
      icon: ShoppingCart,
      benefits: ['A/B Testing', 'Platform Migration', 'SEO Preservation', 'Store Duplication']
    },
    {
      title: 'Designers & Freelancers',
      description: 'Build client portfolios by cloning your best work, create design system libraries, export to various page builders, and streamline client onboarding.',
      icon: Palette,
      benefits: ['Portfolio Building', 'Design Systems', 'Client Onboarding', 'Multi-Format Export']
    },
  ];

  const whyChooseFeatures = [
    {
      icon: Gauge,
      title: 'Lightning Fast Performance',
      description: 'Clone websites in seconds with our optimized cloning engine. Average clone time: 30-90 seconds for most sites.'
    },
    {
      icon: Lock,
      title: 'Enterprise-Grade Security',
      description: 'SOC 2 compliant infrastructure with end-to-end encryption. Your data and cloned websites are completely secure.'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive performance, SEO, security, and technology analysis. Make data-driven decisions for every migration.'
    },
    {
      icon: Users,
      title: 'Multi-User Collaboration',
      description: 'Team accounts, role-based permissions, project sharing, and collaborative workflows for agencies.'
    },
    {
      icon: TrendingUp,
      title: '99.9% Uptime SLA',
      description: 'Reliable infrastructure with automatic scaling. Clone thousands of websites without downtime or performance degradation.'
    },
    {
      icon: CheckCircle,
      title: 'Money-Back Guarantee',
      description: '30-day full refund if you\'re not satisfied. No questions asked, no hassle. We\'re confident you\'ll love it.'
    },
  ];

  const faqs = [
    {
      question: 'What is a website cloning tool and how does it work?',
      answer: 'A website cloning tool is software that creates an exact copy of a website by extracting all HTML, CSS, JavaScript, images, fonts, and other assets. Website Cloner Pro uses advanced browser automation and parsing algorithms to capture every element of a website, preserving design, functionality, and structure. The cloned website can then be deployed, edited, or exported to various formats.'
    },
    {
      question: 'Is website cloning legal?',
      answer: 'Cloning websites you own or have permission to clone is completely legal. Website Cloner Pro is designed for legitimate use cases like migrating your own websites, creating backups, analyzing competitor design patterns for inspiration, or replicating client websites for redesigns. Always respect copyright and intellectual property laws. Do not clone websites without proper authorization.'
    },
    {
      question: 'Can I clone WordPress websites and export to other platforms?',
      answer: 'Yes! Website Cloner Pro specializes in WordPress migration. We support cloning from WordPress and exporting to 11 page builders including Elementor, Divi, Gutenberg, WPBakery, Beaver Builder, and more. You can also export to GoHighLevel, HTML, React, Vue, or other platforms. Our converter intelligently maps WordPress elements to equivalent structures in the target platform.'
    },
    {
      question: 'How does the tool preserve SEO during website migration?',
      answer: 'Our SEO preservation engine extracts all meta tags, title tags, meta descriptions, Open Graph tags, schema markup, and heading structures. We generate comprehensive 301 redirect maps showing old URLs → new URLs to prevent broken links. All alt text, canonical tags, and SEO metadata are preserved. We also provide an SEO analysis report identifying any issues to fix before launch.'
    },
    {
      question: 'What performance optimizations are included?',
      answer: 'Website Cloner Pro includes 50+ automatic optimizations: image compression (50-80% file size reduction), WebP conversion, responsive image sizing, CSS/JS minification, code bundling, lazy loading, critical CSS inlining, font optimization, and browser caching headers. Most sites see 40-70% load time improvements after optimization.'
    },
    {
      question: 'Can I clone dynamic websites with JavaScript frameworks?',
      answer: 'Yes! Our tool uses Playwright browser automation to execute JavaScript and capture dynamically rendered content. We successfully clone React, Vue, Angular, and other SPA (Single Page Application) websites. The tool waits for JavaScript execution, captures AJAX-loaded content, and preserves interactive functionality where possible.'
    },
    {
      question: 'How many websites can I clone?',
      answer: 'Unlimited! There are no restrictions on the number of websites you can clone. Clone as many sites as you need for your projects, clients, or testing purposes. Our infrastructure auto-scales to handle high-volume cloning operations without performance degradation.'
    },
    {
      question: 'What export formats are supported?',
      answer: 'We support multiple export formats: (1) HTML/CSS/JS - clean, static files, (2) WordPress - compatible with Elementor, Divi, Gutenberg, WPBakery, Beaver Builder, (3) GoHighLevel - funnel pages and websites, (4) React - component-based structure, (5) Vue - SFC components, (6) ZIP archive - all assets bundled. Each export format is optimized for that specific platform.'
    },
    {
      question: 'Does the tool work with password-protected or private websites?',
      answer: 'Currently, Website Cloner Pro is designed for publicly accessible websites. For password-protected sites, you would need to provide authentication credentials (which we handle securely), or temporarily make the site public during cloning. For private websites you own, we recommend using our API with custom authentication headers.'
    },
    {
      question: 'What kind of support do you offer?',
      answer: 'We provide email support, comprehensive documentation, video tutorials, and a community forum. Premium plans include priority support with faster response times and dedicated account managers for agencies. Our support team helps with technical issues, migration planning, and optimization strategies.'
    },
  ];

  const technologies = [
    { name: 'WordPress', logo: 'W' },
    { name: 'React', logo: 'R' },
    { name: 'Vue.js', logo: 'V' },
    { name: 'GoHighLevel', logo: 'GHL' },
    { name: 'Shopify', logo: 'S' },
    { name: 'Wix', logo: 'W' },
    { name: 'Webflow', logo: 'WF' },
    { name: 'Squarespace', logo: 'SQ' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Above the fold */}
      <section className="bg-gradient-to-b from-blue-50 via-white to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Website Cloning Tool with Advanced Features
            </h1>
            <h2 className="text-2xl md:text-3xl text-gray-700 mb-6 font-medium">
              Clone, Optimize, and Migrate Any Website
            </h2>
            <p className="text-xl text-gray-600 mb-4 leading-relaxed">
              Professional website cloning software with WordPress export, GoHighLevel conversion, performance optimization, SEO preservation, and security scanning. Clone any website instantly and deploy anywhere.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Trusted by 10,000+ developers, agencies, and marketers worldwide for website migration, cloning, and optimization.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Button
                size="lg"
                onClick={() => navigate(user ? '/clone' : '/signup')}
                className="text-lg px-8 py-4"
              >
                Start Cloning Free
                <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/features')}
                className="text-lg px-8 py-4"
              >
                View All Features
              </Button>
            </div>
            <div className="flex items-center justify-center flex-wrap gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-600" size={20} />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-600" size={20} />
                <span>Unlimited clones</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-600" size={20} />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How Our Website Cloning Tool Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Clone any website in 4 simple steps. Our advanced cloning engine handles everything automatically while you maintain full control over the process.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-full">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center text-2xl font-bold mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
                {index < howItWorksSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="text-blue-300" size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Advanced Website Cloning Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our professional website cloning software includes enterprise-grade features for developers, agencies, and businesses. Everything you need to clone, optimize, and migrate websites.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advancedFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  onClick={() => navigate(feature.link)}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group hover:border-blue-300"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Who Uses Our Website Cloning Software?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From agencies managing hundreds of clients to solo developers building portfolios, our website cloning tool accelerates workflows across industries.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{useCase.title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">{useCase.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {useCase.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="text-green-600 flex-shrink-0" size={16} />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Website Cloner Pro?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The most advanced website cloning platform with features that save time, reduce costs, and deliver superior results.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Trusted by Professionals Worldwide</h2>
            <p className="text-xl text-blue-100">Join thousands of developers, agencies, and businesses using Website Cloner Pro</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100 text-lg">Websites Cloned Monthly</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100 text-lg">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-blue-100 text-lg">Optimization Techniques</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">4.8/5</div>
              <div className="text-blue-100 text-lg">Customer Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Technologies */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Supported Platforms & Technologies
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Clone from and export to all major web platforms and frameworks
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {technologies.map((tech, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-blue-600">{tech.logo}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{tech.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our website cloning tool
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  <ChevronDown
                    className={`text-gray-500 flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                    size={20}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Clone Your First Website?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals using Website Cloner Pro to accelerate website development, migration, and optimization.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate(user ? '/clone' : '/signup')}
              className="text-lg px-8 py-4"
            >
              Start Cloning Free
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/documentation')}
              className="text-lg px-8 py-4"
            >
              View Documentation
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
