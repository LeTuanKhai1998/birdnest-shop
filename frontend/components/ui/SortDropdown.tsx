'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SortOption, getSortConfig, getSortOptions } from '@/lib/sorting-utils';

interface SortDropdownProps {
  value: SortOption;
  onValueChange: (value: SortOption) => void;
  className?: string;
  disabled?: boolean;
}

export function SortDropdown({ 
  value, 
  onValueChange, 
  className,
  disabled = false 
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentConfig = getSortConfig(value);
  const sortOptions = getSortOptions();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          buttonRef.current?.focus();
          break;
        case 'ArrowDown':
          event.preventDefault();
          const nextOption = getNextOption(value);
          if (nextOption) {
            onValueChange(nextOption);
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          const prevOption = getPreviousOption(value);
          if (prevOption) {
            onValueChange(prevOption);
          }
          break;
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, value, onValueChange]);

  const getNextOption = (currentValue: SortOption): SortOption | null => {
    const currentIndex = sortOptions.findIndex(option => option.value === currentValue);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    return sortOptions[nextIndex]?.value || null;
  };

  const getPreviousOption = (currentValue: SortOption): SortOption | null => {
    const currentIndex = sortOptions.findIndex(option => option.value === currentValue);
    const prevIndex = currentIndex === 0 ? sortOptions.length - 1 : currentIndex - 1;
    return sortOptions[prevIndex]?.value || null;
  };

  const handleOptionClick = (option: SortOption) => {
    onValueChange(option);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleButtonClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleButtonKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleButtonClick();
    }
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef} style={{ zIndex: 9998 }}>
      <Button
        ref={buttonRef}
        variant="outline"
        onClick={handleButtonClick}
        onKeyDown={handleButtonKeyDown}
        disabled={disabled}
        className={cn(
          'w-full justify-between text-left font-normal',
          'border-gray-200 hover:border-[#a10000] hover:bg-red-50',
          'focus:border-[#a10000] focus:ring-[#a10000] focus:ring-2',
          'transition-all duration-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Sắp xếp sản phẩm"
      >
        <span className="flex items-center gap-2">
          <span className="text-sm">{currentConfig.label}</span>
        </span>
        <ChevronDown 
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} 
        />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto" style={{ zIndex: 9999 }}>
          <div role="listbox" aria-label="Tùy chọn sắp xếp">
            {sortOptions.map((option) => (
              <div
                key={option.value}
                role="option"
                aria-selected={value === option.value}
                className={cn(
                  'flex items-center justify-between px-3 py-2 cursor-pointer',
                  'hover:bg-red-50 transition-colors duration-150',
                  value === option.value && 'bg-red-50 text-[#a10000]'
                )}
                onClick={() => handleOptionClick(option.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOptionClick(option.value);
                  }
                }}
                tabIndex={0}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm">{option.label}</span>
                </span>
                {value === option.value && (
                  <Check className="h-4 w-4 text-[#a10000]" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 