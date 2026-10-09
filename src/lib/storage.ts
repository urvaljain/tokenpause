/**
 * Tiny localStorage wrapper with an in-memory fallback.
 *
 * Private browsing modes, blocked site data and embedded contexts can all make
 * `localStorage` throw on access, so every read and write is guarded and the
 * prototype silently degrades to session-only memory instead of breaking.
 */

type Driver = {
  readonly persistent: boolean;
  read(key: string): string | null;
  write(key: string, value: string): void;
  remove(key: string): void;
};

function createMemoryDriver(): Driver {
  const map = new Map<string, string>();
  return {
    persistent: false,
    read: (key) => map.get(key) ?? null,
    write: (key, value) => void map.set(key, value),
    remove: (key) => void map.delete(key),
  };
}

function createDriver(): Driver {
  try {
    const probe = '__tokenpause_probe__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
  } catch {
    return createMemoryDriver();
  }

  const memory = createMemoryDriver();
  return {
    persistent: true,
    read(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return memory.read(key);
      }
    },
    write(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        memory.write(key, value);
      }
    },
    remove(key) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        memory.remove(key);
      }
    },
  };
}

const driver: Driver = typeof window === 'undefined' ? createMemoryDriver() : createDriver();

/** True when values survive a page refresh on this device. */
export const storageIsPersistent = driver.persistent;

export function readJson<T>(key: string, fallback: T): T {
  const raw = driver.read(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    driver.write(key, JSON.stringify(value));
  } catch {
    /* Nothing more we can do — the prototype keeps working in memory. */
  }
}

export function removeKey(key: string): void {
  driver.remove(key);
}
