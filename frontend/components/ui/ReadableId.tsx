import React from 'react';
import { formatReadableId, getEntityTypeColor, getEntityTypeLabel, getIdTooltip } from '@/lib/id-utils';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ReadableIdProps {
  readableId?: string | null;
  fallbackId?: string;
  showType?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'badge' | 'text';
  className?: string;
}

export function ReadableId({
  readableId,
  fallbackId,
  showType = false,
  size = 'md',
  variant = 'default',
  className = '',
}: ReadableIdProps) {
  const formattedId = formatReadableId(readableId, fallbackId);
  const tooltipText = getIdTooltip(readableId, fallbackId);
  
  // Extract entity type for styling
  const entityType = readableId ? readableId.split('-')[0] : 'ID';
  const entityTypeLabel = getEntityTypeLabel(entityType);
  const entityTypeColor = getEntityTypeColor(entityType);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const content = (
    <span className={`font-mono font-medium ${sizeClasses[size]} ${className}`}>
      {formattedId}
    </span>
  );

  if (variant === 'badge') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge 
              variant="secondary" 
              className={`${entityTypeColor} ${sizeClasses[size]} font-mono`}
            >
              {showType ? `${entityTypeLabel}: ` : ''}{formattedId}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'text') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className={`${sizeClasses[size]} text-gray-600 font-mono ${className}`}>
              {formattedId}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Default variant
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={`flex items-center gap-2 ${className}`}>
            {showType && (
              <Badge 
                variant="outline" 
                className={`${entityTypeColor} text-xs font-medium`}
              >
                {entityTypeLabel}
              </Badge>
            )}
            {content}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Specialized components for different entity types
export function ProductId({ readableId, fallbackId, ...props }: Omit<ReadableIdProps, 'showType'>) {
  return <ReadableId readableId={readableId} fallbackId={fallbackId} showType={true} {...props} />;
}

export function OrderId({ readableId, fallbackId, ...props }: Omit<ReadableIdProps, 'showType'>) {
  return <ReadableId readableId={readableId} fallbackId={fallbackId} showType={true} {...props} />;
}

export function UserId({ readableId, fallbackId, ...props }: Omit<ReadableIdProps, 'showType'>) {
  return <ReadableId readableId={readableId} fallbackId={fallbackId} showType={true} {...props} />;
}

export function CategoryId({ readableId, fallbackId, ...props }: Omit<ReadableIdProps, 'showType'>) {
  return <ReadableId readableId={readableId} fallbackId={fallbackId} showType={true} {...props} />;
}

export function ReviewId({ readableId, fallbackId, ...props }: Omit<ReadableIdProps, 'showType'>) {
  return <ReadableId readableId={readableId} fallbackId={fallbackId} showType={true} {...props} />;
} 