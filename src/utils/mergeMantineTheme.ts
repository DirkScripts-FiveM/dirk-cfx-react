import type { MantineColorsTuple, MantineThemeOverride } from "@mantine/core";

const isValidColorScale = (v: unknown): v is MantineColorsTuple =>
  Array.isArray(v) && v.length === 10 && v.every((shade) => typeof shade === "string");

export function mergeMantineThemeSafe(
  base: MantineThemeOverride,
  custom?: MantineColorsTuple,
  override?: MantineThemeOverride
): MantineThemeOverride {
  const colors = { ...base.colors };

  if (custom && isValidColorScale(custom)) {
    colors["custom"] = custom;
  } else if (!colors["custom"]) {
    // Always register a "custom" entry so primaryColor === "custom" never
    // points at undefined and silently falls back to Mantine's default
    // (which surfaces as "the configured palette didn't apply").
    const fallback = (base.colors && (base.colors as any).dirk) as MantineColorsTuple | undefined;
    if (fallback && isValidColorScale(fallback)) {
      colors["custom"] = fallback;
    }
  }

  return {
    ...base,
    ...override,
    colors: {
      ...colors,
      ...(override?.colors ?? {}),
    },
  };
}
