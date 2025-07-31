"use client";

import React, { useState, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UnifiedAvatarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    avatar?: string | null;
    image?: string | null;
  } | null;
  size?: number;
  className?: string;
  showName?: boolean;
  showEmail?: boolean;
  fallbackImage?: string;
  onClick?: () => void;
  title?: string;
}

export function UnifiedAvatar({
  user,
  size = 32,
  className,
  showName = false,
  showEmail = false,
  fallbackImage = "/images/default_avatar.mp4",
  onClick,
  title,
}: UnifiedAvatarProps) {
  // Get avatar URL directly from user data (no local state to avoid race conditions)
  const getAvatarUrl = React.useCallback((user: any) => {
    if (user?.avatar && user.avatar.trim() !== '') {
      return user.avatar;
    }
    return fallbackImage;
  }, [fallbackImage]);

  // Check if using default avatar
  const isUsingDefaultAvatar = React.useCallback((user: any) => {
    return !user?.avatar || user.avatar.trim() === '';
  }, []);

  // Get current avatar URL
  const avatarSrc = getAvatarUrl(user);
  const isUsingDefault = isUsingDefaultAvatar(user);



  const displayName = user?.name || user?.email || "User";
  const avatarTitle = title || `${displayName} (Avatar: ${isUsingDefault ? 'Default' : 'Custom'})`;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar
        src={avatarSrc}
        name={displayName}
        size={size}
        className={cn("flex-shrink-0", className)}
        onClick={onClick}
        title={avatarTitle}
      />
      {(showName || showEmail) && (
        <div className="flex flex-col">
          {showName && user?.name && (
            <span className="text-sm font-medium text-gray-900">
              {user.name}
            </span>
          )}
          {showEmail && user?.email && (
            <span className="text-xs text-gray-500">
              {user.email}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for small spaces
export function CompactUnifiedAvatar({
  user,
  size = 24,
  className,
  fallbackImage = "/images/default_avatar.mp4",
  onClick,
  title,
}: Omit<UnifiedAvatarProps, "showName" | "showEmail">) {
  return (
    <UnifiedAvatar
      user={user}
      size={size}
      className={className}
      fallbackImage={fallbackImage}
      onClick={onClick}
      title={title}
    />
  );
}

// Full version with name and email
export function FullUnifiedAvatar({
  user,
  size = 40,
  className,
  fallbackImage = "/images/default_avatar.mp4",
  onClick,
  title,
}: Omit<UnifiedAvatarProps, "showName" | "showEmail">) {
  return (
    <UnifiedAvatar
      user={user}
      size={size}
      className={className}
      showName={true}
      showEmail={true}
      fallbackImage={fallbackImage}
      onClick={onClick}
      title={title}
    />
  );
} 