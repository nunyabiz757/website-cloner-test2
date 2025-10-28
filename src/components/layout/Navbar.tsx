import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export function Navbar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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
          <div className="hidden md:flex items-center gap-6">
            <Link
              to={user ? "/dashboard" : "/"}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/features"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Features
            </Link>
            <Link
              to="/documentation"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Documentation
            </Link>
            {user && (
              <Link
                to="/settings"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
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
