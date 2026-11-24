import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUploadImport } from '@/queries/import';
import { errorMessage, isApiError } from '@/services';
import { BevelButton } from '../ui/BevelButton';

/** Choose a CSV (title,year + optional type,who,stars_a,stars_b) → the review page. */
export function ImportSection() {
  const input = useRef<HTMLInputElement>(null);
  const upload = useUploadImport();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[13px] text-muted">
        Upload a CSV with title and year watched. Optional columns: type, who, stars_a, stars_b.
      </p>
      <input
        ref={input}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) upload.mutate(file, { onSuccess: () => navigate('/settings/import') });
        }}
      />
      <BevelButton className="self-start" disabled={upload.isPending} onClick={() => input.current?.click()}>
        {upload.isPending ? 'Reading..' : 'Choose CSV file'}
      </BevelButton>
      {upload.isError && (
        <p role="alert" className="text-[12px] text-red">
          {isApiError(upload.error) && upload.error.fields?.file
            ? upload.error.fields.file
            : errorMessage(upload.error)}
        </p>
      )}
    </div>
  );
}
