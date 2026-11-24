import { useEffect, useState, type InputHTMLAttributes } from 'react';
import { Poster } from '../../media/Poster';

/** Poster upload box: choose a file, or paste an image link. */
export function PosterPicker({
  file,
  onFile,
  urlProps,
  urlError,
}: {
  file: File | null;
  onFile: (f: File | null) => void;
  urlProps: InputHTMLAttributes<HTMLInputElement>;
  urlError?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="flex gap-3 border border-dashed border-dot p-3">
      <Poster title="New poster" posterUrl={preview} className="w-16" decorative />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="text-[13px] font-extrabold">
          Poster <span className="font-normal text-muted">optional</span>
        </span>
        <label className="bevel inline-flex min-h-11 w-fit cursor-pointer items-center rounded px-3 text-[13px] font-bold focus-within:outline focus-within:outline-2 focus-within:outline-tab">
          {file ? 'Change image' : 'Upload image'}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {file ? (
          <p className="truncate text-[12px] text-muted">
            {file.name}{' '}
            <button type="button" className="text-link underline" onClick={() => onFile(null)}>
              remove
            </button>
          </p>
        ) : (
          <>
            <label htmlFor="poster-url" className="sr-only">
              Image link
            </label>
            <input
              id="poster-url"
              {...urlProps}
              placeholder="or paste an image link"
              aria-invalid={Boolean(urlError)}
              className="h-11 border border-control bg-paper px-2 text-[13px] aria-[invalid=true]:border-red"
            />
            {urlError && <p className="text-[12px] text-red">{urlError}</p>}
          </>
        )}
      </div>
    </div>
  );
}
