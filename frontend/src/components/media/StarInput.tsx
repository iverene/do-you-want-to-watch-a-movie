import { useRef, useState, type KeyboardEvent } from 'react';
import type { Stars } from '@/services';
import { cn } from '@/lib/cn';

export const STAR_WORDS: Record<Stars, string> = {
  1: '1 star · not for me',
  2: '2 stars · it was ok',
  3: '3 stars · liked it',
  4: '4 stars · really liked it',
  5: '5 stars · loved it',
};

interface Props {
  value: Stars | null;
  onChange: (v: Stars) => void;
  label: string;
}

/** Five pixel buttons in a radiogroup. Arrow keys change the value; the picked star bumps. */
export function StarInput({ value, onChange, label }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [bumped, setBumped] = useState<number | null>(null);

  const pick = (v: Stars) => {
    onChange(v);
    setBumped(v);
    refs.current[v - 1]?.focus();
  };

  const onKey = (e: KeyboardEvent) => {
    const cur = value ?? 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      pick(Math.min(5, cur + 1) as Stars);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      pick(Math.max(1, cur - 1) as Stars);
    } else if (/^[1-5]$/.test(e.key)) {
      pick(Number(e.key) as Stars);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div role="radiogroup" aria-label={label} onKeyDown={onKey} className="flex gap-1.5">
        {([1, 2, 3, 4, 5] as Stars[]).map((s) => {
          const on = value !== null && s <= value;
          return (
            <button
              key={s}
              ref={(el) => {
                refs.current[s - 1] = el;
              }}
              type="button"
              role="radio"
              aria-checked={value === s}
              aria-label={STAR_WORDS[s]}
              tabIndex={value === s || (value === null && s === 1) ? 0 : -1}
              onClick={() => pick(s)}
              className={cn(
                'flex h-10 w-10 items-center justify-center border-2 text-[22px] lg:h-12 lg:w-12',
                on
                  ? 'border-pixel-border bg-yellow text-[#D98C00] shadow-bevel'
                  : 'border-line bg-paper text-line',
                bumped === s && 'bump',
              )}
              onAnimationEnd={() => setBumped(null)}
            >
              ★
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="min-h-[22px] font-hand text-[17px] text-muted lg:text-[19px]">
        {value ? STAR_WORDS[value] : 'pick 1 to 5 stars'}
      </p>
    </div>
  );
}
