import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  tone?: 'orange' | 'yellow';
  active?: boolean;
}

export function PixelIconButton({ tone = 'orange', active, className, children, ...rest }: Props) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        'press inline-flex h-11 w-11 shrink-0 items-center justify-center border-2 border-pixel-border font-caps text-[16px] text-pixel-text shadow-bevel disabled:opacity-60',
        tone === 'orange' ? 'bg-orange' : 'bg-yellow',
        active && 'outline outline-2 outline-offset-1 outline-tab',
        className,
      )}
    >
      {children}
    </button>
  );
}
