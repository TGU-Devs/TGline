"use client";

import Avatar from "boring-avatars";

type UserAvatarProps = {
  avatar?: { url: string } | null;
  name?: string;
  size?: number;
  className?: string;
};

export default function UserAvatar({
  avatar,
  name = "User",
  size = 40,
  className = "",
}: UserAvatarProps) {
  if (avatar?.url) {
    return (
      <img
        src={avatar.url}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div className={className} style={{ width: size, height: size }}>
      <Avatar
        size={size}
        name="default-fixed-avatar"
        variant="beam"
        colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
      />
    </div>
  );
}