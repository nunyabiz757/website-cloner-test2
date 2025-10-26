import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle, AlertCircle, Zap, Shield, Sliders } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProjectStore } from '../stores/projectStore';
import { PerformanceFixService } from '../services/optimization/PerformanceFixService';
import { PerformanceFix, FixApplicationResult } from '../types/optimization.types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

type OptimizationMode = 'safe' | 'aggressive' | 'custom';

export function OptimizationPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, updateProject, loadProjects } = useProjectStore();
  const [optimizing, setOptimizing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<OptimizationMode>('safe');
  const [selectedFixIds, setSelectedFixIds] = useState<string[]>([]);
  const [availableFixes, setAvailableFixes] = useState<PerformanceFix[]>([]);
  const [results, setResults] = useState<FixApplicationResult[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const fixService = new PerformanceFixService();

  useEffect(() => {
    const initializeProjects = async () => {
      await loadProjects();
      setIsLoading(false);
    };
    initializeProjects();

    const fixes = fixService.getAvailableFixes();
    setAvailableFixes(fixes);

    const safeFixIds = fixes.filter(f => f.risk === 'safe').map(f => f.id);
    setSelectedFixIds(safeFixIds);
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Optimize Projects</h1>
          <p className="text-gray-600 mb-8">Select a project to optimize</p>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.filter(p => p.status === 'completed').map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => navigate(`/optimize/${proj.id}`)}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:border-green-500 hover:shadow-lg transition-all cursor-pointer"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">{proj.source}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Score: {proj.originalScore || 'N/A'} • {new Date(proj.createdAt).toLocaleDateString()}
                  </p>
                  <Button size="sm" className="w-full">Optimize</Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">Analyze a website first to optimize it</p>
              <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            </div>
          )}
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

  const handleModeChange = (newMode: OptimizationMode) => {
    setMode(newMode);

    if (newMode === 'safe') {
      const safeFixIds = availableFixes.filter(f => f.risk === 'safe').map(f => f.id);
      setSelectedFixIds(safeFixIds);
    } else if (newMode === 'aggressive') {
      const allFixIds = availableFixes.map(f => f.id);
      setSelectedFixIds(allFixIds);
    }
  };

  const toggleFix = (fixId: string) => {
    setMode('custom');
    setSelectedFixIds(prev =>
      prev.includes(fixId)
        ? prev.filter(id => id !== fixId)
        : [...prev, fixId]
    );
  };

  const handleOptimize = async () => {
    if (!project?.originalHtml) return;

    setOptimizing(true);
    setResults([]);

    try {
      const session = await fixService.createSession({
        html: project.originalHtml,
      }, 'test');

      setSessionId(session.sessionId);

      const fixResults = await fixService.applyMode(
        session.sessionId,
        mode,
        mode === 'custom' ? selectedFixIds : [],
        { html: project.originalHtml }
      );

      setResults(fixResults);

      const successCount = fixResults.filter(r => r.success).length;
      const newScore = Math.min(100, (project.originalScore || 50) + (successCount * 2));

      updateProject(project.id, {
        optimizedScore: newScore,
      });

    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setOptimizing(false);
    }
  };

  const groupFixesByCategory = (fixes: PerformanceFix[]) => {
    const groups: Record<string, PerformanceFix[]> = {};
    fixes.forEach(fix => {
      if (!groups[fix.category]) {
        groups[fix.category] = [];
      }
      groups[fix.category].push(fix);
    });
    return groups;
  };

  const fixGroups = groupFixesByCategory(availableFixes);
  const selectedCount = selectedFixIds.length;
  const totalCount = availableFixes.length;
  const successfulFixes = results.filter(r => r.success).length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'images': return '🖼️';
      case 'css': return '🎨';
      case 'js': return '⚡';
      case 'html': return '📄';
      case 'fonts': return '🔤';
      default: return '⚙️';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'safe': return 'bg-green-100 text-green-700 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'aggressive': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'high': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'medium': return 'bg-green-100 text-green-700 border-green-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
              <h1 className="text-3xl font-bold text-gray-900">Performance Optimization</h1>
              <p className="text-gray-600 mt-1">{project.source}</p>
            </div>
          </div>

          <Button
            onClick={handleOptimize}
            disabled={optimizing || selectedFixIds.length === 0}
            size="lg"
          >
            {optimizing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Applying Fixes...
              </>
            ) : (
              <>
                <Play size={18} className="mr-2" />
                Apply {selectedCount} Fix{selectedCount !== 1 ? 'es' : ''}
              </>
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <Card className={`mb-6 ${successfulFixes > 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {successfulFixes > 0 ? (
                  <CheckCircle size={40} className="text-green-600" />
                ) : (
                  <AlertCircle size={40} className="text-yellow-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Optimization Complete!
                </h3>
                <p className="text-gray-700 mb-2">
                  Successfully applied {successfulFixes} of {results.length} fixes.
                  Score: {project.originalScore || 0} → {project.optimizedScore || 0}
                </p>
                <div className="flex flex-wrap gap-2">
                  {results.slice(0, 5).map((result, idx) => (
                    <Badge key={idx} className={result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {result.success ? '✓' : '✗'} {result.fixId.replace(/-/g, ' ')}
                    </Badge>
                  ))}
                  {results.length > 5 && (
                    <Badge className="bg-gray-100 text-gray-700">
                      +{results.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate(`/performance/${projectId}`)}
              >
                View Details
              </Button>
            </div>
          </Card>
        )}

        <Card className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Optimization Mode</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleModeChange('safe')}
              className={`p-4 border-2 rounded-lg transition-all text-left ${
                mode === 'safe'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield size={20} className="text-green-600" />
                <h4 className="font-semibold text-gray-900">Safe Mode</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Only safe, low-risk optimizations. Won't break functionality.
              </p>
              <Badge className="bg-green-100 text-green-700">
                {availableFixes.filter(f => f.risk === 'safe').length} fixes
              </Badge>
            </button>

            <button
              onClick={() => handleModeChange('aggressive')}
              className={`p-4 border-2 rounded-lg transition-all text-left ${
                mode === 'aggressive'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap size={20} className="text-red-600" />
                <h4 className="font-semibold text-gray-900">Aggressive Mode</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                All optimizations enabled. Maximum performance gains.
              </p>
              <Badge className="bg-red-100 text-red-700">
                {totalCount} fixes
              </Badge>
            </button>

            <button
              onClick={() => handleModeChange('custom')}
              className={`p-4 border-2 rounded-lg transition-all text-left ${
                mode === 'custom'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sliders size={20} className="text-blue-600" />
                <h4 className="font-semibold text-gray-900">Custom Mode</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Select specific fixes to apply. Full control.
              </p>
              <Badge className="bg-blue-100 text-blue-700">
                {selectedCount} selected
              </Badge>
            </button>
          </div>
        </Card>

        <div className="space-y-6">
          {Object.entries(fixGroups).map(([category, fixes]) => (
            <Card key={category}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{getCategoryIcon(category)}</span>
                <h3 className="text-xl font-bold text-gray-900 capitalize">{category} Optimization</h3>
                <Badge className="bg-gray-100 text-gray-700">
                  {fixes.length} fixes
                </Badge>
              </div>

              <div className="space-y-3">
                {fixes.map((fix) => {
                  const isSelected = selectedFixIds.includes(fix.id);
                  const hasDependencies = fix.dependencies.length > 0;
                  const hasConflicts = fix.conflicts.length > 0;

                  return (
                    <div
                      key={fix.id}
                      className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleFix(fix.id)}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-5 h-5 rounded text-blue-600 mt-1"
                        />

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{fix.name}</h4>
                            <Badge className={getRiskColor(fix.risk)}>
                              {fix.risk}
                            </Badge>
                            <Badge className={getImpactColor(fix.impact)}>
                              {fix.impact} impact
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">{fix.description}</p>

                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-green-600 font-medium">
                              ⚡ {fix.estimatedImprovement}
                            </span>

                            {hasDependencies && (
                              <span className="text-orange-600">
                                ⚠️ Requires: {fix.dependencies.join(', ')}
                              </span>
                            )}

                            {hasConflicts && (
                              <span className="text-red-600">
                                ⚠️ Conflicts: {fix.conflicts.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
