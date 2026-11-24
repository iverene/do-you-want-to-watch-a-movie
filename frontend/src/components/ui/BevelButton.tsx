import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  dense?: boolean;
}

export function BevelButton({ dense, className, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      {...rest}
      className={cn(
        'bevel inline-flex items-center justify-center gap-1.5 rounded px-3 text-[13px] font-bold hover:brightness-[1.03] active:translate-y-px disabled:opacity-60 lg:text-[14px]',
        dense ? 'min-h-11 lg:min-h-9' : 'min-h-11',
        className,
      )}
    />
  );
}
