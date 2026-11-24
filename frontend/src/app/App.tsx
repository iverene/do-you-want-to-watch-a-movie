import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Providers } from './providers';
import { router } from './router';

export function App() {
  return (
    <Providers>
      <Suspense fallback={null}>
        <RouterProvider router={router} />
      </Suspense>
    </Providers>
  );
}
