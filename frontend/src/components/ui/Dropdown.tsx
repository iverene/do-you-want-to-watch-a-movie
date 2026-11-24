import { useId } from 'react';
import { cn } from '@/lib/cn';

export interface DropdownOption {
  value: string;
  label: string;
}

interface Props {
  label: string;
  hideLabel?: boolean;
  value: string;
  options: DropdownOption[];
  onChange: (v: string) => void;
  size?: 'sm' | 'lg';
  className?: string;
}

/** A native <select> under a retro skin: bevel cap with ▼ on the right. */
export function Dropdown({
  label,
  hideLabel = true,
  value,
  options,
  onChange,
  size = 'sm',
  className,
}: Props) {
  const id = useId();
  return (
    <div className={cn('inline-flex flex-col gap-1', className)}>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'text-[13px] font-extrabold'}>
        {label}
      </label>
      <div
        className={cn(
          'relative flex items-stretch border border-control bg-paper',
          size === 'sm' ? 'h-11 lg:h-8' : 'h-11',
        )}
      >
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-full w-full cursor-pointer appearance-none bg-transparent pl-2 pr-9 text-[13px] text-ink"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="bevel pointer-events-none absolute inset-y-0 right-0 flex w-[26px] items-center justify-center border-y-0 border-r-0 text-[9px]"
        >
          ▼
        </span>
      </div>
    </div>
  );
}
