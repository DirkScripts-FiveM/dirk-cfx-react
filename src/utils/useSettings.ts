import { MantineColorsTuple } from "@mantine/core";
import { create } from "zustand";
import { DEFAULT_PALETTE } from "../types/theme";

export type SettingsState = {
  game: "fivem" | "rdr3";
  currency: string;
  primaryColor: string;
  primaryShade: number;
  itemImgPath: string;
  resourceVersion?: string;
  customTheme?: MantineColorsTuple;
  overideResourceName?: string;
  serverName?: string;
  logo?: string;
  language?: string;
  // Server environment detection, populated from dirk_lib's GET_SETTINGS
  // (lib.settings). Centralised here so any consumer/component can gate on the
  // framework/inventory without its own fetch.
  framework?: string;   // 'qb-core' | 'qbx_core' | 'es_extended' | ...
  inventory?: string;   // 'ox_inventory' | 'qb-inventory' | 'codem-inventory' | ...

  // Display units, owned by dirk_lib for the same reason `currency` is: a
  // server that runs in kilograms wants every dirk script to say kilograms,
  // and correcting that per script means correcting it forever. Optional
  // because an older dirk_lib does not send them -- fall back rather than
  // assume (`weightUnit ?? 'lb'`).
  weightUnit?: "kg" | "lb";
  distanceUnit?: "m" | "ft";
};

export const useSettings = create<SettingsState>(() => ({
  currency: "$",
  game: "fivem",
  primaryColor: "dirk",
  primaryShade: 9,
  itemImgPath: "",
  resourceVersion: "dev",
  customTheme: DEFAULT_PALETTE as unknown as MantineColorsTuple,
  // Match dirk_lib's own schema defaults, so a consumer rendering before
  // GET_SETTINGS resolves shows the same units it will show a moment later
  // rather than flickering from one to the other.
  weightUnit: "lb",
  distanceUnit: "m",
}));

// registerInitialFetch<Partial<SettingsState>>('GET_SETTINGS', undefined).then((data) => {
//     if (!data) {
//       console.warn('No settings data received from GET_SETTINGS fetch.');
//       return;
//     }
//     useSettings.setState({
//       ...data,
//     });
// })
