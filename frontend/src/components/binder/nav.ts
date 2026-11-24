export const TABS = [
  { to: '/', label: 'Home', match: (p: string) => p === '/' },
  { to: '/watched', label: 'Watched', match: (p: string) => p.startsWith('/watched') },
  { to: '/watchlist', label: 'Watchlist', match: (p: string) => p.startsWith('/watchlist') },
  { to: '/profile', label: 'Profile', match: (p: string) => p.startsWith('/profile') },
  { to: '/settings', label: 'Settings', match: (p: string) => p.startsWith('/settings') },
];
