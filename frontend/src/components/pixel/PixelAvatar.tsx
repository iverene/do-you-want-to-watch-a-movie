import type { Avatar } from '@/services';
import { PixelGrid } from './PixelGrid';
import { avatarPalette, avatarRows } from './avatarArt';

export function PixelAvatar({
  avatar,
  scale = 4,
  label,
  className,
}: {
  avatar: Avatar;
  scale?: number;
  label?: string;
  className?: string;
}) {
  return (
    <PixelGrid
      rows={avatarRows(avatar)}
      palette={avatarPalette(avatar)}
      scale={scale}
      label={label}
      className={className}
    />
  );
}
