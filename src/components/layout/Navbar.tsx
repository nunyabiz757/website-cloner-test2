import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { ChevronDown, Home, Layers, BookOpen, Settings, LogIn, LogOut, Copy, RefreshCw, Zap, Search, Shield, Cpu, Globe } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showFeaturesDropdown, setShowFeaturesDropdown] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const features = [
    { name: 'Website Cloning', description: 'Clone any website instantly', path: '/features/website-cloning', icon: Copy, color: 'bg-blue-500' },
    { name: 'WordPress to GHL', description: '11 page builders supported', path: '/features/wordpress-to-ghl', icon: RefreshCw, color: 'bg-purple-500' },
    { name: 'GHL to GHL Cloning', description: 'Duplicate GHL funnels', path: '/features/ghl-to-ghl', icon: Globe, color: 'bg-indigo-500' },
    { name: 'Performance Optimization', description: '20+ optimization techniques', path: '/features/performance-optimization', icon: Zap, color: 'bg-yellow-500' },
    { name: 'SEO Analysis', description: 'Get comprehensive insights', path: '/features/seo-analysis', icon: Search, color: 'bg-green-500' },
    { name: 'Security Scanning', description: 'Detect vulnerabilities', path: '/features/security-scanning', icon: Shield, color: 'bg-red-500' },
    { name: 'Technology Detection', description: 'Identify tech stacks', path: '/features/technology-detection', icon: Cpu, color: 'bg-cyan-500' },
    { name: 'View All Products', description: 'See all features', path: '/features', icon: Layers, color: 'bg-gray-500' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Website Cloner Pro</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to={user ? "/dashboard" : "/"}
              className="relative px-6 py-2.5 text-sm font-semibold text-gray-700 rounded-lg bg-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500 hover:text-white transform hover:scale-105 transition-all duration-200 hover:shadow-lg flex items-center gap-2"
            >
              <Home size={16} />
              Home
            </Link>

            {/* Features Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowFeaturesDropdown(true)}
              onMouseLeave={() => setShowFeaturesDropdown(false)}
            >
              <button
                className="relative px-6 py-2.5 text-sm font-semibold text-gray-700 rounded-lg bg-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500 hover:text-white transform hover:scale-105 transition-all duration-200 hover:shadow-lg flex items-center gap-2"
              >
                <Layers size={16} />
                Features
                <ChevronDown size={16} className={`transition-transform ${showFeaturesDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showFeaturesDropdown && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 pt-2">
                  <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6" style={{ width: '800px' }}>
                    <div className="grid grid-cols-4 gap-4">
                      {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                          <Link
                            key={feature.path}
                            to={feature.path}
                            className="group p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 flex flex-col items-start"
                            onClick={() => setShowFeaturesDropdown(false)}
                          >
                            <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                              <Icon className="text-white" size={20} />
                            </div>
                            <h3 className="font-semibold text-sm text-gray-900 mb-1">{feature.name}</h3>
                            <p className="text-xs text-gray-600">{feature.description}</p>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/documentation"
              className="relative px-6 py-2.5 text-sm font-semibold text-gray-700 rounded-lg bg-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500 hover:text-white transform hover:scale-105 transition-all duration-200 hover:shadow-lg flex items-center gap-2"
            >
              <BookOpen size={16} />
              Documentation
            </Link>
            {user && (
              <Link
                to="/settings"
                className="relative px-6 py-2.5 text-sm font-semibold text-gray-700 rounded-lg bg-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500 hover:text-white transform hover:scale-105 transition-all duration-200 hover:shadow-lg flex items-center gap-2"
              >
                <Settings size={16} />
                Settings
              </Link>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden md:block text-sm text-gray-600">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="relative px-6 py-2.5 text-sm font-semibold text-gray-700 rounded-lg bg-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500 hover:text-white transform hover:scale-105 transition-all duration-200 hover:shadow-lg flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="relative px-6 py-2.5 text-sm font-semibold text-gray-700 rounded-lg bg-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500 hover:text-white transform hover:scale-105 transition-all duration-200 hover:shadow-lg flex items-center gap-2"
              >
                <LogIn size={16} />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
