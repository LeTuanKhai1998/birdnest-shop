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
      style={{ 
        // Only set fixed dimensions if no responsive classes are present
        ...(className?.includes('w-') || className?.includes('h-') ? {} : {
          width: size, 
          height: size,
          minWidth: size,
          minHeight: size,
          maxWidth: size,
          maxHeight: size
        })
      }}
      {...props}
    >
      {src && !imageError ? (
        // Check if this is the default avatar (MP4)
        src === '/images/default_avatar.mp4' ? (
          // Default avatar as MP4 video - wrapped in flex container for perfect centering
          <div className="flex items-center justify-center w-full h-full">
            <video
              src={src}
              className="object-contain w-full h-full rounded-full opacity-100"
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
          </div>
        ) : (
          // Custom avatar as image - wrapped in flex container for perfect centering
          <div className="flex items-center justify-center w-full h-full">
            <img
              src={src}
              alt={alt || name || 'User'}
              className="object-contain w-full h-full rounded-full opacity-100"
              width={size}
              height={size}
              onError={() => {
                setImageError(true);
              }}
            />
          </div>
        )
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <UserIcon className="text-gray-400" style={{ width: `${Math.max(size * 0.5, 16)}px`, height: `${Math.max(size * 0.5, 16)}px` }} />
        </div>
      )}
    </div>
  );
}
