import { create } from "zustand";
import { registerInitialFetch } from "./fetchNui";
import { MantineColorsTuple } from "@mantine/core";

export type SettingsState = {
  game: "fivem" | "rdr3";
  primaryColor: string;
  primaryShade: number;
  itemImgPath: string;
  customTheme?: MantineColorsTuple;
  overideResourceName?: string;
};

export const useSettings = create<SettingsState>(() => ({
  game: "fivem",
  primaryColor: "dirk",
  primaryShade: 9,
  itemImgPath: "",
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
//   console.log('Fetched settings:', data);
//     useSettings.setState({
//       ...data,
//     });
// })
