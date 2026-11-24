import type { User } from '@/services';
import { cn } from '@/lib/cn';
import { PixelGrid } from './PixelGrid';
import { PixelAvatar } from './PixelAvatar';

const SPARKLE = ['.W.', 'WWW', '.W.'];

/** Both avatars side by side on sky, with four white pixel sparkles. */
export function DuoAvatars({
  users,
  scale = 5,
  className,
}: {
  users: (User | undefined)[];
  scale?: number;
  className?: string;
}) {
  const names = users.filter(Boolean).map((u) => u!.displayName);
  return (
    <div
      role="img"
      aria-label={names.length ? `${names.join(' and ')}'s avatars` : 'Avatars'}
      className={cn('relative flex items-end justify-center gap-3 bg-sky px-4 pb-2 pt-5', className)}
    >
      {['left-2 top-2', 'right-3 top-3', 'left-[30%] top-1', 'right-[28%] bottom-6'].map((pos) => (
        <PixelGrid
          key={pos}
          rows={SPARKLE}
          palette={{ W: '#FFFFFF' }}
          scale={Math.max(2, scale - 2)}
          className={cn('absolute', pos)}
        />
      ))}
      {users.map((u, i) =>
        u ? (
          <PixelAvatar key={u.id} avatar={u.avatar} scale={scale} />
        ) : (
          <div key={i} style={{ width: 10 * scale, height: 14 * scale }} />
        ),
      )}
    </div>
  );
}
