import { z } from "zod";

/**
 * Per-resource theme override block.
 *
 * Single source of truth for the shape + defaults that were previously
 * duplicated across `components/ThemeOverrideSection.tsx` and
 * `utils/useSettings.ts`. Both now import from here.
 *
 * Data shape (driven by a schema block on the consumer side):
 *   theme: {
 *     useOverride: boolean,
 *     primaryColor: string,    // "dirk" | "custom" | mantine palette name
 *     primaryShade: 0..9,
 *     customTheme: string[10], // hex stops
 *   }
 */

/**
 * The 10-stop hex palette used as the fallback custom theme. This exact tuple
 * was duplicated in ThemeOverrideSection (DEFAULT_PALETTE) and useSettings
 * (customTheme). Keep it as a 10-tuple — Mantine `MantineColorsTuple` expects
 * exactly ten stops.
 */
export const DEFAULT_PALETTE: string[] = [
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
];

/**
 * Zod schema for the theme override block. `customTheme` is validated as an
 * array of strings (the editor enforces the 10-length shape at the UI layer
 * by falling back to DEFAULT_PALETTE when the count is wrong).
 */
export const ThemeOverrideSchema = z.object({
  useOverride: z.boolean(),
  primaryColor: z.string(),
  primaryShade: z.number(),
  customTheme: z.array(z.string()),
});

export type ThemeOverrideValue = z.infer<typeof ThemeOverrideSchema>;

/**
 * Canonical default theme override block. Used as the merge fallback in
 * ThemeOverrideSection and (the palette portion) as the default custom theme
 * in useSettings.
 */
export const defaultThemeOverride: ThemeOverrideValue = {
  useOverride: false,
  primaryColor: "dirk",
  primaryShade: 5,
  customTheme: DEFAULT_PALETTE,
};
