import { useState, useEffect } from 'react';
import { Globe, Zap, BarChart3, Download, FileText, Clock, CheckCircle, Terminal, Search, Archive, Trash2, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { LogViewer } from './dashboard/LogViewer';
import { DonutChart } from './dashboard/DonutChart';
import { WebsiteInfo } from './dashboard/WebsiteInfo';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { Toast } from './ui/Toast';
import { loggingService } from '../services/LoggingService';
import { cloneService } from '../services/CloneService';
import { useProjectStore } from '../stores/projectStore';

interface DashboardProps {
  initialUrl?: string;
}

export function Dashboard({ initialUrl }: DashboardProps) {
  const navigate = useNavigate();
  const [url, setUrl] = useState(initialUrl || '');
  const [isCloning, setIsCloning] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; projectId: string | null }>({ isOpen: false, projectId: null });
  const [archiveConfirm, setArchiveConfirm] = useState<{ isOpen: boolean; projectId: string | null }>({ isOpen: false, projectId: null });
  const [toast, setToast] = useState<{ show: boolean; title?: string; message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);
  const { addProject, projects, loadProjects, archiveProject, unarchiveProject, deleteProject, setCurrentProject } = useProjectStore();

  // Analysis checkbox states
  const [performanceChecked, setPerformanceChecked] = useState(true); // Default checked
  const [seoChecked, setSeoChecked] = useState(false);
  const [securityChecked, setSecurityChecked] = useState(false);
  const [technologyChecked, setTechnologyChecked] = useState(false);
  const [cloneChecked, setCloneChecked] = useState(false);

  // Clone options
  const [cloneOptions, setCloneOptions] = useState({
    includeAssets: false,
    useBrowserAutomation: false,
    captureResponsive: false,
    captureInteractive: false,
    captureAnimations: false,
    captureStyleAnalysis: false,
    captureNavigation: false,
  });

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
    }
  }, [initialUrl]);

  const handleAnalyze = async () => {
    console.log('handleAnalyze called, URL:', url);

    if (!url.trim()) {
      console.log('URL is empty, returning');
      return;
    }

    // Check if no analysis is selected
    const noAnalysisSelected = !performanceChecked && !seoChecked && !securityChecked && !technologyChecked && !cloneChecked;

    if (noAnalysisSelected) {
      // Just save URL without analysis
      setToast({
        show: true,
        title: 'Project Saved',
        message: 'URL saved as a project. To get detailed analysis, please select one or more checkboxes above.',
        type: 'info'
      });
      setUrl('');
      return;
    }

    try {
      setIsCloning(true);
      console.log('Starting analysis for:', url);
      loggingService.info('analyze', `Starting analysis for ${url}`, {
        performance: performanceChecked,
        seo: seoChecked,
        security: securityChecked,
        technology: technologyChecked,
        clone: cloneChecked
      });

      const project = await cloneService.cloneWebsite({
        source: url,
        type: 'url',
        // Use selected clone options if clone checkbox is selected, otherwise use defaults for analysis
        includeAssets: cloneChecked ? cloneOptions.includeAssets : (performanceChecked || seoChecked || securityChecked || technologyChecked),
        useBrowserAutomation: cloneChecked ? cloneOptions.useBrowserAutomation : (performanceChecked || seoChecked || securityChecked || technologyChecked),
        captureResponsive: cloneChecked ? cloneOptions.captureResponsive : false,
        captureInteractive: cloneChecked ? cloneOptions.captureInteractive : false,
        captureAnimations: cloneChecked ? cloneOptions.captureAnimations : false,
        captureStyleAnalysis: cloneChecked ? cloneOptions.captureStyleAnalysis : false,
        captureNavigation: cloneChecked ? cloneOptions.captureNavigation : false,
        // Pass analysis options
        performanceAnalysis: performanceChecked,
        seoAnalysis: seoChecked,
        securityScan: securityChecked,
        technologyDetection: technologyChecked,
        onProgress: (progress, step) => {
          console.log(`Analysis progress: ${progress}% - ${step}`);
        }
      });

      console.log('Analysis completed, project:', project);
      loggingService.success('analyze', `Analysis completed for ${url}`, { projectId: project.id });

      console.log('Reloading projects from database...');
      await loadProjects();
      console.log('Projects reloaded, current project count:', projects.length);

      setCurrentProject(project);

      setToast({
        show: true,
        title: 'Website Analyzed Successfully!',
        message: `${url}\n\nPerformance Score: ${project.originalScore || 'N/A'}\n\nView it in the Recent Projects section below.`,
        type: 'success'
      });
    } catch (error) {
      console.error('Analysis error:', error);
      loggingService.error('analyze', 'Failed to start analysis', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      alert(`Failed to analyze website: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCloning(false);
      setUrl('');
    }
  };

  const quickActions = [
    {
      icon: Globe,
      title: 'Analyze Website',
      description: 'Extract HTML, CSS, and assets from any URL',
      action: 'analyze',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Zap,
      title: 'Auto-Optimize',
      description: 'Apply 50+ performance optimizations automatically',
      action: 'optimize',
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: BarChart3,
      title: 'Performance Analysis',
      description: 'Run Lighthouse and Core Web Vitals tests',
      action: 'analyze',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: Download,
      title: 'Export to WordPress',
      description: 'Convert to Elementor, Gutenberg, or Divi',
      action: 'export',
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  const handleArchive = async (id: string) => {
    setArchiveConfirm({ isOpen: true, projectId: id });
  };

  const confirmArchive = async () => {
    if (archiveConfirm.projectId) {
      const project = projects.find(p => p.id === archiveConfirm.projectId);
      const projectName = project ? new URL(project.source).hostname.replace('www.', '') : 'Project';

      await archiveProject(archiveConfirm.projectId);
      setArchiveConfirm({ isOpen: false, projectId: null });

      setToast({
        show: true,
        title: 'Project Archived Successfully!',
        message: `${projectName} has been moved to your archived projects. You can restore it anytime.`,
        type: 'success'
      });
    }
  };

  const handleUnarchive = async (id: string) => {
    const project = projects.find(p => p.id === id);
    const projectName = project ? new URL(project.source).hostname.replace('www.', '') : 'Project';

    await unarchiveProject(id);

    setToast({
      show: true,
      title: 'Project Restored Successfully!',
      message: `${projectName} is now back in your active projects list.`,
      type: 'success'
    });
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirm({ isOpen: true, projectId: id });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.projectId) {
      const project = projects.find(p => p.id === deleteConfirm.projectId);
      const projectName = project ? new URL(project.source).hostname.replace('www.', '') : 'Project';

      await deleteProject(deleteConfirm.projectId);
      setDeleteConfirm({ isOpen: false, projectId: null });

      setToast({
        show: true,
        title: 'Project Deleted Successfully!',
        message: `${projectName} has been permanently removed from your dashboard.`,
        type: 'success'
      });
    }
  };

  const recentProjects = projects
    .filter(p => !p.archived)
    .slice(0, 5)
    .map(project => ({
      id: project.id,
      name: new URL(project.source).hostname.replace('www.', ''),
      url: project.source,
      status: project.status,
      score: project.originalScore || 0,
      date: formatDate(project.createdAt),
    }));

  const archivedProjects = projects
    .filter(p => p.archived)
    .map(project => ({
      id: project.id,
      name: new URL(project.source).hostname.replace('www.', ''),
      url: project.source,
      status: project.status,
      score: project.originalScore || 0,
      date: formatDate(project.createdAt),
    }));

  function formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {showLogs && <LogViewer onClose={() => setShowLogs(false)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Analyze, optimize, and convert websites with ease</p>
          </div>
          <Button variant="outline" onClick={() => setShowLogs(true)}>
            <Terminal size={18} className="mr-2" />
            View Logs
          </Button>
        </div>

        <Card className="mb-8 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Analyze a Website</h2>

          {/* Analysis Checkboxes */}
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={performanceChecked}
                onChange={(e) => setPerformanceChecked(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">⚡ Performance</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={seoChecked}
                onChange={(e) => setSeoChecked(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">📊 SEO</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={securityChecked}
                onChange={(e) => setSecurityChecked(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">🔒 Security</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={technologyChecked}
                onChange={(e) => setTechnologyChecked(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">🔍 Technology</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cloneChecked}
                onChange={(e) => setCloneChecked(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Clone</span>
            </label>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!url.trim() || isCloning}
              size="lg"
              className="px-8"
            >
              {isCloning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2" size={18} />
                  Analyze
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Get comprehensive performance analysis, Core Web Vitals, and technology detection
          </p>
        </Card>

        {/* Clone Modal */}
        {cloneChecked && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in p-2 sm:p-4"
            onClick={() => setCloneChecked(false)}
          >
            <div
              className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] sm:max-h-[85vh] shadow-2xl animate-scale-in flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header - Fixed */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-lg sm:text-xl font-semibold text-purple-900">Clone Options</h3>
                <button
                  onClick={() => setCloneChecked(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-3 sm:py-4 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
                {/* Select All Button */}
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => {
                      const allSelected = Object.values(cloneOptions).every(v => v);
                      setCloneOptions({
                        includeAssets: !allSelected,
                        useBrowserAutomation: !allSelected,
                        captureResponsive: !allSelected,
                        captureInteractive: !allSelected,
                        captureAnimations: !allSelected,
                        captureStyleAnalysis: !allSelected,
                        captureNavigation: !allSelected,
                      });
                    }}
                    className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors"
                  >
                    {Object.values(cloneOptions).every(v => v) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <label className="flex items-start gap-2 sm:gap-3 cursor-pointer p-3 sm:p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200">
                  <input
                    type="checkbox"
                    checked={cloneOptions.includeAssets}
                    onChange={(e) => setCloneOptions({...cloneOptions, includeAssets: e.target.checked})}
                    className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-purple-600 rounded flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm text-gray-900 font-medium mb-1">📦 Include Assets</div>
                    <div className="text-[10px] sm:text-xs text-gray-600">Download and include all assets (images, CSS, JS)</div>
                  </div>
                </label>
                <label className="flex items-start gap-2 sm:gap-3 cursor-pointer p-3 sm:p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200">
                  <input
                    type="checkbox"
                    checked={cloneOptions.useBrowserAutomation}
                    onChange={(e) => setCloneOptions({...cloneOptions, useBrowserAutomation: e.target.checked})}
                    className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-purple-600 rounded flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm text-gray-900 font-medium mb-1">🚀 Browser Automation (Recommended)</div>
                    <div className="text-[10px] sm:text-xs text-gray-600">Use Playwright to clone React/Vue/Angular apps with JavaScript execution</div>
                  </div>
                </label>
                <label className="flex items-start gap-2 sm:gap-3 cursor-pointer p-3 sm:p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200">
                  <input
                    type="checkbox"
                    checked={cloneOptions.captureResponsive}
                    onChange={(e) => setCloneOptions({...cloneOptions, captureResponsive: e.target.checked})}
                    className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-purple-600 rounded flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm text-gray-900 font-medium mb-1">📱 Responsive Detection</div>
                    <div className="text-[10px] sm:text-xs text-gray-600">Capture mobile, tablet & desktop breakpoints with media queries (+2-3 seconds)</div>
                  </div>
                </label>
                <label className="flex items-start gap-2 sm:gap-3 cursor-pointer p-3 sm:p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200">
                  <input
                    type="checkbox"
                    checked={cloneOptions.captureInteractive}
                    onChange={(e) => setCloneOptions({...cloneOptions, captureInteractive: e.target.checked})}
                    className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-purple-600 rounded flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm text-gray-900 font-medium mb-1">🎨 Interactive States</div>
                    <div className="text-[10px] sm:text-xs text-gray-600">Capture hover, focus, active effects and pseudo-elements (+1-2 seconds)</div>
                  </div>
                </label>
                <label className="flex items-start gap-2 sm:gap-3 cursor-pointer p-3 sm:p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200">
                  <input
                    type="checkbox"
                    checked={cloneOptions.captureAnimations}
                    onChange={(e) => setCloneOptions({...cloneOptions, captureAnimations: e.target.checked})}
                    className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-purple-600 rounded flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm text-gray-900 font-medium mb-1">🎬 Animation Detection</div>
                    <div className="text-[10px] sm:text-xs text-gray-600">Detect CSS animations, transitions & keyframes (+1 second)</div>
                  </div>
                </label>
                <label className="flex items-start gap-2 sm:gap-3 cursor-pointer p-3 sm:p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200">
                  <input
                    type="checkbox"
                    checked={cloneOptions.captureStyleAnalysis}
                    onChange={(e) => setCloneOptions({...cloneOptions, captureStyleAnalysis: e.target.checked})}
                    className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-purple-600 rounded flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm text-gray-900 font-medium mb-1">🎨 Style Analysis</div>
                    <div className="text-[10px] sm:text-xs text-gray-600">Extract color palette, typography scale & visual effects (+1 second)</div>
                  </div>
                </label>
                <label className="flex items-start gap-2 sm:gap-3 cursor-pointer p-3 sm:p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200">
                  <input
                    type="checkbox"
                    checked={cloneOptions.captureNavigation}
                    onChange={(e) => setCloneOptions({...cloneOptions, captureNavigation: e.target.checked})}
                    className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-purple-600 rounded flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm text-gray-900 font-medium mb-1">🧭 Navigation Detection</div>
                    <div className="text-[10px] sm:text-xs text-gray-600">Multi-level detection of navigation menus & components (+1 second)</div>
                  </div>
                </label>
                </div>
              </div>

              {/* Modal Footer - Fixed */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex justify-end flex-shrink-0 bg-gray-50">
                <Button
                  onClick={() => setCloneChecked(false)}
                  className="bg-purple-600 hover:bg-purple-700 text-sm sm:text-base"
                >
                  Apply Options
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Card
                  key={idx}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
              View All
            </Button>
          </div>

          {recentProjects.length > 0 ? (
            <div className="space-y-4">
              {recentProjects.map((project) => {
                const fullProject = projects.find(p => p.id === project.id);
                const lighthouse = fullProject?.metrics?.lighthouse;

                console.log('Project:', project.id, 'Lighthouse data:', lighthouse);

                return (
                  <Card key={project.id} className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">{project.name}</h3>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            <CheckCircle size={12} />
                            Completed
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{project.url}</p>

                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Lighthouse Scores</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <DonutChart
                              value={lighthouse?.performanceScore || 0}
                              label="Performance"
                              size={100}
                            />
                            <DonutChart
                              value={lighthouse?.accessibilityScore || 0}
                              label="Accessibility"
                              size={100}
                            />
                            <DonutChart
                              value={lighthouse?.bestPracticesScore || 0}
                              label="Best Practices"
                              size={100}
                            />
                            <DonutChart
                              value={lighthouse?.seoScore || 0}
                              label="SEO"
                              size={100}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <WebsiteInfo
                            url={project.url}
                            cms={'WordPress'}
                            pageBuilder={'Elementor'}
                            technologies={['React', 'Tailwind CSS']}
                          />

                          <Card>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Quick Stats</h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Analyzed</span>
                                <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                  <Clock size={14} />
                                  {project.date}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Overall Score</span>
                                <span className="text-sm font-bold text-gray-900">{project.score}/100</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Status</span>
                                <span className="text-sm font-medium text-green-600">Ready</span>
                              </div>
                            </div>
                          </Card>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            onClick={() => {
                              const fullProject = projects.find(p => p.id === project.id);
                              if (fullProject) setCurrentProject(fullProject);
                              navigate(`/performance/${project.id}`);
                            }}
                          >
                            <BarChart3 size={16} className="mr-2" />
                            Performance
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const fullProject = projects.find(p => p.id === project.id);
                              if (fullProject) setCurrentProject(fullProject);
                              navigate(`/optimize/${project.id}`);
                            }}
                            className="text-purple-600 hover:bg-purple-50"
                          >
                            <Zap size={16} className="mr-2" />
                            Optimize
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const fullProject = projects.find(p => p.id === project.id);
                              if (fullProject) setCurrentProject(fullProject);
                              navigate(`/preview/${project.id}`);
                            }}
                            className="text-green-600 hover:bg-green-50"
                          >
                            <FileText size={16} className="mr-2" />
                            Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const fullProject = projects.find(p => p.id === project.id);
                              if (fullProject) setCurrentProject(fullProject);
                              navigate(`/export/${project.id}`);
                            }}
                          >
                            <Download size={16} className="mr-2" />
                            Export
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleArchive(project.id)}
                            className="text-orange-600 hover:bg-orange-50"
                          >
                            <Archive size={16} className="mr-2" />
                            Archive
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(project.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <FileText className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">Start by analyzing your first website</p>
              <Button onClick={() => {
                const input = document.querySelector('input[type="url"]') as HTMLInputElement | null;
                input?.focus();
              }}>
                <Search size={18} className="mr-2" />
                Analyze a Website
              </Button>
            </Card>
          )}
        </div>

        {archivedProjects.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Saved Projects</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
              >
                {showArchived ? 'Hide' : 'Show'} ({archivedProjects.length})
              </Button>
            </div>

            {showArchived && (
              <div className="space-y-4">
                {archivedProjects.map((project) => {
                  const fullProject = projects.find(p => p.id === project.id);
                  const lighthouse = fullProject?.metrics?.lighthouse;

                  return (
                    <Card key={project.id} className="p-6 bg-gray-50">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">{project.name}</h3>
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                              <Archive size={12} />
                              Archived
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{project.url}</p>

                          <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Lighthouse Scores</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              <DonutChart
                                value={lighthouse?.performanceScore || 0}
                                label="Performance"
                                size={100}
                              />
                              <DonutChart
                                value={lighthouse?.accessibilityScore || 0}
                                label="Accessibility"
                                size={100}
                              />
                              <DonutChart
                                value={lighthouse?.bestPracticesScore || 0}
                                label="Best Practices"
                                size={100}
                              />
                              <DonutChart
                                value={lighthouse?.seoScore || 0}
                                label="SEO"
                                size={100}
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              onClick={() => handleUnarchive(project.id)}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <Archive size={16} className="mr-2" />
                              Unarchive
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/performance/${project.id}`)}
                            >
                              <BarChart3 size={16} className="mr-2" />
                              View Analysis
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(project.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} className="mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Total Analyzed</h3>
              <Globe className="text-blue-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
            <p className="text-sm text-gray-600 mt-1">Websites analyzed</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Avg Performance</h3>
              <BarChart3 className="text-green-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">92</p>
            <p className="text-sm text-gray-600 mt-1">Average score</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Exports</h3>
              <Download className="text-purple-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600 mt-1">WordPress exports</p>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, projectId: null })}
        onConfirm={confirmDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone and all data will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={archiveConfirm.isOpen}
        onClose={() => setArchiveConfirm({ isOpen: false, projectId: null })}
        onConfirm={confirmArchive}
        title="Archive Project"
        message="Are you sure you want to archive this project? You can restore it later from the archived projects section."
        confirmText="Archive"
        cancelText="Cancel"
        variant="warning"
      />

      {toast?.show && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
