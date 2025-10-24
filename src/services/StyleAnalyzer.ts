import type { ColorPalette } from '../utils/colorUtils';
import type { FontFace, TypographyScale } from '../utils/typographyUtils';

export interface StyleAnalysisReport {
  colors: {
    palette: ColorPalette;
    totalUnique: number;
    mostUsed: string[];
  };
  typography: {
    fonts: FontFace[];
    scale: TypographyScale;
    totalFonts: number;
  };
  visual: {
    elementsWithShadows: number;
    elementsWithFilters: number;
    elementsWithTransforms: number;
    maxZIndex: number;
  };
}

export class StyleAnalyzer {
  generateReport(analysis: StyleAnalysisReport): string {
    let report = '# 🎨 STYLE ANALYSIS REPORT\n\n';

    // Colors
    report += `## Color Palette\n`;
    report += `- Total Unique Colors: ${analysis.colors.totalUnique}\n`;
    report += `- Most Used Colors:\n`;
    analysis.colors.mostUsed.forEach((color, i) => {
      report += `  ${i + 1}. ${color}\n`;
    });
    report += '\n';

    // Typography
    report += `## Typography\n`;
    report += `- Total Fonts: ${analysis.typography.totalFonts}\n`;
    if (analysis.typography.fonts.length > 0) {
      report += `- Font Families:\n`;
      analysis.typography.fonts.forEach((font) => {
        report += `  - ${font.fontFamily} (weight: ${font.fontWeight || 'default'})\n`;
      });
    }
    report += `\n### Typography Scale\n`;
    Object.entries(analysis.typography.scale).forEach(([key, value]) => {
      report += `- ${key}: ${value}\n`;
    });
    report += '\n';

    // Visual Effects
    report += `## Visual Effects\n`;
    report += `- Elements with Shadows: ${analysis.visual.elementsWithShadows}\n`;
    report += `- Elements with Filters: ${analysis.visual.elementsWithFilters}\n`;
    report += `- Elements with Transforms: ${analysis.visual.elementsWithTransforms}\n`;
    report += `- Max Z-Index: ${analysis.visual.maxZIndex}\n`;

    return report;
  }
}
