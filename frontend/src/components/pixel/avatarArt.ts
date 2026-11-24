import type { Avatar } from '@/services';

export const HAIR = ['#3B2A26', '#7A3B2E', '#D9A441', '#8E6FD6'];
export const SKIN = ['#FFE1CC', '#F5C9A6', '#D9A07A', '#9C6B4A'];
export const TOP = ['#4F8FD6', '#F28FB4', '#86C440', '#E9893F'];
export const STYLES: Avatar['style'][] = ['short', 'long', 'bun', 'bob'];
export const EXTRAS: Avatar['extra'][] = ['none', 'glasses', 'cap'];

// 10 × 14. H hair, S skin, E eyes, B blush, M mouth, T top, P pants, O shoes, G glasses, C cap.
const BASE = [
  '..........',
  '...HHHH...',
  '..HHHHHH..',
  '..HSSSSH..',
  '..SESSES..',
  '..SBSSBS..',
  '...SMMS...',
  '....SS....',
  '..TTTTTT..',
  '.STTTTTTS.',
  '.S.TTTT.S.',
  '...PPPP...',
  '...P..P...',
  '..OO..OO..',
];

function set(rows: string[], y: number, x: number, ch: string): void {
  const r = rows[y].split('');
  r[x] = ch;
  rows[y] = r.join('');
}

export function avatarRows(a: Avatar): string[] {
  const rows = [...BASE];
  if (a.style === 'long') {
    for (const y of [4, 5, 6, 7, 8]) {
      set(rows, y, 1, 'H');
      set(rows, y, 8, 'H');
    }
    set(rows, 3, 1, 'H');
    set(rows, 3, 8, 'H');
  } else if (a.style === 'bob') {
    for (const y of [3, 4, 5]) {
      set(rows, y, 1, 'H');
      set(rows, y, 8, 'H');
    }
    rows[3] = '.HHSSSSHH.';
  } else if (a.style === 'bun') {
    rows[0] = '....HH....';
    set(rows, 3, 2, 'S');
    set(rows, 3, 7, 'S');
  }
  if (a.extra === 'glasses') rows[4] = rows[4].slice(0, 2) + 'GEGGEG' + rows[4].slice(8);
  if (a.extra === 'cap') {
    rows[0] = '..........';
    rows[1] = '...CCCC...';
    rows[2] = '..CCCCCCC.';
  }
  return rows;
}

export function avatarPalette(a: Avatar): Record<string, string> {
  return {
    H: HAIR[a.hair],
    S: SKIN[a.skin],
    E: '#2A2A2A',
    B: '#FFA6A0',
    M: '#E07B7B',
    T: TOP[a.top],
    P: '#2F3E66',
    O: '#3A3A3A',
    G: '#2A2A2A',
    C: '#E9893F',
  };
}
