export interface Animation {
  name: string;
  duration: string;
  timingFunction: string;
  delay: string;
  iterationCount: string;
  direction: string;
  fillMode: string;
  playState: string;
}

export interface Transition {
  property: string;
  duration: string;
  timingFunction: string;
  delay: string;
}

export interface Keyframe {
  name: string;
  rules: string;
  steps: Array<{
    offset: string;
    properties: Record<string, string>;
  }>;
}

export interface AnimatedElement {
  selector: string;
  elementType: string;
  hasAnimation: boolean;
  hasTransition: boolean;
  animation?: Animation;
  transitions?: Transition[];
  transform?: string;
  initialState: Record<string, string>;
}

export interface AnimationReport {
  totalAnimatedElements: number;
  elementsWithAnimations: number;
  elementsWithTransitions: number;
  elementsWithTransforms: number;
  keyframes: Keyframe[];
  animatedElements: AnimatedElement[];
}

export class AnimationDetector {
  /**
   * Generate human-readable report
   */
  generateReport(report: AnimationReport): string {
    let output = '# 🎬 ANIMATION DETECTION REPORT\n\n';

    output += `## Summary\n`;
    output += `- Total Animated Elements: ${report.totalAnimatedElements}\n`;
    output += `- With CSS Animations: ${report.elementsWithAnimations}\n`;
    output += `- With Transitions: ${report.elementsWithTransitions}\n`;
    output += `- With Transforms: ${report.elementsWithTransforms}\n`;
    output += `- Keyframes Detected: ${report.keyframes.length}\n\n`;

    // List keyframes
    if (report.keyframes.length > 0) {
      output += `## Keyframes (${report.keyframes.length})\n\n`;
      report.keyframes.forEach((kf) => {
        output += `### @keyframes ${kf.name}\n`;
        output += `\`\`\`css\n${kf.rules}\n\`\`\`\n\n`;
      });
    }

    // List animated elements
    if (report.animatedElements.length > 0) {
      output += `## Animated Elements (${report.animatedElements.length})\n\n`;
      report.animatedElements.forEach((el) => {
        output += `### ${el.selector}\n`;

        if (el.animation) {
          output += `**Animation:**\n`;
          output += `- Name: ${el.animation.name}\n`;
          output += `- Duration: ${el.animation.duration}\n`;
          output += `- Timing: ${el.animation.timingFunction}\n`;
          output += `- Delay: ${el.animation.delay}\n`;
          output += `- Iterations: ${el.animation.iterationCount}\n\n`;
        }

        if (el.transitions) {
          output += `**Transitions:**\n`;
          el.transitions.forEach((t) => {
            output += `- ${t.property}: ${t.duration} ${t.timingFunction} ${t.delay}\n`;
          });
          output += '\n';
        }

        if (el.transform) {
          output += `**Transform:** ${el.transform}\n\n`;
        }
      });
    }

    return output;
  }
}
