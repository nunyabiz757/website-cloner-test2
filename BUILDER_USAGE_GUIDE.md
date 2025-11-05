# WordPress Builder Usage Guide

Complete guide for using the unified WordPress builder system in Website Cloner Pro.

## Table of Contents
- [Quick Start](#quick-start)
- [Builder Overview](#builder-overview)
- [Usage Examples](#usage-examples)
- [Builder Formats](#builder-formats)
- [API Reference](#api-reference)
- [Advanced Features](#advanced-features)

## Quick Start

### 1. Export to Single Builder

```typescript
import { unifiedExportService } from './services/wordpress/UnifiedExportService';

// Export to Elementor (native blocks)
const result = await unifiedExportService.export({
  builderName: 'elementor',
  nativeBlocks: blocks // From WordPress REST API
});

console.log(result.format); // 'json'
console.log(result.content); // Elementor JSON structure
console.log(result.metadata.widgetCount); // Number of widgets created
```

### 2. Export to Multiple Builders

```typescript
// Export to multiple formats at once
const results = await unifiedExportService.exportToMultiple(
  ['elementor', 'divi', 'gutenberg'],
  { nativeBlocks: blocks }
);

// Access each result
console.log(results.elementor.content); // Elementor JSON
console.log(results.divi.content); // Divi shortcode
console.log(results.gutenberg.content); // Gutenberg HTML
```

### 3. Playwright Fallback

```typescript
// When REST API is blocked, use Playwright data
const result = await unifiedExportService.export({
  builderName: 'elementor',
  playwrightData: pageData // From browser extraction
});
```

## Builder Overview

### Available Builders

| Builder | Format | Best For | Popularity |
|---------|--------|----------|------------|
| **Elementor** | JSON | Most popular drag-and-drop builder | ⭐⭐⭐⭐⭐ |
| **Gutenberg** | HTML | Native WordPress block editor | ⭐⭐⭐⭐⭐ |
| **Divi** | Shortcode | Elegant Themes page builder | ⭐⭐⭐⭐ |
| **Beaver Builder** | Shortcode | Professional page builder | ⭐⭐⭐⭐ |
| **Bricks** | JSON | Modern visual site builder | ⭐⭐⭐ |
| **Oxygen** | JSON | Visual design tool | ⭐⭐⭐ |
| **Kadence** | HTML | Gutenberg-enhanced blocks | ⭐⭐⭐ |
| **Brizy** | JSON | Next-gen website builder | ⭐⭐ |
| **Plugin-Free** | HTML | Lightweight, no dependencies | ⭐⭐⭐ |
| **OptimizePress** | Shortcode | Landing pages & sales funnels | ⭐⭐ |
| **Crocoblock** | JSON | Dynamic content & CPTs | ⭐⭐ |

### Builder Detection

```typescript
// Auto-detect builder from HTML
const builderName = unifiedExportService.detectBuilder(html);

if (builderName) {
  console.log(`Detected: ${builderName}`);
  const result = await unifiedExportService.export({
    builderName,
    playwrightData: pageData
  });
}
```

## Usage Examples

### Example 1: Clone WordPress Site to Elementor

```typescript
import { smartCloneService } from './services/SmartCloneService';
import { unifiedExportService } from './services/wordpress/UnifiedExportService';

// Step 1: Clone the site
const cloneResult = await smartCloneService.clone('https://example.com');

if (cloneResult.success && cloneResult.source === 'wordpress-rest-api') {
  // Step 2: Export to Elementor
  const exportResult = await unifiedExportService.export({
    builderName: 'elementor',
    nativeBlocks: cloneResult.data.pages[0].blocks
  });

  // Step 3: Save or use the exported content
  console.log('Elementor JSON:', exportResult.content);
  console.log('Widgets created:', exportResult.metadata?.widgetCount);
}
```

### Example 2: Convert Between Builders

```typescript
// Convert from Gutenberg to Divi
const gutenbergBlocks = [...]; // WordPress native blocks

const diviResult = await unifiedExportService.export({
  builderName: 'divi',
  nativeBlocks: gutenbergBlocks
});

console.log('Divi Shortcode:', diviResult.content);
// Output: [et_pb_section][et_pb_row]...[/et_pb_row][/et_pb_section]
```

### Example 3: Fallback to Playwright

```typescript
import { smartCloneService } from './services/SmartCloneService';
import { unifiedExportService } from './services/wordpress/UnifiedExportService';

// Clone site with Playwright fallback
const cloneResult = await smartCloneService.clone('https://blocked-api.com');

if (cloneResult.success && cloneResult.source === 'wordpress-playwright') {
  // Use Playwright data for export
  const exportResult = await unifiedExportService.export({
    builderName: 'elementor',
    playwrightData: cloneResult.data
  });

  console.log('Conversion method:', exportResult.metadata?.conversionMethod);
  // Output: 'playwright'
}
```

### Example 4: Export to Plugin-Free HTML

```typescript
// Create lightweight, dependency-free HTML
const result = await unifiedExportService.export({
  builderName: 'plugin-free',
  nativeBlocks: blocks
});

console.log('Pure HTML:', result.content);
// Output: <h1>Title</h1><p>Content</p>...
// No WordPress classes, no builder dependencies!
```

### Example 5: Batch Export for Comparison

```typescript
// Export to all builders for comparison
const builders = unifiedExportService.getAvailableBuilders();

const results = await unifiedExportService.exportToMultiple(
  builders,
  { nativeBlocks: blocks }
);

// Compare widget counts
for (const [name, result] of Object.entries(results)) {
  console.log(`${name}: ${result.metadata?.widgetCount} widgets`);
}
```

## Builder Formats

### JSON Builders

**Elementor, Bricks, Oxygen, Brizy, Crocoblock**

```typescript
const result = await unifiedExportService.export({
  builderName: 'elementor',
  nativeBlocks: blocks
});

// Result structure
{
  format: 'json',
  content: {
    version: '3.0.0',
    title: 'Imported Template',
    type: 'page',
    content: [
      {
        id: 'abc123',
        elType: 'section',
        elements: [...]
      }
    ]
  },
  metadata: {
    widgetCount: 15,
    sectionCount: 3,
    conversionMethod: 'native',
    buildTime: 45
  }
}
```

### Shortcode Builders

**Divi, Beaver Builder, OptimizePress**

```typescript
const result = await unifiedExportService.export({
  builderName: 'divi',
  nativeBlocks: blocks
});

// Result structure
{
  format: 'shortcode',
  content: '[et_pb_section][et_pb_row][et_pb_column type="4_4"]...',
  metadata: {
    widgetCount: 12,
    sectionCount: 2,
    conversionMethod: 'native',
    buildTime: 32
  }
}
```

### HTML Builders

**Gutenberg, Kadence, Plugin-Free**

```typescript
const result = await unifiedExportService.export({
  builderName: 'gutenberg',
  nativeBlocks: blocks
});

// Result structure
{
  format: 'html',
  content: '<!-- wp:heading {"level":2} -->\n<h2>Title</h2>\n<!-- /wp:heading -->',
  metadata: {
    widgetCount: 8,
    sectionCount: 8,
    conversionMethod: 'native',
    buildTime: 28
  }
}
```

## API Reference

### UnifiedExportService

#### `export(options: ExportOptions): Promise<ExportResult>`

Export content to a single builder.

**Parameters:**
- `options.builderName` - Builder to export to (see [Builder Overview](#builder-overview))
- `options.nativeBlocks?` - WordPress blocks from REST API (preferred)
- `options.playwrightData?` - Page data from browser (fallback)

**Returns:**
```typescript
{
  format: 'json' | 'html' | 'shortcode',
  content: any,
  builder: BuilderName,
  success: boolean,
  error?: string,
  metadata?: {
    widgetCount: number,
    sectionCount: number,
    conversionMethod: 'native' | 'playwright',
    buildTime?: number
  }
}
```

#### `exportToMultiple(builders, input): Promise<Record<BuilderName, ExportResult>>`

Export to multiple builders at once.

**Parameters:**
- `builders` - Array of builder names
- `input.nativeBlocks?` - WordPress blocks
- `input.playwrightData?` - Playwright data

**Returns:** Object mapping builder names to their results

#### `getAvailableBuilders(): BuilderName[]`

Get list of all supported builders.

**Returns:** Array of 11 builder names

#### `getBuilderInfo(builderName): BuilderInfo | null`

Get metadata about a builder.

**Returns:**
```typescript
{
  name: string,         // Display name
  format: 'json' | 'html' | 'shortcode',
  description: string   // Builder description
}
```

#### `detectBuilder(html): BuilderName | null`

Auto-detect builder from HTML content.

**Returns:** Detected builder name or null

### Individual Builders

All builders implement the same interface:

```typescript
interface BaseUnifiedBuilder {
  convert(input: BuilderInput): Promise<BuilderOutput>
}
```

**Direct Usage:**
```typescript
import { unifiedElementorBuilder } from './builders/UnifiedElementorBuilder';

const result = await unifiedElementorBuilder.convert({
  type: 'native-blocks',
  blocks: wordPressBlocks
});
```

## Advanced Features

### 1. Metadata Tracking

Every export includes detailed metadata:

```typescript
const result = await unifiedExportService.export({
  builderName: 'elementor',
  nativeBlocks: blocks
});

console.log('Build time:', result.metadata?.buildTime, 'ms');
console.log('Widgets created:', result.metadata?.widgetCount);
console.log('Sections created:', result.metadata?.sectionCount);
console.log('Method used:', result.metadata?.conversionMethod);
```

### 2. Error Handling

```typescript
const result = await unifiedExportService.export({
  builderName: 'elementor',
  nativeBlocks: blocks
});

if (!result.success) {
  console.error('Export failed:', result.error);
  // Handle error gracefully
} else {
  // Process successful result
  console.log('Export successful!');
}
```

### 3. Builder Comparison

```typescript
// Compare output sizes
const results = await unifiedExportService.exportToMultiple(
  ['elementor', 'divi', 'plugin-free'],
  { nativeBlocks: blocks }
);

for (const [name, result] of Object.entries(results)) {
  const size = JSON.stringify(result.content).length;
  console.log(`${name}: ${size} bytes`);
}
```

### 4. Custom Processing

```typescript
// Post-process exported content
const result = await unifiedExportService.export({
  builderName: 'elementor',
  nativeBlocks: blocks
});

if (result.format === 'json') {
  // Modify JSON structure
  result.content.customField = 'value';
} else if (result.format === 'shortcode') {
  // Add custom shortcode attributes
  result.content = result.content.replace(
    '[et_pb_section',
    '[et_pb_section custom_attr="value"'
  );
}
```

### 5. Playwright Data Extraction

```typescript
import { playwrightParserService } from './services/parsers/PlaywrightParserService';

// Extract page data with computed styles
const pageData = await playwrightParserService.loadPageData(url, {
  extractStyles: true,
  takeScreenshot: false
});

// Use for export
const result = await unifiedExportService.export({
  builderName: 'elementor',
  playwrightData: pageData
});
```

## Block Type Support

All builders support these WordPress blocks:

- ✅ **Headings** (h1-h6) - with levels, colors, alignment
- ✅ **Paragraphs** - with text formatting, colors
- ✅ **Images** - with URLs, alt text, alignment
- ✅ **Buttons** - with links, colors, styling
- ✅ **Lists** - ordered and unordered
- ✅ **Quotes** - blockquotes
- ✅ **Videos** - YouTube, Vimeo, hosted
- ✅ **Embeds** - iframes, media embeds
- ✅ **Columns** - multi-column layouts
- ✅ **Groups/Containers** - nested content

## Best Practices

### 1. Prefer Native Blocks

Always use native WordPress blocks when available:

```typescript
// ✅ BEST - Native blocks from REST API
const result = await unifiedExportService.export({
  builderName: 'elementor',
  nativeBlocks: blocks // Perfect block-to-widget mapping
});

// ⚠️ FALLBACK - Playwright when REST API blocked
const result = await unifiedExportService.export({
  builderName: 'elementor',
  playwrightData: pageData // Uses computed styles
});
```

### 2. Handle Errors Gracefully

```typescript
const result = await unifiedExportService.export({
  builderName: 'elementor',
  nativeBlocks: blocks
});

if (!result.success) {
  // Log error for debugging
  console.error('Export error:', result.error);

  // Try fallback builder
  const fallback = await unifiedExportService.export({
    builderName: 'plugin-free',
    nativeBlocks: blocks
  });
}
```

### 3. Validate Builder Names

```typescript
const builders = unifiedExportService.getAvailableBuilders();

if (builders.includes(userInput)) {
  // Safe to export
  await unifiedExportService.export({
    builderName: userInput,
    nativeBlocks: blocks
  });
} else {
  console.error('Unknown builder:', userInput);
}
```

### 4. Monitor Performance

```typescript
const start = Date.now();

const result = await unifiedExportService.export({
  builderName: 'elementor',
  nativeBlocks: blocks
});

console.log('Export took:', Date.now() - start, 'ms');
console.log('Builder processing:', result.metadata?.buildTime, 'ms');
```

## Troubleshooting

### Export Returns Empty Content

**Problem:** Result content is empty or has 0 widgets

**Solution:**
- Check that blocks array is not empty
- Verify blocks have valid `innerHTML` or text content
- Ensure Playwright data has visible elements

### Unknown Builder Error

**Problem:** "Unknown builder: xyz"

**Solution:**
- Use `getAvailableBuilders()` to see valid names
- Builder names are case-insensitive but must match exactly
- Some builders have aliases (e.g., 'beaver-builder' or 'beaverbuilder')

### Playwright Conversion Issues

**Problem:** Playwright fallback produces incorrect output

**Solution:**
- Verify elements have computed styles
- Check that elements are marked as visible
- Ensure Railway backend is running (for Playwright)

## Support

For issues, questions, or feature requests:
- 📝 GitHub Issues: https://github.com/nunyabiz757/website-cloner-test2/issues
- 📖 Documentation: PROMPT3_IMPLEMENTATION_STATUS.md
- 🧪 Tests: See `__tests__` directories

---

**Last Updated:** 2025-01-05
**Version:** 1.0.0
**Builders:** 11/11 Complete
