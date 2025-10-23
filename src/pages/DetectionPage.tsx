import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Code, Download, ArrowLeft, FileCode, Layers } from 'lucide-react';
import FrameworkDetector from '../services/detection/FrameworkDetector';
import ComponentRecognizer from '../services/detection/ComponentRecognizer';
import ElementorMapper from '../services/detection/ElementorMapper';
import GutenbergMapper from '../services/detection/GutenbergMapper';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import type { FrameworkAnalysis, RecognizedComponent } from '../types/detection.types';

export function DetectionPage() {
  const navigate = useNavigate();
  const [html, setHtml] = useState('');
  const [frameworkResults, setFrameworkResults] = useState<FrameworkAnalysis | null>(null);
  const [componentResults, setComponentResults] = useState<RecognizedComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'frameworks' | 'components' | null>(null);

  const detectFrameworks = async () => {
    setLoading(true);
    setActiveTab('frameworks');
    try {
      const analysis = await FrameworkDetector.detectFrameworks(html);
      setFrameworkResults(analysis);
    } catch (error) {
      console.error('Framework detection failed:', error);
      alert('Framework detection failed');
    } finally {
      setLoading(false);
    }
  };

  const detectComponents = async () => {
    setLoading(true);
    setActiveTab('components');
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const body = doc.body;
      const components: RecognizedComponent[] = [];

      const traverse = (element: Element, depth = 0) => {
        if (!(element instanceof HTMLElement)) return;

        const styles = ComponentRecognizer.extractStyles(element);
        const context = {
          depth,
          isInsideForm: false,
          siblings: element.parentElement?.children.length || 0,
        };

        const recognition = ComponentRecognizer.recognizeComponent(element, styles, context);

        if (recognition.componentType !== 'unknown' && recognition.confidence > 50) {
          components.push({
            componentType: recognition.componentType,
            element: {
              tagName: element.tagName,
              classes: Array.from(element.classList),
              styles,
              textContent: element.textContent || '',
              innerHTML: element.innerHTML,
            },
            props: {
              textContent: element.textContent,
              href: element.getAttribute('href'),
              src: element.getAttribute('src'),
              alt: element.getAttribute('alt'),
              target: element.getAttribute('target'),
            },
            confidence: recognition.confidence,
          });
        }

        for (const child of Array.from(element.children)) {
          traverse(child, depth + 1);
        }
      };

      traverse(body);
      setComponentResults(components);
    } catch (error) {
      console.error('Component detection failed:', error);
      alert('Component detection failed');
    } finally {
      setLoading(false);
    }
  };

  const convertToElementor = async () => {
    setLoading(true);
    try {
      if (componentResults.length === 0) {
        await detectComponents();
      }

      const widgets = componentResults.map(c => ElementorMapper.mapToWidget(c));
      const elementorExport = ElementorMapper.buildExport(widgets, 'Converted Page');

      const blob = new Blob([JSON.stringify(elementorExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'elementor-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Elementor conversion failed:', error);
      alert('Elementor conversion failed');
    } finally {
      setLoading(false);
    }
  };

  const convertToGutenberg = async () => {
    setLoading(true);
    try {
      if (componentResults.length === 0) {
        await detectComponents();
      }

      const gutenbergExport = GutenbergMapper.buildExport(componentResults, 'Converted Page');

      const blob = new Blob([gutenbergExport.content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gutenberg-blocks.html';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Gutenberg conversion failed:', error);
      alert('Gutenberg conversion failed');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      header: '📄', footer: '📄', hero: '🎯', navigation: '🧭',
      card: '🃏', grid: '📐', button: '🔘', heading: '📝',
      image: '🖼️', form: '📋', modal: '🪟', carousel: '🎠',
      'icon-box': '📦', testimonial: '💬', 'pricing-table': '💰',
    };
    return icons[category] || '⚙️';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-700 border-green-200';
    if (confidence >= 70) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (confidence >= 50) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Component Detection & Mapping</h1>
              <p className="text-gray-600 mt-1">Detect frameworks and convert HTML to page builders</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <label className="block text-sm font-medium mb-2 text-gray-700">HTML Input</label>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              rows={15}
              className="w-full border border-gray-300 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Paste your HTML here..."
            />
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={detectFrameworks}
              disabled={!html || loading}
              className="flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Detect Frameworks
            </Button>

            <Button
              onClick={detectComponents}
              disabled={!html || loading}
              className="flex items-center justify-center gap-2"
            >
              <Code className="w-5 h-5" />
              Detect Components
            </Button>

            <Button
              onClick={convertToElementor}
              disabled={!html || loading}
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Download className="w-5 h-5" />
              Export Elementor
            </Button>

            <Button
              onClick={convertToGutenberg}
              disabled={!html || loading}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Download className="w-5 h-5" />
              Export Gutenberg
            </Button>
          </div>

          {frameworkResults && activeTab === 'frameworks' && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Framework Analysis</h2>
              </div>

              {frameworkResults.frameworks.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">JavaScript Frameworks</h3>
                  <div className="space-y-3">
                    {frameworkResults.frameworks.map((framework, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold capitalize">{framework.name}</span>
                            {framework.version && (
                              <Badge className="bg-blue-100 text-blue-700">v{framework.version}</Badge>
                            )}
                          </div>
                          <Badge className={getConfidenceColor(framework.confidence)}>
                            {framework.confidence}% confidence
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {framework.indicators.map((indicator, i) => (
                            <Badge key={i} className="bg-gray-100 text-gray-700 text-xs">
                              {indicator}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {frameworkResults.cssFrameworks.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">CSS Frameworks</h3>
                  <div className="flex flex-wrap gap-2">
                    {frameworkResults.cssFrameworks.map((fw, idx) => (
                      <Badge key={idx} className="bg-green-100 text-green-700 capitalize text-sm px-3 py-1">
                        {fw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {frameworkResults.libraries.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Libraries</h3>
                  <div className="flex flex-wrap gap-2">
                    {frameworkResults.libraries.map((lib, idx) => (
                      <Badge key={idx} className="bg-purple-100 text-purple-700 text-sm px-3 py-1">
                        {lib}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {frameworkResults.recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {frameworkResults.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-blue-600 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}

          {componentResults.length > 0 && activeTab === 'components' && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileCode className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Detected Components</h2>
                </div>
                <Badge className="bg-gray-100 text-gray-700 text-lg px-4 py-1">
                  {componentResults.length} components
                </Badge>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {componentResults.map((component, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(component.componentType)}</span>
                        <span className="font-semibold text-gray-900 capitalize">
                          {component.componentType.replace(/-/g, ' ')}
                        </span>
                        <Badge className="bg-gray-100 text-gray-600 text-xs">
                          {component.element.tagName}
                        </Badge>
                      </div>
                      <Badge className={getConfidenceColor(component.confidence)}>
                        {component.confidence}%
                      </Badge>
                    </div>

                    {component.element.textContent && component.element.textContent.length < 100 && (
                      <p className="text-sm text-gray-600 mt-2 truncate">
                        {component.element.textContent}
                      </p>
                    )}

                    {component.element.classes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {component.element.classes.slice(0, 5).map((cls, i) => (
                          <span key={i} className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                            .{cls}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
