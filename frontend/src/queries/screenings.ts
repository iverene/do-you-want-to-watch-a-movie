import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  services,
  type CreateScreeningBody,
  type RateBody,
  type Scope,
  type ScreeningFilters,
  type UpdateScreeningBody,
} from '@/services';
import { invalidateWatches } from './keys';

export const useScreenings = (f: ScreeningFilters) =>
  useQuery({ queryKey: ['screenings', f], queryFn: () => services.screenings.list(f) });

export const useCalendar = (month: string, scope: Scope) =>
  useQuery({
    queryKey: ['calendar', month, scope],
    queryFn: () => services.screenings.calendar(month, scope),
  });

export const useScreening = (id: string | undefined) =>
  useQuery({
    queryKey: ['screening', id],
    queryFn: () => services.screenings.get(id!),
    enabled: Boolean(id),
  });

export function useCreateScreening() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateScreeningBody) => services.screenings.create(body),
    onSuccess: () => invalidateWatches(qc),
  });
}

export function useUpdateScreening() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateScreeningBody }) =>
      services.screenings.update(id, body),
    onSuccess: () => invalidateWatches(qc),
  });
}

export function useRemoveScreening() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => services.screenings.remove(id),
    onSuccess: () => invalidateWatches(qc),
  });
}

export function useRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: RateBody }) => services.screenings.rate(id, body),
    onSuccess: ({ screening }) => {
      qc.setQueryData(['screening', screening.id], (old: { history: unknown[] } | undefined) =>
        old ? { ...old, screening } : old,
      );
      return invalidateWatches(qc);
    },
  });
}
