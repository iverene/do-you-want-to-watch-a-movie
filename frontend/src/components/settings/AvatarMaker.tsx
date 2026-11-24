import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useSetAvatar } from '@/queries/me';
import { errorMessage, type Avatar } from '@/services';
import { EXTRAS, HAIR, SKIN, STYLES, TOP } from '../pixel/avatarArt';
import { PixelAvatar } from '../pixel/PixelAvatar';
import { ArrowButton } from '../ui/ArrowLink';
import { BevelButton } from '../ui/BevelButton';
import { useToast } from '../ui/Toast';

type Idx = 0 | 1 | 2 | 3;
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];
const opt = 'flex h-11 w-11 items-center justify-center border bg-paper';
const on = (sel: boolean) => (sel ? 'border-[3px] border-tab' : 'border-line');

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-1">
      <span className="font-caps text-[11px] uppercase text-muted">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export function AvatarMaker({ initial }: { initial: Avatar }) {
  const [a, setA] = useState<Avatar>(initial);
  const save = useSetAvatar();
  const toast = useToast();
  const swatches = (key: 'hair' | 'skin' | 'top', colors: string[], label: string) => (
    <Row label={label}>
      {colors.map((c, i) => (
        <button
          key={c}
          type="button"
          aria-label={`${label} ${i + 1}`}
          aria-pressed={a[key] === i}
          onClick={() => setA({ ...a, [key]: i as Idx })}
          className={cn(opt, on(a[key] === i))}
        >
          <span className="h-6 w-6 border border-[#3A2A20]" style={{ backgroundColor: c }} />
        </button>
      ))}
    </Row>
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
      <div className="flex shrink-0 items-end justify-center self-start border-[3px] border-[#9AA0AA] bg-sky px-5 pb-2 pt-4">
        <PixelAvatar avatar={a} scale={9} label="Avatar preview" />
      </div>
      <div className="flex flex-col gap-3">
        <Row label="Hair">
          {STYLES.map((s) => (
            <button
              key={s}
              type="button"
              aria-label={`Hair style ${s}`}
              aria-pressed={a.style === s}
              onClick={() => setA({ ...a, style: s })}
              className={cn(opt, on(a.style === s))}
            >
              <PixelAvatar avatar={{ ...a, style: s, extra: 'none' }} scale={2} />
            </button>
          ))}
        </Row>
        {swatches('hair', HAIR, 'Color')}
        {swatches('skin', SKIN, 'Skin')}
        {swatches('top', TOP, 'Top')}
        <Row label="Extra">
          {EXTRAS.map((x) => (
            <button
              key={x}
              type="button"
              aria-pressed={a.extra === x}
              onClick={() => setA({ ...a, extra: x })}
              className={cn('h-11 border bg-paper px-3 text-[13px] font-bold', on(a.extra === x))}
            >
              {x}
            </button>
          ))}
        </Row>
        <div className="flex items-center gap-4">
          <BevelButton
            disabled={save.isPending}
            onClick={() =>
              save.mutate(a, {
                onSuccess: () => toast.show('Avatar saved'),
                onError: (e) => toast.show(errorMessage(e), 'error'),
              })
            }
          >
            Save avatar
          </BevelButton>
          <ArrowButton
            onClick={() =>
              setA({
                style: pick(STYLES),
                hair: pick([0, 1, 2, 3] as const),
                skin: pick([0, 1, 2, 3] as const),
                top: pick([0, 1, 2, 3] as const),
                extra: pick(EXTRAS),
              })
            }
          >
            Shuffle
          </ArrowButton>
        </div>
      </div>
    </div>
  );
}
