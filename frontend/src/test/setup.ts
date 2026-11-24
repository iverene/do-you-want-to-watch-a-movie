import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';

configure({ asyncUtilTimeout: 5000 });

// jsdom has no matchMedia; default to the desktop layout.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: /min-width:\s*1024px/.test(query),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

// The seed data is written for "today" = Nov 24, 2026 in Asia/Manila (6-week streak). Only Date is faked.
vi.useFakeTimers({ toFake: ['Date'] });
vi.setSystemTime(new Date('2026-11-24T12:00:00+08:00'));
