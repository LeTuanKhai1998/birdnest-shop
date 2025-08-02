'use client';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { SmartImage } from '@/components/ui/SmartImage';
import { Button } from '@/components/ui/button';

interface ImageZoomPopupProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  productName: string;
}

export default function ImageZoomPopup({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
  productName,
}: ImageZoomPopupProps) {
  // Handle ESC key to close popup
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle arrow keys for navigation
  useEffect(() => {
    const handleArrowKeys = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowLeft') {
        onIndexChange(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
      } else if (e.key === 'ArrowRight') {
        onIndexChange(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
      }
    };

    document.addEventListener('keydown', handleArrowKeys);
    return () => document.removeEventListener('keydown', handleArrowKeys);
  }, [isOpen, currentIndex, images.length, onIndexChange]);

  // Check if popup is in DOM
  useEffect(() => {
    if (isOpen) {
      const checkPopup = () => {
        const overlay = document.getElementById('zoom-popup-overlay');
        const content = document.getElementById('zoom-popup-content');
      };
      
      // Check immediately and after a short delay
      checkPopup();
      setTimeout(checkPopup, 100);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const currentImage = images[currentIndex];

  // Create portal to render at document body level
  const popupContent = (
    <div 
      id="zoom-popup-overlay"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Zoom popup container */}
      <div 
        id="zoom-popup-content"
        style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '896px',
          height: '60vh',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}
          aria-label="Close zoom"
        >
          ✕
        </button>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => onIndexChange(currentIndex > 0 ? currentIndex - 1 : images.length - 1)}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              onClick={() => onIndexChange(currentIndex < images.length - 1 ? currentIndex + 1 : 0)}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}

        {/* Image counter */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 10,
          background: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '14px'
        }}>
          {currentIndex + 1} / {images.length}
        </div>

        {/* Main image */}
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 16px', // Reduced padding to make image bigger
          backgroundColor: '#f8f9fa',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '100%',
            height: 'calc(100% - 80px)', // Reduced padding to make image bigger
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img
                src={currentImage}
                alt={`${productName} - Zoomed view`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>
          </div>
        </div>

        {/* Thumbnail navigation */}
        {images.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            background: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            gap: '8px'
          }}>
            {images.map((img, idx) => (
              <button
                key={img}
                onClick={() => onIndexChange(idx)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  border: idx === currentIndex ? '2px solid white' : '2px solid transparent',
                  cursor: 'pointer',
                  opacity: idx === currentIndex ? 1 : 0.6,
                  transition: 'all 0.2s'
                }}
                aria-label={`Go to image ${idx + 1}`}
              >
                <SmartImage
                  src={img}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Use portal to render at document body level
  if (typeof window === 'undefined') {
    return null;
  }
  
  return createPortal(popupContent, document.body);
} 