import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { MetricBar } from './MetricBar';
import type { PerformanceMetrics } from '../../types';

interface DetailedMetricsProps {
  metrics: PerformanceMetrics;
}

export function DetailedMetrics({ metrics }: DetailedMetricsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Core Web Vitals Assessment</h3>
        <p className="text-sm text-gray-600 mb-6">Real-world performance metrics measuring user experience</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <MetricBar
            value={metrics.coreWebVitals.lcp.value / 1000}
            thresholds={{ good: 2.5, needsImprovement: 4.0 }}
            label="Largest Contentful Paint (LCP)"
            unit="s"
            format={(v) => v.toFixed(1)}
          />
          <MetricBar
            value={metrics.coreWebVitals.inp.value}
            thresholds={{ good: 200, needsImprovement: 500 }}
            label="Interaction to Next Paint (INP)"
            unit="ms"
            format={(v) => Math.round(v).toString()}
          />
          <MetricBar
            value={metrics.coreWebVitals.cls.value}
            thresholds={{ good: 0.1, needsImprovement: 0.25 }}
            label="Cumulative Layout Shift (CLS)"
            unit=""
            format={(v) => v.toFixed(2)}
          />
        </div>

        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 text-sm uppercase">Additional Details</h4>

          <div className="border-b pb-4">
            <h5 className="font-medium text-gray-900 mb-2 text-sm">LCP Details</h5>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {metrics.coreWebVitals.lcp.element && (
                <div className="col-span-2">
                  <span className="text-gray-600">Element:</span>
                  <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                    {metrics.coreWebVitals.lcp.element}
                  </code>
                </div>
              )}
              {metrics.coreWebVitals.lcp.renderTime && (
                <div>
                  <span className="text-gray-600">Render Time:</span>
                  <span className="ml-2 font-medium">{metrics.coreWebVitals.lcp.renderTime}ms</span>
                </div>
              )}
              {metrics.coreWebVitals.lcp.size && (
                <div>
                  <span className="text-gray-600">Size:</span>
                  <span className="ml-2 font-medium">{(metrics.coreWebVitals.lcp.size / 1024).toFixed(1)}KB</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-b pb-4">
            <h5 className="font-medium text-gray-900 mb-2 text-sm">INP Details</h5>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Total Interactions:</span>
                <span className="ml-2 font-medium">{metrics.coreWebVitals.inp.totalInteractions}</span>
              </div>
              {metrics.coreWebVitals.inp.worstInteraction && (
                <>
                  <div>
                    <span className="text-gray-600">Worst Duration:</span>
                    <span className="ml-2 font-medium">{metrics.coreWebVitals.inp.worstInteraction.duration}ms</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Event:</span>
                    <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                      {metrics.coreWebVitals.inp.worstInteraction.eventType} on {metrics.coreWebVitals.inp.worstInteraction.target}
                    </code>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="border-b pb-4">
            <h5 className="font-medium text-gray-900 mb-2 text-sm">CLS Details</h5>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <span className="text-gray-600">Layout Shifts:</span>
                <span className="ml-2 font-medium">{metrics.coreWebVitals.cls.shifts.length}</span>
              </div>
            </div>
            {metrics.coreWebVitals.cls.shifts.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="text-xs font-medium text-gray-700">Individual Shifts:</div>
                {metrics.coreWebVitals.cls.shifts.map((shift, i) => (
                  <div key={i} className="text-xs bg-gray-50 p-2 rounded">
                    <div>Score: {shift.value.toFixed(4)} at {shift.timestamp}ms</div>
                    <div className="text-gray-600">Elements: {shift.elements.join(', ')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Performance Metrics</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <MetricBar
            value={metrics.coreWebVitals.fcp.value / 1000}
            thresholds={{ good: 1.8, needsImprovement: 3.0 }}
            label="First Contentful Paint (FCP)"
            unit="s"
            format={(v) => v.toFixed(1)}
          />
          <MetricBar
            value={metrics.coreWebVitals.ttfb.value / 1000}
            thresholds={{ good: 0.8, needsImprovement: 1.8 }}
            label="Time to First Byte (TTFB)"
            unit="s"
            format={(v) => v.toFixed(1)}
          />
        </div>

        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 text-sm uppercase">Blocking & Interactivity</h4>

          <div className="border-b pb-4">
            <h5 className="font-medium text-gray-900 mb-2 text-sm">TBT - Total Blocking Time</h5>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Value:</span>
                <span className="ml-2 font-medium">{metrics.additionalMetrics.tbt.value}ms</span>
              </div>
              <div>
                <span className="text-gray-600">Rating:</span>
                <Badge className="ml-2">{metrics.additionalMetrics.tbt.rating}</Badge>
              </div>
              <div>
                <span className="text-gray-600">Long Tasks:</span>
                <span className="ml-2 font-medium">{metrics.additionalMetrics.tbt.longTasksCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Blocking:</span>
                <span className="ml-2 font-medium">{metrics.additionalMetrics.tbt.totalBlockingDuration}ms</span>
              </div>
            </div>
          </div>

          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">TTI - Time to Interactive</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Value:</span>
                <span className="ml-2 font-medium">{metrics.additionalMetrics.tti.value}ms</span>
              </div>
              <div>
                <span className="text-gray-600">Rating:</span>
                <Badge className="ml-2">{metrics.additionalMetrics.tti.rating}</Badge>
              </div>
              {metrics.additionalMetrics.tti.firstCpuIdle && (
                <div>
                  <span className="text-gray-600">First CPU Idle:</span>
                  <span className="ml-2 font-medium">{metrics.additionalMetrics.tti.firstCpuIdle}ms</span>
                </div>
              )}
              {metrics.additionalMetrics.tti.networkIdle && (
                <div>
                  <span className="text-gray-600">Network Idle:</span>
                  <span className="ml-2 font-medium">{metrics.additionalMetrics.tti.networkIdle}ms</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Resource & Network Analysis</h3>

        <div className="space-y-4">
          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Page Size Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Total:</span>
                <span className="ml-2 font-medium">{(metrics.resourceMetrics.totalPageSize.total / (1024 * 1024)).toFixed(2)}MB</span>
              </div>
              <div>
                <span className="text-gray-600">HTML:</span>
                <span className="ml-2 font-medium">{(metrics.resourceMetrics.totalPageSize.html / 1024).toFixed(1)}KB</span>
              </div>
              <div>
                <span className="text-gray-600">CSS:</span>
                <span className="ml-2 font-medium">{(metrics.resourceMetrics.totalPageSize.css / 1024).toFixed(1)}KB</span>
              </div>
              <div>
                <span className="text-gray-600">JS:</span>
                <span className="ml-2 font-medium">{(metrics.resourceMetrics.totalPageSize.js / 1024).toFixed(1)}KB</span>
              </div>
              <div>
                <span className="text-gray-600">Images:</span>
                <span className="ml-2 font-medium">{(metrics.resourceMetrics.totalPageSize.images / 1024).toFixed(1)}KB</span>
              </div>
              <div>
                <span className="text-gray-600">Fonts:</span>
                <span className="ml-2 font-medium">{(metrics.resourceMetrics.totalPageSize.fonts / 1024).toFixed(1)}KB</span>
              </div>
              <div>
                <span className="text-gray-600">Videos:</span>
                <span className="ml-2 font-medium">{(metrics.resourceMetrics.totalPageSize.videos / 1024).toFixed(1)}KB</span>
              </div>
              <div>
                <span className="text-gray-600">Other:</span>
                <span className="ml-2 font-medium">{(metrics.resourceMetrics.totalPageSize.other / 1024).toFixed(1)}KB</span>
              </div>
            </div>
          </div>

          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Resources ({metrics.resourceMetrics.resources.length})</h4>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {metrics.resourceMetrics.resources.map((resource, i) => (
                <div key={i} className="text-xs bg-gray-50 p-2 rounded flex items-center justify-between">
                  <div className="flex-1 truncate">
                    <Badge className="mr-2">{resource.type}</Badge>
                    <span className="text-gray-600 truncate">{resource.url}</span>
                  </div>
                  <div className="flex items-center gap-3 ml-2">
                    <span className="text-gray-600">{(resource.size / 1024).toFixed(1)}KB</span>
                    <span className="text-gray-600">{resource.duration.toFixed(0)}ms</span>
                    {resource.renderBlocking && (
                      <Badge className="bg-orange-100 text-orange-700">Blocking</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Long Tasks ({metrics.resourceMetrics.longTasks.length})</h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {metrics.resourceMetrics.longTasks.map((task, i) => (
                <div key={i} className="text-xs bg-red-50 p-2 rounded flex items-center justify-between">
                  <div>
                    <span className="font-medium text-red-900">Task #{i + 1}</span>
                    {task.attribution && (
                      <span className="ml-2 text-gray-600">({task.attribution})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">Start: {task.startTime.toFixed(0)}ms</span>
                    <span className="font-medium text-red-700">{task.duration.toFixed(0)}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Network Requests ({metrics.resourceMetrics.networkRequests.length})</h4>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {metrics.resourceMetrics.networkRequests.map((request, i) => (
                <div key={i} className="text-xs bg-gray-50 p-2 rounded flex items-center justify-between">
                  <div className="flex-1 truncate">
                    <Badge className={`mr-2 ${request.status >= 200 && request.status < 300 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {request.method} {request.status}
                    </Badge>
                    <span className="text-gray-600 truncate">{request.url}</span>
                  </div>
                  <div className="flex items-center gap-3 ml-2">
                    <span className="text-gray-600">{(request.size / 1024).toFixed(1)}KB</span>
                    <span className="text-gray-600">{request.duration.toFixed(0)}ms</span>
                    {request.cached && <Badge className="bg-blue-100 text-blue-700">Cached</Badge>}
                    {request.blocking && <Badge className="bg-orange-100 text-orange-700">Blocking</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
