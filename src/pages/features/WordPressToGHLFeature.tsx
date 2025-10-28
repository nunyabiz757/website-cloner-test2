import { Workflow, Check, Zap, RefreshCw, Target, Code2 } from 'lucide-react';
import { FeatureHero } from '../../components/features/FeatureHero';
import { FeatureSection } from '../../components/features/FeatureSection';
import { FeatureCTA } from '../../components/features/FeatureCTA';
import { FeatureFAQ } from '../../components/features/FeatureFAQ';
import { Card } from '../../components/ui/Card';

export function WordPressToGHLFeature() {
  const faqs = [
    {
      question: 'Which WordPress page builders are supported?',
      answer: 'We support Elementor, Divi, Gutenberg (WordPress Block Editor), WPBakery Page Builder, Beaver Builder, and vanilla WordPress themes. Our intelligent detection automatically identifies your builder and applies the appropriate conversion strategy.',
    },
    {
      question: 'Will my WordPress forms work in GoHighLevel?',
      answer: 'WordPress forms are converted to HTML structure, but you\'ll need to reconnect them to GHL\'s form system. GHL forms are powerful and easy to set up, typically taking just a few minutes per form.',
    },
    {
      question: 'How accurate is the conversion?',
      answer: 'Our conversion achieves 85-95% pixel-perfect accuracy. We inline all styles, preserve responsive breakpoints, and maintain layout integrity. Minor adjustments may be needed for complex custom code.',
    },
    {
      question: 'Can I convert entire WordPress sites or just single pages?',
      answer: 'You can convert single pages, entire funnels, or complete websites. For multi-page conversions, each page is processed individually and organized for easy import into GHL.',
    },
    {
      question: 'Do WordPress plugins get converted?',
      answer: 'Plugin visual output (sliders, galleries, etc.) is converted as static HTML/CSS. Plugin functionality requiring server-side processing must be replaced with GHL equivalents or custom code.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <FeatureHero
        icon={Workflow}
        title="WordPress to GoHighLevel Conversion"
        description="Seamlessly convert WordPress websites to GoHighLevel format. Preserve your design while unlocking GHL's powerful marketing automation."
        gradient="from-purple-600 to-pink-600"
      />

      <FeatureSection title="The Challenge of WordPress Migration">
        <p className="text-lg leading-relaxed mb-6">
          GoHighLevel is revolutionizing how agencies manage client relationships, automate marketing, and build sales funnels. However, migrating existing WordPress websites to GHL has traditionally been painful. WordPress and GoHighLevel use fundamentally different architectures—WordPress relies on PHP, MySQL databases, and complex plugin ecosystems, while GHL uses a drag-and-drop page builder with integrated CRM functionality.
        </p>
        <p className="text-lg leading-relaxed mb-6">
          Manual migration requires rebuilding pages element by element in GHL's editor. For agencies managing dozens of clients, this process is prohibitively expensive and time-consuming. A typical WordPress site with 10-15 pages might require 20-40 hours of manual reconstruction. That's where our WordPress to GoHighLevel converter becomes invaluable.
        </p>
        <p className="text-lg leading-relaxed">
          Our converter automates 80-90% of the migration work. We parse WordPress page structure, extract design elements, convert CSS styling to GHL-compatible format, and generate clean HTML ready for import. What once took weeks now happens in minutes. You get a head start on every migration project, allowing you to focus on optimization and client-specific customization rather than tedious reconstruction.
        </p>
      </FeatureSection>

      <FeatureSection title="How the WordPress to GHL Converter Works" className="bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose mb-8">
          <Card className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="text-purple-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">1. WordPress Detection</h3>
            <p className="text-gray-700">
              Enter your WordPress URL. Our system identifies the WordPress version, active theme, page builder, and plugins. We analyze site structure to create an optimized conversion plan.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Code2 className="text-pink-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">2. Element Parsing</h3>
            <p className="text-gray-700">
              We parse your WordPress page structure using builder-specific logic. Elementor sections become GHL sections, Divi rows map to GHL rows, preserving your visual hierarchy.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <RefreshCw className="text-orange-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">3. GHL Conversion</h3>
            <p className="text-gray-700">
              All CSS is inlined for GHL compatibility. Responsive breakpoints, hover states, and animations are preserved. The result is clean, GHL-ready HTML you can import directly.
            </p>
          </Card>
        </div>

        <p className="text-lg leading-relaxed mb-6">
          The conversion process is intelligent and context-aware. When we detect Elementor, we map Elementor sections, columns, and widgets to their GHL equivalents. For Divi, we handle Divi modules, rows, and sections. Gutenberg blocks are converted to semantic HTML structures. This isn't a generic scraper—it's a purpose-built migration engine that understands WordPress architecture.
        </p>
        <p className="text-lg leading-relaxed mb-6">
          We extract computed styles from every element, ensuring pixel-perfect visual accuracy. WordPress themes often use complex CSS inheritance and specificity rules. Our converter resolves all computed styles and inlines them, eliminating stylesheet dependencies. Colors, fonts, spacing, borders, shadows—everything is preserved exactly as it appears on the original WordPress site.
        </p>
        <p className="text-lg leading-relaxed">
          Responsive design is critical for modern websites. We capture mobile, tablet, and desktop breakpoints, converting WordPress media queries into GHL-compatible responsive rules. Your converted site will look perfect on all devices, maintaining the mobile-first design principles your WordPress theme implemented.
        </p>
      </FeatureSection>

      <FeatureSection title="Supported WordPress Page Builders">
        <p className="text-lg leading-relaxed mb-6">
          Our converter supports all major WordPress page builders with specialized parsing logic for each:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
          <div className="border-l-4 border-purple-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Elementor</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The most popular WordPress page builder. We parse Elementor's section → column → widget hierarchy, converting inner sections, container elements, and all Elementor-specific widgets. Custom CSS from Elementor's advanced panel is preserved.
            </p>
          </div>

          <div className="border-l-4 border-pink-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Divi</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Elegant Themes' powerful builder. Our parser handles Divi sections, rows, and modules with specialized logic for Divi's unique class structure. We extract inline styles from Divi's style attribute system and convert them to GHL format.
            </p>
          </div>

          <div className="border-l-4 border-blue-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Gutenberg</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              WordPress's native block editor. We identify block types, extract block attributes, and convert semantic HTML structures. Group blocks, column blocks, and reusable blocks are all supported with proper hierarchy preservation.
            </p>
          </div>

          <div className="border-l-4 border-orange-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">WPBakery & Beaver Builder</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Legacy but widely-used builders. We parse their shortcode-based structures, converting rows, columns, and elements to clean HTML. All custom CSS and JavaScript is extracted and preserved.
            </p>
          </div>
        </div>
      </FeatureSection>

      <FeatureSection title="Step-by-Step Conversion Process" className="bg-gray-50">
        <ol className="space-y-6 text-lg text-gray-700">
          <li>
            <strong className="text-gray-900">Phase 1: Detection & Analysis</strong> - We fetch your WordPress page and analyze its structure. Our detection engine identifies the page builder, theme, plugins, and WordPress version. We calculate complexity scores to predict conversion accuracy and flag potential issues before processing begins.
          </li>
          <li>
            <strong className="text-gray-900">Phase 2: HTML Parsing</strong> - Using builder-specific parsers, we extract every element from your WordPress page. Sections, rows, columns, text blocks, images, buttons, and widgets are identified and cataloged. We build a hierarchical representation of your page structure.
          </li>
          <li>
            <strong className="text-gray-900">Phase 3: Style Extraction</strong> - All CSS is computed and extracted using browser automation. We capture inline styles, stylesheet rules, and JavaScript-generated styling. Hover states, animations, and transitions are preserved. Media queries for responsive design are identified and converted.
          </li>
          <li>
            <strong className="text-gray-900">Phase 4: Asset Processing</strong> - Images, fonts, and other media are downloaded and optimized. Image URLs are updated to work in GHL's hosting environment. Fonts are embedded or linked appropriately for GHL compatibility.
          </li>
          <li>
            <strong className="text-gray-900">Phase 5: GHL Conversion</strong> - Elements are mapped to GHL equivalents. CSS is inlined following GHL's requirements. HTML is cleaned and formatted. We remove WordPress-specific classes and IDs that have no meaning outside WordPress.
          </li>
          <li>
            <strong className="text-gray-900">Phase 6: Quality Validation</strong> - The converted code is validated for GHL compatibility. We test responsive breakpoints, check for broken links, and calculate a conversion quality score. Warnings and recommendations are provided for manual review areas.
          </li>
        </ol>

        <p className="text-lg leading-relaxed mt-6">
          The entire process takes 60-120 seconds for typical pages. Complex pages with hundreds of elements may take 2-3 minutes. You'll receive a detailed conversion report showing success rate, elements converted, warnings, and recommended next steps.
        </p>
      </FeatureSection>

      <FeatureSection title="Benefits for Marketing Agencies">
        <p className="text-lg leading-relaxed mb-6">
          Marketing agencies are our primary users, and for good reason. The WordPress to GHL converter delivers massive ROI:
        </p>

        <div className="space-y-6">
          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Reduce Migration Costs by 80%</h3>
              <p className="text-gray-700 leading-relaxed">
                Manual WordPress to GHL migrations cost agencies $2,000-$5,000 per client in labor. Our converter reduces that to $400-$1,000, dramatically improving project profitability. You can pass savings to clients or increase margins—either way, you win.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Close More GHL Migration Deals</h3>
              <p className="text-gray-700 leading-relaxed">
                Offer WordPress to GHL migration as a service. With our converter, you can confidently quote aggressive timelines and competitive pricing. Land clients who might otherwise stick with WordPress due to migration concerns.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Scale Your Agency Operations</h3>
              <p className="text-gray-700 leading-relaxed">
                Without automation, migration capacity is limited by developer hours. Our converter removes that bottleneck. Process multiple client migrations simultaneously. Junior team members can handle imports, freeing senior developers for strategic work.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Improve Client Satisfaction</h3>
              <p className="text-gray-700 leading-relaxed">
                Fast migrations mean happier clients. Instead of month-long projects, deliver fully migrated sites in days. Clients see their familiar design live in GHL quickly, building confidence in the transition. First impressions matter—nail them with our converter.
              </p>
            </div>
          </div>
        </div>
      </FeatureSection>

      <FeatureSection title="Real-World Applications & Use Cases" className="bg-gray-50">
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Full Website Migrations</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              Converting entire WordPress websites to GHL is our most common use case. Agencies use our tool to migrate client sites from WordPress hosting to GHL's all-in-one platform. The value proposition for clients is compelling: eliminate separate CRM, email marketing, and funnel builder subscriptions by consolidating everything in GHL. Our converter makes the technical migration painless, allowing you to focus on demonstrating GHL's superior marketing automation.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Landing Page Conversions</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              Many businesses run marketing campaigns on WordPress while managing their CRM in GHL. This creates data silos and workflow friction. Convert your high-performing WordPress landing pages to GHL, enabling native integration with GHL's form builder, pipeline management, and automation workflows. Track leads from first touch to closed deal without leaving GHL's ecosystem.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Template Library Creation</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              Build a library of GHL templates by converting proven WordPress designs. Find high-converting WordPress themes in your industry, convert them to GHL, and customize for your clients. This creates reusable assets that accelerate future projects. Instead of starting from blank GHL pages every time, you have a professionally designed template library.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Client Onboarding Acceleration</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              When prospects come to you with existing WordPress sites, conversion friction often kills deals. "How long will migration take?" "Will my site look the same?" These questions create hesitation. With our converter, you confidently answer "Your site will be migrated in 48 hours and look identical." This removes objections and accelerates your sales cycle. Demo the converter during sales calls—show prospects their site converted to GHL in real-time.
            </p>
          </div>
        </div>
      </FeatureSection>

      <FeatureFAQ faqs={faqs} />

      <FeatureCTA
        title="Start Converting WordPress Sites to GHL"
        description="Join hundreds of agencies using our converter to deliver faster, more profitable WordPress migrations."
      />
    </div>
  );
}
