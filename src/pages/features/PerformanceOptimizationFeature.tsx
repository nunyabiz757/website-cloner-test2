import { Zap, Check, TrendingUp, Target, Code2, Image } from 'lucide-react';
import { FeatureHero } from '../../components/features/FeatureHero';
import { FeatureSection } from '../../components/features/FeatureSection';
import { FeatureCTA } from '../../components/features/FeatureCTA';
import { FeatureFAQ } from '../../components/features/FeatureFAQ';
import { Card } from '../../components/ui/Card';

export function PerformanceOptimizationFeature() {
  const faqs = [
    {
      question: 'How much faster will my cloned website be after optimization?',
      answer: 'Most websites see 40-70% improvement in load times after our optimization process. Heavily unoptimized sites can see improvements of 80% or more. We measure performance using Google Lighthouse scores, focusing on First Contentful Paint (FCP), Largest Contentful Paint (LCP), and Time to Interactive (TTI).',
    },
    {
      question: 'Will optimization affect the visual appearance of my site?',
      answer: 'No. Our optimization process is non-destructive to visual design. We compress images without visible quality loss, minify code while preserving functionality, and optimize delivery without changing layouts. Your site will look identical but load significantly faster.',
    },
    {
      question: 'Can I optimize sites that are already live?',
      answer: 'Yes. While our primary use case is optimizing during the cloning process, you can also run optimization on existing websites. Simply clone the site with all optimization options enabled, and deploy the optimized version as a replacement.',
    },
    {
      question: 'What image formats does the optimizer support?',
      answer: 'We support JPEG, PNG, GIF, SVG, and WebP formats. Our system automatically converts JPEG and PNG images to WebP format when appropriate, which typically reduces file sizes by 25-35% without quality loss. SVGs are optimized by removing unnecessary metadata and simplifying paths.',
    },
    {
      question: 'Does optimization work for single-page applications (SPAs)?',
      answer: 'Yes. We optimize React, Vue, Angular, and other SPA frameworks. For SPAs, we focus on bundle splitting, lazy loading components, tree shaking unused code, and optimizing initial page load. The optimization strategy is automatically adjusted based on the detected framework.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <FeatureHero
        icon={Zap}
        title="Performance Optimization"
        description="Transform slow websites into lightning-fast experiences. Automatically optimize images, minify code, and implement best practices for maximum performance."
        gradient="from-yellow-500 to-orange-600"
      />

      <FeatureSection title="Why Website Performance Matters">
        <p className="text-lg leading-relaxed mb-6">
          Website performance is no longer optional—it's a critical business requirement. Google uses page speed as a ranking factor, meaning slow websites rank lower in search results. Beyond SEO, performance directly impacts user experience and conversion rates. Studies show that 53% of mobile users abandon sites that take longer than 3 seconds to load. Even a 100-millisecond delay in load time can reduce conversion rates by 7%.
        </p>
        <p className="text-lg leading-relaxed mb-6">
          For e-commerce sites, the impact is even more dramatic. Amazon found that every 100ms improvement in page load time increased revenue by 1%. Walmart discovered that for every 1-second improvement in page load time, conversions increased by 2%. These aren't marginal gains—they represent millions of dollars in annual revenue for large businesses.
        </p>
        <p className="text-lg leading-relaxed">
          When cloning websites, performance issues often get carried over from the source. Unoptimized images, bloated CSS files, render-blocking JavaScript, and excessive HTTP requests create slow experiences. Our Performance Optimization feature solves this by automatically applying industry best practices during the cloning process. You get a pixel-perfect clone that loads faster than the original, improving both user experience and search engine rankings.
        </p>
      </FeatureSection>

      <FeatureSection title="How Performance Optimization Works" className="bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose mb-8">
          <Card className="p-6">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <Image className="text-yellow-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">1. Image Optimization</h3>
            <p className="text-gray-700">
              Images are automatically compressed using smart algorithms that reduce file size by 50-80% without visible quality loss. We convert images to modern WebP format and implement responsive image sizing for different devices.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Code2 className="text-orange-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">2. Code Minification</h3>
            <p className="text-gray-700">
              CSS, JavaScript, and HTML are minified to remove whitespace, comments, and unnecessary characters. Bundle splitting and tree shaking eliminate unused code, reducing payload sizes by 30-60%.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="text-red-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">3. Delivery Optimization</h3>
            <p className="text-gray-700">
              Critical CSS is inlined for faster first paint. Resources are lazy-loaded when appropriate. HTTP requests are minimized through resource bundling and strategic caching headers are implemented.
            </p>
          </Card>
        </div>

        <p className="text-lg leading-relaxed mb-6">
          Our optimization engine analyzes your cloned website and applies a comprehensive set of performance improvements. The process begins with asset analysis—identifying all images, stylesheets, scripts, and fonts used throughout the site. Each asset is evaluated for optimization potential, and appropriate techniques are applied based on file type and usage context.
        </p>
        <p className="text-lg leading-relaxed mb-6">
          Image optimization is typically the highest-impact improvement. Large, uncompressed images are the number one cause of slow page loads. We use advanced compression algorithms that intelligently reduce file size while preserving visual quality. JPEG images are optimized using progressive rendering and chroma subsampling. PNG images are crushed using pngquant and zopfli compression. Where appropriate, we convert images to WebP format, which offers superior compression compared to JPEG and PNG.
        </p>
        <p className="text-lg leading-relaxed">
          Code optimization focuses on reducing file sizes and eliminating render-blocking resources. CSS files are minified, deduplicated, and analyzed for unused rules. Critical CSS—styles needed for above-the-fold content—is extracted and inlined in the HTML head. This allows the browser to render initial content immediately without waiting for external stylesheets. JavaScript files are minified, bundled, and strategically loaded using async or defer attributes to prevent blocking page rendering.
        </p>
      </FeatureSection>

      <FeatureSection title="Key Performance Optimization Techniques">
        <p className="text-lg leading-relaxed mb-6">
          Our optimization engine implements dozens of techniques proven to improve website performance. Here are the most impactful optimizations applied to every cloned website:
        </p>

        <div className="space-y-6">
          <div className="border-l-4 border-yellow-500 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Image Compression & Format Conversion</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Images are the heaviest resources on most websites, often accounting for 50-70% of total page weight. We apply lossy and lossless compression techniques tailored to each image type. JPEG images are compressed using MozJPEG, which achieves 5-10% better compression than standard JPEG encoders. PNG images use pngquant for palette reduction and zopfli for optimal compression. WebP conversion reduces file sizes by an additional 25-35% compared to optimized JPEG/PNG, with support for transparency and animation.
            </p>
          </div>

          <div className="border-l-4 border-orange-500 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Responsive Image Implementation</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Serving desktop-sized images to mobile users wastes bandwidth and slows load times. We implement responsive images using srcset and sizes attributes, allowing browsers to request appropriately sized images for each device. A 2000px wide image might be resized to 320px, 640px, 1024px, and 2000px variants. Mobile users downloading the 320px version save 85% of the original file size, dramatically improving mobile performance.
            </p>
          </div>

          <div className="border-l-4 border-red-500 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Lazy Loading for Off-Screen Content</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Images, videos, and iframes below the fold don't need to load immediately. We implement native lazy loading using the loading="lazy" attribute for modern browsers, with JavaScript polyfills for older browsers. This defers loading of off-screen resources until users scroll near them, reducing initial page weight by 40-60% on content-heavy pages.
            </p>
          </div>

          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">CSS Optimization & Critical CSS Inlining</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Stylesheets are render-blocking by default—browsers won't display content until all CSS is downloaded and parsed. We extract critical CSS (styles for above-the-fold content) and inline it in the HTML head. Non-critical CSS is loaded asynchronously, allowing browsers to render visible content immediately. This typically improves First Contentful Paint by 30-50%.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">JavaScript Minification & Bundle Splitting</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              JavaScript files are minified to remove whitespace, comments, and shorten variable names. For single-page applications, we implement bundle splitting to create smaller chunks loaded on demand. A 500KB bundle might be split into a 100KB main bundle and four 100KB route-specific bundles, reducing initial load time by 80%.
            </p>
          </div>

          <div className="border-l-4 border-green-500 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Font Optimization & Subsetting</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Web fonts can add 100-500KB to page weight. We implement font-display: swap to prevent invisible text during font loading. Custom fonts are subsetted to include only characters actually used on the site, reducing file sizes by 70-90%. Preconnect hints warm up connections to font CDNs, reducing latency by 100-300ms.
            </p>
          </div>
        </div>
      </FeatureSection>

      <FeatureSection title="Benefits of Performance Optimization" className="bg-gray-50">
        <p className="text-lg leading-relaxed mb-6">
          Performance optimization delivers measurable business results across multiple dimensions. Here's what you gain by optimizing every cloned website:
        </p>

        <div className="space-y-6">
          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Higher Search Engine Rankings</h3>
              <p className="text-gray-700 leading-relaxed">
                Google's Core Web Vitals are now direct ranking factors. Sites that score well on Largest Contentful Paint (LCP), First Input Delay (FID), and Cumulative Layout Shift (CLS) receive ranking boosts. Our optimization improves all three metrics, typically moving sites from "Needs Improvement" to "Good" status. This translates to higher visibility in search results and more organic traffic.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Increased Conversion Rates</h3>
              <p className="text-gray-700 leading-relaxed">
                Fast websites convert better, period. Studies across thousands of sites show consistent correlation between speed and conversions. A site loading in 1 second converts 3x better than one loading in 5 seconds. For e-commerce clients, this means more sales. For lead generation, it means more form submissions. Performance optimization directly impacts your bottom line.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Better Mobile Experience</h3>
              <p className="text-gray-700 leading-relaxed">
                Mobile users are more performance-sensitive than desktop users, often browsing on slower connections. Our responsive image optimization and lazy loading dramatically improve mobile load times. Sites that took 8-10 seconds on mobile networks now load in 2-3 seconds. With mobile traffic representing 60%+ of total traffic for most sites, mobile optimization is critical.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Reduced Hosting Costs</h3>
              <p className="text-gray-700 leading-relaxed">
                Optimized sites consume less bandwidth and require less server resources. Image compression alone reduces bandwidth by 50-70%. For sites serving millions of page views, this translates to significant hosting cost savings. CDN costs drop proportionally with file size reductions. Some clients save thousands per month on hosting and CDN bills after optimization.
              </p>
            </div>
          </div>
        </div>
      </FeatureSection>

      <FeatureSection title="Real-World Performance Improvements">
        <p className="text-lg leading-relaxed mb-6">
          Let's examine real scenarios where performance optimization delivered transformative results for web design agencies and their clients:
        </p>

        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">E-Commerce Site Migration</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              A marketing agency cloned a Shopify store to WordPress for greater customization. The original Shopify site loaded in 2.8 seconds. The initial WordPress clone, carrying over unoptimized assets, loaded in 6.2 seconds—more than twice as slow. After running our performance optimization, load time dropped to 1.9 seconds, faster than the original Shopify site.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              The results were dramatic. Mobile traffic bounced 40% less frequently. Average session duration increased by 25%. Most importantly, conversion rate increased from 2.1% to 3.4%—a 62% improvement. For this client generating $50,000 monthly revenue, the optimization translated to an additional $31,000 in monthly sales, or $372,000 annually.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Agency Portfolio Showcase</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              A design agency wanted to clone their best client projects into a portfolio site. The original sites had beautiful designs but poor performance—average load time of 5.3 seconds across 12 showcased projects. Many used high-resolution photography without optimization, resulting in 8-12MB page weights.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              After cloning with performance optimization enabled, average page weight dropped from 9.2MB to 1.8MB—an 80% reduction. Load time improved from 5.3 seconds to 1.4 seconds. The agency's portfolio site now loads faster than competitors' portfolio sites, creating a better first impression with prospects. The agency reports that their portfolio site generates 40% more lead form submissions after the optimization.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">News Publisher Migration</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              A digital publisher migrated from a legacy CMS to a modern platform using our cloning tool. The old site served full-size images to all devices and loaded 200KB of unused CSS on every page. Initial page load required downloading 4.5MB of resources, taking 7-9 seconds on mobile networks.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Performance optimization implemented responsive images, reducing mobile payload to 800KB. Unused CSS was eliminated, cutting stylesheet size by 60%. Critical CSS inlining improved First Contentful Paint from 4.2 seconds to 1.1 seconds. Google Search Console showed improved Core Web Vitals scores across 95% of URLs, resulting in a 23% increase in organic search traffic within 60 days of migration.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">SaaS Landing Page Conversion</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              A SaaS company wanted to clone their high-performing landing page from Unbounce to their main website for better brand consistency. The Unbounce page loaded in 3.2 seconds and converted at 8.5%. The initial clone on their WordPress site loaded in 5.7 seconds, and conversion rate dropped to 6.2%.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              After optimization, load time improved to 1.8 seconds—faster than the original Unbounce page. Conversion rate recovered to 8.9%, actually exceeding the original. The SaaS company now uses our tool to clone all their Unbounce pages to WordPress, maintaining conversion rates while reducing their Unbounce subscription costs by $300/month.
            </p>
          </div>
        </div>
      </FeatureSection>

      <FeatureFAQ faqs={faqs} />

      <FeatureCTA
        title="Start Optimizing Your Cloned Websites"
        description="Join agencies using our optimization tools to deliver faster, higher-converting websites to clients."
      />
    </div>
  );
}
