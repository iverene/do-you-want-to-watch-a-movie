import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';
import type { DropdownOption } from './Dropdown';

interface Props {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Type to filter, then pick (ARIA combobox with a listbox popup). Shows the chosen label when not
 * typing; ✕ clears the choice. ↓/↑ move, Enter picks, Esc closes (or restores the label).
 */
export function Combobox({
  label,
  value,
  options,
  onChange,
  placeholder = 'Type a title…',
  className,
}: Props) {
  const id = useId();
  const chosen = options.find((o) => o.value === value);
  const [text, setText] = useState(chosen?.label ?? '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) setText(chosen?.label ?? '');
  }, [chosen?.label, open]);

  const query = text.trim().toLowerCase();
  const filtered =
    open && query && query !== chosen?.label.toLowerCase()
      ? options.filter((o) => o.label.toLowerCase().includes(query))
      : options;

  useEffect(() => {
    if (open) list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView?.({ block: 'nearest' });
  }, [open, active]);

  const pick = (o: DropdownOption) => {
    onChange(o.value);
    setText(o.label);
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      else setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter' && open && filtered[active]) {
      e.preventDefault();
      pick(filtered[active]);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="flex h-11 items-stretch border border-control bg-paper focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-tab">
        <input
          ref={input}
          role="combobox"
          aria-label={label}
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={open && filtered[active] ? `${id}-opt-${active}` : undefined}
          value={text}
          placeholder={placeholder}
          onChange={(e) => {
            setText(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={(e) => e.target.select()}
          onClick={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-transparent px-2.5 text-[13px] text-ink outline-none placeholder:text-muted"
        />
        {value && (
          <button
            type="button"
            aria-label={`Clear ${label}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onChange('');
              setText('');
              input.current?.focus();
            }}
            className="px-2 text-[12px] text-muted hover:text-ink"
          >
            ✕
          </button>
        )}
      </div>
      {open && (
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          aria-label={label}
          className="pop-in absolute left-0 right-0 top-full z-30 mt-1 max-h-[220px] overflow-y-auto rounded-[6px] border-2 border-pixel-border bg-paper p-1 shadow-[4px_4px_0_rgba(0,0,0,0.18)]"
        >
          {filtered.length === 0 ? (
            <li className="px-2 py-2 text-[13px] text-muted">No watched title matches.</li>
          ) : (
            filtered.map((o, i) => (
              <li
                key={o.value}
                id={`${id}-opt-${i}`}
                data-index={i}
                role="option"
                aria-selected={o.value === value}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(o)}
                className={cn(
                  'flex min-h-9 cursor-pointer items-center rounded-[4px] px-2 text-[13px]',
                  i === active && 'bg-sky',
                  o.value === value && 'font-bold text-link',
                )}
              >
                {o.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
