export interface CloneProgressProps {
  progress: number; // 0-100
  currentStep: string;
  logs: string[];
  estimatedTimeRemaining?: number; // in seconds
}

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

export function CloneProgress({
  progress,
  currentStep,
  logs,
  estimatedTimeRemaining
}: CloneProgressProps) {
  const steps = [
    { name: 'Fetch', range: [0, 20] },
    { name: 'Parse', range: [20, 40] },
    { name: 'Process', range: [40, 60] },
    { name: 'Optimize', range: [60, 80] },
    { name: 'Export', range: [80, 100] },
  ];

  const getStepStatus = (stepRange: number[]): 'completed' | 'in-progress' | 'pending' => {
    if (progress > stepRange[1]) return 'completed';
    if (progress >= stepRange[0] && progress <= stepRange[1]) return 'in-progress';
    return 'pending';
  };

  const isComplete = progress === 100;

  return (
    <div className="space-y-6 bg-white rounded-xl border border-gray-200 shadow-lg p-6">
      {/* Progress Bar Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Cloning Progress</h3>
          <span className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</span>
        </div>

        {/* Progress Bar with Shimmer */}
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 relative overflow-hidden ${
              isComplete
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer Effect */}
            {!isComplete && (
              <div className="absolute inset-0 animate-shimmer">
                <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </div>
            )}
          </div>
        </div>

        {/* Estimated Time Remaining */}
        {estimatedTimeRemaining !== undefined && !isComplete && (
          <p className="text-sm text-gray-600 mt-2">
            Estimated time remaining: <span className="font-medium">{formatTime(estimatedTimeRemaining)}</span>
          </p>
        )}
      </div>

      {/* Steps Visualization */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Steps</h4>
        <div className="flex items-center justify-between gap-2">
          {steps.map((step, index) => {
            const status = getStepStatus(step.range);

            return (
              <div key={index} className="flex-1">
                <div className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      status === 'completed'
                        ? 'bg-green-500 border-green-500'
                        : status === 'in-progress'
                        ? 'bg-blue-500 border-blue-500 animate-pulse'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {status === 'completed' ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : status === 'in-progress' ? (
                      <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <span className="text-gray-400 text-sm font-medium">{index + 1}</span>
                    )}
                  </div>

                  {/* Step Name */}
                  <span
                    className={`text-xs font-medium mt-2 ${
                      status === 'completed'
                        ? 'text-green-600'
                        : status === 'in-progress'
                        ? 'text-blue-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="relative top-[-30px] left-[50%] w-full h-0.5 bg-gray-300">
                    <div
                      className={`h-full transition-all duration-500 ${
                        getStepStatus(steps[index + 1].range) === 'completed'
                          ? 'bg-green-500'
                          : getStepStatus(steps[index + 1].range) === 'in-progress'
                          ? 'bg-blue-500'
                          : 'bg-gray-300'
                      }`}
                      style={{
                        width: status === 'completed' ? '100%' : status === 'in-progress' ? '50%' : '0%',
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Indicator */}
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
        {!isComplete ? (
          <>
            <svg className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">Current Step</p>
              <p className="text-sm text-blue-700">{currentStep}</p>
            </div>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-900">Completed</p>
              <p className="text-sm text-green-700">Website cloned successfully!</p>
            </div>
          </>
        )}
      </div>

      {/* Live Activity Log */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">Activity Log</h4>
          <span className="text-xs text-gray-500">{logs.length} events</span>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 max-h-80 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-gray-500">Waiting for activity...</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => {
                // Detect log type by content
                const isWordPress = log.includes('[WordPress]');
                const isService = log.includes('[Service]');
                const isError = log.includes('[ERROR]') || log.includes('Error:') || log.includes('❌');
                const isWarning = log.includes('[WARNING]') || log.includes('WARNING:');
                const isSuccess = log.includes('✓') || log.includes('complete') || log.includes('success');
                const isInfo = log.includes('🔍') || log.includes('📥');

                // Choose color based on log type
                let textColor = 'text-gray-300';
                let iconColor = 'text-green-400';

                if (isWordPress) {
                  textColor = 'text-blue-300';
                  iconColor = 'text-blue-400';
                } else if (isError) {
                  textColor = 'text-red-300';
                  iconColor = 'text-red-400';
                } else if (isWarning) {
                  textColor = 'text-yellow-300';
                  iconColor = 'text-yellow-400';
                } else if (isSuccess) {
                  textColor = 'text-green-300';
                  iconColor = 'text-green-400';
                } else if (isInfo) {
                  textColor = 'text-cyan-300';
                  iconColor = 'text-cyan-400';
                } else if (isService) {
                  textColor = 'text-purple-300';
                  iconColor = 'text-purple-400';
                }

                return (
                  <div key={index} className="flex items-start gap-2">
                    <span className={`${iconColor} flex-shrink-0`}>{'>'}</span>
                    <span className={textColor}>{log}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Log Legend */}
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span className="text-blue-400">▪</span>
            <span>WordPress</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-400">▪</span>
            <span>Success</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-cyan-400">▪</span>
            <span>Info</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">▪</span>
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-red-400">▪</span>
            <span>Error</span>
          </div>
        </div>
      </div>
    </div>
  );
}
