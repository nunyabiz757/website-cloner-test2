import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { ChevronDown, Home, Layers, BookOpen, Settings } from 'lucide-react';
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
    { name: 'All Features', path: '/features' },
    { name: 'Website Cloning', path: '/features/website-cloning' },
    { name: 'WordPress to GHL', path: '/features/wordpress-to-ghl' },
    { name: 'GHL to GHL Cloning', path: '/features/ghl-to-ghl' },
    { name: 'Performance Optimization', path: '/features/performance-optimization' },
    { name: 'SEO Analysis', path: '/features/seo-analysis' },
    { name: 'Security Scanning', path: '/features/security-scanning' },
    { name: 'Technology Detection', path: '/features/technology-detection' },
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
              className="relative px-6 py-2.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
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
                className="relative px-6 py-2.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Layers size={16} />
                Features
                <ChevronDown size={16} className={`transition-transform ${showFeaturesDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showFeaturesDropdown && (
                <div className="absolute top-full left-0 pt-2">
                  <div className="w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-96 overflow-y-auto">
                    {features.map((feature) => (
                      <Link
                        key={feature.path}
                        to={feature.path}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setShowFeaturesDropdown(false)}
                      >
                        {feature.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/documentation"
              className="relative px-6 py-2.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <BookOpen size={16} />
              Documentation
            </Link>
            {user && (
              <Link
                to="/settings"
                className="relative px-6 py-2.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
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
                <Button size="sm" variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
