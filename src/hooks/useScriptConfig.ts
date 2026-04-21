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

// ── Singleton registry ────────────────────────────────────────────────────────

export interface ScriptConfigInstance<T = any> {
  store: { getState: () => T; setState: (partial: Partial<T> | ((prev: T) => T)) => void };
  updateConfig: (newConfig: Partial<T>) => Promise<NuiResponse<T>>;
  resetConfig: () => Promise<{ success: boolean; _error?: string }>;
  getHistory: (params?: ScriptConfigHistoryRequest) => Promise<ScriptConfigHistoryResponse>;
  fetchConfig: () => Promise<T | null>;
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
    useNuiEvent<{ config?: Partial<T>; clientVersion?: number }>("UPDATE_SCRIPT_CONFIG", (data) => {
      if (!data) return;

      if (typeof data.clientVersion === "number") {
        clientVersion = data.clientVersion as number;
      }

      if (data.config && typeof data.config === "object") {
        store.setState((prev) => ({ ...prev, ...(data.config as Partial<T>) }));
      }
    });
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

  const updateScriptConfig = async (newConfig: Partial<T>): Promise<NuiResponse<T>> => {
    store.setState((prev) => ({ ...prev, ...newConfig }));

    const response = await fetchNui<NuiResponse<T>>("UPDATE_SCRIPT_CONFIG", {
      data: newConfig,
      expectedVersion: clientVersion,
    });

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
      const fresh = await fetchScriptConfig();
      if (fresh) {
        store.setState(() => fresh);
      }
    }
    return response;
  };

  _instance = {
    store,
    updateConfig: updateScriptConfig,
    resetConfig,
    getHistory: getScriptConfigHistory,
    fetchConfig: fetchScriptConfig,
  };

  return {store, updateScriptConfig, resetConfig, getScriptConfigHistory, useScriptConfigHooks, fetchScriptConfig}
}
