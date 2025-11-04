import { WordPressTestLogger } from '../components/wordpress/WordPressTestLogger';

/**
 * WordPress REST API Test Page
 *
 * Phase 7: Testing & Validation
 * Provides comprehensive logging and testing interface for WordPress detection and cloning
 */
export function WordPressTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <WordPressTestLogger />
    </div>
  );
}
