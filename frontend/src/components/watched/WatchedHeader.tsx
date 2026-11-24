import { useLocation, useNavigate } from 'react-router-dom';
import { BevelButton } from '../ui/BevelButton';
import { SectionHeader } from '../ui/SectionHeader';
import { Segmented } from '../ui/Segmented';

/** "Watched" header with List / Calendar and the Stats button. Keeps ?scope= when switching. */
export function WatchedHeader({ view }: { view: 'list' | 'calendar' }) {
  const navigate = useNavigate();
  const { search } = useLocation();
  const scope = new URLSearchParams(search).get('scope');
  const qs = scope ? `?scope=${encodeURIComponent(scope)}` : '';
  return (
    <SectionHeader
      as="h1"
      title="Watched"
      sub="NEWEST FIRST"
      right={
        <>
          <Segmented
            label="View"
            value={view}
            onChange={(v) => navigate(`${v === 'list' ? '/watched' : '/watched/calendar'}${qs}`)}
            options={[
              { value: 'list', label: 'List' },
              { value: 'calendar', label: 'Calendar' },
            ]}
          />
          <BevelButton dense onClick={() => navigate(`/watched/stats${qs}`)}>
            Stats
          </BevelButton>
        </>
      }
    />
  );
}
