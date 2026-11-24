import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  compact?: boolean;
}

/** The orange primary CTA. Also used for the last step of flows ("▶ Save & rate", "★ Save rating"). */
export function LogWatchButton({ icon = '+', compact, children = 'Log a watch', className, ...rest }: Props) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        'press inline-flex items-center justify-center gap-2 rounded-md border-2 border-pixel-border bg-orange px-4 text-pixel-text shadow-cta hover:brightness-105 disabled:opacity-60',
        compact ? 'h-10' : 'h-10 lg:h-[46px]',
        className,
      )}
    >
      <span aria-hidden className="font-caps text-[22px] leading-none">
        {icon}
      </span>
      <span className="font-pixel text-[15px] lg:text-[18px]">{children}</span>
    </button>
  );
}
