import { useState } from 'react';
import type { LogWatchRequest } from '@/app/LogWatchContext';
import { PixelWindow } from './PixelWindow';
import { ManualStep } from './logwatch/ManualStep';
import { RateStep } from './logwatch/RateStep';
import { SearchStep } from './logwatch/SearchStep';
import { cn } from '@/lib/cn';

function Steps({ step }: { step: 1 | 2 }) {
  const item = (n: 1 | 2, label: string) => (
    <span
      aria-current={step === n ? 'step' : undefined}
      className={cn(step === n ? 'text-tab' : 'text-muted')}
    >
      {n} {label}
    </span>
  );
  return (
    <p className="mb-4 flex gap-2 font-caps text-[11px] uppercase">
      {item(1, 'FIND IT')}{' '}
      <span aria-hidden className="text-muted">
        ▸
      </span>{' '}
      {item(2, 'RATE IT')}
    </p>
  );
}

/** "Log a watch": 1 find it (search or add manually) ▸ 2 rate it. In watchlist mode there is no rate step. */
export function LogWatchDialog({ request, onClose }: { request: LogWatchRequest; onClose: () => void }) {
  const [manual, setManual] = useState(false);
  const [dirty, setDirty] = useState(false);
  const watchlist = request.mode === 'watchlist';
  const title =
    request.mode === 'rate'
      ? request.justSaved
        ? 'Log a watch'
        : 'Rate it'
      : watchlist
        ? 'Add to watchlist'
        : 'Log a watch';

  return (
    <PixelWindow title={title} onClose={onClose} dirty={dirty}>
      {!watchlist && <Steps step={request.mode === 'rate' ? 2 : 1} />}
      {request.mode === 'rate' ? (
        <RateStep
          key={request.screening.id}
          screening={request.screening}
          justSaved={request.justSaved}
          onDone={onClose}
          onDirty={setDirty}
        />
      ) : manual ? (
        <ManualStep mode={request.mode} onBack={() => setManual(false)} onDirty={setDirty} />
      ) : (
        <SearchStep mode={request.mode} onManual={() => setManual(true)} onDirty={setDirty} />
      )}
    </PixelWindow>
  );
}
