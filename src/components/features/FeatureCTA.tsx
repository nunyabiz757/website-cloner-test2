import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ArrowRight } from 'lucide-react';

interface FeatureCTAProps {
  title: string;
  description: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
}

export function FeatureCTA({
  title,
  description,
  primaryButtonText = 'Get Started Free',
  secondaryButtonText = 'View All Features'
}: FeatureCTAProps) {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
        <p className="text-xl text-blue-50 mb-8">{description}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate('/signup')}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            {primaryButtonText}
            <ArrowRight className="ml-2" size={20} />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/features')}
            className="border-white text-white hover:bg-white hover:text-blue-600"
          >
            {secondaryButtonText}
          </Button>
        </div>
      </div>
    </section>
  );
}
