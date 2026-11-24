import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '@/queries/auth';
import { Segmented } from '../ui/Segmented';
import { ArrowButton } from '../ui/ArrowLink';

// Install and reminders are device settings (PWA, S12): kept in this browser.
function useLocalToggle(key: string): [boolean, (v: boolean) => void] {
  const [v, setV] = useState(() => {
    try {
      return localStorage.getItem(key) === 'on';
    } catch {
      return false;
    }
  });
  return [
    v,
    (next) => {
      setV(next);
      try {
        localStorage.setItem(key, next ? 'on' : 'off');
      } catch {
        /* ignore */
      }
    },
  ];
}

export function AppOptions() {
  const [install, setInstall] = useLocalToggle('dywwam-install');
  const [remind, setRemind] = useLocalToggle('dywwam-reminders');
  const logout = useLogout();
  const navigate = useNavigate();
  const toggle = (label: string, value: boolean, set: (v: boolean) => void) => (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[14px]">{label}</span>
      <Segmented
        label={label}
        value={value ? 'on' : 'off'}
        onChange={(x) => set(x === 'on')}
        options={[
          { value: 'on', label: 'On' },
          { value: 'off', label: 'Off' },
        ]}
      />
    </div>
  );
  return (
    <div className="flex flex-col gap-3">
      {toggle('Install on this phone', install, setInstall)}
      {toggle('Movie-night reminders', remind, setRemind)}
      <ArrowButton
        className="self-start"
        disabled={logout.isPending}
        onClick={() => logout.mutate(undefined, { onSettled: () => navigate('/login', { replace: true }) })}
      >
        Sign out
      </ArrowButton>
    </div>
  );
}
