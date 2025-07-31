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
  const [imageError, setImageError] = React.useState(false);
  
  // Get initials from name
  const getInitials = (name?: string) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Reset error state when src changes
  React.useEffect(() => {
    setImageError(false);
  }, [src]);

  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-gray-200 overflow-hidden border border-gray-300 ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      {src && !imageError ? (
        // Check if this is the default avatar (MP4)
        src === '/images/default_avatar.mp4' ? (
          // Default avatar as MP4 video
          <video
            src={src}
            className="object-cover w-full h-full rounded-full opacity-100"
            width={size}
            height={size}
            autoPlay
            loop
            muted
            playsInline
            onError={() => {
              setImageError(true);
            }}
            aria-label={alt || name || 'User'}
          />
        ) : (
          // Custom avatar as image
          <img
            src={src}
            alt={alt || name || 'User'}
            className="object-cover w-full h-full rounded-full opacity-100"
            width={size}
            height={size}
            onError={() => {
              setImageError(true);
            }}
          />
        )
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <UserIcon className="text-gray-400" style={{ width: `${Math.max(size * 0.5, 16)}px`, height: `${Math.max(size * 0.5, 16)}px` }} />
        </div>
      )}
    </div>
  );
}
