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
};

export const useSettings = create<SettingsState>(() => ({
  currency: "$",
  game: "fivem",
  primaryColor: "dirk",
  primaryShade: 9,
  itemImgPath: "",
  resourceVersion: "dev",
  customTheme: DEFAULT_PALETTE as unknown as MantineColorsTuple,
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
