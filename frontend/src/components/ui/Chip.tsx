import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

/** Toggle chip (aria-pressed). For a static chip, use <ChipLabel>. */
export function Chip({ selected, className, ...rest }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      {...rest}
      className={cn(
        'inline-flex min-h-8 items-center rounded-full border px-3 py-[5px] text-[13px] font-bold max-lg:min-h-11',
        selected ? 'border-tab bg-tab text-ontab' : 'border-line bg-paper text-ink hover:border-tab',
        className,
      )}
    />
  );
}

export function ChipLabel({
  children,
  tone = 'plain',
}: {
  children: React.ReactNode;
  tone?: 'plain' | 'orange';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-[3px] text-[12px] font-bold',
        tone === 'orange' ? 'border-orange text-orange' : 'border-line bg-paper text-ink',
      )}
    >
      {children}
    </span>
  );
}
