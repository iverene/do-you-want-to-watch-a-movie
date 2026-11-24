import { useScope } from '@/hooks/useScope';
import { useSession } from '@/queries/auth';
import { Segmented } from '../ui/Segmented';

/** Ours / Mine / [partner] — kept in the URL as ?scope=. */
export function ScopeSwitch() {
  const [scope, setScope] = useScope();
  const { partner } = useSession();
  return (
    <Segmented
      label="Whose watches"
      value={scope}
      onChange={setScope}
      options={[
        { value: 'ours', label: 'Ours' },
        { value: 'mine', label: 'Mine' },
        { value: partner.username, label: partner.displayName },
      ]}
    />
  );
}
