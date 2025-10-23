import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, Home, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ProductsMenu } from './ProductsMenu';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const isDashboard = location.pathname.startsWith('/dashboard') ||
                     location.pathname.startsWith('/performance') ||
                     location.pathname.startsWith('/optimize') ||
                     location.pathname.startsWith('/preview') ||
                     location.pathname.startsWith('/export') ||
                     location.pathname.startsWith('/projects') ||
                     location.pathname.startsWith('/ai-assistant');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Website Cloner Pro</h1>
              <p className="text-xs text-gray-500">Performance-First Migration Tool</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {!isDashboard && (
              <>
                <NavLink to="/" icon={Home} label="Home" active={location.pathname === '/'} />
                <ProductsMenu isActive={location.pathname.startsWith('/products')} />
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <button className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2">
              Docs
            </button>
            {user ? (
              <>
                {!isDashboard && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="relative px-6 py-2.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Dashboard
                  </button>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline text-sm text-green-700 font-medium max-w-[150px] truncate">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

interface NavLinkProps {
  to: string;
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  active: boolean;
}

function NavLink({ to, icon: Icon, label, active }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 text-sm transition-colors ${
        active
          ? 'text-blue-600 font-medium'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}
