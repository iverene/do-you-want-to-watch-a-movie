import { PixelGrid } from './PixelGrid';

const ROWS = [
  '...R....',
  '...RR...',
  '..RRR.R.',
  '..RORRR.',
  '.RROORR.',
  '.ROOYOR.',
  'RROYYORR',
  'ROYYYYOR',
  '.RYYYYR.',
  '..RRRR..',
];

export function Flame({ lit = true, scale = 3 }: { lit?: boolean; scale?: number }) {
  const palette = lit
    ? { R: '#D23B2F', O: '#E8792F', Y: '#FFD23F' }
    : { R: '#8E949E', O: '#B5BAC2', Y: '#D5D9DF' };
  return <PixelGrid rows={ROWS} palette={palette} scale={scale} />;
}
