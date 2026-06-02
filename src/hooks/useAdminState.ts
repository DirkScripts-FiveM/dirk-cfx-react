// Drop-in replacement for React's useState that survives unmount/remount.
//
// Why: ConfigPanel returns null when closed, which tears down the entire
// React tree under it. Local component state (active tab, current edit
// target, search text, view-mode toggles, etc.) is lost. Admins who close
// and reopen the panel land back at the default state every time.
//
// useAdminState writes to a module-scope store keyed by an arbitrary
// string. The store survives close/reopen because the NUI iframe stays
// alive across SetNuiFocus toggles — only React unmounts.
//
// Reset scope: keys live for the lifetime of the iframe (= until the
// resource restarts or the player reloads the NUI). That's exactly what
// admins want — "remember where I was in this session, but don't carry
// over after a restart".
//
// Usage:
//   const [activeTab, setActiveTab] = useAdminState("labs:viewMode", "list");
//
// Key collisions: state is scoped per dirk-cfx-react module-scope, which
// is per-iframe — so two different consumer resources can both use the key
// "viewMode" without colliding. Within a single consumer, keep keys unique
// (prefix with section name: "labs:viewMode", "shells:editingId" etc).

import { useEffect, useState } from "react";

type Listener = () => void;

const store: Map<string, unknown> = new Map();
const listeners: Map<string, Set<Listener>> = new Map();

function notify(key: string) {
  const ls = listeners.get(key);
  if (!ls) return;
  ls.forEach((fn) => fn());
}

/**
 * Like `useState` but the value persists in a module-scope store across
 * unmount/remount cycles. Identical API otherwise.
 *
 * @param key       Stable string identifying this slot. Must be unique per
 *                  intended slot within the consumer's iframe.
 * @param initial   Initial value if no value has been stored under `key` yet.
 */
export function useAdminState<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  // useState here is just for triggering re-renders on cross-component
  // updates. The real value lives in the module-scope `store`.
  const [, setTick] = useState(0);

  useEffect(() => {
    const set = listeners.get(key) ?? new Set<Listener>();
    listeners.set(key, set);
    const handler = () => setTick((t) => t + 1);
    set.add(handler);
    return () => {
      set.delete(handler);
      if (set.size === 0) listeners.delete(key);
    };
  }, [key]);

  const value = (store.has(key) ? store.get(key) : initial) as T;

  const setValue = (v: T | ((prev: T) => T)) => {
    const next = typeof v === "function" ? (v as (p: T) => T)(value) : v;
    store.set(key, next);
    notify(key);
  };

  return [value, setValue];
}

/** Imperative clear — useful for "reset everything" admin actions. */
export function clearAdminState(key?: string) {
  if (key) {
    store.delete(key);
    notify(key);
  } else {
    const keys = Array.from(store.keys());
    store.clear();
    keys.forEach(notify);
  }
}
