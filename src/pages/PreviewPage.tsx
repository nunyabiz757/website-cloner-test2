import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Monitor, Smartphone, Tablet, ArrowLeft, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProjectStore } from '../stores/projectStore';
import { Button } from '../components/ui/Button';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const devices = {
  desktop: { width: '100%', height: '100%', icon: Monitor, label: 'Desktop' },
  tablet: { width: '768px', height: '1024px', icon: Tablet, label: 'Tablet' },
  mobile: { width: '375px', height: '667px', icon: Smartphone, label: 'Mobile' },
};

export function PreviewPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, loadProjects } = useProjectStore();
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [zoom, setZoom] = useState(100);
  const [showOriginal, setShowOriginal] = useState(false);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Project Selected</h2>
          <p className="text-gray-600 mb-6">Please clone a website first to preview it</p>
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

  const DeviceIcon = devices[device].icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
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
                <h1 className="text-xl font-bold text-gray-900">{project.source}</h1>
                <p className="text-sm text-gray-600">Live Preview</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {Object.entries(devices).map(([key, { icon: Icon, label }]) => (
                  <button
                    key={key}
                    onClick={() => setDevice(key as DeviceType)}
                    className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                      device === key
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title={label}
                  >
                    <Icon size={18} />
                    <span className="hidden sm:inline text-sm">{label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                  className="p-2 hover:bg-white rounded transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>
                <span className="text-sm font-medium px-2">{zoom}%</span>
                <button
                  onClick={() => setZoom(Math.min(150, zoom + 10))}
                  className="p-2 hover:bg-white rounded transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  onClick={() => setZoom(100)}
                  className="p-2 hover:bg-white rounded transition-colors"
                  title="Reset Zoom"
                >
                  <RotateCw size={18} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showOriginal}
                    onChange={(e) => setShowOriginal(e.target.checked)}
                    className="rounded"
                  />
                  Show Original
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div
            className="mx-auto transition-all duration-300 bg-white"
            style={{
              width: devices[device].width,
              maxWidth: '100%',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
            }}
          >
            <div
              className="border border-gray-300 rounded-lg overflow-hidden"
              style={{
                height: device === 'desktop' ? '800px' : devices[device].height,
              }}
            >
              <iframe
                srcDoc={showOriginal ? project.originalHtml : project.optimizedHtml}
                className="w-full h-full"
                title="Preview"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </div>

          {device !== 'desktop' && (
            <div className="text-center mt-4 text-sm text-gray-600">
              <DeviceIcon size={16} className="inline mr-2" />
              Simulating {devices[device].label} ({devices[device].width} × {devices[device].height})
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Performance Score</h3>
            <div className="text-3xl font-bold text-green-600">
              {showOriginal ? project.originalScore : project.optimizedScore}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Version</h3>
            <div className="text-lg font-medium text-gray-700">
              {showOriginal ? 'Original' : 'Optimized'}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Device</h3>
            <div className="text-lg font-medium text-gray-700 capitalize">
              {device}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
