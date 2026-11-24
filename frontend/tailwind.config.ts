import type { Config } from 'tailwindcss';

const token = (name: string) => `var(--${name})`;
const colorNames = [
  'page',
  'grid',
  'frame',
  'paper',
  'panel',
  'inner',
  'line',
  'dot',
  'ink',
  'muted',
  'link',
  'tab',
  'ontab',
  'red',
  'orange',
  'yellow',
  'sky',
  'star',
  'bubble',
] as const;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ...Object.fromEntries(colorNames.map((n) => [n, token(n)])),
        bevel: { top: '#FFFFFF', bottom: '#E4E7EC', border: '#9AA0AA' },
        control: '#8E949E',
        pixel: { border: '#3A2A20', text: '#22140A' },
        success: { bg: '#E7F6DF', border: '#86C440', text: '#3E7A1A' },
      },
      fontFamily: {
        pixel: ['"DotGothic16"', 'monospace'],
        caps: ['Silkscreen', 'monospace'],
        body: ['"Nanum Gothic"', 'system-ui', 'sans-serif'],
        hand: ['Gaegu', 'cursive'],
      },
      boxShadow: {
        bevel: 'inset -3px -3px 0 rgba(0,0,0,.18), inset 3px 3px 0 rgba(255,255,255,.35)',
        cta: 'inset -3px -3px 0 rgba(0,0,0,.18), inset 3px 3px 0 rgba(255,255,255,.35), 3px 3px 0 rgba(58,42,32,.35)',
        window: '10px 10px 0 rgba(0,0,0,.18)',
        card: '3px 3px 0 rgba(58,42,32,.35)',
      },
    },
  },
  plugins: [],
} satisfies Config;
