import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'secondary' | 'outline';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'secondary', ...props }, ref) => {
    const base =
      'inline-block px-3 py-1 rounded-full border text-xs font-semibold align-middle select-none';
    const color =
      variant === 'success'
        ? 'bg-green-100 text-green-800 border-green-200'
        : variant === 'outline'
        ? 'bg-transparent border-gray-300 text-gray-700'
        : 'bg-gray-100 text-gray-800 border-gray-200';
    return (
      <span ref={ref} className={`${base} ${color} ${className}`} {...props} />
    );
  },
);
Badge.displayName = 'Badge';
