'use client';

import { Users, Award, Shield, Heart } from 'lucide-react';
import { HOME_CONSTANTS } from '@/lib/constants';
import { SlideUpSection, StaggeredSection } from '@/components/ui/ScrollAnimation';

const iconMap = {
  Users,
  Award,
  Shield,
  Heart,
};

export function CustomerServiceSection() {
  return (
    <section className="w-full bg-white py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <SlideUpSection>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-red-700">
            {HOME_CONSTANTS.customerService.title}
          </h2>
        </SlideUpSection>
        
        <StaggeredSection className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {HOME_CONSTANTS.customerService.items.map((service, index) => {
            const IconComponent = iconMap[service.icon as keyof typeof iconMap];
            return (
              <div key={index} className="text-center p-4 sm:p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
                <IconComponent className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-red-600" />
                <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 text-red-700">
                  {service.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {service.description}
                </p>
              </div>
            );
          })}
        </StaggeredSection>
      </div>
    </section>
  );
} 