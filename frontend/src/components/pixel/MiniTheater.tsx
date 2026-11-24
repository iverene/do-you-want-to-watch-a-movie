import type { User } from '@/services';
import { PixelAvatar } from './PixelAvatar';

/** Decorative pixel scene: a screen with ▶, a bench and both avatars. */
export function MiniTheater({ users }: { users: User[] }) {
  return (
    <div aria-hidden className="relative h-[120px] overflow-hidden border border-line bg-[#2F3E66]">
      <div className="absolute inset-x-6 top-3 flex h-[52px] items-center justify-center border-2 border-[#9AA0AA] bg-[#DCE7FB] font-caps text-[18px] text-[#2C68B0]">
        ▶
      </div>
      <div
        className="absolute inset-x-0 bottom-0 h-7"
        style={{
          backgroundImage: 'repeating-conic-gradient(#3A2A20 0 25%, #5A4432 0 50%)',
          backgroundSize: '12px 12px',
        }}
      />
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
        {users.map((u) => (
          <PixelAvatar key={u.id} avatar={u.avatar} scale={3} />
        ))}
      </div>
    </div>
  );
}
