# Website Cloner Pro

A professional web application that clones websites, optimizes their performance, and exports them to 11 different WordPress page builders.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Core Functionality

- **Website Cloning**: Clone any website by URL with automatic asset extraction
- **WordPress REST API Integration**: Native WordPress block detection and cloning via REST API
- **Performance Analysis**: Comprehensive performance scoring system (0-100)
- **Automatic Optimization**: 50+ optimization techniques applied automatically
- **WordPress Export**: Export to 11 popular WordPress page builders
- **Live Preview**: Side-by-side comparison of original vs optimized versions
- **Export Formats**: HTML, WordPress Theme, Static Site, and React Component

### WordPress Features (NEW!)

#### Native WordPress Block Detection
- **Automatic WordPress Detection**: Detects WordPress sites via REST API in under 2 seconds
- **Native Block Parsing**: Parses WordPress block comments (`<!-- wp:heading -->`) for perfect hierarchy
- **Page Builder Detection**: Identifies Elementor, Divi, Gutenberg, Beaver Builder, Bricks, Oxygen, WPBakery
- **Block Structure Preservation**: Maintains nested blocks (columns → column → heading) with all attributes
- **REST API Integration**: Fetches posts and pages via `/wp-json/wp/v2/` endpoints

#### WordPress Test Logger
- **Comprehensive Testing Interface**: `/wordpress-test` route for WordPress integration testing
- **Real-time Logging**: Step-by-step progress tracking with timestamps
- **Quick Test URLs**: Pre-configured tests for WordPress.org, TechCrunch, Smashing Magazine, CSS-Tricks
- **Custom URL Testing**: Test any WordPress site with detailed logging
- **Block Analytics**: View block counts, types, and structure analysis
- **JSON Data Preview**: Inspect WordPress API responses and parsed blocks

#### WordPress Clone Features
- **Posts & Pages**: Fetch unlimited posts and pages from WordPress REST API
- **Block Hierarchy**: Complete nested block structure with attributes
- **Meta Data**: Site info, version detection, API endpoint discovery
- **Page Builder Data**: Specialized handling for page builder content
- **Error Handling**: Graceful fallbacks for REST API authentication and CORS issues

### Optimization Techniques

#### HTML Optimization
- Minify HTML (remove whitespace and comments)
- Add lazy loading to images
- Add async/defer to scripts
- Add width/height to images (prevent CLS)
- Add resource hints (dns-prefetch, preconnect, preload)
- Optimize meta tags
- Lazy load iframes
- Remove unnecessary comments

#### CSS Optimization
- Minify CSS
- Remove unused CSS rules
- Extract critical CSS (above-the-fold)
- Defer non-critical CSS
- Combine multiple CSS files
- Remove duplicate rules
- Optimize CSS selectors

#### JavaScript Optimization
- Minify JS with Terser
- Remove console.log statements
- Remove debugger statements
- Add defer to non-critical scripts
- Add async to independent scripts
- Remove duplicate scripts

#### Image Optimization
- Add lazy loading (loading="lazy")
- Add dimensions (width/height attributes)
- Add decoding="async"
- Add fetchpriority="high" to hero images
- Detect missing alt text
- Convert data URLs to external files

#### Performance Optimization
- Critical CSS extraction
- Resource hints generation
- Preload critical resources
- DNS prefetch for external domains
- Preconnect to required origins

### WordPress Page Builders (🆕 Unified System)

Export your cloned website to any of these 11 popular WordPress builders using our **unified builder system**:

| Builder | Format | Use Case | Export Method |
|---------|--------|----------|---------------|
| **Elementor** | JSON | Most popular drag-and-drop builder | Native blocks + Playwright fallback |
| **Gutenberg** | HTML | WordPress core block editor | Native blocks pass-through |
| **Divi Builder** | Shortcode | Elegant Themes page builder | Native blocks + computed styles |
| **Beaver Builder** | Shortcode | Professional drag-and-drop | Native blocks + fallback |
| **Bricks** | JSON | Modern visual site builder | Native blocks + computed styles |
| **Oxygen** | JSON | Developer-friendly visual builder | Native blocks + fallback |
| **Kadence** | HTML | Gutenberg-enhanced blocks | Native blocks + styling |
| **Brizy** | JSON | Next-gen website builder | Native blocks + fallback |
| **Plugin-Free** | HTML | Lightweight, no dependencies | Pure semantic HTML |
| **OptimizePress** | Shortcode | Landing pages & sales funnels | Native blocks + fallback |
| **Crocoblock** | JSON | Dynamic content & custom post types | Native blocks + JetEngine |

#### 🎯 Dual Input System

Each builder supports **two conversion methods** for maximum compatibility:

1. **Native WordPress Blocks (BEST)** - Perfect block-to-widget mapping from REST API
   ```typescript
   const result = await unifiedExportService.export({
     builderName: 'elementor',
     nativeBlocks: blocks // From WordPress REST API
   });
   ```

2. **Playwright Fallback** - Uses computed styles when REST API is blocked
   ```typescript
   const result = await unifiedExportService.export({
     builderName: 'elementor',
     playwrightData: pageData // From browser extraction
   });
   ```

#### 📚 Usage Guide

See [BUILDER_USAGE_GUIDE.md](./BUILDER_USAGE_GUIDE.md) for:
- Complete API documentation
- Code examples for all 11 builders
- Best practices and troubleshooting
- Block type support matrix
- Advanced features and customization

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Zustand for state management
- Lucide React for icons
- Recharts for performance graphs

### Key Libraries
- `axios` - HTTP requests and WordPress REST API calls
- `cheerio` - HTML parsing
- `jszip` - ZIP file generation
- `clean-css` - CSS minification
- `html-minifier-terser` - HTML minification
- `terser` - JavaScript minification
- `playwright` - Browser automation for complex site cloning (Railway backend)

### Backend Services
- **Railway**: Docker container running Playwright for browser automation
  - Full Chromium support with all dependencies
  - 5-minute timeout (vs 10-second on Vercel)
  - WordPress REST API integration
  - Browser-based screenshot capture
- **Vercel**: Frontend hosting with serverless functions
  - React app deployment
  - API proxy to Railway backend
  - Fast global CDN

## Installation

```bash
npm install
```

## Usage

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

### Testing WordPress Integration

Access the WordPress Test Logger at `/wordpress-test` (requires authentication):

```bash
# Start development server
npm run dev

# Navigate to http://localhost:5173/wordpress-test
```

**Quick Test URLs:**
- WordPress.org News - Official WordPress site
- TechCrunch - Large publication
- Smashing Magazine - WordPress magazine
- CSS-Tricks - Web development blog
- Example.com - Non-WordPress site (negative test)

**What Gets Logged:**
1. WordPress Detection (REST API availability, version, site info)
2. API Test (endpoint validation)
3. Fetch Posts (retrieves posts from `/wp/v2/posts`)
4. Fetch Pages (retrieves pages from `/wp/v2/pages`)
5. Parse Blocks (extracts WordPress block structure)
6. Clone Summary (final statistics and results)

### Running Tests

```bash
# Run all unit tests
npm test

# Run WordPress API service tests specifically
npm test WordPressAPIService
```

The test suite includes 21 comprehensive tests for WordPress block parsing:
- Simple and nested block parsing
- Custom block namespaces (ACF, Elementor, etc.)
- Malformed JSON handling
- Real-world WordPress content scenarios
- Block filtering and depth limiting

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How It Works

### 1. Clone a Website

Enter a URL and click "Clone & Optimize". The system will:
- **Detect WordPress**: Automatically checks if the site is WordPress via REST API
- **Parse Blocks**: For WordPress sites, extracts native Gutenberg blocks with attributes
- **Fetch Content**: Downloads posts, pages, and media via `/wp-json/wp/v2/` endpoints
- **Extract Assets**: For non-WordPress sites, parses HTML and extracts images, CSS, JS, fonts
- **Page Builder Detection**: Identifies which page builder is in use (if any)
- **Preserve Structure**: Maintains original hierarchy and relationships

#### WordPress Detection Flow
```typescript
// Step 1: Detection (< 2 seconds)
const detection = await wordPressAPIService.detectWordPress(url);
// Returns: { isWordPress: true, apiUrl, siteInfo, pageBuilder, confidence }

// Step 2: Clone via REST API
if (detection.isWordPress) {
  const clone = await wordPressAPIService.cloneWordPressSite(apiUrl);
  // Returns: { posts, pages, blocks, metadata }
}

// Step 3: Parse Native Blocks
const blocks = wordPressAPIService.parseWordPressBlocks(content);
// Returns: [{ namespace, name, attributes, innerHTML, innerBlocks }]
```

### 2. Performance Analysis

The system analyzes:
- HTML, CSS, and JavaScript file sizes
- Image count and total size
- External resources count
- Render-blocking resources
- Layout shift issues
- Missing optimizations

Performance score is calculated based on:
```typescript
score = 100 - penalties

Penalties:
- HTML size > 200KB: -10 points
- CSS size > 500KB: -15 points
- JS size > 1MB: -20 points
- Render-blocking resources > 6: -15 points
- Images without lazy loading > 10: -10 points
```

### 3. Automatic Optimization

The system applies optimizations automatically:
- Minifies all text-based files (HTML, CSS, JS)
- Adds lazy loading to images
- Adds async/defer to scripts
- Extracts critical CSS
- Adds resource hints
- Optimizes iframes

### 4. Export

Choose from multiple export formats:
- **HTML Package**: Optimized HTML with all assets
- **WordPress Page Builder**: JSON/shortcode for your chosen builder
- **WordPress Theme**: Complete theme package
- **Static Site**: Deployment-ready for Netlify/Vercel
- **React Component**: JSX conversion with Tailwind CSS

### WordPress Builder Export

#### Elementor Export
Converts HTML structure to Elementor JSON with:
- Sections and columns
- Heading, text, image, and button widgets
- Icon boxes, testimonials, and counters
- Video and carousel widgets
- Tabs, accordions, and galleries

Import instructions:
1. Go to Pages > Add New in WordPress
2. Click "Edit with Elementor"
3. Click Templates > Import
4. Upload the JSON file
5. Click "Import Now"

#### Gutenberg Export
Converts HTML to Gutenberg blocks:
```html
<!-- wp:heading {"level":2,"textAlign":"center"} -->
<h2 class="wp-block-heading has-text-align-center">Your Heading</h2>
<!-- /wp:heading -->
```

Import instructions:
1. Go to Pages > Add New
2. Click the three dots menu
3. Select "Code editor"
4. Paste the exported blocks
5. Switch back to "Visual editor"

## Project Structure

```
website-cloner-pro/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── CloneInput.tsx          # URL/file input form with WordPress detection
│   │   │   └── ProjectCard.tsx         # Project list item
│   │   ├── wordpress/
│   │   │   ├── WordPressTestLogger.tsx # WordPress REST API test interface
│   │   │   └── WordPressDetectionBadge.tsx # WordPress detection badge
│   │   ├── export/
│   │   │   └── ExportModal.tsx         # Export dialog
│   │   ├── ui/
│   │   │   ├── Button.tsx              # Button component
│   │   │   ├── Card.tsx                # Card component
│   │   │   ├── Badge.tsx               # Badge component
│   │   │   └── Progress.tsx            # Progress indicators
│   │   ├── Dashboard.tsx               # Main dashboard view
│   │   └── ProjectDetail.tsx           # Project detail view
│   ├── services/
│   │   ├── CloneService.ts             # Website cloning logic
│   │   ├── PerformanceService.ts       # Performance analysis
│   │   ├── OptimizationService.ts      # Optimization engine
│   │   └── wordpress/
│   │       ├── WordPressAPIService.ts  # REST API integration (NEW!)
│   │       ├── ElementorService.ts     # Elementor export
│   │       └── GutenbergService.ts     # Gutenberg export
│   ├── stores/
│   │   └── projectStore.ts             # Zustand state management
│   ├── types/
│   │   ├── index.ts                    # Core TypeScript types
│   │   └── wordpress.ts                # WordPress types (NEW!)
│   ├── pages/
│   │   └── WordPressTestPage.tsx       # WordPress test logger page (NEW!)
│   └── App.tsx                         # Main app component
├── api/
│   └── capture.ts                      # Playwright browser automation (Railway)
├── Dockerfile                          # Docker config for Railway deployment
├── railway.json                        # Railway deployment config
├── package.json
└── README.md
```

## Performance Score Breakdown

### Excellent (90-100)
- Optimized HTML, CSS, and JS
- All images have lazy loading
- No render-blocking resources
- Critical CSS extracted
- Resource hints configured

### Good (70-89)
- Minified files
- Most images optimized
- Some render-blocking resources
- Basic optimizations applied

### Needs Improvement (50-69)
- Large file sizes
- Missing lazy loading
- Multiple render-blocking resources
- No critical CSS

### Poor (0-49)
- Very large page size (> 5MB)
- No optimizations
- Missing viewport meta tag
- Many critical issues

## Issue Detection

The system detects and categorizes issues:

### Critical Issues (-10 points each)
- Page size > 5MB
- Render-blocking resources > 6
- No viewport meta tag
- Missing lazy loading on 10+ images

### High Priority (-5 points each)
- Page size > 2MB
- CSS size > 500KB
- JS size > 1MB
- 50+ external resources

### Medium Priority (-3 points each)
- Missing image dimensions
- No lazy loading on 5+ images
- 20+ external resources
- Missing font preloading

### Low Priority (-1 point each)
- Multiple inline scripts
- Unoptimized SVGs
- Missing alt attributes

## Recommendations

Based on detected issues, the system provides actionable recommendations:
- Fix critical performance issues immediately
- Implement lazy loading for below-the-fold images
- Defer non-critical CSS and JavaScript
- Minify and compress all text-based assets
- Add explicit dimensions to prevent layout shift

## Advanced Options

When cloning a website, you can configure:
- **Follow Links**: Crawl internal links up to specified depth
- **Respect robots.txt**: Honor website's crawling rules
- **Include Assets**: Download images, CSS, JS, and fonts
- **Crawl Depth**: 1-5 levels of link following

## Deployment

### Railway + Vercel Architecture

This project uses a split architecture for optimal performance:

**Railway (Backend):**
- Runs Playwright in Docker container
- Full Chromium browser with all dependencies
- 5-minute timeout for complex operations
- Handles WordPress REST API calls
- Auto-deploys from GitHub `main` branch

**Vercel (Frontend):**
- Hosts React application
- Serverless functions for API proxy
- Global CDN for fast delivery
- Auto-deploys from GitHub `main` branch

### Environment Variables

Required for production deployment:

```bash
# Railway Backend
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000

# Vercel Frontend
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAILWAY_API_URL=https://your-railway-app.railway.app
```

See `RAILWAY_DEPLOYMENT_GUIDE.md` for complete deployment instructions.

## Limitations

### General Limitations
- CORS restrictions may prevent cloning some websites
- Large websites may take longer to clone
- Some dynamic content may not be captured
- Asset downloads depend on network speed

### WordPress-Specific Limitations
- **REST API Required**: WordPress sites must have REST API enabled (most do by default)
- **Authentication**: Private/draft content requires authentication (public content works fine)
- **Custom Endpoints**: Custom post types may need additional endpoint configuration
- **Page Builder Content**: Some page builders store data in proprietary formats
- **CORS**: Some WordPress sites may have CORS restrictions (use Railway backend to bypass)

## Advanced Optimization System (In Progress)

A comprehensive optimization system is being integrated with these features:

### Image Optimization (Ready to Implement)
- WebP/AVIF conversion using Sharp (25-35% size reduction)
- Responsive image generation (320px to 1920px)
- Progressive JPEG optimization
- Automatic format detection and conversion

### Performance Fix Service (Ready to Implement)
- **30+ Performance Fixes** with dependency management
- Interactive fix selection (Safe/Aggressive/Custom modes)
- Test mode (preview changes) vs Live mode (apply changes)
- Automatic rollback capability
- Fix categories: Images, CSS, JS, HTML, Fonts

### Custom Minifiers (Ready to Implement)
- CSS Minifier (20-40% reduction, no heavy dependencies)
- JS Minifier (30-50% reduction)
- HTML Minifier (5-15% reduction)

### Advanced CSS Analysis (Ready to Implement)
- Critical CSS Extraction (50-70% faster FCP)
- Unused CSS Detection (60-80% reduction)
- Works without Puppeteer (Cheerio-based)

### Performance Auditing (Ready to Implement)
- Estimates Core Web Vitals (FCP, LCP, CLS, TBT, TTI)
- Comprehensive asset analysis
- Prioritized recommendations
- Overall performance scoring

**See `/IMPLEMENTATION_SUMMARY.md` for complete details and next steps.**

## Future Enhancements

- Real User Monitoring (RUM)
- A/B testing support
- SEO analysis and optimization
- Accessibility (a11y) checks

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Built with ❤️ using React, TypeScript, and modern web technologies**

