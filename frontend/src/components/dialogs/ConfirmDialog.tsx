import { BevelButton } from '../ui/BevelButton';
import { LogWatchButton } from '../ui/LogWatchButton';
import { PixelWindow } from './PixelWindow';

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <PixelWindow title={title} onClose={onClose} width="lg:w-[480px]">
      <p className="text-[14px]">{message}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <BevelButton data-autofocus onClick={onClose}>
          Cancel
        </BevelButton>
        <LogWatchButton icon="!" onClick={onConfirm}>
          {confirmLabel}
        </LogWatchButton>
      </div>
    </PixelWindow>
  );
}
