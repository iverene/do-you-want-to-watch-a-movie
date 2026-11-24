import { errorMessage } from '@/services';
import { BevelButton } from '../ui/BevelButton';

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 border border-dashed border-red px-4 py-3"
    >
      <p className="text-[13px] text-red">{errorMessage(error)}</p>
      {onRetry && (
        <BevelButton dense onClick={onRetry}>
          Try again
        </BevelButton>
      )}
    </div>
  );
}
