import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { PixelIconButton } from '../ui/PixelIconButton';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** When true, closing asks "Discard changes?" first. */
  dirty?: boolean;
  width?: string;
}

/**
 * Retro dialog: yellow title tab, pixel close button, paper inner page. Desktop: centered over a dim
 * overlay. Mobile: bottom sheet. role=dialog, aria-modal, focus trap, Esc closes, focus returns.
 */
export function PixelWindow({ title, onClose, children, dirty, width = 'lg:w-[900px]' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [confirming, setConfirming] = useState(false);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const requestClose = useRef(() => {});
  requestClose.current = () => (dirtyRef.current ? setConfirming(true) : onClose());

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const node = ref.current!;
    const first =
      node.querySelector<HTMLElement>('[autofocus], [data-autofocus]') ??
      node.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        requestClose.current();
      } else if (e.key === 'Tab') {
        const items = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
          (el) => el.offsetParent !== null || el === document.activeElement,
        );
        if (!items.length) return;
        const [a, z] = [items[0], items[items.length - 1]];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      opener?.focus?.();
    };
  }, []);

  return createPortal(
    <div
      className="fade-in fixed inset-0 z-50 flex items-end justify-center bg-[rgba(20,30,50,.45)] lg:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && requestClose.current()}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'pop-in relative flex max-h-[92dvh] w-full flex-col border-2 border-[#9AA0AA] bg-[#E6E8EC] pt-9 shadow-window',
          'rounded-t-[18px] lg:max-h-[calc(100vh-60px)] lg:rounded-none',
          width,
        )}
      >
        <h2
          id={titleId}
          className="absolute left-3 top-0 -translate-y-1/2 border-2 border-pixel-border bg-yellow px-3 py-0.5 font-pixel text-[18px] text-pixel-text lg:text-[20px]"
        >
          {title}
        </h2>
        <PixelIconButton
          aria-label="Close"
          className="absolute right-2 top-1"
          onClick={() => requestClose.current()}
        >
          x
        </PixelIconButton>
        <div className="m-2 mt-3 min-h-0 flex-1 overflow-y-auto rounded-[18px] bg-paper p-4 text-ink lg:p-[22px]">
          {children}
        </div>
        {confirming && (
          <div
            role="alertdialog"
            aria-label="Discard changes?"
            className="absolute inset-x-2 bottom-2 flex flex-wrap items-center justify-between gap-2 border-2 border-pixel-border bg-yellow p-3 text-ink"
          >
            <span className="font-bold">Discard changes?</span>
            <span className="flex gap-2">
              <button
                type="button"
                autoFocus
                className="bevel min-h-11 rounded px-3 font-bold"
                onClick={() => setConfirming(false)}
              >
                Keep editing
              </button>
              <button
                type="button"
                className="min-h-11 rounded border-2 border-pixel-border bg-orange px-3 font-bold text-pixel-text"
                onClick={onClose}
              >
                Discard
              </button>
            </span>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
