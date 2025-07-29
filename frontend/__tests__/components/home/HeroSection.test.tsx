import React from 'react';
import { render } from '@testing-library/react';
import { HeroSection } from '@/components/home/HeroSection';

describe('HeroSection', () => {
  it('renders hero section with main content', () => {
    const { getByText } = render(<HeroSection />);
    
    // Check for main title
    expect(getByText(/TỔ YẾN SÀO/i)).toBeInTheDocument();
    expect(getByText(/NGUYÊN CHẤT/i)).toBeInTheDocument();
    
    // Check for subtitle
    expect(getByText(/Cho sức khỏe gia đình bạn/i)).toBeInTheDocument();
    
    // Check for CTA button
    expect(getByText(/ĐẶT MUA NGAY/i)).toBeInTheDocument();
    
    // Check for shipping info
    expect(getByText(/Giao hàng/i)).toBeInTheDocument();
    expect(getByText(/MIỄN PHÍ/i)).toBeInTheDocument();
  });

  it('has proper link to products page', () => {
    const { getByText } = render(<HeroSection />);
    
    const ctaButton = getByText(/ĐẶT MUA NGAY/i);
    expect(ctaButton.closest('a')).toHaveAttribute('href', '/products');
  });

  it('renders product images with proper alt text', () => {
    const { getByAltText, getAllByAltText } = render(<HeroSection />);
    
    // Check for main product image
    const productImage = getByAltText(/Yến Sào Kim Sang/i);
    expect(productImage).toBeInTheDocument();
    
    // Check for decor images
    const decorImages = getAllByAltText(/Decor/i);
    expect(decorImages.length).toBeGreaterThan(0);
  });

  it('has responsive design classes', () => {
    const { getByText } = render(<HeroSection />);
    
    const heroSection = getByText(/TỔ YẾN SÀO/i).closest('section');
    expect(heroSection).toHaveClass('relative', 'w-full', 'overflow-hidden');
  });
}); 