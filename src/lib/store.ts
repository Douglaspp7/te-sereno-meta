import { useEffect, useState, useCallback } from "react";

const PREFIX = "tea-app:";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("tea-store", { detail: { key } }));
}

export function useStore<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    setValue(read(key, fallback));
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ key: string }>;
      if (ce.detail?.key === key) setValue(read(key, fallback));
    };
    window.addEventListener("tea-store", handler);
    return () => window.removeEventListener("tea-store", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        write(key, v);
        return v;
      });
    },
    [key],
  );

  return [value, update] as const;
}

export interface Profile {
  name: string;
  startWeight: number;
  currentWeight: number;
  goalWeight: number;
  startDate: string;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  recipes: string[];
  weight?: number;
}

export const today = () => new Date().toISOString().slice(0, 10);
