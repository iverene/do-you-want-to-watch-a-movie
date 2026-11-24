import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/cn';

interface FieldProps {
  label: string;
  note?: string;
  error?: string;
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode;
  className?: string;
}

/** Label above, optional note, error below in red. Children get the id/aria wiring. */
export function Field({ label, note, error, children, className }: FieldProps) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={id} className="flex items-baseline gap-2 text-[13px] font-extrabold">
        {label}
        {note && <span className="text-[12px] font-normal text-muted">{note}</span>}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': error ? errId : undefined })}
      {error && (
        <p id={errId} className="text-[12px] text-red">
          {error}
        </p>
      )}
    </div>
  );
}

const inputBase =
  'w-full border bg-paper px-2.5 text-[14px] text-ink placeholder:text-muted focus-visible:outline-2 aria-[invalid=true]:border-red';

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function TextInput({ className, ...rest }, ref) {
    return <input ref={ref} {...rest} className={cn(inputBase, 'h-11 border-control', className)} />;
  },
);

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextArea({ className, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        {...rest}
        className={cn(inputBase, 'min-h-[88px] border-control py-2 font-pixel text-[15px]', className)}
      />
    );
  },
);
