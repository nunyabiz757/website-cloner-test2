import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureHeroProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: string;
}

export function FeatureHero({ icon: Icon, title, description, gradient = 'from-blue-600 to-blue-400' }: FeatureHeroProps) {
  return (
    <div className={`bg-gradient-to-r ${gradient} text-white py-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Icon size={40} />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">{title}</h1>
        <p className="text-xl text-center text-blue-50 max-w-3xl mx-auto leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
