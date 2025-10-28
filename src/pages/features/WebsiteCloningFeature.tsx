import { Globe, Check, Zap, Code, Image, Smartphone, Settings } from 'lucide-react';
import { FeatureHero } from '../../components/features/FeatureHero';
import { FeatureSection } from '../../components/features/FeatureSection';
import { FeatureCTA } from '../../components/features/FeatureCTA';
import { FeatureFAQ } from '../../components/features/FeatureFAQ';
import { Card } from '../../components/ui/Card';

export function WebsiteCloningFeature() {
  const faqs = [
    {
      question: 'Is website cloning legal?',
      answer: 'Website cloning for personal use, learning, testing, or with proper authorization is legal. Always respect copyright and obtain permission when cloning third-party websites for commercial use.',
    },
    {
      question: 'How long does it take to clone a website?',
      answer: 'Most websites can be cloned in 30-60 seconds. Complex sites with many pages or heavy assets may take 2-3 minutes. Our browser automation ensures complete capture of dynamic content.',
    },
    {
      question: 'Can I clone password-protected websites?',
      answer: 'Yes, if you have valid credentials. Our tool can handle authenticated sessions, allowing you to clone member areas, dashboards, and protected content.',
    },
    {
      question: 'What file formats are supported?',
      answer: 'We capture HTML, CSS, JavaScript, images (JPG, PNG, WebP, SVG), fonts (WOFF, WOFF2, TTF), and other web assets. Everything is organized in a structured folder system.',
    },
    {
      question: 'Do you clone the backend/database?',
      answer: 'No, we clone the frontend presentation layer only. This includes HTML structure, styling, client-side JavaScript, and assets. Server-side code and databases are not cloned.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <FeatureHero
        icon={Globe}
        title="Website Cloning Made Simple"
        description="Clone any website in seconds with pixel-perfect accuracy. Capture every element, style, and asset automatically."
        gradient="from-blue-600 to-cyan-600"
      />

      <FeatureSection title="What is Website Cloning?">
        <p className="text-lg leading-relaxed mb-6">
          Website cloning is the process of creating an exact copy of a website's frontend—its HTML structure, CSS styling, JavaScript functionality, and all visual assets. Whether you're a web developer analyzing competitor sites, an agency onboarding new clients, or a designer studying modern web trends, website cloning provides instant access to complete, functional code you can learn from and build upon.
        </p>
        <p className="text-lg leading-relaxed mb-6">
          Traditional manual cloning is tedious and error-prone. You'd need to save HTML files, download CSS and JavaScript separately, hunt down images and fonts, and carefully reconstruct the folder structure. Website Cloner Pro automates this entire workflow, delivering production-ready code in under a minute.
        </p>
        <p className="text-lg leading-relaxed">
          Our advanced cloning engine goes beyond simple "Save As" functionality. We use browser automation to render pages exactly as users see them, capturing dynamically loaded content, CSS animations, responsive breakpoints, and even interactive JavaScript elements. The result is a complete, working copy you can host anywhere.
        </p>
      </FeatureSection>

      <FeatureSection title="How Website Cloning Works" className="bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose mb-8">
          <Card className="p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Code className="text-blue-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">1. URL Analysis</h3>
            <p className="text-gray-700">
              Enter any website URL. Our system analyzes the page structure, identifies all resources, and prepares an optimized cloning strategy tailored to that specific site architecture.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="text-green-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">2. Browser Automation</h3>
            <p className="text-gray-700">
              We launch a headless browser (Playwright) to render the page exactly as users see it. This captures JavaScript-rendered content, lazy-loaded images, and dynamic styling that static scrapers miss.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Image className="text-purple-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">3. Asset Extraction</h3>
            <p className="text-gray-700">
              All images, fonts, CSS files, and JavaScript libraries are automatically downloaded and organized. We preserve original folder structures and update all internal links to maintain functionality.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Settings className="text-orange-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">4. Code Optimization</h3>
            <p className="text-gray-700">
              The cloned code is cleaned, formatted, and optimized. We remove tracking scripts, fix broken links, inline critical CSS, and ensure the clone works independently of the original server.
            </p>
          </Card>
        </div>

        <p className="text-lg leading-relaxed mb-4">
          Our multi-phase cloning process ensures nothing is missed. First, we capture the initial HTML and visible assets. Next, we scroll through the page to trigger lazy-loading mechanisms. Then we test responsive breakpoints to capture mobile and tablet styles. Finally, we validate all links and resources to guarantee a complete, functional clone.
        </p>
        <p className="text-lg leading-relaxed">
          The entire process happens automatically in the background. You simply wait 30-60 seconds and receive a ZIP file containing perfectly organized, ready-to-deploy website code.
        </p>
      </FeatureSection>

      <FeatureSection title="Key Benefits of Website Cloning">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mb-8">
          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Save Hundreds of Hours</h3>
              <p className="text-gray-700">
                What takes days to manually recreate happens in seconds. Eliminate tedious HTML inspection, CSS extraction, and asset hunting. Focus on customization, not reconstruction.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Pixel-Perfect Accuracy</h3>
              <p className="text-gray-700">
                Our browser automation captures computed styles, ensuring your clone matches the original exactly. Colors, fonts, spacing, animations—everything is preserved with professional precision.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Multi-Framework Support</h3>
              <p className="text-gray-700">
                Clone sites built with React, Vue, Angular, WordPress, Shopify, Webflow, or vanilla HTML. Our tool works regardless of the underlying technology stack.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Learning & Inspiration</h3>
              <p className="text-gray-700">
                Study how top designers structure their code. Analyze animation techniques, responsive strategies, and modern CSS patterns used by leading websites.
              </p>
            </div>
          </div>
        </div>

        <p className="text-lg leading-relaxed">
          Beyond time savings, website cloning accelerates learning. New developers can study real-world production code. Agencies can quickly onboard clients by cloning their existing sites. Freelancers can offer migration services without weeks of manual work. The applications are endless.
        </p>
      </FeatureSection>

      <FeatureSection title="Real-World Use Cases" className="bg-gray-50">
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Client Onboarding for Agencies</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              When agencies acquire new clients, they often inherit websites built by previous developers. Instead of manually reverse-engineering the existing site, clone it instantly. This gives you complete access to the codebase for analysis, improvement, and migration. You can identify performance bottlenecks, security issues, and optimization opportunities without weeks of investigation. Present clients with detailed audits backed by their actual code.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Competitive Research & Analysis</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              Understanding competitor strategies is crucial for business success. Clone competitor websites to analyze their user experience, conversion funnels, page layouts, and technical implementation. Study how they structure content, where they place calls-to-action, and what design patterns drive engagement. This isn't about copying—it's about learning what works and adapting those insights to your unique value proposition.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Portfolio & Template Creation</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              Designers and developers can build reusable template libraries by cloning high-performing websites (with permission). Create a collection of landing page templates, pricing page layouts, and navigation patterns. When starting new projects, you'll have battle-tested designs ready to customize instead of building from scratch every time.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Website Migration & Redesign</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              Migrating websites between platforms (WordPress to Shopify, Wix to custom code, etc.) traditionally requires complete rebuilds. With website cloning, you capture the existing design as a starting point. This preserves what works while enabling strategic improvements. Your redesign process becomes evolutionary rather than revolutionary, reducing risk and accelerating timelines.
            </p>
          </div>
        </div>
      </FeatureSection>

      <FeatureSection title="Technical Features & Capabilities">
        <p className="text-lg leading-relaxed mb-6">
          Website Cloner Pro includes advanced technical features that go far beyond simple HTML downloads:
        </p>

        <ul className="space-y-4 text-lg text-gray-700">
          <li className="flex gap-3">
            <Check className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <span><strong>Playwright Browser Automation:</strong> We use Microsoft's Playwright framework to render pages in a real Chromium browser, ensuring JavaScript execution, CSS animation capture, and accurate DOM representation.</span>
          </li>
          <li className="flex gap-3">
            <Check className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <span><strong>Responsive Design Capture:</strong> Automatically test and capture mobile, tablet, and desktop breakpoints. Your clone includes all media queries and responsive styling.</span>
          </li>
          <li className="flex gap-3">
            <Check className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <span><strong>Asset Management:</strong> Images are optimized, fonts are embedded correctly, and external resources are downloaded and stored locally for offline functionality.</span>
          </li>
          <li className="flex gap-3">
            <Check className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <span><strong>Code Quality Tools:</strong> Cloned code is formatted with Prettier, validated for accessibility, and checked for broken links before delivery.</span>
          </li>
          <li className="flex gap-3">
            <Check className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <span><strong>Interactive Elements:</strong> JavaScript-driven features like modals, carousels, accordions, and forms are preserved with full functionality.</span>
          </li>
          <li className="flex gap-3">
            <Check className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <span><strong>Style Analysis:</strong> Our CSS analyzer identifies unused styles, provides specificity reports, and suggests optimization opportunities.</span>
          </li>
        </ul>
      </FeatureSection>

      <FeatureSection title="Getting Started with Website Cloning" className="bg-gray-50">
        <p className="text-lg leading-relaxed mb-6">
          Cloning your first website takes less than 2 minutes:
        </p>

        <ol className="space-y-4 text-lg text-gray-700 list-decimal list-inside">
          <li><strong>Create a free account</strong> at Website Cloner Pro. No credit card required for your first 3 clones.</li>
          <li><strong>Navigate to the Dashboard</strong> and find the "Clone Website" section.</li>
          <li><strong>Enter the target URL</strong> of the website you want to clone.</li>
          <li><strong>Select cloning options:</strong> Choose whether to include assets, capture responsive designs, and enable browser automation.</li>
          <li><strong>Click "Start Cloning"</strong> and wait 30-60 seconds while we work our magic.</li>
          <li><strong>Download your clone</strong> as a ZIP file containing perfectly organized HTML, CSS, JavaScript, and assets.</li>
          <li><strong>Extract and customize</strong> the code in your favorite code editor. The clone is fully functional and ready for modifications.</li>
        </ol>

        <p className="text-lg leading-relaxed mt-6">
          Advanced users can configure additional options like custom viewport sizes, authentication credentials for protected pages, and selective asset downloading. Our documentation provides detailed guides for every scenario.
        </p>
      </FeatureSection>

      <FeatureFAQ faqs={faqs} />

      <FeatureCTA
        title="Start Cloning Websites Today"
        description="Join thousands of developers and agencies who trust Website Cloner Pro for fast, accurate website cloning."
      />
    </div>
  );
}
