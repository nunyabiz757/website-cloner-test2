import { Search, Check, TrendingUp, FileText, Link2, Target } from 'lucide-react';
import { FeatureHero } from '../../components/features/FeatureHero';
import { FeatureSection } from '../../components/features/FeatureSection';
import { FeatureCTA } from '../../components/features/FeatureCTA';
import { FeatureFAQ } from '../../components/features/FeatureFAQ';
import { Card } from '../../components/ui/Card';

export function SEOAnalysisFeature() {
  const faqs = [
    {
      question: 'How accurate is the SEO analysis compared to tools like Ahrefs or SEMrush?',
      answer: 'Our SEO analysis focuses on on-page technical SEO factors that directly impact cloning decisions, not backlink analysis or keyword research. We evaluate meta tags, heading structure, schema markup, page speed, mobile-friendliness, and content optimization. For these technical factors, our analysis is as accurate as premium tools. For comprehensive SEO audits including off-page factors, use our analysis alongside dedicated SEO platforms.',
    },
    {
      question: 'Can I export SEO analysis reports to share with clients?',
      answer: 'Yes. SEO analysis results can be exported as PDF reports or JSON data. Reports include visual charts showing scores across different categories, detailed lists of issues found, and prioritized recommendations. These client-ready reports help demonstrate the value of your work and justify optimization efforts.',
    },
    {
      question: 'Does the tool fix SEO issues automatically or just identify them?',
      answer: 'We identify issues and provide detailed recommendations, but fixes are not applied automatically to cloned sites. This is intentional—many SEO decisions require context and strategy. For example, missing meta descriptions could be auto-generated, but human-written descriptions perform better. We give you the data to make informed decisions.',
    },
    {
      question: 'How often should I run SEO analysis on cloned websites?',
      answer: 'Run analysis during the initial clone to establish a baseline and identify critical issues. After making optimizations and publishing, run analysis again to verify improvements. For ongoing projects, monthly analysis helps track SEO health over time and catch new issues as content is added.',
    },
    {
      question: 'Does the analysis include content quality assessment?',
      answer: 'Yes. We analyze content length, keyword usage, readability scores (Flesch-Kincaid), and content structure. We identify thin content (pages with less than 300 words), duplicate content across pages, and keyword stuffing. Our content analysis provides actionable recommendations for improving content quality and relevance.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <FeatureHero
        icon={Search}
        title="SEO Analysis & Optimization"
        description="Comprehensive SEO audits for cloned websites. Identify technical issues, optimize metadata, and ensure your cloned sites rank well in search engines."
        gradient="from-green-600 to-teal-600"
      />

      <FeatureSection title="Why SEO Analysis Matters for Cloned Websites">
        <p className="text-lg leading-relaxed mb-6">
          Search engine optimization is the foundation of organic traffic generation. Without proper SEO, even beautifully designed websites remain invisible in search results, buried beneath competitors on page two or three of Google. When cloning websites, SEO issues from the source site often get carried over—missing meta descriptions, broken internal links, duplicate content, poor heading structure, and missing schema markup.
        </p>
        <p className="text-lg leading-relaxed mb-6">
          Our SEO Analysis feature performs comprehensive technical SEO audits on cloned websites, identifying issues that harm search rankings and providing actionable recommendations for improvement. We analyze over 50 SEO factors across multiple categories: technical SEO, on-page optimization, content quality, mobile-friendliness, and page speed. Each issue is scored by severity and impact, helping you prioritize fixes that deliver the biggest ranking improvements.
        </p>
        <p className="text-lg leading-relaxed">
          For web design agencies, SEO analysis transforms website cloning from a simple duplication process into an opportunity to deliver superior results. Instead of cloning a site with all its SEO problems, you can identify and fix issues during migration, delivering a cloned site that ranks better than the original. This value-add differentiates your services and justifies premium pricing. Clients don't just get a cloned website—they get an SEO-optimized website positioned for organic growth.
        </p>
      </FeatureSection>

      <FeatureSection title="How SEO Analysis Works" className="bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose mb-8">
          <Card className="p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="text-green-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">1. Technical Audit</h3>
            <p className="text-gray-700">
              We crawl your cloned website analyzing HTML structure, meta tags, heading hierarchy, canonical tags, robots.txt, XML sitemaps, and schema markup. Every technical SEO factor Google uses for ranking is evaluated and scored.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="text-teal-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">2. Content Analysis</h3>
            <p className="text-gray-700">
              Content quality, keyword optimization, readability, and content structure are analyzed. We identify thin content, duplicate content, keyword stuffing, and opportunities for content expansion and improvement.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Link2 className="text-blue-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">3. Link Structure</h3>
            <p className="text-gray-700">
              Internal linking structure is mapped and analyzed. We identify broken links, orphaned pages, excessive link depth, and opportunities to strengthen internal link equity distribution across your site.
            </p>
          </Card>
        </div>

        <p className="text-lg leading-relaxed mb-6">
          Our SEO analysis engine performs a deep crawl of your cloned website, examining every page, resource, and technical element that impacts search rankings. The process begins immediately after cloning completes, or can be run on-demand for existing cloned sites. Analysis typically takes 2-5 minutes for small sites (10-50 pages) and 10-20 minutes for larger sites (100-500 pages).
        </p>
        <p className="text-lg leading-relaxed mb-6">
          Technical SEO analysis evaluates structural elements Google uses to understand and rank your site. We check for proper HTML5 semantic markup, ensuring headings follow logical hierarchy (H1 → H2 → H3). Meta tags are validated—title tags must be 50-60 characters, meta descriptions 150-160 characters, and both should be unique across pages. We verify robots.txt configuration doesn't block important resources, check XML sitemap validity, and ensure canonical tags prevent duplicate content issues.
        </p>
        <p className="text-lg leading-relaxed">
          Content analysis goes beyond word count. We calculate readability scores using Flesch-Kincaid metrics, assess keyword usage and distribution, identify content gaps and duplication, and evaluate content freshness. Thin content (pages under 300 words) is flagged, as Google often considers these low-value pages. We also detect keyword stuffing—excessive keyword repetition that triggers spam filters—and recommend natural keyword density ranges.
        </p>
      </FeatureSection>

      <FeatureSection title="Key SEO Factors Analyzed">
        <p className="text-lg leading-relaxed mb-6">
          Our analysis evaluates over 50 SEO ranking factors. Here are the most critical categories and what we check in each:
        </p>

        <div className="space-y-6">
          <div className="border-l-4 border-green-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Meta Tags & Title Optimization</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Every page needs a unique, descriptive title tag (50-60 characters) and meta description (150-160 characters). We verify title tags include target keywords near the beginning, descriptions are compelling and include calls-to-action, and no duplicate meta tags exist across pages. Missing or duplicate meta tags are flagged with specific recommendations for each page. We also check Open Graph tags for social media sharing and Twitter Card tags for proper social preview rendering.
            </p>
          </div>

          <div className="border-l-4 border-teal-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Heading Structure & Content Hierarchy</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Proper heading hierarchy helps Google understand content structure. Each page should have exactly one H1 tag containing the primary keyword. H2 tags should divide main sections, H3 tags for subsections, maintaining logical nesting. We detect multiple H1 tags (confuses search engines), skipped heading levels (H1 → H3 without H2), and heading tags used for styling instead of structure. We also verify headings contain relevant keywords and accurately describe following content.
            </p>
          </div>

          <div className="border-l-4 border-blue-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Schema Markup & Structured Data</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Schema markup (structured data) helps search engines understand page content and enables rich snippets in search results. We detect existing schema implementations (JSON-LD, Microdata, RDFa) and validate syntax using Google's structured data guidelines. For e-commerce sites, we recommend Product schema. For local businesses, LocalBusiness schema. For articles, Article schema with author, publish date, and image. Proper schema implementation can increase click-through rates by 30-50% through rich snippets.
            </p>
          </div>

          <div className="border-l-4 border-purple-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Mobile-Friendliness & Responsive Design</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Google uses mobile-first indexing—the mobile version of your site determines rankings. We test responsive design implementation, verify proper viewport meta tags, check font sizes are readable on mobile (minimum 16px), ensure tap targets are adequately sized (minimum 48x48 pixels), and confirm no horizontal scrolling occurs on mobile devices. Sites failing mobile-friendliness tests receive lower rankings in mobile search results, which now account for 60%+ of all searches.
            </p>
          </div>

          <div className="border-l-4 border-orange-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Page Speed & Core Web Vitals</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Google's Core Web Vitals are official ranking factors. We measure Largest Contentful Paint (LCP) - should be under 2.5 seconds, First Input Delay (FID) - under 100 milliseconds, and Cumulative Layout Shift (CLS) - under 0.1. We identify issues causing poor scores: unoptimized images increasing LCP, render-blocking JavaScript delaying FID, and missing width/height attributes causing CLS. Our analysis provides specific recommendations to improve each metric.
            </p>
          </div>

          <div className="border-l-4 border-red-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Internal Linking & Site Architecture</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Internal links distribute page authority throughout your site and help Google discover content. We analyze link structure identifying orphaned pages (no internal links pointing to them), excessive link depth (pages requiring 4+ clicks from homepage), broken internal links, and poor anchor text usage. We map site architecture and recommend strategic internal linking to strengthen important pages and improve crawlability. Proper internal linking can increase indexed pages by 20-40%.
            </p>
          </div>

          <div className="border-l-4 border-yellow-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Image Optimization & Alt Text</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Images need descriptive alt text for accessibility and SEO. We verify every image has alt attributes, alt text is descriptive (not "image1.jpg"), and images use descriptive filenames containing relevant keywords. Missing alt text is flagged per image with recommendations. We also check image file sizes, recommending compression for images over 200KB, and verify responsive image implementation using srcset attributes for faster mobile loading.
            </p>
          </div>
        </div>
      </FeatureSection>

      <FeatureSection title="SEO Analysis Report & Recommendations" className="bg-gray-50">
        <p className="text-lg leading-relaxed mb-6">
          After analysis completes, you receive a comprehensive SEO report with visual scoring, issue prioritization, and actionable recommendations. The report is designed for both technical developers and non-technical clients, using clear language and visual indicators:
        </p>

        <div className="space-y-6">
          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Overall SEO Score</h3>
              <p className="text-gray-700 leading-relaxed">
                A single 0-100 score summarizing overall SEO health. Scores are calculated by weighting different factors by importance. Critical issues (missing title tags, broken links) are heavily weighted, while minor issues (heading hierarchy) have less impact. Scores help track improvement over time and benchmark against competitors. Most professional websites score 70-85. Scores below 60 indicate serious SEO problems requiring immediate attention.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Category Breakdowns</h3>
              <p className="text-gray-700 leading-relaxed">
                Separate scores for Technical SEO, Content Optimization, Mobile-Friendliness, Page Speed, and Link Structure. This breakdown identifies weak areas requiring focus. A site might score 85 overall but only 55 for page speed, indicating performance optimization should be prioritized. Each category includes specific issues found and estimated impact on rankings.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Prioritized Issue List</h3>
              <p className="text-gray-700 leading-relaxed">
                All issues are categorized as Critical (red), Important (orange), or Low Priority (yellow). Critical issues severely harm rankings and should be fixed immediately. Important issues have moderate impact and should be addressed soon. Low priority issues have minimal impact but fix them for maximum optimization. Each issue includes a clear description, affected pages, and step-by-step fix instructions.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Competitive Comparison</h3>
              <p className="text-gray-700 leading-relaxed">
                Compare your cloned site's SEO performance against the original source site and competitor sites. See which SEO factors improved during cloning, which remained the same, and which need additional work. This data helps demonstrate value to clients—show them their cloned site has better SEO fundamentals than the original, positioning them for improved rankings.
              </p>
            </div>
          </div>
        </div>
      </FeatureSection>

      <FeatureSection title="Real-World SEO Improvements">
        <p className="text-lg leading-relaxed mb-6">
          SEO analysis has helped agencies and businesses dramatically improve organic search performance. Here are real scenarios demonstrating the impact:
        </p>

        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Local Service Business Migration</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              A plumbing company's website was cloned from an outdated template-based builder to WordPress. The original site had an SEO score of 42—critical issues included missing meta descriptions on 80% of pages, no schema markup, poor mobile experience, and broken internal links. The site ranked on page 3-4 for primary keywords like "plumber [city name]".
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our SEO analysis identified all issues with specific fix recommendations. After implementing fixes during migration—adding unique meta tags, implementing LocalBusiness schema, fixing mobile responsiveness, and restructuring internal links—the post-migration SEO score improved to 78. Within 90 days, the site moved to page 1 for primary keywords, increasing organic traffic by 240% and generating 15-20 qualified leads per month compared to 3-5 previously.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">E-Commerce Product Pages Optimization</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              An online retailer cloned their Shopify store to a custom platform for greater control. Original product pages had thin content (50-100 words per product), missing alt text on product images, no Product schema markup, and generic title tags. SEO analysis flagged these issues across 200+ product pages.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              The agency expanded product descriptions to 300+ words incorporating target keywords, added descriptive alt text to all images, implemented Product schema with price, availability, and review data, and rewrote title tags to include specific product names and keywords. Google Search Console showed improved rankings for long-tail product keywords within 45 days. Organic product page traffic increased 180%, and e-commerce conversion rate from organic traffic improved from 1.8% to 2.9%.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Blog Content Migration</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              A SaaS company migrated their blog from Medium to their main website using our cloning tool. Medium URLs were redirecting to the new domain, but SEO analysis revealed issues—heading structure was inconsistent (multiple H1 tags per article), internal linking between blog posts was minimal, and no Article schema was implemented. The blog had 150 published articles but most received minimal organic traffic.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Following SEO analysis recommendations, the agency corrected heading hierarchy across all articles, created an internal linking strategy connecting related posts, implemented Article schema with author and publish date, and added category pages to improve site architecture. After 60 days, blog organic traffic increased 160%. Several articles began ranking in featured snippets, driving significant traffic spikes. The blog became the company's primary lead generation channel, contributing 40% of new signups.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Agency Website Overhaul</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              A digital marketing agency cloned their outdated website to a modern design. SEO analysis of the original site revealed an SEO score of 38—missing meta descriptions, slow page speed (6.8 second load time), failing Core Web Vitals, and poor mobile experience. The agency ranked poorly for competitive keywords like "digital marketing agency [city]".
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              During migration, SEO issues were systematically addressed. Meta tags were written for all pages, performance optimization reduced load time to 1.6 seconds, Core Web Vitals scores moved from "Needs Improvement" to "Good", and mobile experience was completely overhauled. Post-migration SEO score improved to 86. Within 120 days, the agency's website moved from page 3 to positions 3-5 for primary keywords. Organic lead flow increased from 2-3 per month to 12-15 per month, and the improved website became a powerful sales tool during client presentations.
            </p>
          </div>
        </div>
      </FeatureSection>

      <FeatureFAQ faqs={faqs} />

      <FeatureCTA
        title="Start Optimizing SEO on Your Cloned Websites"
        description="Join agencies using our SEO analysis tools to deliver higher-ranking websites to clients."
      />
    </div>
  );
}
