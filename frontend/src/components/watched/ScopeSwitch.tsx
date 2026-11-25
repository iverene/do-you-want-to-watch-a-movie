import { useScope } from '@/hooks/useScope';
import { Segmented } from '../ui/Segmented';

/** Ours (together) / Mine, kept in the URL as ?scope=. */
export function ScopeSwitch() {
  const [scope, setScope] = useScope();
  return (
    <Segmented
      label="Whose watches"
      value={scope}
      onChange={setScope}
      options={[
        { value: 'ours', label: 'Ours' },
        { value: 'mine', label: 'Mine' },
      ]}
    />
  );
}
