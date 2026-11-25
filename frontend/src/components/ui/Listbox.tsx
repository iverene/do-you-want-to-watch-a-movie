import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';
import type { DropdownOption } from './Dropdown';

interface Props {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (v: string) => void;
  className?: string;
}

/**
 * A custom-drawn dropdown (ARIA listbox pattern): pixel panel, bevel ▼ cap, check on the chosen
 * option. Keyboard: ↓/↑/Enter/Space open, arrows move, Home/End, type a letter to jump,
 * Enter/Space pick, Esc or Tab close.
 */
export function Listbox({ label, value, options, onChange, className }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => {
    if (open) list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView?.({ block: 'nearest' });
  }, [open, active]);

  const show = () => {
    setActive(selectedIndex);
    setOpen(true);
  };
  const pick = (i: number) => {
    onChange(options[i].value);
    setOpen(false);
    button.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        show();
      }
      return;
    }
    const last = options.length - 1;
    const keys: Record<string, () => void> = {
      ArrowDown: () => setActive((a) => Math.min(last, a + 1)),
      ArrowUp: () => setActive((a) => Math.max(0, a - 1)),
      Home: () => setActive(0),
      End: () => setActive(last),
      Enter: () => pick(active),
      ' ': () => pick(active),
      Escape: () => {
        setOpen(false);
        button.current?.focus();
      },
    };
    if (keys[e.key]) {
      e.preventDefault();
      e.stopPropagation();
      keys[e.key]();
    } else if (e.key === 'Tab') {
      setOpen(false);
    } else if (e.key.length === 1) {
      const ch = e.key.toLowerCase();
      const from = options.findIndex((o, i) => i > active && o.label.toLowerCase().startsWith(ch));
      const next = from >= 0 ? from : options.findIndex((o) => o.label.toLowerCase().startsWith(ch));
      if (next >= 0) setActive(next);
    }
  };

  return (
    <div ref={root} className={cn('relative inline-flex flex-col', className)}>
      <span id={`${id}-label`} className="sr-only">
        {label}
      </span>
      <button
        ref={button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        aria-controls={`${id}-list`}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        className="flex h-11 min-w-[160px] items-stretch border border-control bg-paper text-left text-[13px] text-ink lg:h-8"
      >
        <span id={`${id}-value`} className="flex flex-1 items-center truncate pl-2.5 pr-2">
          {options[selectedIndex]?.label}
        </span>
        <span
          aria-hidden
          className={cn(
            'bevel flex w-[26px] items-center justify-center border-y-0 border-r-0 text-[9px] transition-transform',
            open && '[&>span]:rotate-180',
          )}
        >
          <span className="inline-block transition-transform">▼</span>
        </span>
      </button>
      {open && (
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          aria-labelledby={`${id}-label`}
          tabIndex={-1}
          className="pop-in absolute left-0 top-full z-30 mt-1 max-h-[260px] min-w-full overflow-y-auto rounded-[6px] border-2 border-pixel-border bg-paper p-1 shadow-[4px_4px_0_rgba(0,0,0,0.18)]"
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-opt-${i}`}
              data-index={i}
              role="option"
              aria-selected={o.value === value}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(i)}
              className={cn(
                'flex min-h-9 cursor-pointer items-center gap-2 whitespace-nowrap rounded-[4px] px-2 text-[13px]',
                i === active && 'bg-sky',
                o.value === value && 'font-bold text-link',
              )}
            >
              <span aria-hidden className="w-3 text-orange">
                {o.value === value ? '▶' : ''}
              </span>
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
