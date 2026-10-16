"use client";

import { useCallback, useSyncExternalStore } from "react";
import { readStored, writeStored } from "./theme";

const PREF_EVENT = "jarvis:pref";

const subscribe = (onChange: () => void) => {
  window.addEventListener(PREF_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(PREF_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

/**
 * A localStorage-backed preference that is SSR-safe: the server (and first
 * hydration pass) render `fallback`, then the stored value takes over.
 */
export function usePref(key: string, fallback: string): [string, (value: string) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => readStored(key) ?? fallback,
    () => fallback
  );
  const set = useCallback(
    (next: string) => {
      writeStored(key, next);
      window.dispatchEvent(new Event(PREF_EVENT));
    },
    [key]
  );
  return [value, set];
}
