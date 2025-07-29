import * as React from 'react';
import { User as UserIcon } from 'lucide-react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: number;
}

export function Avatar({
  src,
  alt,
  name,
  size = 32,
  className = '',
  ...props
}: AvatarProps) {
  // Get initials from name
  const getInitials = (name?: string) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-gray-200 overflow-hidden border border-gray-300 ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt || name || 'User'}
          className="object-cover w-full h-full"
          width={size}
          height={size}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '';
          }}
        />
      ) : name ? (
        <span className="text-gray-700 font-semibold text-base select-none">
          {getInitials(name)}
        </span>
      ) : (
        <UserIcon className="w-2/3 h-2/3 text-gray-400" />
      )}
    </div>
  );
}
