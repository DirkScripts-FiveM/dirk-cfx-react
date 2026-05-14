import { MantineColorsTuple } from "@mantine/core";
import { create } from "zustand";

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
  // When true, the resource has its own theme defined in scriptConfig and
  // global dirk_lib UPDATE_DIRK_LIB_SETTINGS pushes must not clobber the
  // local primaryColor / primaryShade / customTheme. The consumer's
  // GET_SETTINGS callback is responsible for setting this flag.
  themeOverride?: boolean;
};

export const useSettings = create<SettingsState>(() => ({
  currency: "$",
  game: "fivem",
  primaryColor: "dirk",
  primaryShade: 9,
  itemImgPath: "",
  resourceVersion: "dev",
  customTheme: [
    "#f0f4ff",
    "#d9e3ff",
    "#bfcfff",
    "#a6bbff",
    "#8ca7ff",
    "#7393ff",
    "#5a7fff",
    "#406bff",
    "#2547ff",
    "#0b33ff",
  ],
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
