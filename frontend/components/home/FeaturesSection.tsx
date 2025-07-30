'use client';

import { Award, Shield, Heart } from 'lucide-react';
import { HOME_CONSTANTS } from '@/lib/constants';
import { StaggeredSection, SlideUpSection } from '@/components/ui/ScrollAnimation';

const iconMap = {
  Award,
  Shield,
  Heart,
};

export function FeaturesSection() {
  return (
    <section className="w-full bg-white py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <SlideUpSection>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-red-700">
            {HOME_CONSTANTS.features.title}
          </h2>
        </SlideUpSection>
        
        <StaggeredSection className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {HOME_CONSTANTS.features.items.map((feature, index) => {
            const IconComponent = iconMap[feature.icon as keyof typeof iconMap];
            return (
              <div key={index} className="text-center p-4 sm:p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
                <IconComponent className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-red-600" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-red-700">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </StaggeredSection>
      </div>
    </section>
  );
} 