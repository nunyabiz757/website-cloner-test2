/**
 * WordPress REST API Type Definitions
 *
 * These types define the structure of WordPress data fetched via the REST API,
 * including native Gutenberg blocks, page builder detection, and WordPress metadata.
 */

/**
 * Represents a single WordPress block (Gutenberg)
 *
 * Example block comment:
 * <!-- wp:heading {"level":2,"className":"custom-heading"} -->
 * <h2 class="custom-heading">My Title</h2>
 * <!-- /wp:heading -->
 */
export interface WordPressBlock {
  /** Block namespace (e.g., 'core', 'elementor', 'acf') */
  namespace: string;

  /** Block name (e.g., 'heading', 'paragraph', 'image') */
  name: string;

  /** Block attributes as JSON object (e.g., {level: 2, align: 'center'}) */
  attributes: Record<string, any>;

  /** Inner HTML content of the block */
  innerHTML: string;

  /** Nested child blocks (for container blocks like columns, groups) */
  innerBlocks: WordPressBlock[];
}

/**
 * WordPress post/page from REST API
 *
 * Endpoint: /wp-json/wp/v2/posts or /wp-json/wp/v2/pages
 */
export interface WordPressPost {
  /** Post ID */
  id: number;

  /** Post type (post, page, custom) */
  type: string;

  /** Post title */
  title: {
    rendered: string;
    raw?: string;
  };

  /** Post content with block comments */
  content: {
    rendered: string;
    raw?: string; // Contains block comments like <!-- wp:heading -->
  };

  /** Post excerpt */
  excerpt?: {
    rendered: string;
  };

  /** Post slug */
  slug: string;

  /** Post status (publish, draft, etc.) */
  status: string;

  /** Featured media ID */
  featured_media?: number;

  /** Post author ID */
  author?: number;

  /** Post date */
  date?: string;

  /** Post modified date */
  modified?: string;

  /** Post URL */
  link?: string;

  /** Parsed WordPress blocks */
  blocks?: WordPressBlock[];

  /** Post metadata */
  meta?: Record<string, any>;

  /** Post categories */
  categories?: number[];

  /** Post tags */
  tags?: number[];
}

/**
 * WordPress site information from REST API
 *
 * Endpoint: /wp-json/
 */
export interface WordPressSiteInfo {
  /** Site name */
  name: string;

  /** Site description */
  description: string;

  /** Site URL */
  url: string;

  /** Site home URL */
  home: string;

  /** GMT offset */
  gmt_offset: number;

  /** Timezone string */
  timezone_string: string;

  /** Available namespaces */
  namespaces: string[];

  /** Available routes */
  routes?: Record<string, any>;
}

/**
 * WordPress detection result
 */
export interface WordPressDetectionResult {
  /** Is this a WordPress site? */
  isWordPress: boolean;

  /** WordPress version */
  version?: string;

  /** REST API URL */
  apiUrl?: string;

  /** Site information */
  siteInfo?: WordPressSiteInfo;

  /** Detected page builder */
  pageBuilder?: WordPressPageBuilder;

  /** Detection confidence (0-100) */
  confidence: number;

  /** Detection errors */
  errors?: string[];
}

/**
 * Detected WordPress page builder
 */
export interface WordPressPageBuilder {
  /** Builder name */
  name: 'elementor' | 'divi' | 'beaver' | 'bricks' | 'oxygen' | 'gutenberg' | 'wpbakery' | 'unknown';

  /** Builder version */
  version?: string;

  /** Is builder active? */
  isActive: boolean;

  /** Builder-specific data endpoint */
  dataEndpoint?: string;
}

/**
 * WordPress clone result
 */
export interface WordPressCloneResult {
  /** Was the clone successful? */
  success: boolean;

  /** Total posts cloned */
  postsCloned: number;

  /** Total pages cloned */
  pagesCloned: number;

  /** Total blocks parsed */
  blocksCount: number;

  /** All posts and pages */
  posts: WordPressPost[];

  /** Site information */
  siteInfo?: WordPressSiteInfo;

  /** Page builder detected */
  pageBuilder?: WordPressPageBuilder;

  /** Clone errors */
  errors?: string[];

  /** Clone warnings */
  warnings?: string[];
}

/**
 * WordPress REST API response metadata
 */
export interface WordPressAPIResponse<T> {
  /** Response data */
  data: T;

  /** Total items available */
  total?: number;

  /** Total pages available */
  totalPages?: number;

  /** Current page */
  page?: number;

  /** Items per page */
  perPage?: number;
}

/**
 * WordPress block parsing options
 */
export interface BlockParsingOptions {
  /** Include inner HTML in blocks */
  includeHTML?: boolean;

  /** Maximum depth for nested blocks */
  maxDepth?: number;

  /** Parse only specific block types */
  blockTypes?: string[];

  /** Skip empty blocks */
  skipEmpty?: boolean;
}

/**
 * WordPress clone options
 */
export interface WordPressCloneOptions {
  /** Maximum posts to fetch */
  maxPosts?: number;

  /** Maximum pages to fetch */
  maxPages?: number;

  /** Include post metadata */
  includeMeta?: boolean;

  /** Include media */
  includeMedia?: boolean;

  /** Block parsing options */
  blockOptions?: BlockParsingOptions;

  /** Detect page builder */
  detectPageBuilder?: boolean;
}
