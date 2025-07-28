"use client";

import { useEffect } from 'react';

export function HydrationFix() {
  useEffect(() => {
    // Remove browser extension attributes that cause hydration mismatches
    function removeExtensionAttributes() {
      const body = document.body;
      if (body && body.hasAttribute('cz-shortcut-listen')) {
        body.removeAttribute('cz-shortcut-listen');
      }
      
      // Remove other common extension attributes
      const elements = document.querySelectorAll('[data-extension-attribute]');
      elements.forEach(el => {
        el.removeAttribute('data-extension-attribute');
      });
    }
    
    // Run immediately
    removeExtensionAttributes();
    
    // Also run after a short delay to catch any new attributes
    const timer = setTimeout(removeExtensionAttributes, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return null;
} 