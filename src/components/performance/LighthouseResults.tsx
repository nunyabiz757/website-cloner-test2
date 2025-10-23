import { AlertCircle, CheckCircle, TrendingUp, Zap, ExternalLink } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { MetricBar } from './MetricBar';
import type { LighthouseResults } from '../../types';

interface LighthouseResultsProps {
  results: LighthouseResults;
}

export function LighthouseResults({ results }: LighthouseResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 50) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap size={28} className="text-orange-500" />
            Google Lighthouse Audit
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Official performance, accessibility, and best practices analysis
          </p>
        </div>
        <a
          href="https://developers.google.com/web/tools/lighthouse"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Learn more <ExternalLink size={14} />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`text-center ${getScoreBg(results.performanceScore)}`}>
          <div className="text-xs font-medium text-gray-600 mb-2 uppercase">Performance</div>
          <div className={`text-5xl font-bold ${getScoreColor(results.performanceScore)}`}>
            {results.performanceScore}
          </div>
          <div className="text-xs text-gray-600 mt-2">Out of 100</div>
        </Card>

        <Card className={`text-center ${getScoreBg(results.accessibilityScore)}`}>
          <div className="text-xs font-medium text-gray-600 mb-2 uppercase">Accessibility</div>
          <div className={`text-5xl font-bold ${getScoreColor(results.accessibilityScore)}`}>
            {results.accessibilityScore}
          </div>
          <div className="text-xs text-gray-600 mt-2">Out of 100</div>
        </Card>

        <Card className={`text-center ${getScoreBg(results.bestPracticesScore)}`}>
          <div className="text-xs font-medium text-gray-600 mb-2 uppercase">Best Practices</div>
          <div className={`text-5xl font-bold ${getScoreColor(results.bestPracticesScore)}`}>
            {results.bestPracticesScore}
          </div>
          <div className="text-xs text-gray-600 mt-2">Out of 100</div>
        </Card>

        <Card className={`text-center ${getScoreBg(results.seoScore)}`}>
          <div className="text-xs font-medium text-gray-600 mb-2 uppercase">SEO</div>
          <div className={`text-5xl font-bold ${getScoreColor(results.seoScore)}`}>
            {results.seoScore}
          </div>
          <div className="text-xs text-gray-600 mt-2">Out of 100</div>
        </Card>
      </div>

      <Card>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Core Web Vitals Assessment</h3>
          <p className="text-sm text-gray-600">Real-world performance metrics from field data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricBar
            value={results.metrics.lcp / 1000}
            thresholds={{ good: 2.5, needsImprovement: 4.0 }}
            label="Largest Contentful Paint (LCP)"
            unit="s"
            format={(v) => v.toFixed(1)}
          />
          <MetricBar
            value={results.metrics.inp}
            thresholds={{ good: 200, needsImprovement: 500 }}
            label="Interaction to Next Paint (INP)"
            unit="ms"
            format={(v) => Math.round(v).toString()}
          />
          <MetricBar
            value={results.metrics.cls}
            thresholds={{ good: 0.1, needsImprovement: 0.25 }}
            label="Cumulative Layout Shift (CLS)"
            unit=""
            format={(v) => v.toFixed(2)}
          />
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Other Notable Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricBar
              value={results.metrics.fcp / 1000}
              thresholds={{ good: 1.8, needsImprovement: 3.0 }}
              label="First Contentful Paint (FCP)"
              unit="s"
              format={(v) => v.toFixed(1)}
            />
            <MetricBar
              value={results.metrics.ttfb / 1000}
              thresholds={{ good: 0.8, needsImprovement: 1.8 }}
              label="Time to First Byte (TTFB)"
              unit="s"
              format={(v) => v.toFixed(1)}
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Optimization Opportunities</h3>
            <Badge className="bg-blue-100 text-blue-700">
              {results.opportunities.length} found
            </Badge>
          </div>

          {results.opportunities.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
              <p className="font-medium">No major optimization opportunities found!</p>
              <p className="text-sm mt-1">Your site is well optimized.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.opportunities.map((opportunity, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{opportunity.title}</h4>
                        <Badge className={`${getImpactColor(opportunity.impact)} border text-xs`}>
                          {opportunity.impact}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {opportunity.description}
                      </p>
                    </div>
                  </div>
                  {opportunity.savingsMs && opportunity.savingsMs > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <TrendingUp size={14} className="text-green-600" />
                      <span className="text-green-700 font-medium">
                        Potential savings: {(opportunity.savingsMs / 1000).toFixed(2)}s
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Diagnostics</h3>
            <Badge className="bg-gray-100 text-gray-700">
              {results.diagnostics.length} items
            </Badge>
          </div>

          {results.diagnostics.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
              <p className="font-medium">All checks passed!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.diagnostics.map((diagnostic, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start gap-2 mb-1">
                    <AlertCircle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{diagnostic.title}</h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {diagnostic.description}
                      </p>
                      <div className="mt-2">
                        <Badge className="bg-white text-gray-700 border border-gray-300 text-xs">
                          {diagnostic.value}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Zap size={24} className="text-blue-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">About Lighthouse Scores</h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              Lighthouse scores are calculated using real Chrome browser metrics and follow Google's official
              performance guidelines. Scores above 90 are considered excellent, 50-89 need improvement,
              and below 50 require immediate attention.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
