import { useState } from 'react';
import { useHome, useSetNote } from '@/queries/home';
import { errorMessage } from '@/services';
import { ArrowButton } from '../ui/ArrowLink';

/** "TODAY IS.." mood and the handwritten status note, both shared and editable in place. */
export function MoodNote() {
  const { data } = useHome();
  const save = useSetNote();
  const [editing, setEditing] = useState<'mood' | 'note' | null>(null);
  const [draft, setDraft] = useState('');

  const start = (what: 'mood' | 'note') => {
    setDraft(what === 'mood' ? (data?.mood ?? '') : (data?.statusNote ?? ''));
    setEditing(what);
  };
  const commit = () => {
    const body = editing === 'mood' ? { mood: draft } : { statusNote: draft };
    save.mutate(body, { onSuccess: () => setEditing(null) });
  };
  const max = editing === 'mood' ? 30 : 80;

  const editor = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        commit();
      }}
      className="flex flex-col gap-1"
    >
      <label className="sr-only" htmlFor="mood-note-input">
        {editing === 'mood' ? 'Mood' : 'Status note'}
      </label>
      <input
        id="mood-note-input"
        autoFocus
        value={draft}
        maxLength={max}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && setEditing(null)}
        className="h-9 border border-control bg-paper px-2 text-[13px]"
      />
      <div className="flex items-center justify-between text-[12px] text-muted">
        <span>
          {draft.length}/{max}
        </span>
        <span className="flex gap-3">
          <button type="button" className="hover:underline" onClick={() => setEditing(null)}>
            Cancel
          </button>
          <button type="submit" className="font-bold text-link hover:underline" disabled={save.isPending}>
            Save
          </button>
        </span>
      </div>
      {save.isError && <p className="text-[12px] text-red">{errorMessage(save.error)}</p>}
    </form>
  );

  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="font-caps text-[11px] uppercase text-muted">TODAY IS..</p>
        {editing === 'mood' ? (
          editor
        ) : (
          <button
            type="button"
            onClick={() => start('mood')}
            className="font-pixel text-[16px] text-ink hover:underline"
            aria-label={`Mood: ${data?.mood ?? ''}. Edit`}
          >
            {data?.mood || '[set a mood]'}
          </button>
        )}
      </div>
      {editing === 'note' ? (
        editor
      ) : (
        <div>
          <p className="font-hand text-[18px] leading-snug text-ink">
            {data?.statusNote || '[write a note for each other]'}
          </p>
          <ArrowButton onClick={() => start('note')} className="font-caps text-[11px] uppercase">
            EDIT
          </ArrowButton>
        </div>
      )}
    </div>
  );
}
