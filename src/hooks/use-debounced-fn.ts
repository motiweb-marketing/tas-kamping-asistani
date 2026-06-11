import { useCallback, useEffect, useRef } from 'react';

/** iOS Safari onBlur güvenilmez — yazmayı bırakınca debounce ile kaydet. */
export function useDebouncedFn<T extends unknown[]>(
  fn: (...args: T) => void | Promise<void>,
  delay = 800
) {
  const fnRef = useRef(fn);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return useCallback(
    (...args: T) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => void fnRef.current(...args), delay);
    },
    [delay]
  );
}
