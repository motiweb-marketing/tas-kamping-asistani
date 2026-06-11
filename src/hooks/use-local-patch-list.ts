import { useCallback, useEffect, useState } from 'react';

/**
 * Admin tablolarında blur/change sonrası tam reload yapmadan satır düzenleme.
 * Reload yalnızca ilk yükleme veya API hatasında çalışır — odak kaybı / satır zıplaması olmaz.
 */
export function useLocalPatchList<T extends { id: string }>(
  loadFn: () => Promise<T[]>
) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const data = await loadFn();
    setRows(data);
    setLoading(false);
  }, [loadFn]);

  useEffect(() => {
    reload();
  }, [reload]);

  const setField = useCallback((id: string, fields: Partial<T>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...fields } : r)));
  }, []);

  const patch = useCallback(
    async (
      id: string,
      fields: Partial<T>,
      endpoint = `/api/items/${id}`
    ): Promise<string | null> => {
      const previous = rows.find((r) => r.id === id);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...fields } : r)));
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (previous) {
          setRows((prev) => prev.map((r) => (r.id === id ? previous : r)));
        } else {
          await reload();
        }
        return (data as { error?: string }).error || 'Kaydedilemedi';
      }
      return null;
    },
    [reload, rows]
  );

  const remove = useCallback(
    async (id: string, endpoint = `/api/items/${id}`) => {
      setRows((prev) => prev.filter((r) => r.id !== id));
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (!res.ok) await reload();
    },
    [reload]
  );

  return { rows, loading, reload, setField, patch, remove };
}
