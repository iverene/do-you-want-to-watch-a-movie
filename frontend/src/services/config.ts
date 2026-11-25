// The only switch between mock data and the real backend. No environment variables.
export const serviceConfig = {
  mode: 'mock' as 'mock' | 'http', // 'mock' = local sample data, 'http' = real backend
  apiBaseUrl: '/api', // used only in 'http' mode
  mockLatencyMs: 250, // fake network delay so loading states are visible
  mockStorageKey: 'dywwam-mock-db-v1',
  timeZone: 'Asia/Manila', // "today" for new watches and streak weeks
};
