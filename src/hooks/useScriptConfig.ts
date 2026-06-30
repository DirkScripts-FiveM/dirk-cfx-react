import { fetchNui } from "@/utils";
import { useNuiEvent } from "@/hooks/useNuiEvent";
import { create } from "zustand";

type ScriptConfigUpdateMeta<T> = {
  client_version?: number;
  latestVersion?: number;
  latestData?: Partial<T>;
  changed_paths?: Array<{ path: string; old: unknown; new: unknown }>;
  lastEditor?: { source?: number; name?: string; identifier?: string };
};

export type ScriptConfigHistoryChange = {
  path: string;
  old: unknown;
  new: unknown;
};

export type ScriptConfigHistoryEntry = {
  at_unix: number;
  at_utc: string;
  script: string;
  admin?: { source?: number; name?: string; identifier?: string };
  expected_version?: number;
  applied_version?: number;
  changes: ScriptConfigHistoryChange[];
};

export type ScriptConfigHistoryRequest = {
  offset?: number;
  limit?: number;
  query?: string;
  path?: string;
  admin?: string;
  fromUnix?: number;
  toUnix?: number;
};

export type ScriptConfigHistoryResponse = {
  success: boolean;
  _error?: string;
  data?: {
    items: ScriptConfigHistoryEntry[];
    total: number;
    limit: number;
    offset: number;
    nextOffset?: number;
  };
};

type NuiResponse<T> = {
  success: boolean;
  message?: string;
  _error?: string;
  meta?: ScriptConfigUpdateMeta<T>;
};

// Server-only "sliver" response (GET_SERVER_ONLY_SCRIPT_CONFIG). Identical
// envelope to GET_FULL_SCRIPT_CONFIG — only the inner key differs (`serverOnly`
// instead of `config`). `serverOnly` is the x-serverOnly subtree in the SAME
// nested shape/paths as `config` (a deep object, NOT flat dot-paths); `{}` when
// the schema declares no server-only fields.
export type ServerOnlyScriptConfigResponse<T> = {
  success: boolean;
  _error?: string;
  data?: { serverOnly: Partial<T>; clientVersion: number };
};

// Recursive deep-merge: returns a new object where `patch`'s plain-object
// branches are merged INTO `base`'s, and non-object values (scalars, arrays)
// from `patch` replace `base`. Used to top up the server-only sliver onto the
// already-cached client-visible config WITHOUT the top-level spread-replace
// `fetchScriptConfig` uses — a shallow spread would clobber sibling
// client-visible keys that live under a shared parent section. By construction
// the two views are disjoint (serverOnly is the set-complement of the
// client-visible view), but we still deep-merge so a shared parent section keeps
// both its client-visible and server-only children.
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge<T>(base: T, patch: Partial<T>): T {
  if (!isPlainObject(base) || !isPlainObject(patch)) {
    // patch wins for non-object values (arrays/scalars are replaced wholesale).
    return (patch as unknown as T) ?? base;
  }
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(patch as Record<string, unknown>)) {
    const patchVal = (patch as Record<string, unknown>)[key];
    const baseVal = out[key];
    out[key] = isPlainObject(baseVal) && isPlainObject(patchVal)
      ? deepMerge(baseVal, patchVal as Record<string, unknown>)
      : patchVal;
  }
  return out as T;
}

// Derive the set of changed TOP-LEVEL section keys from a useForm changed-set
// of dotted paths (e.g. ["stores.0.name", "basic.weightUnit"] → {"stores","basic"}).
// CONSERVATIVE by design: any changed path under section X marks the WHOLE
// section X as changed, so the caller sends its full current value. This is what
// lets deletions inside a section (a removed array element) propagate, because
// the server/client overwrite the section wholesale rather than deep-merging.
function changedTopLevelSections(changedFields?: readonly string[]): string[] {
  if (!changedFields || changedFields.length === 0) return [];
  const sections = new Set<string>();
  for (const path of changedFields) {
    if (typeof path !== "string" || path.length === 0) continue;
    const dot = path.indexOf(".");
    sections.add(dot === -1 ? path : path.slice(0, dot));
  }
  return Array.from(sections);
}

// ── Singleton registry ────────────────────────────────────────────────────────

export interface ScriptConfigInstance<T = any> {
  store: { getState: () => T; setState: (partial: Partial<T> | ((prev: T) => T)) => void };
  updateConfig: (newConfig: Partial<T>, changedFields?: readonly string[]) => Promise<NuiResponse<T>>;
  resetConfig: () => Promise<{ success: boolean; _error?: string }>;
  getHistory: (params?: ScriptConfigHistoryRequest) => Promise<ScriptConfigHistoryResponse>;
  fetchConfig: () => Promise<T | null>;
  // Admin-only top-up: fetches the server-only sliver and DEEP-MERGES it onto
  // the already-cached client-visible store state. Returns the merged full
  // config, or null on failure / no-permission. The sliver is in-memory only —
  // it is NEVER persisted to KVP or any cache (KVP holds client-visible only).
  fetchServerOnly: () => Promise<T | null>;
}

let _instance: ScriptConfigInstance | null = null;

export function getScriptConfigInstance<T = any>(): ScriptConfigInstance<T> {
  if (!_instance) throw new Error("[dirk-cfx-react] createScriptConfig must be called before using ConfigPanel");
  return _instance as ScriptConfigInstance<T>;
}

export function createScriptConfig<T>(defaultValue: T) {
  const store = create<T>(() => defaultValue);
  let clientVersion = 0;

  const useScriptConfigHooks = () => {
    useNuiEvent<{ config?: Partial<T>; clientVersion?: number; sectionReplace?: boolean }>(
      "UPDATE_SCRIPT_CONFIG",
      (data) => {
        if (!data) return;

        if (typeof data.clientVersion === "number") {
          clientVersion = data.clientVersion as number;
        }

        if (data.config && typeof data.config === "object") {
          // Both apply modes use the same top-level merge-by-replace:
          //  - sectionReplace: `config` holds only the changed sections; spreading
          //    them over `prev` wholesale-overwrites those keys and leaves every
          //    other (unsent) section exactly as-is. We MUST NOT full-replace here
          //    or the unsent sections would vanish from the UI.
          //  - fullReplace / merge / initial: `config` holds the FULL config, so
          //    the same spread effectively replaces every key.
          store.setState((prev) => ({ ...prev, ...(data.config as Partial<T>) }));
        }
      }
    );
  };

  const fetchScriptConfig = async (): Promise<T | null> => {
    try {
      const response = await fetchNui<{
        success: boolean;
        data?: { config: T; clientVersion: number };
      }>("GET_FULL_SCRIPT_CONFIG");

      if (response?.success && response.data?.config) {
        store.setState(() => response.data!.config as T);
        if (typeof response.data.clientVersion === "number") {
          clientVersion = response.data.clientVersion;
        }
        return response.data.config;
      }
    } catch { /* fallback to current store state */ }
    return null;
  };

  // Option B top-up. Called ONLY by the admin editor on panel open. The
  // baseline (client-visible config) is already in the store — pushed by Lua
  // via UPDATE_SCRIPT_CONFIG (handled in useScriptConfigHooks above) and cached
  // in KVP on the Lua side. Here we fetch ONLY the server-only sliver
  // (permission-gated server-side on canEditScript) and DEEP-MERGE it onto that
  // baseline to form the full editor view. We deliberately do NOT spread-replace
  // (as fetchScriptConfig does) — that would clobber sibling client-visible keys
  // under a shared parent section.
  //
  // SECURITY: this sliver is admin-only and in-memory only. It is NEVER written
  // to KVP or any cache; it is re-fetched fresh on every panel open.
  const fetchServerOnlyScriptConfig = async (): Promise<T | null> => {
    try {
      const response = await fetchNui<ServerOnlyScriptConfigResponse<T>>(
        "GET_SERVER_ONLY_SCRIPT_CONFIG"
      );

      if (response?.success && response.data) {
        // clientVersion here matches the value already in the store from the
        // Lua push; keep it in sync (safe no-op if identical).
        if (typeof response.data.clientVersion === "number") {
          clientVersion = response.data.clientVersion;
        }
        const sliver = response.data.serverOnly;
        // An empty sliver ({} — schema declares no server-only paths) is a valid
        // no-op merge: deepMerge returns the baseline unchanged.
        const merged = deepMerge(store.getState() as T, (sliver ?? {}) as Partial<T>);
        store.setState(() => merged as T);
        return merged;
      }
    } catch { /* fall back to the client-visible baseline already in the store */ }
    return null;
  };

  // `changedFields` is the useForm tracked changed-set (dotted paths). When
  // supplied AND it resolves to ≥1 top-level section, we send a SECTION-DELTA:
  // only the changed sections, each as its WHOLE current value, with
  // sectionReplace:true. The server/client then overwrite those keys wholesale
  // (which is what lets deletions inside a section propagate). When omitted or
  // empty, we fall back to the legacy full-send (server defaults to
  // fullReplace=true when no `sectionReplace` flag is present).
  const updateScriptConfig = async (
    newConfig: Partial<T>,
    changedFields?: readonly string[]
  ): Promise<NuiResponse<T>> => {
    store.setState((prev) => ({ ...prev, ...newConfig }));

    const sections = changedTopLevelSections(changedFields);

    let payload: { data: Partial<T>; expectedVersion: number; sectionReplace?: boolean };
    if (sections.length > 0) {
      // Section-delta: flat object keyed by top-level section name → whole
      // current section value (pulled from the just-applied store state so it
      // reflects the user's edits, including deletions).
      const current = store.getState() as Record<string, unknown>;
      const delta: Record<string, unknown> = {};
      for (const key of sections) delta[key] = current[key];
      payload = { data: delta as Partial<T>, expectedVersion: clientVersion, sectionReplace: true };
    } else {
      // No changed-set provided (or nothing resolved) but the user explicitly
      // saved → legacy full-send. No sectionReplace flag ⇒ server fullReplace.
      payload = { data: newConfig, expectedVersion: clientVersion };
    }

    const response = await fetchNui<NuiResponse<T>>("UPDATE_SCRIPT_CONFIG", payload);

    if (response?.meta?.client_version != null) {
      clientVersion = response.meta.client_version as number;
    }

    if (response?.success === false && response?.meta?.latestData) {
      store.setState((prev) => ({ ...prev, ...(response.meta!.latestData as Partial<T>) }));
    }

    return response;
  };

  const getScriptConfigHistory = async (
    params: ScriptConfigHistoryRequest = {}
  ): Promise<ScriptConfigHistoryResponse> => {
    return fetchNui<ScriptConfigHistoryResponse>('GET_SCRIPT_CONFIG_HISTORY', params);
  };

  const resetConfig = async (): Promise<{ success: boolean; _error?: string }> => {
    const response = await fetchNui<{ success: boolean; _error?: string }>('RESET_SCRIPT_CONFIG');
    if (response?.success) {
      // Option B: after a reset the server restores defaults and broadcasts a
      // fresh client-visible UPDATE_SCRIPT_CONFIG push (handled in
      // useScriptConfigHooks → store baseline). We only need to re-merge the
      // server-only sliver onto that refreshed baseline to rebuild the full
      // editor view — no GET_FULL_SCRIPT_CONFIG round-trip. fetchServerOnly
      // merges onto whatever client-visible baseline is currently in the store,
      // so it's safe regardless of broadcast/callback ordering.
      await fetchServerOnlyScriptConfig();
    }
    return response;
  };

  _instance = {
    store,
    updateConfig: updateScriptConfig,
    resetConfig,
    getHistory: getScriptConfigHistory,
    fetchConfig: fetchScriptConfig,
    fetchServerOnly: fetchServerOnlyScriptConfig,
  };

  return {store, updateScriptConfig, resetConfig, getScriptConfigHistory, useScriptConfigHooks, fetchScriptConfig, fetchServerOnlyScriptConfig}
}
