import { Cpu, Check, Layers, Code, Database, Cloud } from 'lucide-react';
import { FeatureHero } from '../../components/features/FeatureHero';
import { FeatureSection } from '../../components/features/FeatureSection';
import { FeatureCTA } from '../../components/features/FeatureCTA';
import { FeatureFAQ } from '../../components/features/FeatureFAQ';
import { Card } from '../../components/ui/Card';

export function TechnologyDetectionFeature() {
  const faqs = [
    {
      question: 'How accurate is technology detection compared to tools like Wappalyzer or BuiltWith?',
      answer: 'Our detection engine achieves 90-95% accuracy for common technologies, comparable to premium tools. We use multiple detection methods: signature matching, header analysis, DOM inspection, and behavioral fingerprinting. For mainstream technologies (React, WordPress, Shopify, jQuery, etc.), accuracy is near 100%. For obscure or heavily customized implementations, detection may be less certain, so we provide confidence scores for each technology identified.',
    },
    {
      question: 'Can technology detection identify custom or proprietary frameworks?',
      answer: 'Custom frameworks without public signatures are difficult to identify precisely, but we can often detect characteristics. For example, we might not identify "AcmeCompany Internal Framework v2.1" specifically, but we can identify it as "Custom React-based framework" by analyzing patterns. We also detect underlying technologies even if wrapped in custom abstractions—React apps are identifiable even with custom build tools.',
    },
    {
      question: 'Does technology detection work on single-page applications (SPAs)?',
      answer: 'Yes. SPAs require special detection techniques since content is JavaScript-rendered. We use headless browser automation to execute JavaScript, allowing detection of client-side frameworks like React, Vue, and Angular. We identify state management libraries (Redux, Vuex, MobX), routing implementations, and build tools used to create the bundle. Detection typically takes 10-20 seconds longer for SPAs than static sites.',
    },
    {
      question: 'What information does technology detection provide about each technology?',
      answer: 'For each detected technology, we provide: technology name, version number (when detectable), category (CMS, framework, library, etc.), official website link, confidence score (0-100%), and detected location (headers, HTML, JavaScript, etc.). For libraries with known versions, we cross-reference against vulnerability databases and flag outdated versions with security issues.',
    },
    {
      question: 'Can I use technology detection for competitive research?',
      answer: 'Absolutely. Many agencies use our technology detection to analyze competitor websites, understanding tech stacks before pitching migration or optimization services. For example, identify competitors using outdated WordPress versions or underperforming hosting, then demonstrate how your solutions are superior. Technology intelligence informs sales strategy and competitive positioning.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <FeatureHero
        icon={Cpu}
        title="Technology Detection & Stack Analysis"
        description="Automatically identify all technologies powering any website. Detect CMS platforms, frameworks, libraries, hosting, CDNs, and third-party integrations."
        gradient="from-indigo-600 to-purple-600"
      />

      <FeatureSection title="Why Technology Detection Matters">
        <p className="text-lg leading-relaxed mb-6">
          Understanding a website's technology stack is fundamental to effective web development, migration planning, and competitive analysis. Before cloning a website, you need to know what technologies it uses—the content management system, JavaScript frameworks, CSS preprocessors, hosting infrastructure, analytics tools, and third-party integrations. This intelligence informs migration strategy, identifies potential compatibility issues, and reveals optimization opportunities.
        </p>
        <p className="text-lg leading-relaxed mb-6">
          Manual technology identification is time-consuming and error-prone. WordPress sites might use custom themes that obscure identification. React applications may be server-rendered, making framework detection non-obvious. Multiple JavaScript libraries might be bundled and minified into a single file. CDN usage might mask the actual hosting provider. HTTP headers might be stripped by proxies. Accurate technology detection requires analyzing dozens of signals across headers, HTML structure, JavaScript behavior, CSS patterns, and network requests.
        </p>
        <p className="text-lg leading-relaxed">
          Our Technology Detection feature automates this analysis, identifying technologies in seconds that would take hours to discover manually. We detect over 1,500 different technologies across 70+ categories including content management systems, JavaScript frameworks, server-side languages, databases, hosting providers, CDN services, analytics platforms, advertising networks, payment processors, email services, and more. Each detection includes version information, confidence scores, and relevant technical details to inform your cloning strategy.
        </p>
      </FeatureSection>

      <FeatureSection title="How Technology Detection Works" className="bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose mb-8">
          <Card className="p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Code className="text-indigo-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">1. Signature Matching</h3>
            <p className="text-gray-700">
              We maintain a database of technology signatures—unique patterns that identify specific frameworks, libraries, and platforms. HTML meta tags, JavaScript global variables, CSS class patterns, and file paths are matched against known signatures.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Database className="text-purple-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">2. Header Analysis</h3>
            <p className="text-gray-700">
              HTTP response headers reveal server technologies, programming languages, and middleware. We analyze headers like X-Powered-By, Server, X-Generator, and custom headers that identify CDNs, hosting providers, and application frameworks.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Cloud className="text-pink-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">3. Behavioral Detection</h3>
            <p className="text-gray-700">
              JavaScript execution patterns, API endpoint structures, cookie naming conventions, and DOM manipulation behaviors fingerprint specific technologies. React, Vue, and Angular each have distinct runtime characteristics we can identify.
            </p>
          </Card>
        </div>

        <p className="text-lg leading-relaxed mb-6">
          Technology detection runs as the first step in the cloning process, analyzing the source website to build a comprehensive technology profile. This profile guides subsequent cloning decisions—WordPress-specific parsers are used for WordPress sites, React hydration is handled differently than traditional page rendering, and CDN asset URLs are rewritten appropriately based on detected CDN provider.
        </p>
        <p className="text-lg leading-relaxed mb-6">
          Our detection engine uses a multi-stage approach combining multiple detection techniques for maximum accuracy. Stage one analyzes HTTP headers from the initial page request, extracting server information, security headers, caching directives, and custom headers. Common headers like "X-Powered-By: PHP/7.4.3" immediately reveal PHP usage and version. "Server: nginx" identifies the web server. Cloudflare, Fastly, and other CDNs add identifying headers we recognize.
        </p>
        <p className="text-lg leading-relaxed">
          Stage two performs static HTML analysis, parsing the downloaded page for technology signatures. WordPress sites include meta tags like "generator" indicating WordPress and version. JavaScript frameworks often inject data attributes or class names we can detect—React apps typically have a div with id="root", Vue apps use data-v- attributes, Angular uses ng- directives. CSS frameworks like Bootstrap, Tailwind, and Foundation have distinctive class naming patterns. We catalog script and stylesheet URLs, which often contain library names and versions (jquery-3.6.0.min.js explicitly identifies jQuery 3.6.0).
        </p>
      </FeatureSection>

      <FeatureSection title="Technology Categories We Detect">
        <p className="text-lg leading-relaxed mb-6">
          Our detection covers every layer of the modern web stack. Here are the major categories and examples of technologies we identify:
        </p>

        <div className="space-y-6">
          <div className="border-l-4 border-indigo-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Content Management Systems (CMS)</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We detect all major CMS platforms including WordPress (and identify active theme and plugins), Drupal, Joomla, Magento, Shopify, Wix, Squarespace, Webflow, Ghost, Contentful, Strapi, and dozens of others. Version detection is particularly important for WordPress—knowing whether a site runs WordPress 5.x vs 6.x informs migration compatibility. We also identify WordPress page builders (Elementor, Divi, Gutenberg, WPBakery, Beaver Builder) which require specialized parsing logic during cloning.
            </p>
          </div>

          <div className="border-l-4 border-purple-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">JavaScript Frameworks & Libraries</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Modern websites rely heavily on JavaScript. We detect frontend frameworks (React, Vue.js, Angular, Svelte, Solid, Preact), state management (Redux, Vuex, MobX, Zustand, Recoil), UI component libraries (Material-UI, Ant Design, Chakra UI, Bootstrap React), utility libraries (Lodash, Underscore, Ramda), and legacy libraries (jQuery, Prototype, MooTools). For React applications, we can often identify whether Next.js, Gatsby, or Create React App was used as the build tool. Framework detection is critical because cloning a React SPA requires different strategies than cloning a traditional multi-page site.
            </p>
          </div>

          <div className="border-l-4 border-pink-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Server-Side Technologies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We identify backend languages and frameworks through headers, cookie patterns, and URL structures. Detectable technologies include PHP (and frameworks like Laravel, Symfony, CodeIgniter), Python (Django, Flask, FastAPI), Ruby (Rails, Sinatra), Node.js (Express, NestJS, Fastify), Java (Spring, Jakarta EE), .NET (ASP.NET, ASP.NET Core), and Go frameworks. Server-side detection helps predict API endpoint structures and form handling behavior, important for maintaining functionality in cloned sites.
            </p>
          </div>

          <div className="border-l-4 border-blue-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Hosting Providers & Infrastructure</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Hosting infrastructure significantly impacts website performance and cloning approach. We identify hosting providers (AWS, Google Cloud, Azure, DigitalOcean, Vercel, Netlify, Heroku, WP Engine, Kinsta, SiteGround, Bluehost) through IP address analysis, DNS records, and provider-specific headers. Cloud function platforms (AWS Lambda, Google Cloud Functions, Azure Functions, Cloudflare Workers) are detected through edge computing patterns. Hosting identification helps set performance expectations—sites on premium managed WordPress hosting typically perform better than shared hosting equivalents.
            </p>
          </div>

          <div className="border-l-4 border-green-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">CDN & Caching Services</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Content Delivery Networks accelerate global content delivery. We detect Cloudflare, Fastly, CloudFront (AWS), Azure CDN, KeyCDN, StackPath, BunnyCDN, and others through headers, IP ranges, and DNS CNAME records. CDN detection is important for cloning because asset URLs might point to CDN domains instead of origin servers. We also identify caching layers like Varnish, Redis, Memcached through headers and response characteristics. Understanding caching configuration helps explain performance characteristics of the source site.
            </p>
          </div>

          <div className="border-l-4 border-yellow-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics & Tracking Technologies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Websites use numerous analytics and tracking tools. We detect Google Analytics (Universal Analytics and GA4), Adobe Analytics, Matomo, Mixpanel, Amplitude, Segment, Heap, Hotjar, Crazy Egg, FullStory, session recording tools, heatmap tools, and A/B testing platforms (Optimizely, VWO, Google Optimize). Analytics detection helps preserve tracking during migration—you'll know which tracking codes need to be reconfigured in the cloned site. We also detect tag managers (Google Tag Manager, Adobe Launch, Tealium) which aggregate multiple tracking scripts.
            </p>
          </div>

          <div className="border-l-4 border-orange-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">E-Commerce & Payment Platforms</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              E-commerce sites require special handling during cloning. We detect e-commerce platforms (Shopify, WooCommerce, Magento, BigCommerce, PrestaShop, OpenCart, Wix eCommerce) and payment processors (Stripe, PayPal, Square, Braintree, Authorize.net, Klarna, Afterpay). Shopping cart implementations, checkout flows, and payment forms often require custom cloning logic. Detection also identifies cart abandonment tools, product recommendation engines, and inventory management integrations. For agencies migrating e-commerce sites, comprehensive technology detection ensures no critical integrations are overlooked.
            </p>
          </div>

          <div className="border-l-4 border-red-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Third-Party Integrations & Widgets</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Modern websites integrate numerous third-party services. We detect chat widgets (Intercom, Drift, Zendesk Chat, LiveChat, Tidio), email marketing tools (Mailchimp, Klaviyo, Constant Contact, SendGrid), CRM platforms (HubSpot, Salesforce, Zoho), social media widgets (Facebook Like buttons, Twitter feeds, Instagram embeds), video players (YouTube, Vimeo, Wistia, Vidyard), map services (Google Maps, Mapbox, OpenStreetMap), and booking systems (Calendly, Acuity, Booksy). Integration detection ensures cloned sites maintain functionality—you'll know which third-party services need API keys or configuration in the new environment.
            </p>
          </div>
        </div>
      </FeatureSection>

      <FeatureSection title="Technology Report & Strategic Insights" className="bg-gray-50">
        <p className="text-lg leading-relaxed mb-6">
          Technology detection generates comprehensive reports providing strategic insights beyond simple technology lists. Here's what you receive:
        </p>

        <div className="space-y-6">
          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Technology Inventory</h3>
              <p className="text-gray-700 leading-relaxed">
                A categorized list of every detected technology with name, version, category, confidence score, and description. Technologies are grouped by category (CMS, frontend framework, analytics, etc.) for easy review. Each entry includes a link to official documentation, helping developers quickly learn about unfamiliar technologies. Version information is highlighted when outdated versions with security vulnerabilities are detected, enabling proactive security recommendations to clients.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Stack Complexity Score</h3>
              <p className="text-gray-700 leading-relaxed">
                A numerical score (0-100) indicating technology stack complexity. Simple static sites with basic HTML/CSS/jQuery score low (10-30). Modern SPAs with React, Redux, TypeScript, and multiple integrations score higher (50-70). Extremely complex sites with microservices, multiple frameworks, and dozens of integrations score highest (70-100). Complexity scores help estimate clone difficulty and inform project pricing—complex stacks require more development time and testing.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Compatibility Analysis</h3>
              <p className="text-gray-700 leading-relaxed">
                Automated assessment of technology compatibility and potential conflicts. For example, if jQuery 1.x and React are both detected, we flag potential conflicts since they shouldn't typically coexist. If multiple analytics platforms are found, we note potential duplication. If outdated frameworks are detected alongside modern ones, we identify migration opportunities. Compatibility analysis surfaces issues that might cause problems during cloning or operation of the cloned site.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Modernization Opportunities</h3>
              <p className="text-gray-700 leading-relaxed">
                Recommendations for technology upgrades and modernization. If jQuery 1.x is detected, we recommend upgrading to jQuery 3.x or migrating to vanilla JavaScript. If PHP 5.x is detected, we note it's end-of-life and recommend PHP 8.x. If obsolete libraries like Moment.js are found, we suggest modern alternatives like date-fns or Luxon. For clients considering platform migrations, modernization recommendations justify additional services and improve site performance, security, and maintainability.
              </p>
            </div>
          </div>
        </div>
      </FeatureSection>

      <FeatureSection title="Real-World Applications of Technology Detection">
        <p className="text-lg leading-relaxed mb-6">
          Technology detection delivers strategic value across multiple use cases. Here are scenarios where technology intelligence drove business results:
        </p>

        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Competitive Analysis for Agency Prospecting</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              A web design agency targeted local businesses with outdated websites for redesign services. They used our technology detection to analyze 200 competitor client websites, identifying those running WordPress 4.x (severely outdated), using jQuery 1.x, or lacking mobile optimization. These insights informed targeted sales outreach.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              The agency created customized sales presentations for each prospect, showing exactly which outdated technologies their current website used and explaining security risks and performance problems. They demonstrated technology detection live during sales calls, generating instant credibility. This data-driven approach increased their close rate from 12% to 31%, and average project value increased because clients understood the technical debt they were carrying. The agency closed 18 redesign projects worth $247,000 in six months using technology intelligence for prospecting.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">E-Commerce Platform Migration Planning</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              An online retailer running a custom PHP e-commerce platform wanted to migrate to Shopify. Technology detection revealed the custom platform used 47 different technologies and integrations including Authorize.net payment processing, Mailchimp email marketing, Zendesk support, custom inventory management API, Avalara tax calculation, ShipStation fulfillment, and Google Analytics with custom e-commerce tracking.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              The comprehensive technology inventory became the migration project roadmap. Each integration was evaluated for Shopify compatibility—some had native Shopify apps, others required custom development, and a few needed complete replacement. The technology report prevented the common migration mistake of discovering critical integrations mid-project. The agency accurately estimated migration complexity and cost, quoted $78,000 for 16 weeks of work, and delivered on time and on budget. Without technology detection, they estimate they would have underbid by 30% and missed several integrations, causing delays and scope creep.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Security Audit for Financial Services Client</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              A financial advisory firm needed security assessment of their client portal before launching a major marketing campaign. Technology detection identified their site ran WordPress 5.2 (two years outdated), PHP 7.2 (end-of-life), jQuery 1.12.4 (five years old with known XSS vulnerabilities), and 12 WordPress plugins with critical security updates available.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              The technology report became the basis for a comprehensive security remediation project. The agency updated WordPress to 6.3, upgraded PHP to 8.1, replaced jQuery 1.x with jQuery 3.x, updated all plugins, and migrated to managed WordPress hosting with automatic security updates. The technology report was included in the client proposal, demonstrating specific security risks and justifying the $12,000 remediation project. The financial services client appreciated the data-driven approach and signed an ongoing maintenance contract worth $1,500/month, knowing their technology stack would stay current and secure.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Performance Optimization for Media Publisher</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              A digital news publisher struggled with slow page loads despite investing in premium hosting. Technology detection revealed the problem—their site loaded 23 different third-party scripts including 4 analytics platforms, 3 advertising networks, 2 social media widgets, video players, comment systems, and various tracking pixels. The technology report quantified the impact: third-party scripts added 2.8MB of resources and 4.2 seconds to page load time.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Armed with this intelligence, the agency proposed a performance optimization project focused on third-party script management. They consolidated analytics platforms (4 → 1), implemented lazy loading for social widgets and video players, removed duplicate tracking, and used Google Tag Manager to control script loading. Post-optimization, page load time decreased from 6.1 seconds to 2.3 seconds, a 62% improvement. The publisher saw bounce rate decrease by 28% and ad viewability increase by 35%, directly increasing ad revenue. Technology detection quantified the problem and guided the optimization strategy, delivering measurable ROI.
            </p>
          </div>
        </div>
      </FeatureSection>

      <FeatureFAQ faqs={faqs} />

      <FeatureCTA
        title="Start Analyzing Website Technology Stacks"
        description="Join agencies using our technology detection to inform migration strategy and competitive analysis."
      />
    </div>
  );
}
