import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Zap, Eye, Download, Sparkles, FolderKanban, Menu, X } from 'lucide-react';

export function DashboardNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const isDashboardPage = location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/performance') ||
    location.pathname.startsWith('/optimize') ||
    location.pathname.startsWith('/optimization') ||
    location.pathname.startsWith('/preview') ||
    location.pathname.startsWith('/export') ||
    location.pathname.startsWith('/ai-assistant') ||
    location.pathname.startsWith('/projects');

  console.log('🔍 DashboardNav - Current path:', location.pathname, 'isDashboardPage:', isDashboardPage);

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
    <>
      {/* Floating Navigation Container - Desktop */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-50 flex-col items-end gap-3">
        {/* Navigation Buttons - shown when open */}
        <div
          className={`
            flex flex-col gap-3 transition-all duration-300 origin-bottom-right
            ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}
          `}
        >
          {/* Regular Nav Items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <div key={item.path} className="relative group">
                {/* Tooltip Label */}
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {item.label}
                </div>

                {/* Button */}
                <button
                  onClick={() => navigate(item.path)}
                  className={`
                    w-14 h-14 rounded-full flex items-center justify-center
                    transition-all duration-200 shadow-xl
                    ${active
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white scale-110'
                      : 'bg-white/90 backdrop-blur-md text-gray-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500 hover:text-white hover:scale-110'
                    }
                  `}
                  aria-label={item.label}
                >
                  <Icon size={22} />
                </button>
              </div>
            );
          })}

          {/* AI Assistant Button - Special Style */}
          <div className="relative group">
            {/* Tooltip Label */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              AI Assistant
            </div>

            {/* Button */}
            <button
              onClick={() => navigate('/ai-assistant')}
              className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-xl hover:scale-110"
              aria-label="AI Assistant"
            >
              <Sparkles size={22} />
            </button>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-xl hover:scale-110 flex items-center justify-center"
          aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile: Compact floating button (shows menu icon only on small screens) */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xl flex items-center justify-center"
        >
          <Menu size={20} />
        </button>
      </div>
    </>
  );
}
