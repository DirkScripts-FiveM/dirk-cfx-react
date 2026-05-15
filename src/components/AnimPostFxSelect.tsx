// FiveM AnimPostFX picker. Curated list from the altV docs + a few common
// community-known overlays (ULP_PlayerWakeUp etc.) grouped by use-case so
// admins building cutscenes can find "the wake-up effect" without reading
// 150 raw effect names.
//
// Single-value Select (the AnimpostfxPlay native takes one effect name).
// Custom uncatalogued values in `value` are preserved under a "Custom"
// group so old data with effect names we haven't catalogued still display.
//
// For full freedom (typing any arbitrary effect name), pass `creatable` —
// users can hit Enter on a search term to add it as a custom value.

import { Select } from "@mantine/core";
import type { SelectProps } from "@mantine/core";
import {
  GTA_ANIM_POST_FX,
  GTA_ANIM_POST_FX_GROUP_ORDER,
  formatGtaAnimPostFx,
  type GtaAnimPostFx,
  type GtaAnimPostFxGroup,
} from "@/utils/gtaAnimPostFx";

function buildGroupedData(extraNames: string[] = []) {
  const groups = new Map<GtaAnimPostFxGroup, GtaAnimPostFx[]>();
  const seen = new Set<string>();
  for (const fx of GTA_ANIM_POST_FX) {
    if (seen.has(fx.name)) continue;
    seen.add(fx.name);
    if (!groups.has(fx.group)) groups.set(fx.group, []);
    groups.get(fx.group)!.push(fx);
  }

  const data = GTA_ANIM_POST_FX_GROUP_ORDER.flatMap((g) => {
    const items = groups.get(g);
    if (!items || items.length === 0) return [];
    return [
      {
        group: g,
        items: items.map((fx) => ({
          value: fx.name,
          label: formatGtaAnimPostFx(fx.name),
        })),
      },
    ];
  });

  // Surface custom values so the dropdown still shows the current selection.
  // Mantine drops chips silently when the value isn't in the data array.
  const knownNames = new Set(GTA_ANIM_POST_FX.map((fx) => fx.name));
  const customs = extraNames.filter((n) => n && !knownNames.has(n));
  if (customs.length > 0) {
    data.push({
      group: "Custom" as GtaAnimPostFxGroup,
      items: customs.map((n) => ({ value: n, label: n })),
    });
  }

  return data;
}

export type AnimPostFxSelectProps = Omit<SelectProps, "data" | "value" | "onChange"> & {
  /** Current effect name. Empty string = no effect selected. */
  value: string;
  onChange: (name: string) => void;
};

export function AnimPostFxSelect({
  value,
  onChange,
  label = "Screen FX",
  size = "xs",
  searchable = true,
  clearable = true,
  ...rest
}: AnimPostFxSelectProps) {
  const data = buildGroupedData([value]);
  return (
    <Select
      label={label}
      size={size}
      searchable={searchable}
      clearable={clearable}
      maxDropdownHeight={320}
      nothingFoundMessage="No matching effects"
      placeholder="Pick an effect..."
      {...rest}
      data={data}
      value={value || null}
      onChange={(v) => onChange(v ?? "")}
    />
  );
}
