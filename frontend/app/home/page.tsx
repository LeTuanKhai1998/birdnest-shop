'use client';

import { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { PromotionalBanner } from '@/components/home/PromotionalBanner';
import { FeatureIcons } from '@/components/home/FeatureIcons';
import { CompanySummary } from '@/components/home/CompanySummary';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { ProductHighlight } from '@/components/home/ProductHighlight';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CustomerServiceSection } from '@/components/home/CustomerServiceSection';
import { NewsletterSignup } from '@/components/home/NewsletterSignup';
import { SEO_CONSTANTS } from '@/lib/constants';

// SEO Metadata
export const metadata: Metadata = {
  title: SEO_CONSTANTS.home.title,
  description: SEO_CONSTANTS.home.description,
  keywords: SEO_CONSTANTS.home.keywords,
  openGraph: {
    title: SEO_CONSTANTS.home.title,
    description: SEO_CONSTANTS.home.description,
    type: 'website',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_CONSTANTS.home.title,
    description: SEO_CONSTANTS.home.description,
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Promotional Banner */}
      <PromotionalBanner />
      
      {/* Feature Icons */}
      <FeatureIcons />
      
      {/* Company Summary */}
      <CompanySummary />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Product Highlight */}
      <ProductHighlight />
      
      {/* Testimonials */}
      <TestimonialsSection />
      
      {/* Customer Service */}
      <CustomerServiceSection />
      
      {/* Newsletter Signup */}
      <NewsletterSignup />
    </main>
  );
}
