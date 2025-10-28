import { ReactNode } from 'react';

interface FeatureSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function FeatureSection({ title, children, className = '' }: FeatureSectionProps) {
  return (
    <section className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">{title}</h2>
        <div className="prose prose-lg max-w-none text-gray-700">
          {children}
        </div>
      </div>
    </section>
  );
}
