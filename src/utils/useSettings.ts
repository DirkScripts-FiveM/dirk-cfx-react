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
