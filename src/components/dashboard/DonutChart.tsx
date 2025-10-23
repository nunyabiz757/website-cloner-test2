interface DonutChartProps {
  value: number;
  label: string;
  size?: number;
}

export function DonutChart({ value, label, size = 120 }: DonutChartProps) {
  const getColor = (score: number) => {
    if (score >= 90) return { stroke: '#10b981', bg: '#d1fae5' };
    if (score >= 50) return { stroke: '#f59e0b', bg: '#fed7aa' };
    return { stroke: '#ef4444', bg: '#fecaca' };
  };

  const color = getColor(value);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color.bg}
            strokeWidth="10"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-700 mt-2 text-center">{label}</p>
    </div>
  );
}
