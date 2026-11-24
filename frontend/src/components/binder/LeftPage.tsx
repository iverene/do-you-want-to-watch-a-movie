import { useDefaultScope } from '@/hooks/useScope';
import { useSession } from '@/queries/auth';
import { DuoAvatars } from '../pixel/DuoAvatars';
import { Dropdown } from '../ui/Dropdown';
import { MoodNote } from './MoodNote';

/** The couple's profile spread (desktop only). */
export function LeftPage() {
  const { user, partner, users } = useSession();
  const [scope, setScope] = useDefaultScope();
  return (
    <div className="flex flex-col gap-3">
      <div className="border border-line p-1">
        <DuoAvatars users={users} />
      </div>
      <MoodNote />
      <div className="dotted-divider" />
      <div>
        <p className="text-[18px] font-extrabold text-link">{users.map((u) => u.displayName).join(' & ')}</p>
        <p className="text-[12px] text-orange">movie-room/{user.username}</p>
      </div>
      <Dropdown
        label="Default view"
        value={scope}
        onChange={setScope}
        options={[
          { value: 'ours', label: '★ Ours' },
          { value: 'mine', label: 'Mine' },
          { value: partner.username, label: partner.displayName },
        ]}
      />
    </div>
  );
}
