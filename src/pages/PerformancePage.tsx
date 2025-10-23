import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, TrendingUp, AlertCircle, Clock, Zap, FileText, MousePointer, Eye, Activity, Server, BarChart3, ChevronDown, ChevronUp, PackageOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProjectStore } from '../stores/projectStore';
import { cloneService } from '../services/CloneService';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { MetricCard } from '../components/performance/MetricCard';
import { MetricBar } from '../components/performance/MetricBar';
import { DetailedMetrics } from '../components/performance/DetailedMetrics';
import { LighthouseResults } from '../components/performance/LighthouseResults';

export function PerformancePage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, loadProjects } = useProjectStore();
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingAssets, setIsDownloadingAssets] = useState(false);

  useEffect(() => {
    const initializeProjects = async () => {
      await loadProjects();
      setIsLoading(false);
    };
    initializeProjects();
  }, [loadProjects]);

  const project = projectId ? projects.find(p => p.id === projectId) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project && !projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Project Selected</h2>
          <p className="text-gray-600 mb-6">Please clone a website first to view performance analysis</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (projectId && !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const metrics = project?.metrics;

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No metrics available</h2>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

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

  const coreWebVitalsMetrics = [
    {
      name: 'Largest Contentful Paint',
      abbr: 'LCP',
      value: metrics.coreWebVitals.lcp.value,
      unit: 'ms',
      rating: metrics.coreWebVitals.lcp.rating,
      threshold: { good: 2500, poor: 4000 },
      icon: FileText,
      description: 'Largest visible element render time',
    },
    {
      name: 'Interaction to Next Paint',
      abbr: 'INP',
      value: metrics.coreWebVitals.inp.value,
      unit: 'ms',
      rating: metrics.coreWebVitals.inp.rating,
      threshold: { good: 200, poor: 500 },
      icon: MousePointer,
      description: 'Interaction responsiveness',
    },
    {
      name: 'Cumulative Layout Shift',
      abbr: 'CLS',
      value: metrics.coreWebVitals.cls.value,
      unit: '',
      rating: metrics.coreWebVitals.cls.rating,
      threshold: { good: 0.1, poor: 0.25 },
      icon: Activity,
      description: 'Visual stability score',
    },
    {
      name: 'First Contentful Paint',
      abbr: 'FCP',
      value: metrics.coreWebVitals.fcp.value,
      unit: 'ms',
      rating: metrics.coreWebVitals.fcp.rating,
      threshold: { good: 1800, poor: 3000 },
      icon: Zap,
      description: 'First content paint time',
    },
    {
      name: 'Time to First Byte',
      abbr: 'TTFB',
      value: metrics.coreWebVitals.ttfb.value,
      unit: 'ms',
      rating: metrics.coreWebVitals.ttfb.rating,
      threshold: { good: 800, poor: 1800 },
      icon: Server,
      description: 'Server response time',
    },
  ];

  const additionalMetricsData = [
    {
      name: 'Total Blocking Time',
      abbr: 'TBT',
      value: metrics.additionalMetrics.tbt.value,
      unit: 'ms',
      rating: metrics.additionalMetrics.tbt.rating,
      threshold: { good: 200, poor: 600 },
      icon: Clock,
      description: 'Main thread blocking duration',
    },
    {
      name: 'Speed Index',
      abbr: 'SI',
      value: metrics.additionalMetrics.speedIndex.value,
      unit: 'ms',
      rating: metrics.additionalMetrics.speedIndex.rating,
      threshold: { good: 3400, poor: 5800 },
      icon: BarChart3,
      description: 'Visual display speed',
    },
    {
      name: 'Time to Interactive',
      abbr: 'TTI',
      value: metrics.additionalMetrics.tti.value,
      unit: 'ms',
      rating: metrics.additionalMetrics.tti.rating,
      threshold: { good: 3800, poor: 7300 },
      icon: Eye,
      description: 'Full interactivity time',
    },
  ];

  const improvement = project?.optimizedScore && project?.originalScore
    ? project.optimizedScore - project.originalScore
    : 0;

  const hasAssets = project?.assets && project.assets.length > 0;

  const handleDownloadAssets = async () => {
    if (!projectId) return;
    setIsDownloadingAssets(true);
    try {
      await cloneService.downloadAssets(projectId);
      await loadProjects();
    } catch (error) {
      alert(`Failed to download assets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloadingAssets(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Performance Analysis</h1>
              <p className="text-gray-600 mt-1">{project?.source || 'Demo Project'}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {!hasAssets && (
              <Button
                variant="outline"
                onClick={handleDownloadAssets}
                disabled={isDownloadingAssets}
              >
                {isDownloadingAssets ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <PackageOpen size={16} className="mr-2" />
                    Download Assets
                  </>
                )}
              </Button>
            )}
            <Button onClick={() => navigate(projectId ? `/optimization/${projectId}` : '/optimize')}>
              Optimize Now
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className={`text-center ${getScoreBg(project?.optimizedScore || project?.originalScore || 85)}`}>
            <div className="text-sm font-medium text-gray-600 mb-2">Overall Score</div>
            <div className={`text-5xl font-bold ${getScoreColor(project?.optimizedScore || project?.originalScore || 85)}`}>
              {project?.optimizedScore || project?.originalScore || 85}
            </div>
            <div className="text-sm text-gray-600 mt-2">Out of 100</div>
          </Card>

          <Card className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-2">Improvement</div>
            <div className="flex items-center justify-center gap-2">
              {improvement > 0 ? (
                <>
                  <TrendingUp className="text-green-600" size={32} />
                  <span className="text-4xl font-bold text-green-600">+{improvement}</span>
                </>
              ) : (
                <span className="text-4xl font-bold text-gray-400">—</span>
              )}
            </div>
            <div className="text-sm text-gray-600 mt-2">Points Gained</div>
          </Card>

          <Card className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-2">Total Size</div>
            <div className="text-4xl font-bold text-gray-900">
              {(metrics.resourceMetrics.totalPageSize.total / (1024 * 1024)).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600 mt-2">MB</div>
          </Card>
        </div>

        {metrics.lighthouse && (
          <div className="mb-8">
            <LighthouseResults results={metrics.lighthouse} />
          </div>
        )}

        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Core Web Vitals</h2>
          <p className="text-sm text-gray-600 mb-6">Real-world performance metrics measuring user experience</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricBar
              value={metrics.coreWebVitals.lcp.value / 1000}
              thresholds={{ good: 2.5, needsImprovement: 4.0 }}
              label="Largest Contentful Paint (LCP)"
              unit="s"
              format={(v) => v.toFixed(1)}
            />
            <MetricBar
              value={metrics.coreWebVitals.inp.value}
              thresholds={{ good: 200, needsImprovement: 500 }}
              label="Interaction to Next Paint (INP)"
              unit="ms"
              format={(v) => Math.round(v).toString()}
            />
            <MetricBar
              value={metrics.coreWebVitals.cls.value}
              thresholds={{ good: 0.1, needsImprovement: 0.25 }}
              label="Cumulative Layout Shift (CLS)"
              unit=""
              format={(v) => v.toFixed(2)}
            />
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">Other Notable Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MetricBar
                value={metrics.coreWebVitals.fcp.value / 1000}
                thresholds={{ good: 1.8, needsImprovement: 3.0 }}
                label="First Contentful Paint (FCP)"
                unit="s"
                format={(v) => v.toFixed(1)}
              />
              <MetricBar
                value={metrics.coreWebVitals.ttfb.value / 1000}
                thresholds={{ good: 0.8, needsImprovement: 1.8 }}
                label="Time to First Byte (TTFB)"
                unit="s"
                format={(v) => v.toFixed(1)}
              />
            </div>
          </div>
        </Card>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {additionalMetricsData.map((vital) => (
              <MetricCard key={vital.abbr} {...vital} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Resource Breakdown</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Total Requests</span>
                  <span className="font-semibold text-gray-900">{metrics.resourceMetrics.networkRequests.length}</span>
                </div>
                <Progress value={(metrics.resourceMetrics.networkRequests.length / 50) * 100} />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Render Blocking Resources</span>
                  <span className="font-semibold text-orange-600">
                    {metrics.resourceMetrics.resources.filter(r => r.renderBlocking).length}
                  </span>
                </div>
                <Progress
                  value={(metrics.resourceMetrics.resources.filter(r => r.renderBlocking).length / 10) * 100}
                  className="bg-orange-100"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Long Tasks</span>
                  <span className="font-semibold text-gray-900">{metrics.resourceMetrics.longTasks.length}</span>
                </div>
                <Progress value={(metrics.resourceMetrics.longTasks.length / 15) * 100} />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Issues Found</h3>
            <div className="space-y-3">
              {['critical', 'high', 'medium', 'low'].map(severity => {
                const count = metrics.issues.filter(i => i.severity === severity).length;
                if (count === 0) return null;
                return (
                  <IssueItem
                    key={severity}
                    severity={severity as 'critical' | 'high' | 'medium' | 'low'}
                    count={count}
                    description={`${severity.charAt(0).toUpperCase() + severity.slice(1)} ${severity === 'critical' ? 'issues' : 'priority optimizations'}`}
                  />
                );
              })}
              {metrics.issues.length === 0 && (
                <div className="text-center py-4 text-gray-600">
                  No issues found. Great job!
                </div>
              )}
            </div>

            <Button className="w-full mt-4" onClick={() => navigate(projectId ? `/optimization/${projectId}` : '/optimize')}>
              View All Recommendations
            </Button>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Detailed Metrics & Resource Analysis</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetailedMetrics(!showDetailedMetrics)}
            >
              {showDetailedMetrics ? (
                <>
                  <ChevronUp size={16} className="mr-2" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown size={16} className="mr-2" />
                  Show All Details
                </>
              )}
            </Button>
          </div>

          {showDetailedMetrics && <DetailedMetrics metrics={metrics} />}
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" onClick={() => navigate(projectId ? `/preview/${projectId}` : '/preview')}>
              View Preview
            </Button>
            <Button variant="outline" onClick={() => navigate(projectId ? `/optimization/${projectId}` : '/optimize')}>
              Auto-Optimize
            </Button>
            <Button variant="outline" onClick={() => navigate(projectId ? `/export/${projectId}` : '/export')}>
              Export Project
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

interface IssueItemProps {
  severity: 'critical' | 'high' | 'medium' | 'low';
  count: number;
  description: string;
}

function IssueItem({ severity, count, description }: IssueItemProps) {
  const colors = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-blue-100 text-blue-700 border-blue-200',
    low: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <Badge className={`${colors[severity]} border`}>
          {count}
        </Badge>
        <span className="text-sm text-gray-700">{description}</span>
      </div>
      <AlertCircle size={16} className="text-gray-400" />
    </div>
  );
}
