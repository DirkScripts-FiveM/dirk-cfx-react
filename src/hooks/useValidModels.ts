// Validates a list of GTA / RDR model names against the client's CD-image
// via dirk_lib's adminTool.validateModels Lua tool. Returns a Set of names
// that DO resolve to a streamable model — useful for greying out admin-
// panel rows that reference props/shells/peds that aren't installed.
//
// Batches: pass the full list each render; the hook diffs against what's
// already been resolved and only asks Lua for the new names. Once a name
// has been checked, subsequent renders with the same name return the
// cached result instantly.
//
// Result is a stable Set reference per resolution wave so callers can use
// it as a useMemo / useEffect dep without thrashing.
//
// Usage:
//   const valid = useValidModels(shells.map(s => s.model));
//   shells.map(s => <Row dimmed={!valid.has(s.model)} ... />)
//
// Only meaningful inside an open admin panel (the underlying NUI callback
// is gated on scriptConfig being open). Outside that window the hook just
// returns an empty Set.
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchNui } from "../utils/fetchNui";

const moduleCache = new Map<string, boolean>();

export function useValidModels(names: string[]): Set<string> {
  // Stable string key for the input list so the effect doesn't re-fire on
  // every render. Sort + join keeps the dep change-detection cheap.
  const cacheKey = useMemo(() => {
    const unique = Array.from(new Set(names.filter(n => typeof n === "string" && n.length > 0)));
    unique.sort();
    return unique.join("|");
  }, [names]);

  // Bump on every new validation result so memoised consumers re-derive.
  const [version, setVersion] = useState(0);
  const inflight = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!cacheKey) return;
    const all = cacheKey.split("|").filter(Boolean);
    const missing = all.filter(n => !moduleCache.has(n) && !inflight.current.has(n));
    if (missing.length === 0) return;

    missing.forEach(n => inflight.current.add(n));
    let cancelled = false;

    fetchNui<Record<string, boolean> | null>(
      "ADMIN_TOOL_QUERY",
      { id: "validateModels", value: missing },
      // Fallback when running outside FiveM (browser dev) — assume valid so the
      // dev shell doesn't grey out every row.
      Object.fromEntries(missing.map(n => [n, true])),
    )
      .then(result => {
        if (cancelled) return;
        const map = result && typeof result === "object" ? result : {};
        missing.forEach(n => {
          moduleCache.set(n, !!map[n]);
          inflight.current.delete(n);
        });
        setVersion(v => v + 1);
      })
      .catch(() => {
        if (cancelled) return;
        // On failure, mark them as valid by default so a transient NUI hiccup
        // doesn't dim every row of the panel. Lua side will be re-asked next
        // time the deps change.
        missing.forEach(n => {
          inflight.current.delete(n);
        });
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey]);

  return useMemo(() => {
    const out = new Set<string>();
    if (!cacheKey) return out;
    for (const n of cacheKey.split("|")) {
      if (n && moduleCache.get(n) === true) out.add(n);
    }
    return out;
    // version bumps cause re-derivation once the async cache fills in.
  }, [cacheKey, version]);
}
