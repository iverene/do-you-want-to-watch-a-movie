import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { services, type ImportRow, type ImportRowPatch } from '@/services';
import { invalidateWatches } from './keys';

const KEY = ['import-rows'] as const;

/** Rows from the last upload. The API has no "list rows" route, so they live in the query cache. */
export const useImportRows = () =>
  useQuery<ImportRow[] | null>({
    queryKey: KEY,
    queryFn: () => null,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: false,
  });

export function useUploadImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => services.import.upload(file),
    onSuccess: ({ rows }) => qc.setQueryData(KEY, rows),
  });
}

export function useUpdateImportRow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ImportRowPatch }) => services.import.updateRow(id, body),
    onSuccess: ({ row }) =>
      qc.setQueryData<ImportRow[] | null>(
        KEY,
        (rows) => rows?.map((r) => (r.id === row.id ? row : r)) ?? rows,
      ),
  });
}

export function useConfirmImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => services.import.confirm(),
    onSuccess: () => {
      qc.setQueryData(KEY, null);
      return invalidateWatches(qc);
    },
  });
}
