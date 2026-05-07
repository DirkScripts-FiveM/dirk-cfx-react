// FiveM control-id pickers. These are for the numeric control IDs you pass
// to IsControlPressed / DisableControlAction / EnableControlAction (the
// ones documented at https://docs.fivem.net/docs/game-references/controls/),
// not for keybind primary keys — for those use FiveMKeyBindInput.
//
// Two flavours:
//   • <ControlSelect>      — single id, returns number
//   • <ControlMultiSelect> — array of ids, returns number[]
//
// Both accept arbitrary Mantine Select / MultiSelect props so callers can
// style/portal/disable as they need. Custom (uncatalogued) IDs the data
// already contains in `value` are still rendered — they just appear in a
// "Custom" group so the user can see and remove them.

import { MultiSelect, Select } from "@mantine/core";
import type { MultiSelectProps, SelectProps } from "@mantine/core";
import {
  GTA_CONTROLS,
  GTA_CONTROL_GROUP_ORDER,
  formatGtaControl,
  type GtaControl,
  type GtaControlGroup,
} from "@/utils/gtaControls";

// Build the grouped Mantine data once per module-load. Each group entry is
// `{ group: name, items: [{ value, label }, ...] }`.
function buildGroupedData(extraIds: number[] = []) {
  // Dedupe by id — Mantine throws "Duplicate options" if two entries share
  // the same value. First occurrence wins so the catalogue order in
  // GTA_CONTROLS stays authoritative.
  const groups = new Map<GtaControlGroup, GtaControl[]>();
  const seen = new Set<number>();
  for (const c of GTA_CONTROLS) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    if (!groups.has(c.group)) groups.set(c.group, []);
    groups.get(c.group)!.push(c);
  }

  const data = GTA_CONTROL_GROUP_ORDER.flatMap((g) => {
    const items = groups.get(g);
    if (!items || items.length === 0) return [];
    return [
      {
        group: g,
        items: items.map((c) => ({
          value: String(c.id),
          label: formatGtaControl(c.id),
        })),
      },
    ];
  });

  // Surface custom (uncatalogued) ids in a "Custom" group so they're visible
  // in the dropdown rather than disappearing. Without this, MultiSelect drops
  // the chip silently when the value isn't in `data`.
  const knownIds = new Set(GTA_CONTROLS.map((c) => c.id));
  const customs = extraIds.filter((id) => !knownIds.has(id));
  if (customs.length > 0) {
    // The "Custom" group label is just a heading for unrecognised IDs the
    // caller has in their data — it's not a real GtaControlGroup, so cast
    // through unknown.
    data.push({
      group: "Custom" as unknown as GtaControlGroup,
      items: customs.map((id) => ({ value: String(id), label: `Control ${id}` })),
    });
  }

  return data;
}

// ── Single-control Select ──────────────────────────────────────────────────

export type ControlSelectProps = Omit<SelectProps, "data" | "value" | "onChange"> & {
  value: number | null | undefined;
  onChange: (id: number | null) => void;
};

export function ControlSelect({
  value,
  onChange,
  label = "Control",
  size = "xs",
  searchable = true,
  ...rest
}: ControlSelectProps) {
  const data = buildGroupedData(value != null ? [value] : []);
  return (
    <Select
      label={label}
      size={size}
      searchable={searchable}
      maxDropdownHeight={320}
      nothingFoundMessage="No matching controls"
      {...rest}
      data={data}
      value={value != null ? String(value) : null}
      onChange={(v) => onChange(v == null ? null : Number(v))}
    />
  );
}

// ── Multi-control MultiSelect ──────────────────────────────────────────────

export type ControlMultiSelectProps = Omit<MultiSelectProps, "data" | "value" | "onChange"> & {
  value: number[];
  onChange: (ids: number[]) => void;
};

export function ControlMultiSelect({
  value,
  onChange,
  label = "Controls",
  size = "xs",
  searchable = true,
  ...rest
}: ControlMultiSelectProps) {
  const data = buildGroupedData(value);
  return (
    <MultiSelect
      label={label}
      size={size}
      searchable={searchable}
      maxDropdownHeight={320}
      nothingFoundMessage="No matching controls"
      {...rest}
      data={data}
      value={value.map(String)}
      onChange={(vals) => onChange(vals.map((v) => Number(v)).filter((n) => Number.isFinite(n)))}
    />
  );
}
