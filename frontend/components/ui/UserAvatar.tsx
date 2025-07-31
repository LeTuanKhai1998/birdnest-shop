"use client";

import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
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
}

export function UserAvatar({
  user,
  size = 32,
  className,
  showName = false,
  showEmail = false,
  fallbackImage = "/images/user.jpeg",
}: UserAvatarProps) {
  const avatarSrc = user?.avatar || user?.image || fallbackImage;
  const displayName = user?.name || user?.email || "User";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar
        src={avatarSrc}
        name={displayName}
        size={size}
        className={cn("flex-shrink-0", className)}
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
export function CompactUserAvatar({
  user,
  size = 24,
  className,
  fallbackImage = "/images/user.jpeg",
}: Omit<UserAvatarProps, "showName" | "showEmail">) {
  return (
    <UserAvatar
      user={user}
      size={size}
      className={className}
      fallbackImage={fallbackImage}
    />
  );
}

// Full version with name and email
export function FullUserAvatar({
  user,
  size = 40,
  className,
  fallbackImage = "/images/user.jpeg",
}: Omit<UserAvatarProps, "showName" | "showEmail">) {
  return (
    <UserAvatar
      user={user}
      size={size}
      className={className}
      showName={true}
      showEmail={true}
      fallbackImage={fallbackImage}
    />
  );
} 