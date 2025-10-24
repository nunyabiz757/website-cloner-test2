import { ResponsiveStyles } from './BrowserService';

export interface ResponsiveDiff {
  selector: string;
  property: string;
  desktop: string;
  tablet: string;
  mobile: string;
  changed: boolean;
}

export interface ResponsiveReport {
  totalElements: number;
  responsiveElements: number;
  responsivePercentage: number;
  breakpointDiffs: ResponsiveDiff[];
  hiddenOnMobile: string[];
  hiddenOnTablet: string[];
  hiddenOnDesktop: string[];
}

export class ResponsiveAnalyzer {
  /**
   * Analyze responsive styles and create comparison report
   */
  analyze(responsiveStyles: ResponsiveStyles[]): ResponsiveReport {
    const mobile = responsiveStyles.find((s) => s.breakpoint === 'mobile');
    const tablet = responsiveStyles.find((s) => s.breakpoint === 'tablet');
    const desktop = responsiveStyles.find((s) => s.breakpoint === 'desktop');

    if (!mobile || !tablet || !desktop) {
      throw new Error('Missing required breakpoints: mobile, tablet, desktop');
    }

    const breakpointDiffs: ResponsiveDiff[] = [];
    const allSelectors = new Set([
      ...Object.keys(mobile.styles),
      ...Object.keys(tablet.styles),
      ...Object.keys(desktop.styles),
    ]);

    // Compare styles across breakpoints
    allSelectors.forEach((selector) => {
      const mobileStyle = mobile.styles[selector] || {};
      const tabletStyle = tablet.styles[selector] || {};
      const desktopStyle = desktop.styles[selector] || {};

      // Check each CSS property
      const properties = [
        'display',
        'width',
        'fontSize',
        'padding',
        'margin',
        'flexDirection',
        'gridTemplateColumns',
      ];

      properties.forEach((prop) => {
        const mobileVal = mobileStyle[prop];
        const tabletVal = tabletStyle[prop];
        const desktopVal = desktopStyle[prop];

        // If values differ, it's responsive
        const changed =
          mobileVal !== desktopVal || tabletVal !== desktopVal;

        if (changed) {
          breakpointDiffs.push({
            selector,
            property: prop,
            mobile: mobileVal || 'unset',
            tablet: tabletVal || 'unset',
            desktop: desktopVal || 'unset',
            changed: true,
          });
        }
      });
    });

    // Count unique responsive elements
    const responsiveSelectors = new Set(breakpointDiffs.map((d) => d.selector));

    return {
      totalElements: allSelectors.size,
      responsiveElements: responsiveSelectors.size,
      responsivePercentage: (responsiveSelectors.size / allSelectors.size) * 100,
      breakpointDiffs,
      hiddenOnMobile: mobile.hiddenElements,
      hiddenOnTablet: tablet.hiddenElements,
      hiddenOnDesktop: desktop.hiddenElements,
    };
  }

  /**
   * Generate human-readable report
   */
  generateReport(analysis: ResponsiveReport): string {
    let report = '# 📱 RESPONSIVE ANALYSIS REPORT\n\n';

    report += `## Summary\n`;
    report += `- Total Elements: ${analysis.totalElements}\n`;
    report += `- Responsive Elements: ${analysis.responsiveElements}\n`;
    report += `- Responsive Coverage: ${analysis.responsivePercentage.toFixed(1)}%\n\n`;

    report += `## Breakpoint Differences\n`;
    report += `Found ${analysis.breakpointDiffs.length} responsive style changes:\n\n`;

    // Group by selector
    const bySelector = new Map<string, ResponsiveDiff[]>();
    analysis.breakpointDiffs.forEach((diff) => {
      if (!bySelector.has(diff.selector)) {
        bySelector.set(diff.selector, []);
      }
      bySelector.get(diff.selector)!.push(diff);
    });

    bySelector.forEach((diffs, selector) => {
      report += `### ${selector}\n`;
      diffs.forEach((diff) => {
        report += `- **${diff.property}**:\n`;
        report += `  - Mobile: ${diff.mobile}\n`;
        report += `  - Tablet: ${diff.tablet}\n`;
        report += `  - Desktop: ${diff.desktop}\n`;
      });
      report += '\n';
    });

    report += `## Hidden Elements\n`;
    report += `- Hidden on Mobile: ${analysis.hiddenOnMobile.length} elements\n`;
    report += `- Hidden on Tablet: ${analysis.hiddenOnTablet.length} elements\n`;
    report += `- Hidden on Desktop: ${analysis.hiddenOnDesktop.length} elements\n`;

    return report;
  }
}
