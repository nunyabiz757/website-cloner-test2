import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronDown, Copy, BarChart3, Zap, Download } from 'lucide-react';

interface ProductsMenuProps {
  isActive: boolean;
}

export function ProductsMenu({ isActive }: ProductsMenuProps) {
  const [showMenu, setShowMenu] = useState(false);

  const products = [
    {
      id: 'website-cloner',
      icon: Copy,
      title: 'Website Cloner',
      description: 'Clone any website instantly',
      color: 'from-blue-600 to-blue-500'
    },
    {
      id: 'performance-analyzer',
      icon: BarChart3,
      title: 'Performance Analyzer',
      description: 'Get comprehensive insights',
      color: 'from-green-600 to-green-500'
    },
    {
      id: 'optimizer',
      icon: Zap,
      title: 'Website Optimizer',
      description: '20+ optimization techniques',
      color: 'from-yellow-600 to-yellow-500'
    },
    {
      id: 'wordpress-export',
      icon: Download,
      title: 'WordPress Export',
      description: '11 page builders supported',
      color: 'from-purple-600 to-purple-500'
    }
  ];

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <button
        className={`flex items-center gap-2 text-sm transition-colors ${
          isActive
            ? 'text-blue-600 font-medium'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Package size={16} />
        Products
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`}
        />
      </button>

      {showMenu && (
        <div className="absolute top-full left-0 pt-2">
          <div className="w-80 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 opacity-0 animate-fadeIn">
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="flex items-start gap-4 px-4 py-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 group"
              >
                <div className={`w-10 h-10 bg-gradient-to-r ${product.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                    {product.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {product.description}
                  </p>
                </div>
              </Link>
            );
          })}
            <div className="border-t border-gray-200 mt-2 pt-2 px-4">
              <Link
                to="/products"
                className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors"
              >
                View All Products →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
