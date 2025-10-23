interface MetricBarProps {
  value: number;
  thresholds: {
    good: number;
    needsImprovement: number;
  };
  label: string;
  unit: string;
  format?: (value: number) => string;
}

export function MetricBar({ value, thresholds, label, unit, format }: MetricBarProps) {
  const formatValue = format || ((v: number) => v.toFixed(2));

  const getRating = (val: number): 'good' | 'needs-improvement' | 'poor' => {
    if (val <= thresholds.good) return 'good';
    if (val <= thresholds.needsImprovement) return 'needs-improvement';
    return 'poor';
  };

  const rating = getRating(value);

  const getPosition = (val: number): number => {
    const max = thresholds.needsImprovement * 1.5;
    const position = (val / max) * 100;
    return Math.min(Math.max(position, 0), 100);
  };

  const markerPosition = getPosition(value);
  const goodThreshold = getPosition(thresholds.good);
  const needsImprovementThreshold = getPosition(thresholds.needsImprovement);

  const getDotColor = () => {
    if (rating === 'good') return 'bg-green-600';
    if (rating === 'needs-improvement') return 'bg-orange-600';
    return 'bg-red-600';
  };

  const getTextColor = () => {
    if (rating === 'good') return 'text-green-700';
    if (rating === 'needs-improvement') return 'text-orange-700';
    return 'text-red-700';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getDotColor()}`}></div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className={`text-lg font-bold ${getTextColor()}`}>
          {formatValue(value)} {unit}
        </span>
      </div>

      <div className="relative h-2 w-full rounded-full overflow-hidden bg-gray-100">
        <div
          className="absolute left-0 top-0 h-full bg-green-500"
          style={{ width: `${goodThreshold}%` }}
        />
        <div
          className="absolute top-0 h-full bg-orange-500"
          style={{
            left: `${goodThreshold}%`,
            width: `${needsImprovementThreshold - goodThreshold}%`,
          }}
        />
        <div
          className="absolute top-0 h-full bg-red-500"
          style={{
            left: `${needsImprovementThreshold}%`,
            width: `${100 - needsImprovementThreshold}%`,
          }}
        />

        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-0.5 h-4 bg-gray-700 z-10"
          style={{ left: `${markerPosition}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gray-700"></div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gray-700"></div>
        </div>
      </div>
    </div>
  );
}
