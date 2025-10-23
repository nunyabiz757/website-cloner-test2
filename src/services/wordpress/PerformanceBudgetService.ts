import type {
  PerformanceBudget,
  BudgetValidationResult,
  BudgetViolation,
  BudgetCheck,
} from '../../types/wordpress-export.types';

export class PerformanceBudgetService {
  private readonly DEFAULT_BUDGET: PerformanceBudget = {
    html: {
      maxSize: 500 * 1024,
      maxLineLength: 10000,
    },
    css: {
      maxSizePerFile: 100 * 1024,
      maxTotalSize: 300 * 1024,
    },
    js: {
      maxSizePerFile: 150 * 1024,
      maxTotalSize: 500 * 1024,
    },
    images: {
      maxSizePerImage: 500 * 1024,
      maxTotalSize: 5 * 1024 * 1024,
    },
    page: {
      maxTotalSize: 10 * 1024 * 1024,
      maxRequests: 50,
    },
    allowOverride: true,
  };

  async validateBudget(
    html: string,
    css: string[],
    js: string[],
    images: string[],
    customBudget?: PerformanceBudget
  ): Promise<BudgetValidationResult> {
    const budget = customBudget || this.DEFAULT_BUDGET;
    const violations: BudgetViolation[] = [];
    const passed: BudgetCheck[] = [];

    const htmlSize = html.length;
    if (htmlSize > budget.html.maxSize) {
      violations.push({
        category: 'HTML',
        item: 'Main HTML file',
        current: htmlSize,
        budget: budget.html.maxSize,
        exceeded: htmlSize - budget.html.maxSize,
        percentage: (htmlSize / budget.html.maxSize) * 100,
        severity: htmlSize > budget.html.maxSize * 1.5 ? 'critical' : 'warning',
        recommendation: 'Consider minifying HTML or splitting into smaller templates',
      });
    } else {
      passed.push({
        category: 'HTML',
        current: htmlSize,
        budget: budget.html.maxSize,
        status: 'pass',
      });
    }

    let totalCssSize = 0;
    css.forEach((cssContent, index) => {
      const size = cssContent.length;
      totalCssSize += size;

      if (size > budget.css.maxSizePerFile) {
        violations.push({
          category: 'CSS',
          item: `CSS file ${index + 1}`,
          current: size,
          budget: budget.css.maxSizePerFile,
          exceeded: size - budget.css.maxSizePerFile,
          percentage: (size / budget.css.maxSizePerFile) * 100,
          severity: size > budget.css.maxSizePerFile * 2 ? 'critical' : 'warning',
          recommendation: 'Minify CSS, remove unused rules, or split into smaller files',
        });
      }
    });

    if (totalCssSize > budget.css.maxTotalSize) {
      violations.push({
        category: 'CSS',
        item: 'Total CSS',
        current: totalCssSize,
        budget: budget.css.maxTotalSize,
        exceeded: totalCssSize - budget.css.maxTotalSize,
        percentage: (totalCssSize / budget.css.maxTotalSize) * 100,
        severity: totalCssSize > budget.css.maxTotalSize * 1.5 ? 'critical' : 'warning',
        recommendation: 'Remove unused CSS, enable critical CSS extraction',
      });
    } else {
      passed.push({
        category: 'CSS Total',
        current: totalCssSize,
        budget: budget.css.maxTotalSize,
        status: 'pass',
      });
    }

    let totalJsSize = 0;
    js.forEach((jsContent, index) => {
      const size = jsContent.length;
      totalJsSize += size;

      if (size > budget.js.maxSizePerFile) {
        violations.push({
          category: 'JavaScript',
          item: `JS file ${index + 1}`,
          current: size,
          budget: budget.js.maxSizePerFile,
          exceeded: size - budget.js.maxSizePerFile,
          percentage: (size / budget.js.maxSizePerFile) * 100,
          severity: size > budget.js.maxSizePerFile * 2 ? 'critical' : 'warning',
          recommendation: 'Minify JavaScript, remove unused code, or use code splitting',
        });
      }
    });

    if (totalJsSize > budget.js.maxTotalSize) {
      violations.push({
        category: 'JavaScript',
        item: 'Total JavaScript',
        current: totalJsSize,
        budget: budget.js.maxTotalSize,
        exceeded: totalJsSize - budget.js.maxTotalSize,
        percentage: (totalJsSize / budget.js.maxTotalSize) * 100,
        severity: totalJsSize > budget.js.maxTotalSize * 1.5 ? 'critical' : 'warning',
        recommendation: 'Defer non-critical scripts, use async loading',
      });
    } else {
      passed.push({
        category: 'JavaScript Total',
        current: totalJsSize,
        budget: budget.js.maxTotalSize,
        status: 'pass',
      });
    }

    let totalImageSize = 0;
    images.forEach((imagePath, index) => {
      const size = imagePath.length;
      totalImageSize += size;

      if (size > budget.images.maxSizePerImage) {
        violations.push({
          category: 'Images',
          item: `Image ${index + 1}`,
          current: size,
          budget: budget.images.maxSizePerImage,
          exceeded: size - budget.images.maxSizePerImage,
          percentage: (size / budget.images.maxSizePerImage) * 100,
          severity: size > budget.images.maxSizePerImage * 2 ? 'critical' : 'warning',
          recommendation: 'Compress images, use modern formats (WebP, AVIF)',
        });
      }
    });

    if (totalImageSize > budget.images.maxTotalSize) {
      violations.push({
        category: 'Images',
        item: 'Total Images',
        current: totalImageSize,
        budget: budget.images.maxTotalSize,
        exceeded: totalImageSize - budget.images.maxTotalSize,
        percentage: (totalImageSize / budget.images.maxTotalSize) * 100,
        severity: 'warning',
        recommendation: 'Implement lazy loading, optimize all images',
      });
    } else {
      passed.push({
        category: 'Images Total',
        current: totalImageSize,
        budget: budget.images.maxTotalSize,
        status: 'pass',
      });
    }

    const totalSize = htmlSize + totalCssSize + totalJsSize + totalImageSize;
    if (totalSize > budget.page.maxTotalSize) {
      violations.push({
        category: 'Page',
        item: 'Total Page Size',
        current: totalSize,
        budget: budget.page.maxTotalSize,
        exceeded: totalSize - budget.page.maxTotalSize,
        percentage: (totalSize / budget.page.maxTotalSize) * 100,
        severity: 'critical',
        recommendation: 'Overall page optimization needed - compress all assets',
      });
    } else {
      passed.push({
        category: 'Page Total',
        current: totalSize,
        budget: budget.page.maxTotalSize,
        status: 'pass',
      });
    }

    const criticalViolations = violations.filter(v => v.severity === 'critical').length;
    const canExport = violations.length === 0 || budget.allowOverride;
    const requiresOverride = violations.length > 0 && budget.allowOverride;

    return {
      canExport,
      requiresOverride,
      summary: {
        totalChecks: violations.length + passed.length,
        passed: passed.length,
        violations: violations.length,
        totalViolations: violations.length,
      },
      violations,
      passed,
    };
  }

  generateReport(result: BudgetValidationResult): string {
    const lines: string[] = [];

    lines.push('╔══════════════════════════════════════════════════════════════╗');
    lines.push('║         PERFORMANCE BUDGET VALIDATION REPORT                 ║');
    lines.push('╚══════════════════════════════════════════════════════════════╝');
    lines.push('');

    if (result.canExport && !result.requiresOverride) {
      lines.push('✅ ALL CHECKS PASSED');
    } else if (result.canExport && result.requiresOverride) {
      lines.push('⚠️  VIOLATIONS DETECTED - OVERRIDE REQUIRED');
    } else {
      lines.push('❌ EXPORT BLOCKED - BUDGET VIOLATIONS');
    }

    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('');
    lines.push('Summary:');
    lines.push(`  Total Checks:  ${result.summary.totalChecks}`);
    lines.push(`  Passed:        ${result.summary.passed}`);
    lines.push(`  Violations:    ${result.summary.violations}`);
    lines.push('');

    if (result.violations.length > 0) {
      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      lines.push('');
      lines.push('VIOLATIONS:');
      lines.push('');

      result.violations.forEach(violation => {
        const icon = violation.severity === 'critical' ? '🔴' : '⚠️';
        lines.push(`${icon} ${violation.category}: ${violation.item}`);
        lines.push(`   Current:  ${this.formatBytes(violation.current)}`);
        lines.push(`   Budget:   ${this.formatBytes(violation.budget)}`);
        lines.push(`   Exceeded: ${this.formatBytes(violation.exceeded)} (${violation.percentage.toFixed(1)}%)`);
        lines.push(`   Fix: ${violation.recommendation}`);
        lines.push('');
      });
    }

    if (result.passed.length > 0) {
      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      lines.push('');
      lines.push('PASSED CHECKS:');
      lines.push('');

      result.passed.forEach(check => {
        lines.push(`✅ ${check.category}: ${this.formatBytes(check.current)} / ${this.formatBytes(check.budget)}`);
      });
    }

    lines.push('');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return lines.join('\n');
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}
