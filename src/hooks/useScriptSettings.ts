

// This is a function that you will call and it will return liek so 
// const {useScriptSettings, useScriptSettingHooks} = createScriptSettings<YourTypeHere>({
//   key1: 'your_unique_value1',
//   key2: {}
//     subKey1: 'your_unique_value2',
//     subKey2: 'your_unique_value3'
//   }
// })

import { fetchNui } from "@/utils";
import { useNuiEvent } from "@/hooks/useNuiEvent";
import { create, type StoreApi, type UseBoundStore } from "zustand";

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


export function createScriptSettings<T>(defaultValue: T) {
  const store = create<T>(() => defaultValue);
  let clientVersion = 0;

  const useScriptSettingHooks = () => {
    console.log("Setting up useNuiEvent for UPDATE_SCRIPT_SETTINGS");

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

  return {store, updateScriptSettings, getScriptSettingsHistory, useScriptSettingHooks}
} 


