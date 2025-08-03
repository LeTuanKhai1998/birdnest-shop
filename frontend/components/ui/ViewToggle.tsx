'use client';

import React from 'react';
import { Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  value: ViewMode;
  onValueChange: (value: ViewMode) => void;
  className?: string;
  disabled?: boolean;
}

const viewOptions: Array<{ value: ViewMode; label: string; icon: React.ComponentType<any> }> = [
  { value: 'grid', label: 'Lưới', icon: Grid },
  { value: 'list', label: 'Danh sách', icon: List },
];

export function ViewToggle({ 
  value, 
  onValueChange, 
  className,
  disabled = false 
}: ViewToggleProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {viewOptions.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.value;
        
        return (
          <Button
            key={option.value}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => !disabled && onValueChange(option.value)}
            disabled={disabled}
            className={cn(
              'h-8 w-8 p-0',
              isActive 
                ? 'bg-[#a10000] text-white hover:bg-red-800' 
                : 'border-gray-200 hover:border-[#a10000] hover:bg-red-50',
              'transition-all duration-200',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-label={`Chuyển sang chế độ xem ${option.label}`}
            title={option.label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
    </div>
  );
} 