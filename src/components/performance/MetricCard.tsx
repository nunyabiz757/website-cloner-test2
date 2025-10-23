import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';

interface MetricCardProps {
  name: string;
  abbr: string;
  value: number;
  unit?: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  description: string;
  threshold: { good: number; poor: number };
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export function MetricCard({ name, abbr, value, unit = '', rating, description, threshold, icon: Icon }: MetricCardProps) {
  const ratingConfig = {
    good: {
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      valueColor: 'text-green-600',
      StatusIcon: CheckCircle,
      statusColor: 'text-green-600',
    },
    'needs-improvement': {
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      valueColor: 'text-orange-600',
      StatusIcon: AlertTriangle,
      statusColor: 'text-orange-600',
    },
    poor: {
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      valueColor: 'text-red-600',
      StatusIcon: AlertCircle,
      statusColor: 'text-red-600',
    },
  };

  const config = ratingConfig[rating];
  const StatusIcon = config.StatusIcon;

  return (
    <Card className={`${config.bgColor} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg ${config.iconBg}`}>
          <Icon size={24} className={config.iconColor} />
        </div>
        <StatusIcon size={20} className={config.statusColor} />
      </div>

      <h3 className="font-semibold text-gray-900 mb-1">{abbr}</h3>
      <p className="text-xs text-gray-600 mb-3">{description}</p>

      <div className="flex items-baseline gap-1 mb-3">
        <span className={`text-3xl font-bold ${config.valueColor}`}>
          {value.toFixed(unit === 'ms' || unit === 's' ? 0 : 2)}
        </span>
        <span className="text-sm text-gray-600">{unit}</span>
      </div>

      <div className="pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Good:</span>
            <span className="font-medium">≤ {threshold.good}{unit}</span>
          </div>
          <div className="flex justify-between">
            <span>Poor:</span>
            <span className="font-medium">≥ {threshold.poor}{unit}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
