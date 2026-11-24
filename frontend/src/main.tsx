import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import './styles/index.css';

function ThemePreview() {
  const { theme, setTheme } = useTheme();
  return (
    <main className="p-8">
      <h1 className="font-pixel text-2xl text-ink">Do You Want to Watch a Movie?</h1>
      <button
        className="bevel mt-4 rounded px-3 py-2"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        {theme === 'light' ? '☾ Dark' : '☼ Light'}
      </button>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ThemePreview />
    </ThemeProvider>
  </StrictMode>,
);
