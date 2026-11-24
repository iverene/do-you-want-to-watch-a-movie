import { LogWatchDialog } from '@/components/dialogs/LogWatchDialog';
import { useLogWatch } from './LogWatchContext';

/** Dialogs that can open from any page. */
export function GlobalDialogs() {
  const { request, close } = useLogWatch();
  if (!request) return null;
  // A new request (e.g. search → rate) remounts the dialog with fresh state.
  return (
    <LogWatchDialog
      key={request.mode === 'rate' ? `rate-${request.screening.id}` : request.mode}
      request={request}
      onClose={close}
    />
  );
}
