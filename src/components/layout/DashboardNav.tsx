import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Zap, Eye, Download, Sparkles, FolderKanban } from 'lucide-react';

export function DashboardNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboardPage = location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/performance') ||
    location.pathname.startsWith('/optimize') ||
    location.pathname.startsWith('/optimization') ||
    location.pathname.startsWith('/preview') ||
    location.pathname.startsWith('/export') ||
    location.pathname.startsWith('/ai-assistant') ||
    location.pathname.startsWith('/projects');

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/projects', label: 'Projects', icon: FolderKanban },
    { path: '/performance', label: 'Performance', icon: BarChart3 },
    { path: '/optimize', label: 'Optimize', icon: Zap },
    { path: '/preview', label: 'Preview', icon: Eye },
    { path: '/export', label: 'Export', icon: Download },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  if (!isDashboardPage) {
    return null;
  }

  return (
    <div className="sticky top-20 z-40 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="bg-white/80 backdrop-blur-md shadow-lg rounded-2xl border border-gray-200/50">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
                      transition-all duration-200 whitespace-nowrap
                      ${active
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md transform scale-105'
                        : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500 hover:text-white hover:shadow-md'
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => navigate('/ai-assistant')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 whitespace-nowrap"
            >
              <Sparkles size={18} />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
