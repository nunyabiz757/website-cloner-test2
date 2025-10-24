import { InteractiveState } from './BrowserService';

export interface InteractiveReport {
  totalInteractive: number;
  withHoverEffects: number;
  withFocusStyles: number;
  withActiveStyles: number;
  withPseudoElements: number;
  interactiveCoverage: number;
  styleChanges: Array<{
    selector: string;
    property: string;
    normal: string;
    hover?: string;
    focus?: string;
    active?: string;
  }>;
}

export class InteractiveAnalyzer {
  analyze(interactiveElements: InteractiveState[]): InteractiveReport {
    let withHoverEffects = 0;
    let withFocusStyles = 0;
    let withActiveStyles = 0;
    let withPseudoElements = 0;

    const styleChanges: InteractiveReport['styleChanges'] = [];

    interactiveElements.forEach((element) => {
      // Check hover
      if (element.states.hover) {
        const changed = this.hasStyleChanges(element.states.normal, element.states.hover);
        if (changed) withHoverEffects++;
      }

      // Check focus
      if (element.states.focus) {
        const changed = this.hasStyleChanges(element.states.normal, element.states.focus);
        if (changed) withFocusStyles++;
      }

      // Check active
      if (element.states.active) {
        const changed = this.hasStyleChanges(element.states.normal, element.states.active);
        if (changed) withActiveStyles++;
      }

      // Check pseudo-elements
      if (element.pseudoElements.before || element.pseudoElements.after) {
        withPseudoElements++;
      }

      // Record significant changes
      Object.keys(element.states.normal).forEach((prop) => {
        const normal = element.states.normal[prop];
        const hover = element.states.hover?.[prop];
        const focus = element.states.focus?.[prop];
        const active = element.states.active?.[prop];

        if (
          (hover && hover !== normal) ||
          (focus && focus !== normal) ||
          (active && active !== normal)
        ) {
          styleChanges.push({
            selector: element.selector,
            property: prop,
            normal,
            hover: hover !== normal ? hover : undefined,
            focus: focus !== normal ? focus : undefined,
            active: active !== normal ? active : undefined,
          });
        }
      });
    });

    const interactiveCoverage =
      interactiveElements.length > 0
        ? ((withHoverEffects + withFocusStyles + withActiveStyles) /
            (interactiveElements.length * 3)) *
          100
        : 0;

    return {
      totalInteractive: interactiveElements.length,
      withHoverEffects,
      withFocusStyles,
      withActiveStyles,
      withPseudoElements,
      interactiveCoverage,
      styleChanges,
    };
  }

  private hasStyleChanges(
    normal: Record<string, string>,
    state: Record<string, string>
  ): boolean {
    return Object.keys(normal).some((key) => normal[key] !== state[key]);
  }

  generateReport(analysis: InteractiveReport): string {
    let report = '# 🎨 INTERACTIVE STATE ANALYSIS REPORT\n\n';

    report += `## Summary\n`;
    report += `- Total Interactive Elements: ${analysis.totalInteractive}\n`;
    report += `- With Hover Effects: ${analysis.withHoverEffects}\n`;
    report += `- With Focus Styles: ${analysis.withFocusStyles}\n`;
    report += `- With Active Styles: ${analysis.withActiveStyles}\n`;
    report += `- With Pseudo-Elements: ${analysis.withPseudoElements}\n`;
    report += `- Interactive Coverage: ${analysis.interactiveCoverage.toFixed(1)}%\n\n`;

    report += `## Style Changes (${analysis.styleChanges.length})\n\n`;

    // Group by selector
    const bySelector = new Map<string, typeof analysis.styleChanges>();
    analysis.styleChanges.forEach((change) => {
      if (!bySelector.has(change.selector)) {
        bySelector.set(change.selector, []);
      }
      bySelector.get(change.selector)!.push(change);
    });

    bySelector.forEach((changes, selector) => {
      report += `### ${selector}\n`;
      changes.forEach((change) => {
        report += `- **${change.property}**:\n`;
        report += `  - Normal: ${change.normal}\n`;
        if (change.hover) report += `  - Hover: ${change.hover}\n`;
        if (change.focus) report += `  - Focus: ${change.focus}\n`;
        if (change.active) report += `  - Active: ${change.active}\n`;
      });
      report += '\n';
    });

    return report;
  }
}
