import { CheckCircle, AlertTriangle, XCircle, Shield, Search, Cpu, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface AnalysisResultsProps {
  seoAnalysis?: {
    score: number;
    recommendations: string[];
  };
  securityScan?: {
    score: number;
    threats: string[];
    recommendations: string[];
  };
  technologyStack?: {
    frameworks: Array<{ name: string }>;
    libraries: Array<{ name: string }>;
    cms: Array<{ name: string }>;
    analytics: Array<{ name: string }>;
  };
  performanceScore?: number;
}

export function AnalysisResults({
  seoAnalysis,
  securityScan,
  technologyStack,
  performanceScore
}: AnalysisResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    if (score >= 50) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle size={20} className="text-green-600" />;
    if (score >= 70) return <AlertTriangle size={20} className="text-yellow-600" />;
    return <XCircle size={20} className="text-red-600" />;
  };

  const hasAnyAnalysis = seoAnalysis || securityScan || technologyStack || performanceScore !== undefined;

  if (!hasAnyAnalysis) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Performance Score */}
      {performanceScore !== undefined && (
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Performance</h3>
              <p className="text-xs text-gray-500">Lighthouse Score</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getScoreIcon(performanceScore)}
            <span className={`text-2xl font-bold ${getScoreColor(performanceScore)}`}>
              {performanceScore}
            </span>
            <span className="text-gray-500">/100</span>
          </div>
        </Card>
      )}

      {/* SEO Analysis */}
      {seoAnalysis && (
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Search size={20} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">SEO</h3>
              <p className="text-xs text-gray-500">Search Optimization</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            {getScoreIcon(seoAnalysis.score)}
            <span className={`text-2xl font-bold ${getScoreColor(seoAnalysis.score)}`}>
              {seoAnalysis.score}
            </span>
            <span className="text-gray-500">/100</span>
          </div>
          {seoAnalysis.recommendations.length > 0 && (
            <p className="text-xs text-gray-600">
              {seoAnalysis.recommendations.length} recommendations
            </p>
          )}
        </Card>
      )}

      {/* Security Scan */}
      {securityScan && (
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <Shield size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Security</h3>
              <p className="text-xs text-gray-500">Security Audit</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            {getScoreIcon(securityScan.score)}
            <span className={`text-2xl font-bold ${getScoreColor(securityScan.score)}`}>
              {securityScan.score}
            </span>
            <span className="text-gray-500">/100</span>
          </div>
          {securityScan.threats.length > 0 && (
            <p className="text-xs text-red-600">
              {securityScan.threats.length} threats detected
            </p>
          )}
        </Card>
      )}

      {/* Technology Stack */}
      {technologyStack && (
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Cpu size={20} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Technology</h3>
              <p className="text-xs text-gray-500">Tech Stack</p>
            </div>
          </div>
          <div className="space-y-1">
            {technologyStack.frameworks.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {technologyStack.frameworks.slice(0, 2).map((tech, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {tech.name}
                  </Badge>
                ))}
              </div>
            )}
            {technologyStack.cms.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {technologyStack.cms.slice(0, 2).map((tech, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs bg-blue-50">
                    {tech.name}
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-600 mt-2">
              {Object.values(technologyStack).reduce((sum, arr) => sum + arr.length, 0)} technologies detected
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
