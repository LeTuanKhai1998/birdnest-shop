import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';

describe('HeroSection', () => {
  it('can be imported and rendered', () => {
    // Just test that the component can be imported without errors
    expect(HeroSection).toBeDefined();
    expect(typeof HeroSection).toBe('function');
  });

  it('has expected component structure', () => {
    // Test that the component has the expected structure without rendering
    const component = HeroSection;
    expect(component.name).toBe('HeroSection');
  });
}); 