import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useSession } from '@/queries/auth';
import { RequireAuth } from './RequireAuth';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const WatchedListPage = lazy(() => import('@/pages/WatchedListPage'));
const WatchedCalendarPage = lazy(() => import('@/pages/WatchedCalendarPage'));
const StatsPage = lazy(() => import('@/pages/StatsPage'));
const TitleDetailPage = lazy(() => import('@/pages/TitleDetailPage'));
const WatchlistPage = lazy(() => import('@/pages/WatchlistPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const ImportPage = lazy(() => import('@/pages/ImportPage'));

function OwnProfile() {
  const { user } = useSession();
  return <Navigate to={`/profile/${user.username}`} replace />;
}

export const routes = [
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/watched', element: <WatchedListPage /> },
      { path: '/watched/calendar', element: <WatchedCalendarPage /> },
      { path: '/watched/stats', element: <StatsPage /> },
      { path: '/watched/:screeningId', element: <TitleDetailPage /> },
      { path: '/watchlist', element: <WatchlistPage /> },
      { path: '/profile', element: <OwnProfile /> },
      { path: '/profile/:username', element: <ProfilePage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/settings/import', element: <ImportPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
];

export const router = createBrowserRouter(routes);
