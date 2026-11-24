import type { ReactNode } from 'react';

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 border border-dashed border-dot px-4 py-8 text-center">
      <p className="font-hand text-[17px] text-muted lg:text-[20px]">{message}</p>
      {action}
    </div>
  );
}
