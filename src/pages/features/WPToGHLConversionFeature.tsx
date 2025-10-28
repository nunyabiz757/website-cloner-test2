import { RefreshCw, Check, Rocket, Layout, Code, Gauge } from 'lucide-react';
import { FeatureHero } from '../../components/features/FeatureHero';
import { FeatureSection } from '../../components/features/FeatureSection';
import { FeatureCTA } from '../../components/features/FeatureCTA';
import { FeatureFAQ } from '../../components/features/FeatureFAQ';
import { Card } from '../../components/ui/Card';

export function WPToGHLConversionFeature() {
  const faqs = [
    {
      question: 'Will my WordPress plugins and functionality work after conversion to GHL?',
      answer: 'WordPress plugins are PHP-based and cannot run in GHL, which is a different platform. However, we identify plugin functionality and replicate it using GHL native features or JavaScript alternatives. Contact forms become GHL forms, calendars become GHL calendars, and many features have GHL equivalents. Custom functionality may require custom code implementation in GHL.',
    },
    {
      question: 'How are WordPress dynamic elements like blog posts handled?',
      answer: 'WordPress blog posts and dynamic content are converted to static pages in GHL. Each blog post becomes an individual GHL page with preserved content, images, and formatting. For clients requiring ongoing blogging, we recommend maintaining WordPress for the blog and linking to it from the GHL site, or using third-party blog platforms integrated with GHL.',
    },
    {
      question: 'Can WooCommerce stores be converted to GHL?',
      answer: 'Basic WooCommerce product pages can be converted to GHL pages, but GHL is not a full e-commerce platform like WooCommerce. For simple product sales (1-10 products), we can recreate product pages and integrate GHL payment forms with Stripe. For complex stores with inventory management, shipping calculations, and hundreds of products, we recommend keeping WooCommerce or migrating to dedicated e-commerce platforms like Shopify.',
    },
    {
      question: 'What happens to my WordPress SEO during conversion?',
      answer: 'All meta tags, title tags, meta descriptions, heading structure, and alt text are preserved during conversion, maintaining SEO value. We generate 301 redirect maps to redirect old WordPress URLs to new GHL URLs, preventing broken links and preserving search rankings. Schema markup is converted when possible. You should update your Google Search Console with the new GHL URLs after migration.',
    },
    {
      question: 'How long does a typical WordPress to GHL conversion take?',
      answer: 'Simple WordPress sites (5-10 pages) convert in 5-10 minutes. Medium sites (20-30 pages) take 15-30 minutes. Large sites (50+ pages) may take 1-2 hours. Complex sites with extensive custom functionality, membership areas, or e-commerce require additional manual development time after initial conversion. We provide time estimates based on site analysis before starting the conversion.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <FeatureHero
        icon={RefreshCw}
        title="WordPress to GHL Conversion"
        description="Seamlessly migrate WordPress websites to GoHighLevel. Convert WP pages, posts, forms, and functionality to native GHL format while preserving design and SEO."
        gradient="from-blue-600 to-cyan-600"
      />

      <FeatureSection title="Why Migrate from WordPress to GoHighLevel">
        <p className="text-lg leading-relaxed mb-6">
          WordPress powers 43% of all websites globally, making it the world's most popular content management system. However, for digital marketing agencies and service businesses, WordPress presents significant operational challenges. WordPress requires constant maintenance—weekly plugin updates, monthly core updates, security patches, compatibility testing, and backup management. A single plugin conflict can break your entire site. Security vulnerabilities in outdated plugins expose sites to hacking, malware, and data breaches. Hosting costs escalate as traffic grows, requiring managed WordPress hosting at $50-$300+ monthly for good performance.
        </p>
        <p className="text-lg leading-relaxed mb-6">
          GoHighLevel eliminates these WordPress pain points by providing an all-in-one platform combining website hosting, CRM, email marketing, SMS, calendars, funnels, and automation. No plugin management, no security updates, no hosting headaches. Everything is maintained by GHL, allowing agencies to focus on client results instead of technical maintenance. GHL's page builder is optimized for conversion-focused marketing pages and funnels, not blog-heavy content sites. For agencies building lead generation funnels, sales pages, landing pages, and appointment booking sites, GHL is purpose-built for these use cases.
        </p>
        <p className="text-lg leading-relaxed">
          However, migrating from WordPress to GHL presents a significant challenge. WordPress sites are built with PHP, MySQL databases, and complex theme/plugin architectures. GHL uses a proprietary page builder with different structure and capabilities. Manually rebuilding a WordPress site in GHL takes 8-20 hours depending on complexity—analyzing the WordPress design, recreating pages in GHL's builder, rebuilding forms and functionality, and testing everything. Our WordPress to GHL Conversion tool automates this migration, extracting your WordPress site's design, content, and functionality, then intelligently converting it to GHL-compatible format. What used to take days now takes minutes, enabling agencies to migrate clients from WordPress to GHL efficiently and profitably.
        </p>
      </FeatureSection>

      <FeatureSection title="How WordPress to GHL Conversion Works" className="bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose mb-8">
          <Card className="p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Layout className="text-blue-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">1. WordPress Extraction</h3>
            <p className="text-gray-700">
              Our tool analyzes your WordPress site, extracting all pages, posts, images, content, forms, menus, and custom CSS. We identify the active theme, plugins providing functionality, and custom code requiring conversion.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
              <Code className="text-cyan-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">2. Intelligent Conversion</h3>
            <p className="text-gray-700">
              WordPress HTML is transformed into GHL-compatible format. Contact forms become GHL forms, calendar plugins become GHL calendars, and custom functionality is replicated using GHL features or custom JavaScript where needed.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Rocket className="text-green-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">3. GHL Deployment</h3>
            <p className="text-gray-700">
              Converted pages are deployed to your GHL sub-account as fully functional pages. Forms are connected to GHL CRM, tracking codes are configured, and 301 redirects are generated to preserve SEO from WordPress URLs.
            </p>
          </Card>
        </div>

        <p className="text-lg leading-relaxed mb-6">
          The conversion process starts with comprehensive WordPress site analysis. You provide your WordPress site URL, and our crawler performs a deep scan identifying all pages, posts, and custom post types. We extract the complete site structure including navigation menus, page hierarchy (parent/child relationships), and internal linking patterns. The HTML for each page is downloaded along with all CSS stylesheets, JavaScript files, and media assets (images, videos, PDFs). We also identify active plugins and attempt to determine what functionality they provide—forms, calendars, sliders, galleries, popups, etc.
        </p>
        <p className="text-lg leading-relaxed mb-6">
          Intelligent conversion translates WordPress-specific elements to GHL equivalents. WordPress's block editor (Gutenberg) creates deeply nested HTML with WordPress-specific CSS classes. We flatten this structure, removing WordPress bloat and converting it to clean, semantic HTML compatible with GHL. Contact Form 7, WPForms, Gravity Forms, and other WordPress form plugins are converted to GHL native forms with field mapping preserved—name fields remain name fields, email becomes email, phone becomes phone, maintaining proper field types and validation. Calendar plugins like Calendly embeds or custom WordPress calendar implementations are replaced with GHL's native calendar booking widgets.
        </p>
        <p className="text-lg leading-relaxed">
          SEO preservation is critical during migration. We extract all Yoast SEO, Rank Math, or All in One SEO metadata including title tags, meta descriptions, Open Graph tags, and schema markup. This metadata is converted to GHL's custom code section, ensuring search engines see the same SEO information post-migration. We generate comprehensive 301 redirect maps showing every WordPress URL and its corresponding GHL URL. These redirects are implemented via your domain's DNS settings or hosting provider, ensuring visitors and search engines are seamlessly redirected from old WordPress URLs to new GHL pages without encountering 404 errors.
        </p>
      </FeatureSection>

      <FeatureSection title="WordPress Elements We Convert">
        <p className="text-lg leading-relaxed mb-6">
          Our conversion engine handles the most common WordPress elements and plugins, translating them to GHL-compatible implementations:
        </p>

        <div className="space-y-6">
          <div className="border-l-4 border-blue-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Pages & Posts</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              All WordPress pages and blog posts are converted to GHL pages with content, images, headings, and formatting preserved. Page hierarchy (parent/child pages) is maintained. Blog posts become individual GHL pages organized by category if needed. Custom post types (portfolios, testimonials, case studies) are also converted. We preserve featured images, post excerpts, and custom fields where applicable.
            </p>
          </div>

          <div className="border-l-4 border-cyan-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Contact Forms</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Contact Form 7, WPForms, Gravity Forms, Ninja Forms, and Elementor forms are converted to GHL native forms. Field mappings are intelligently matched—name, email, phone, message, dropdown selections, checkboxes, and radio buttons all convert with proper field types. Form submissions automatically flow into the GHL CRM with contact records created. Email notifications configured in WordPress forms are replicated using GHL's workflow automation.
            </p>
          </div>

          <div className="border-l-4 border-purple-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Navigation Menus</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              WordPress navigation menus are converted to GHL's navigation system. Primary menus, footer menus, and sidebar menus are all extracted and recreated. Menu item structure, including dropdown menus and multi-level navigation, is preserved. Custom menu items linking to external URLs, anchor links, or downloadable files are maintained. We ensure consistent navigation across all converted pages.
            </p>
          </div>

          <div className="border-l-4 border-green-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Images & Media</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              All images are downloaded from WordPress media library and re-uploaded to GHL. Image optimization is applied automatically, reducing file sizes by 50-70% without visible quality loss. Alt text, titles, and captions are preserved for SEO. Background images in CSS are updated to reference GHL-hosted versions. Image galleries created with WordPress plugins or Gutenberg blocks are converted to GHL-compatible gallery layouts.
            </p>
          </div>

          <div className="border-l-4 border-orange-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Custom CSS & JavaScript</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Custom CSS added to WordPress themes or via customizer/child themes is extracted and added to GHL's custom code section. JavaScript added via theme functions or plugin settings is similarly migrated. We clean up WordPress-specific CSS selectors and update them to work with GHL's page structure. Third-party JavaScript integrations (analytics, chatbots, tracking pixels) are identified and reconfigured for GHL deployment.
            </p>
          </div>

          <div className="border-l-4 border-red-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">SEO Metadata & Schema</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              SEO plugins like Yoast, Rank Math, and All in One SEO store metadata in WordPress databases. We extract title tags, meta descriptions, canonical URLs, Open Graph tags (Facebook), Twitter Card tags, and schema.org structured data (LocalBusiness, Organization, Article, Product schemas). All this metadata is converted to GHL's custom code and page settings, ensuring search engines see identical SEO information before and after migration.
            </p>
          </div>

          <div className="border-l-4 border-yellow-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Page Builders (Elementor, Divi, WPBakery)</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              WordPress page builders create complex layouts with sections, columns, and widgets. We parse Elementor, Divi, Beaver Builder, and WPBakery page builder structures, converting them to equivalent GHL layouts. Section backgrounds, column structures, spacing, and responsive settings are preserved. Widgets like buttons, icons, testimonials, pricing tables, and counters are converted to GHL elements or custom HTML/CSS implementations that replicate the same visual appearance.
            </p>
          </div>
        </div>
      </FeatureSection>

      <FeatureSection title="Benefits of Converting WordPress to GHL" className="bg-gray-50">
        <p className="text-lg leading-relaxed mb-6">
          Migrating from WordPress to GHL delivers compelling benefits for agencies and clients:
        </p>

        <div className="space-y-6">
          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Eliminate WordPress Maintenance Overhead</h3>
              <p className="text-gray-700 leading-relaxed">
                WordPress requires constant maintenance—updating 20+ plugins monthly, testing compatibility, fixing conflicts, managing security vulnerabilities, backing up databases, optimizing MySQL, and monitoring uptime. For agencies managing 50-100 client WordPress sites, this maintenance burden consumes 40-80 hours monthly. Migrating to GHL eliminates this entirely. GHL handles all infrastructure, security, updates, and backups. Your team reclaims 40-80 hours per month previously spent on WordPress maintenance, reallocating that time to revenue-generating activities.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Consolidate Marketing Stack</h3>
              <p className="text-gray-700 leading-relaxed">
                Typical WordPress marketing setups require multiple tools: WordPress for the website, Mailchimp for email, Calendly for scheduling, Zapier for automation, ActiveCampaign for CRM, and Stripe for payments. Each tool has separate login credentials, separate billing, and requires integration maintenance. GHL consolidates all these tools into one platform. Website, CRM, email/SMS marketing, calendar booking, workflow automation, and payments all in one system with unified reporting. Clients save $200-$500 monthly consolidating multiple tool subscriptions into GHL's all-in-one pricing.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Improved Page Speed & Performance</h3>
              <p className="text-gray-700 leading-relaxed">
                WordPress sites often suffer from slow load times due to plugin bloat, unoptimized themes, and shared hosting limitations. A typical WordPress site with 15 plugins loads in 4-8 seconds. GHL pages, built on optimized infrastructure with minimal overhead, load in 1-2 seconds. Faster page speed improves user experience, reduces bounce rates, increases conversions, and improves SEO rankings. Google's Core Web Vitals favor fast sites—GHL sites consistently score higher than WordPress equivalents.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enhanced Security & Reliability</h3>
              <p className="text-gray-700 leading-relaxed">
                WordPress security is a constant concern. Outdated plugins are the primary attack vector—hackers scan for known vulnerabilities in popular plugins like Contact Form 7, Yoast SEO, and WooCommerce. One unpatched plugin can compromise your entire site, leading to malware infections, data breaches, or complete site takeovers. GHL's closed platform eliminates these risks. No plugins to update, no vulnerable PHP code, no database injection risks. GHL handles all security patches and infrastructure hardening, providing enterprise-grade security for all customers.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Native CRM Integration for Lead Management</h3>
              <p className="text-gray-700 leading-relaxed">
                WordPress form submissions typically go to email or third-party CRMs via Zapier. This creates friction—manually copying leads from email to CRM, or paying for Zapier automation. GHL forms automatically create CRM contact records, trigger workflows, send automated follow-up emails/SMS, assign leads to team members, and track the entire customer journey from form submission to sale. This native integration eliminates data silos and improves lead conversion rates by 20-40% through faster, automated follow-up.
              </p>
            </div>
          </div>
        </div>
      </FeatureSection>

      <FeatureSection title="Real-World WordPress to GHL Migrations">
        <p className="text-lg leading-relaxed mb-6">
          Agencies and businesses across industries have successfully migrated from WordPress to GHL using our conversion tool:
        </p>

        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Local Service Business Migration</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              A plumbing company had a 15-page WordPress site built with Elementor, including service pages, contact forms, blog posts, and a booking calendar. Their WordPress site cost $150/month for managed hosting, plus $50/month for email marketing (Mailchimp), $20/month for calendar booking (Calendly), and $30/month for CRM (HubSpot free tier with paid add-ons). Total monthly cost: $250. The site was also slow (5.2 second load time) and required monthly maintenance.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              The agency converted the WordPress site to GHL in one afternoon using our tool. All 15 pages were converted with design preserved. Elementor contact forms became GHL forms flowing into GHL CRM. The blog was migrated to GHL pages. Calendly was replaced with GHL's native calendar. After migration, the client had one platform ($297/month for GHL) replacing four separate tools ($250/month), simplifying operations. Page load time improved from 5.2 seconds to 1.8 seconds. Lead conversion improved 28% due to faster load times and automated GHL follow-up workflows. The client saved 15 hours monthly previously spent managing WordPress updates and plugin conflicts.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Agency Client Portfolio Migration</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              A digital marketing agency managed WordPress sites for 25 clients across various industries. Each client site required 2-3 hours monthly maintenance (plugin updates, security patches, backups, troubleshooting). Total monthly maintenance: 50-75 hours. The agency charged some clients for maintenance but ate the cost for others, reducing profitability. WordPress hosting costs ($30-$150 per client) and maintenance burden limited scalability.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              The agency strategically migrated all 25 clients from WordPress to GHL over six months, converting 4-5 sites monthly using our tool. Each conversion took 2-4 hours including testing and client review. After migration, monthly maintenance dropped from 50-75 hours to nearly zero—GHL handled all updates and infrastructure. The agency repositioned the migration as a service upgrade, charging clients $1,500-$3,000 per migration. Total migration revenue: $37,500-$75,000. Ongoing GHL subscriptions at $297/month per client generated $7,425 monthly recurring revenue. The agency eliminated $750-$3,750 in monthly WordPress hosting costs across all clients, passing some savings to clients and pocketing the rest as increased margin.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Membership Site Conversion</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              An online coach ran a membership site on WordPress using MemberPress for content protection, WooCommerce for payments, and various plugins for quizzes, forums, and progress tracking. The site had 200+ members paying $97/month. WordPress infrastructure costs were high ($400/month managed hosting), and plugin conflicts caused frequent downtime, frustrating members. The coach spent 10-15 hours monthly troubleshooting WordPress issues instead of creating content.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Converting to GHL required both automated conversion and custom development. Our tool converted the public marketing pages (sales page, about page, blog) automatically. The membership area required custom implementation using GHL's membership features and custom code. Total conversion time: 20 hours (2 hours automated conversion, 18 hours custom membership development). Post-migration, the coach consolidated WordPress, MemberPress, WooCommerce, and email marketing into GHL ($297/month), saving $500+ monthly. Member churn decreased 15% due to improved site reliability and faster performance. The coach reclaimed 10-15 hours monthly, allowing more content creation and member engagement, further improving retention and enabling a price increase from $97 to $127 monthly.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Multi-Location Franchise Standardization</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              A fitness franchise with 40 locations had inconsistent web presence—some franchisees used WordPress, others used Wix, some used custom-built sites. Each location managed their own site with varying quality, branding inconsistencies, and different lead capture processes. The franchisor wanted standardization but lacked the budget to custom-build 40 websites.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              The franchisor selected their best-performing location's WordPress site as the template. Using our WordPress to GHL conversion tool, they converted this site to GHL, then cloned it 40 times (one per location) using our GHL to GHL cloning feature. Each clone was customized with location-specific branding (franchisee name, address, phone, local images) using bulk variable replacement. All 40 locations went live on identical, high-converting GHL funnels within two weeks. Franchise-wide lead volume increased 65% due to standardized, optimized funnels. The franchisor now manages all 40 sites from a central GHL agency account, ensuring brand consistency and allowing rapid deployment of promotions and updates across all locations simultaneously.
            </p>
          </div>
        </div>
      </FeatureSection>

      <FeatureFAQ faqs={faqs} />

      <FeatureCTA
        title="Start Converting WordPress Sites to GHL"
        description="Join agencies using our WordPress to GHL conversion tool to migrate clients faster and eliminate WordPress maintenance overhead."
      />
    </div>
  );
}
