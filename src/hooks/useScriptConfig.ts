import { fetchNui } from "@/utils";
import { useNuiEvent } from "@/hooks/useNuiEvent";
import { create } from "zustand";

type ScriptSettingsUpdateMeta<T> = {
  client_version?: number;
  latestVersion?: number;
  latestData?: Partial<T>;
  changed_paths?: Array<{ path: string; old: unknown; new: unknown }>;
  lastEditor?: { source?: number; name?: string; identifier?: string };
};

export type ScriptSettingsHistoryChange = {
  path: string;
  old: unknown;
  new: unknown;
};

export type ScriptSettingsHistoryEntry = {
  at_unix: number;
  at_utc: string;
  script: string;
  admin?: { source?: number; name?: string; identifier?: string };
  expected_version?: number;
  applied_version?: number;
  changes: ScriptSettingsHistoryChange[];
};

export type ScriptSettingsHistoryRequest = {
  offset?: number;
  limit?: number;
  query?: string;
  path?: string;
  admin?: string;
  fromUnix?: number;
  toUnix?: number;
};

export type ScriptSettingsHistoryResponse = {
  success: boolean;
  _error?: string;
  data?: {
    items: ScriptSettingsHistoryEntry[];
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
  meta?: ScriptSettingsUpdateMeta<T>;
};

// ── Singleton registry ────────────────────────────────────────────────────────

export interface ScriptSettingsInstance<T = any> {
  store: { getState: () => T; setState: (partial: Partial<T> | ((prev: T) => T)) => void };
  updateSettings: (newSettings: Partial<T>) => Promise<NuiResponse<T>>;
  resetSettings: () => Promise<{ success: boolean; _error?: string }>;
  getHistory: (params?: ScriptSettingsHistoryRequest) => Promise<ScriptSettingsHistoryResponse>;
  fetchSettings: () => Promise<T | null>;
}

let _instance: ScriptSettingsInstance | null = null;

export function getScriptSettingsInstance<T = any>(): ScriptSettingsInstance<T> {
  if (!_instance) throw new Error("[dirk-cfx-react] createScriptSettings must be called before using SettingsPanel");
  return _instance as ScriptSettingsInstance<T>;
}

export function createScriptSettings<T>(defaultValue: T) {
  const store = create<T>(() => defaultValue);
  let clientVersion = 0;

  const useScriptSettingHooks = () => {
    useNuiEvent<{ settings?: Partial<T>; clientVersion?: number }>("UPDATE_SCRIPT_SETTINGS", (data) => {
      if (!data) return;

      if (typeof data.clientVersion === "number") {
        clientVersion = data.clientVersion as number;
      }

      if (data.settings && typeof data.settings === "object") {
        store.setState((prev) => ({ ...prev, ...(data.settings as Partial<T>) }));
      }
    });
  };

  const fetchScriptSettings = async (): Promise<T | null> => {
    try {
      const response = await fetchNui<{
        success: boolean;
        data?: { settings: T; clientVersion: number };
      }>("GET_FULL_SCRIPT_SETTINGS");

      if (response?.success && response.data?.settings) {
        store.setState(() => response.data!.settings as T);
        if (typeof response.data.clientVersion === "number") {
          clientVersion = response.data.clientVersion;
        }
        return response.data.settings;
      }
    } catch { /* fallback to current store state */ }
    return null;
  };

  const updateScriptSettings = async (newSettings: Partial<T>): Promise<NuiResponse<T>> => {
    store.setState((prev) => ({ ...prev, ...newSettings }));

    const response = await fetchNui<NuiResponse<T>>("UPDATE_SCRIPT_SETTINGS", {
      data: newSettings,
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

  const getScriptSettingsHistory = async (
    params: ScriptSettingsHistoryRequest = {}
  ): Promise<ScriptSettingsHistoryResponse> => {
    return fetchNui<ScriptSettingsHistoryResponse>('GET_SCRIPT_SETTINGS_HISTORY', params);
  };

  const resetSettings = async (): Promise<{ success: boolean; _error?: string }> => {
    const response = await fetchNui<{ success: boolean; _error?: string }>('RESET_SCRIPT_SETTINGS');
    if (response?.success) {
      const fresh = await fetchScriptSettings();
      if (fresh) {
        store.setState(() => fresh);
      }
    }
    return response;
  };

  _instance = {
    store,
    updateSettings: updateScriptSettings,
    resetSettings,
    getHistory: getScriptSettingsHistory,
    fetchSettings: fetchScriptSettings,
  };

  return {store, updateScriptSettings, resetSettings, getScriptSettingsHistory, useScriptSettingHooks, fetchScriptSettings}
} 


