import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProjectStore } from '../stores/projectStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIAssistantPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects } = useProjectStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI assistant. I can help you analyze your website, suggest optimizations, and answer questions about performance best practices. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);

  const project = projects.find(p => p.id === projectId);

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(input, project),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setLoading(false);
    }, 1000);
  };

  const suggestedQuestions = [
    'How can I improve my performance score?',
    'What are the most critical issues to fix?',
    'Explain Core Web Vitals for my site',
    'What WordPress builder should I use?',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-gray-600 mt-1">{project.source}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg">
            <Sparkles size={16} />
            <span className="text-sm font-medium">Powered by Claude</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 240px)' }}>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles size={16} className="text-purple-600" />
                </div>
                <div className="flex-1 bg-gray-100 rounded-lg p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <Card className="bg-blue-50 border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3">Try asking:</h3>
                <div className="grid grid-cols-1 gap-2">
                  {suggestedQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(question)}
                      className="text-left px-4 py-2 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-sm text-blue-900"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything about your website..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                size="lg"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-blue-600 text-white rounded-lg p-4">
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
        <Sparkles size={16} className="text-purple-600" />
      </div>
      <div className="flex-1">
        <div className="bg-gray-100 rounded-lg p-4">
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Copy size={12} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors">
            <ThumbsUp size={12} />
          </button>
          <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors">
            <ThumbsDown size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function getAIResponse(input: string, project: any): string {
  const lower = input.toLowerCase();

  if (lower.includes('performance') || lower.includes('score')) {
    return `Based on your current performance score of ${project.optimizedScore || project.originalScore || 0}, here are my recommendations:

1. **Critical CSS**: Extract and inline critical CSS to improve First Contentful Paint
2. **Image Optimization**: Enable lazy loading for images below the fold
3. **JavaScript**: Defer non-critical JavaScript to improve Time to Interactive

Your Core Web Vitals are ${project.optimizedScore >= 90 ? 'excellent' : 'need improvement'}. Focus on reducing render-blocking resources first.`;
  }

  if (lower.includes('critical') || lower.includes('issue')) {
    return `I've analyzed your project and found these critical issues:

1. **Render-blocking resources** (3 files): These CSS/JS files are blocking your initial paint
2. **Unoptimized images**: Several images lack width/height attributes
3. **Missing resource hints**: Add DNS prefetch for external domains

Run the optimization tool to automatically fix most of these issues.`;
  }

  if (lower.includes('core web vitals') || lower.includes('cwv')) {
    return `Let me explain your Core Web Vitals:

**LCP (Largest Contentful Paint)**: ${project.metrics?.lcp || '2.1'}s
- Measures loading performance
- Should be under 2.5s ✓

**FID (First Input Delay)**: ${project.metrics?.fid || '50'}ms
- Measures interactivity
- Should be under 100ms ✓

**CLS (Cumulative Layout Shift)**: ${project.metrics?.cls || '0.05'}
- Measures visual stability
- Should be under 0.1 ✓

Your site is performing well! Small improvements can make it even better.`;
  }

  if (lower.includes('wordpress') || lower.includes('builder')) {
    return `For your project, I recommend:

**Elementor** - Best choice if you want:
- Visual drag-and-drop editing
- Wide plugin ecosystem
- Easy customization

**Gutenberg** - Best choice if you want:
- Native WordPress experience
- Block-based editing
- Better performance

Both formats are fully supported and will preserve your layout perfectly!`;
  }

  return `I can help you with:

- Performance analysis and recommendations
- Explaining optimization techniques
- Choosing the right export format
- Understanding Core Web Vitals
- WordPress builder selection

Feel free to ask me anything specific about your project!`;
}
