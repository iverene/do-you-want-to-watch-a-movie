import { useQuery } from '@tanstack/react-query';
import { services, type StatsQuery } from '@/services';

export const useStats = (q: StatsQuery) =>
  useQuery({ queryKey: ['stats', q], queryFn: () => services.stats.get(q) });
