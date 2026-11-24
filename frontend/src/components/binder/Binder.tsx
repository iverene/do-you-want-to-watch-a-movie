import type { ReactNode } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { OfflineBar } from '../feedback/OfflineBar';
import { BinderHeader, MobileHeader } from './BinderHeader';
import { LeftPage } from './LeftPage';
import { MobileTabs } from './MobileTabs';
import { Rings } from './Rings';
import { TabRail } from './TabRail';

/** One binder everywhere: only the right page changes between routes. */
export function Binder({ children, onLog }: { children: ReactNode; onLog: () => void }) {
  const desktop = useIsDesktop();

  if (!desktop) {
    return (
      <div className="flex h-[100dvh] flex-col">
        <MobileHeader onLog={onLog} />
        <OfflineBar />
        <div className="mx-2 mb-2 flex min-h-0 flex-1 flex-col rounded-[18px] bg-frame p-2">
          <div className="stitch flex min-h-0 flex-1 flex-col rounded-[12px] bg-inner pt-2">
            <MobileTabs />
            <main
              id="main"
              className="min-h-0 flex-1 overflow-y-auto rounded-[10px] border border-line bg-paper p-3"
            >
              {children}
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full items-start justify-center px-4 py-[50px] pr-[124px]">
      <div className="relative h-[calc(100vh-100px)] min-h-[760px] w-[min(1060px,calc(100vw-140px))] rounded-[26px] bg-frame p-4">
        <div className="stitch flex h-full flex-col rounded-[18px] bg-inner p-3">
          <BinderHeader onLog={onLog} />
          <OfflineBar />
          <div className="flex min-h-0 flex-1">
            <aside
              aria-label="Our room"
              className="w-[270px] shrink-0 overflow-y-auto rounded-[14px] border border-line bg-paper p-4"
            >
              <LeftPage />
            </aside>
            <Rings />
            <main
              id="main"
              className="min-w-0 flex-1 overflow-y-auto rounded-[14px] border border-line bg-paper px-[22px] py-[18px]"
            >
              {children}
            </main>
          </div>
        </div>
        <TabRail />
      </div>
    </div>
  );
}
