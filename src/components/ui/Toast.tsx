import { useEffect } from 'react';
import { CheckCircle, X, Info, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  title?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, title, type = 'success', onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="text-green-600" size={24} />,
    info: <Info className="text-blue-600" size={24} />,
    warning: <AlertCircle className="text-orange-600" size={24} />,
    error: <AlertCircle className="text-red-600" size={24} />,
  };

  const colors = {
    success: 'bg-green-50 border-green-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-orange-50 border-orange-200',
    error: 'bg-red-50 border-red-200',
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className={`${colors[type]} border rounded-lg shadow-lg p-4 pr-12 max-w-md min-w-[320px]`}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex gap-3">
          <div className="flex-shrink-0">
            {icons[type]}
          </div>
          <div className="flex-1">
            {title && (
              <h3 className="font-semibold text-gray-900 mb-1">
                {title}
              </h3>
            )}
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
