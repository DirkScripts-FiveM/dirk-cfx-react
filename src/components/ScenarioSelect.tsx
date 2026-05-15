// FiveM scenario picker. Curated list from
// https://wiki.rage.mp/wiki/Scenarios (via DurtyFree's data dump) grouped by
// what the ped is actually doing — Sitting, Working, Sports, etc. — so admins
// building a scene can find "the chair with food" without scrolling 250
// alphabetical rows.
//
// Single-value Select (TaskStartScenarioInPlace/AtPosition takes one name).
// Custom values in `value` that don't match a catalogued scenario are kept
// in a "Custom" group so externally-loaded scenario keys still display.

import { Select } from "@mantine/core";
import type { SelectProps } from "@mantine/core";
import {
  GTA_SCENARIOS,
  GTA_SCENARIO_GROUP_ORDER,
  formatGtaScenario,
  type GtaScenario,
  type GtaScenarioGroup,
} from "@/utils/gtaScenarios";

function buildGroupedData(extraNames: string[] = []) {
  const groups = new Map<GtaScenarioGroup, GtaScenario[]>();
  const seen = new Set<string>();
  for (const sc of GTA_SCENARIOS) {
    if (seen.has(sc.name)) continue;
    seen.add(sc.name);
    if (!groups.has(sc.group)) groups.set(sc.group, []);
    groups.get(sc.group)!.push(sc);
  }

  const data = GTA_SCENARIO_GROUP_ORDER.flatMap((g) => {
    const items = groups.get(g);
    if (!items || items.length === 0) return [];
    return [
      {
        group: g,
        items: items.map((sc) => ({
          value: sc.name,
          label: sc.label ?? formatGtaScenario(sc.name),
        })),
      },
    ];
  });

  // Surface custom values so the dropdown still shows the current selection.
  // Mantine silently drops chips when the value isn't in the data array.
  const knownNames = new Set(GTA_SCENARIOS.map((sc) => sc.name));
  const customs = extraNames.filter((n) => n && !knownNames.has(n));
  if (customs.length > 0) {
    data.push({
      group: "Custom" as GtaScenarioGroup,
      items: customs.map((n) => ({ value: n, label: n })),
    });
  }

  return data;
}

export type ScenarioSelectProps = Omit<SelectProps, "data" | "value" | "onChange"> & {
  /** Current scenario name. Empty string = no scenario selected. */
  value: string;
  onChange: (name: string) => void;
};

export function ScenarioSelect({
  value,
  onChange,
  label = "Scenario",
  size = "xs",
  searchable = true,
  clearable = true,
  ...rest
}: ScenarioSelectProps) {
  const data = buildGroupedData([value]);
  return (
    <Select
      label={label}
      size={size}
      searchable={searchable}
      clearable={clearable}
      maxDropdownHeight={320}
      nothingFoundMessage="No matching scenarios"
      placeholder="Pick a scenario..."
      {...rest}
      data={data}
      value={value || null}
      onChange={(v) => onChange(v ?? "")}
    />
  );
}
