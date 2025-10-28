import { Copy, Check, Zap, Users, Clock, Target } from 'lucide-react';
import { FeatureHero } from '../../components/features/FeatureHero';
import { FeatureSection } from '../../components/features/FeatureSection';
import { FeatureCTA } from '../../components/features/FeatureCTA';
import { FeatureFAQ } from '../../components/features/FeatureFAQ';
import { Card } from '../../components/ui/Card';

export function GHLToGHLFeature() {
  const faqs = [
    {
      question: 'Will cloning a GHL funnel or website maintain all the integrations?',
      answer: 'Most integrations are preserved during the cloning process, including forms, calendars, and CRM connections. However, some integrations like custom webhooks, API connections, and third-party services may require reconfiguration with new API keys or credentials. We provide a detailed report of all integrations found so you can systematically reconfigure them in the cloned version.',
    },
    {
      question: 'Can I clone GHL sites between different sub-accounts?',
      answer: 'Yes. Our tool supports cloning between different GHL sub-accounts within the same agency account or across different agency accounts. You can clone from a template sub-account to multiple client sub-accounts, or duplicate successful client funnels for new clients. Authentication is handled securely through GHL API tokens.',
    },
    {
      question: 'How long does it take to clone a typical GHL funnel?',
      answer: 'Simple funnels with 3-5 pages clone in 30-60 seconds. Complex funnels with 10-20 pages, custom forms, calendars, and workflows typically take 2-5 minutes. Very large sites with 50+ pages and extensive automations may take 10-15 minutes. Cloning happens in the background, so you can continue working while the process completes.',
    },
    {
      question: 'Are GHL workflows and automations cloned as well?',
      answer: 'Currently, our tool focuses on cloning funnel pages, websites, forms, and calendars. GHL workflows and automations are not automatically cloned due to API limitations. However, we provide detailed documentation of detected workflows and automations in the source funnel, making it easier to manually recreate them in the cloned version.',
    },
    {
      question: 'Can I customize the cloned funnel before deploying it?',
      answer: 'Yes. After cloning completes, you receive the HTML, CSS, and JavaScript for all pages. You can edit content, swap images, change colors, update copy, and modify forms before deploying to GHL. Our built-in editor allows quick customization, or you can export files to your preferred development environment for advanced modifications.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <FeatureHero
        icon={Copy}
        title="GHL to GHL Cloning"
        description="Duplicate GoHighLevel funnels, websites, and pages in seconds. Clone successful campaigns, replicate templates across clients, and scale your agency faster."
        gradient="from-purple-600 to-indigo-600"
      />

      <FeatureSection title="Why GHL to GHL Cloning Transforms Agency Operations">
        <p className="text-lg leading-relaxed mb-6">
          For digital marketing agencies using GoHighLevel, duplicating successful funnels and websites across multiple client accounts is a constant need. When you build a high-converting funnel for one client, you want to replicate that success for similar clients. When you create a proven template, you need to deploy it quickly across dozens of sub-accounts. Manual recreation is tedious, time-consuming, and error-prone—copying and pasting each page, reconfiguring forms, rebuilding calendars, and hoping you didn't miss critical elements.
        </p>
        <p className="text-lg leading-relaxed mb-6">
          Traditional GHL cloning methods have significant limitations. The native GHL snapshot feature works within a single sub-account but becomes cumbersome when managing multiple clients. Exporting and importing snapshots requires multiple steps, doesn't always preserve custom code, and can break integrations. Manually rebuilding funnels takes 2-4 hours per funnel, and inconsistencies creep in—one client gets the updated version while another gets the old version with bugs. As your agency scales, these inefficiencies compound, limiting growth and profitability.
        </p>
        <p className="text-lg leading-relaxed">
          Our GHL to GHL Cloning feature automates the entire duplication process, allowing you to clone complete funnels, websites, or individual pages between any GHL sub-accounts in minutes. Point our tool at a source funnel, select a destination sub-account, and the entire funnel is replicated with pixel-perfect accuracy—all pages, forms, custom CSS, JavaScript, images, and content preserved exactly as designed. What used to take hours now takes minutes, and consistency is guaranteed because every clone is identical to the source. This automation transforms how agencies operate, enabling rapid scaling, consistent client deliverables, and dramatically improved profitability.
        </p>
      </FeatureSection>

      <FeatureSection title="How GHL to GHL Cloning Works" className="bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose mb-8">
          <Card className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="text-purple-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">1. Source Selection</h3>
            <p className="text-gray-700">
              Connect to your GHL account and select the funnel, website, or pages you want to clone. Our tool authenticates securely via GHL API and retrieves all funnel assets including pages, forms, calendars, and custom code.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="text-indigo-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">2. Intelligent Cloning</h3>
            <p className="text-gray-700">
              The cloning engine analyzes the source funnel structure, extracts all pages and assets, preserves custom HTML/CSS/JavaScript, maintains form configurations, and prepares everything for deployment to the destination account.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="text-blue-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">3. Multi-Account Deploy</h3>
            <p className="text-gray-700">
              Deploy the cloned funnel to one or multiple GHL sub-accounts simultaneously. Customize per-client details like branding, contact info, and domain settings before deployment. Push to production with one click.
            </p>
          </Card>
        </div>

        <p className="text-lg leading-relaxed mb-6">
          Our cloning process begins with secure GHL API authentication. You connect your GHL agency account, and our tool retrieves a list of all accessible sub-accounts and funnels. This authentication uses OAuth 2.0 tokens, ensuring your credentials remain secure. We never store your GHL password—only temporary API tokens that can be revoked at any time. Once authenticated, you browse your funnels visually, seeing thumbnail previews and funnel names to identify the source you want to clone.
        </p>
        <p className="text-lg leading-relaxed mb-6">
          After selecting a source funnel, our intelligent analysis engine performs a deep scan of the funnel structure. We map the complete page hierarchy—landing pages, thank you pages, sales pages, order forms, upsells, downsells, and any custom pages. Each page is analyzed to extract HTML structure, CSS stylesheets (both inline and external), JavaScript code (custom scripts and third-party integrations), images and media files, form configurations and field mappings, calendar widget settings, and tracking codes (Facebook Pixel, Google Analytics, etc.). This comprehensive extraction ensures nothing is lost during cloning.
        </p>
        <p className="text-lg leading-relaxed">
          The deployment phase intelligently handles GHL-specific elements. Form IDs are regenerated to avoid conflicts with the source funnel. Calendar widgets are reconfigured to point to the destination sub-account's calendar settings. Custom domain configurations are adjusted based on your specifications. Image URLs are updated to reference the new sub-account's media library. Tracking pixels can be swapped—clone the funnel but replace the client's Facebook Pixel ID with the new client's ID automatically. The result is a fully functional, production-ready funnel that works immediately upon deployment, requiring minimal post-clone configuration.
        </p>
      </FeatureSection>

      <FeatureSection title="Key Benefits for GHL Agencies">
        <p className="text-lg leading-relaxed mb-6">
          GHL to GHL cloning delivers transformative benefits that directly impact agency profitability, scalability, and client satisfaction:
        </p>

        <div className="space-y-6">
          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Massive Time Savings</h3>
              <p className="text-gray-700 leading-relaxed">
                Manually rebuilding a GHL funnel takes 2-4 hours on average, depending on complexity. With our cloning tool, the same funnel is replicated in 2-5 minutes—a 95% time reduction. For agencies onboarding 5-10 new clients monthly, this saves 10-40 hours per month, equivalent to a full-time employee's weekly workload. That time can be reallocated to revenue-generating activities like sales, client strategy, or marketing. The time savings compound as you clone more funnels—clone the same proven template 50 times, and you've saved 100+ hours compared to manual recreation.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Guaranteed Consistency</h3>
              <p className="text-gray-700 leading-relaxed">
                Manual funnel recreation introduces inconsistencies. One client gets version 1.0 of your template, another gets version 1.2 with bug fixes, and a third gets a hybrid version with some improvements and some old bugs. Tracking which clients have which version becomes a nightmare. With automated cloning, every client receives an identical, pixel-perfect copy of the source funnel. Update your master template once, and all future clones include those improvements. This consistency ensures quality control—no client receives an inferior version, and troubleshooting is easier because all funnels are structurally identical.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Rapid Client Onboarding</h3>
              <p className="text-gray-700 leading-relaxed">
                Long onboarding times delay revenue recognition and frustrate clients eager to launch campaigns. Traditional GHL setup takes 1-2 weeks as team members manually build funnels, configure integrations, and test functionality. With cloning, onboarding collapses to 1-2 days. Clone the proven funnel template, customize client-specific branding and content, configure domain and email settings, and launch. Clients see value faster, satisfaction increases, and you can onboard more clients without expanding team size. Some agencies report onboarding capacity increasing 3-5x after implementing automated cloning.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Template Library Management</h3>
              <p className="text-gray-700 leading-relaxed">
                Build a library of proven, high-converting funnel templates organized by industry, use case, and client type. When a new dentist client signs up, clone the proven dental practice funnel template. When a real estate agent joins, deploy the real estate lead generation template. This template-driven approach standardizes your service delivery, reduces custom development requirements, and ensures clients benefit from your accumulated knowledge. Templates become intellectual property assets—your agency's competitive advantage codified in reusable, battle-tested funnels.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">A/B Testing at Scale</h3>
              <p className="text-gray-700 leading-relaxed">
                Testing funnel variations across multiple clients generates valuable performance data. Clone a baseline funnel to 10 clients. Create a variant with different headline, CTA, or layout. Clone that variant to another 10 clients. After 30 days, compare conversion rates between the two versions across 20 clients—statistically significant sample size revealing which version performs better. Apply winning variations to all future clients. This systematic testing approach, enabled by easy cloning, continuously improves your funnel templates and client results.
              </p>
            </div>
          </div>
        </div>
      </FeatureSection>

      <FeatureSection title="Real-World Agency Use Cases" className="bg-gray-50">
        <p className="text-lg leading-relaxed mb-6">
          GHL agencies across various niches use our cloning tool to solve specific operational challenges and scale their businesses:
        </p>

        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Multi-Location Franchise Deployment</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              A marketing agency serving a national franchise with 50 locations needed to deploy identical lead generation funnels to each franchise location's GHL sub-account. Each location required the same funnel structure but with location-specific branding (franchise owner name, local address, local phone number, location-specific images). Manually building 50 funnels would take 100-200 hours.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Using our cloning tool, they built one master funnel in their template sub-account, then cloned it 50 times in a single afternoon. Before each deployment, they customized location-specific variables (name, address, phone, images) using our bulk variable replacement feature. All 50 locations went live simultaneously with identical, proven funnels, ensuring brand consistency across the franchise network. When the franchisor wanted to update the funnel design, the agency updated the master template and redeployed to all 50 locations in hours instead of weeks.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Agency White-Label Program</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              A GHL agency built a white-label program selling funnel templates to other agencies and GHL users. They created 15 high-converting funnel templates for various industries (dental, chiropractic, real estate, gyms, coaches, etc.). Customers purchased templates and received them deployed to their GHL accounts instantly. Managing manual deployment for 100+ monthly customers was unsustainable.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              They integrated our cloning API into their e-commerce platform. When a customer purchases a template, the system automatically clones the corresponding funnel from the template library to the customer's GHL account. The entire process is automated—purchase confirmation triggers the clone, deployment completes in minutes, and the customer receives login credentials and setup instructions. This automation enabled them to scale from 20 customers per month to 150+ without hiring additional staff, increasing monthly recurring revenue from $8,000 to $45,000 in six months.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Client Migration from Competitor Platform</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              A GHL agency targeted competitors' clients (ClickFunnels, Kartra, etc.) with migration offers. They successfully signed 12 clients in one month, all requiring their existing funnels migrated to GHL. Each client had 3-8 funnels with multiple pages. Manually rebuilding 50+ funnels in GHL would delay onboarding by months and require significant development resources.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              They used our website cloning tool to extract the clients' existing funnels from competitor platforms, then used our GHL deployment feature to import them into GHL sub-accounts. Complex ClickFunnels with 12 pages that would take 6-8 hours to rebuild manually were migrated in 20-30 minutes. All 12 clients were fully migrated and live on GHL within three weeks instead of three months. The agency positioned this fast migration as a competitive advantage, helping close future migration deals by demonstrating quick turnaround times.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Seasonal Campaign Replication</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              A GHL agency specializing in e-commerce ran seasonal promotional campaigns for 30 e-commerce clients (Black Friday, Christmas, New Year, Valentine's Day, etc.). Each seasonal campaign required a custom funnel with time-limited offers, countdown timers, and seasonal branding. Building unique funnels for 30 clients four times per year meant 120 custom funnels annually—unsustainable workload.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              They created seasonal master templates for each campaign (Black Friday template, Christmas template, etc.). When each season arrived, they cloned the appropriate template to all 30 client sub-accounts, then used bulk customization to swap client-specific products, offers, and branding. Template cloning reduced funnel creation time from 3 hours per client to 10 minutes per client. A seasonal campaign that previously required 90 hours of work (3 hours × 30 clients) now takes 5 hours (10 minutes × 30 clients)—95% time reduction. The agency now runs more frequent seasonal campaigns, generating additional revenue without increasing workload.
            </p>
          </div>
        </div>
      </FeatureSection>

      <FeatureSection title="Advanced Cloning Features">
        <p className="text-lg leading-relaxed mb-6">
          Beyond basic funnel duplication, our tool includes advanced features that solve complex agency workflows:
        </p>

        <div className="space-y-6">
          <div className="border-l-4 border-purple-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Bulk Multi-Account Deployment</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Clone one funnel to unlimited destination sub-accounts simultaneously. Select 10, 20, or 50 destination accounts, customize variables for each, and deploy in one batch. Perfect for franchises, multi-location businesses, or agencies managing dozens of similar clients. Progress tracking shows deployment status for each account, with detailed error reporting if any deployment fails.
            </p>
          </div>

          <div className="border-l-4 border-indigo-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Variable Replacement System</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Define template variables in your source funnel (like [CLIENT_NAME], [PHONE_NUMBER], [BUSINESS_ADDRESS]) and bulk-replace them during cloning. Upload a CSV with client-specific values, and our tool automatically swaps variables before deployment. Clone 50 funnels with unique client information in minutes instead of manually editing 50 funnels individually. Variables work in text content, form fields, custom code, and meta tags.
            </p>
          </div>

          <div className="border-l-4 border-blue-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Selective Page Cloning</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Clone entire funnels or cherry-pick specific pages. Maybe you want the landing page and thank you page from one funnel, but not the upsell sequence. Or perhaps you need just the opt-in page from a proven template. Selective cloning gives you granular control, allowing you to mix and match pages from multiple source funnels to create custom combinations tailored to specific client needs.
            </p>
          </div>

          <div className="border-l-4 border-green-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Integration Mapping & Reconfiguration</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our tool detects integrations in the source funnel (Stripe, PayPal, Zapier, email autoresponders, etc.) and provides mapping tools to reconfigure them for destination accounts. Instead of manually finding every integration point, you get a comprehensive integration report with reconfiguration instructions. For common integrations, we provide automated reconfiguration—enter the destination account's API keys, and integrations are automatically updated in the cloned funnel.
            </p>
          </div>
        </div>
      </FeatureSection>

      <FeatureFAQ faqs={faqs} />

      <FeatureCTA
        title="Start Cloning GHL Funnels in Minutes"
        description="Join agencies using our GHL cloning tools to scale faster, onboard clients quicker, and maximize profitability."
      />
    </div>
  );
}
