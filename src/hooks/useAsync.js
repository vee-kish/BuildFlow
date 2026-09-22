import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Run an async loader (a function returning a promise) and track its state.
 * Returns { data, loading, error, reload }. Re-runs when `deps` change.
 * Keeps previous data visible during a reload so the UI does not flash empty.
 */
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const run = useCallback(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(() => loaderRef.current())
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cancel = run();
    return cancel;
    // Deps are supplied by the caller and intentionally dynamic.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const reload = useCallback(() => {
    run();
  }, [run]);

  return { ...state, reload };
}
