import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      title: 'Instant Cloning',
      description: 'Clone any website in seconds with all HTML, CSS, JavaScript, and assets',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'WordPress Export',
      description: 'Export to 11 page builders including Elementor, Divi, and Gutenberg',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
    },
    {
      title: 'Component Detection',
      description: 'Automatic identification of components with 80+ patterns',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Clone Any Website Instantly
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Professional website cloning with WordPress export support
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => navigate(user ? '/clone' : '/login')}>
              Start Cloning
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate(user ? '/dashboard' : '/login')}
            >
              View Dashboard
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Trusted by Developers Worldwide
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Websites Cloned</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">11</div>
              <div className="text-gray-600">Page Builders</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">Security Compliant</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
