import { useEffect } from "react";
import { isEnvBrowser } from "./misc";
import { useSettings } from "./useSettings";

/**
 * Simple wrapper around fetch API tailored for CEF/NUI use.
 */
export async function fetchNui<T = unknown>(
  eventName: string,
  data?: unknown,
  mockData?: T,
): Promise<T> {
  const options = {
    method: "post",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(data),
  };

  if (isEnvBrowser() && mockData !== undefined) return mockData;
  if (isEnvBrowser() && mockData === undefined) {
    console.warn(
      `[fetchNui] Called fetchNui for event "${eventName}" in browser environment without mockData. Returning empty object.`,
    );
    return {} as T;
  }

  const overrideResourceName = useSettings.getState().overideResourceName;

  const resourceName = (window as any).GetParentResourceName
    ? (window as any).GetParentResourceName()
    : overrideResourceName ? overrideResourceName : "dirk-cfx-react";
  try {
    const resp = await fetch(`https://${resourceName}/${eventName}`, options);
    return await resp.json();
  } catch {
    return (mockData ?? ({} as T));
  }
}

// -----------------------------
// Initial fetch registration
// -----------------------------
export type InitialFetch<T> = () => Promise<T>;
export const initialFetches: Record<string, InitialFetch<unknown>> = {};

/**
 * Registers an initial fetch that automatically uses fetchNui.
 * Works like:
 * ```ts
 * registerInitialFetch<{ name: string }>("MY_EVENT_NAME", undefined, { name: "Mocky" });
 * ```
 * and returns a Promise resolving to the same type as fetchNui.
 */
export async function registerInitialFetch<T = unknown>(
  eventName: string,
  data?: unknown,
  mockData?: T,
): Promise<T> {
  const fetcher = () => fetchNui<T>(eventName, data, mockData);
  initialFetches[eventName] = fetcher;
  return fetcher(); // run immediately if needed
}

/**
 * Runs all registered initial fetches in parallel.
 */
export async function runFetches() {
  return Promise.all(
    Object.entries(initialFetches).map(async ([eventName, fetcher]) => {
      const data = await fetcher();
      return { eventName, data };
    }),
  );
}

/**
 * React hook to automatically run all registered fetches on mount.
 */
export const useAutoFetcher = () => {
  useEffect(() => {
    if (isEnvBrowser()) return;
    runFetches().catch(() => {});
  }, []);
};


export const fetchLuaTable = <T>(tableName: string, mockData?: T): Promise<T> => {  
  return fetchNui<T>('FETCH_LUA_TABLE', { tableName }, mockData);
} 

export const registerInitialLuaTableFetch = <T>(tableName: string, mockData?: T): Promise<T> => { 
  return registerInitialFetch<T>('FETCH_LUA_TABLE', { tableName }, mockData);
} 



// useage example:
// registerInitialLuaTableFetch<{ [key: string]: string }>('my_lua_table', { key1: 'value1', key2: 'value2' }); 
