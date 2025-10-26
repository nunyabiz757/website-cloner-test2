import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Code, FileCode, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProjectStore } from '../stores/projectStore';
import { ExportModal } from '../components/export/ExportModal';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function ExportPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, loadProjects } = useProjectStore();
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'html' | 'wordpress' | 'react'>('html');
  const [isLoading, setIsLoading] = useState(true);

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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Export Projects</h1>
          <p className="text-gray-600 mb-8">Select a project to export</p>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.filter(p => p.status === 'completed').map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => navigate(`/export/${proj.id}`)}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:border-orange-500 hover:shadow-lg transition-all cursor-pointer"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">{proj.source}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {new Date(proj.createdAt).toLocaleDateString()}
                  </p>
                  <Button size="sm" className="w-full">Export</Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">Analyze a website first to export it</p>
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

  const exportFormats = [
    {
      id: 'html',
      title: 'Static HTML',
      icon: Code,
      description: 'Export as optimized HTML, CSS, and JavaScript files',
      formats: ['HTML', 'CSS', 'JS', 'Assets'],
      recommended: true,
    },
    {
      id: 'wordpress',
      title: 'WordPress',
      icon: Package,
      description: 'Convert to WordPress page builder format',
      formats: ['Elementor', 'Gutenberg', 'Divi', '+8 more'],
      recommended: false,
    },
    {
      id: 'react',
      title: 'React Components',
      icon: FileCode,
      description: 'Convert to React/Vue/Angular components',
      formats: ['React', 'Vue', 'Angular', 'Svelte'],
      recommended: false,
    },
  ];

  const handleExport = (type: 'html' | 'wordpress' | 'react') => {
    setExportType(type);
    setShowExportModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
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
              <h1 className="text-3xl font-bold text-gray-900">Export Project</h1>
              <p className="text-gray-600 mt-1">{project.source}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-2">Performance Score</div>
            <div className="text-4xl font-bold text-green-600">
              {project.optimizedScore || project.originalScore || 0}
            </div>
          </Card>

          <Card className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-2">Total Size</div>
            <div className="text-4xl font-bold text-gray-900">
              {((project.metrics?.totalSize || 0) / 1024).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">MB</div>
          </Card>

          <Card className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-2">Assets</div>
            <div className="text-4xl font-bold text-gray-900">
              {project.assets?.length || 0}
            </div>
          </Card>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Export Format</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {exportFormats.map((format) => {
            const Icon = format.icon;

            return (
              <Card
                key={format.id}
                className="hover:shadow-lg transition-shadow cursor-pointer relative"
                onClick={() => handleExport(format.id as any)}
              >
                {format.recommended && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      Recommended
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon size={24} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{format.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{format.description}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {format.formats.map((fmt) => (
                      <span
                        key={fmt}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>

                  <Button className="w-full">
                    <Download size={16} className="mr-2" />
                    Export as {format.title}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <Card>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Export Options</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded" defaultChecked />
              <div>
                <div className="font-medium text-gray-900">Include all assets</div>
                <div className="text-sm text-gray-600">Images, fonts, and other resources</div>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded" defaultChecked />
              <div>
                <div className="font-medium text-gray-900">Use optimized version</div>
                <div className="text-sm text-gray-600">Export the optimized HTML instead of original</div>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded" />
              <div>
                <div className="font-medium text-gray-900">Inline all resources</div>
                <div className="text-sm text-gray-600">Create a self-contained HTML file</div>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded" />
              <div>
                <div className="font-medium text-gray-900">Include source maps</div>
                <div className="text-sm text-gray-600">For debugging minified code</div>
              </div>
            </label>
          </div>
        </Card>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Need help choosing?</h3>
          <p className="text-blue-700 mb-4">
            For most use cases, we recommend exporting as Static HTML. This gives you the most flexibility
            and preserves all optimizations.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" size="sm">
              View Documentation
            </Button>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </div>
        </div>
      </div>

      {showExportModal && (
        <ExportModal
          project={project}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
