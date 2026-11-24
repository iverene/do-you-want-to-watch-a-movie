import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/lib/cn';

const base = 'inline-flex min-h-6 items-center gap-1 text-[13px] text-ink hover:underline';
const Arrow = () => (
  <span aria-hidden className="text-[10px] text-orange">
    ▶
  </span>
);

export function ArrowLink({ className, children, ...rest }: LinkProps & { children: ReactNode }) {
  return (
    <Link {...rest} className={cn(base, className)}>
      <Arrow />
      {children}
    </Link>
  );
}

export function ArrowButton({
  className,
  children,
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} {...rest} className={cn(base, 'disabled:opacity-60', className)}>
      <Arrow />
      {children}
    </button>
  );
}
