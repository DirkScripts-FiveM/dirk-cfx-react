// Group / rank pickers backed by lib.framework on the Lua side.
//
// Two usage modes:
//
// Compound (group + rank pair):
//   <GroupSelect value={{ name: 'police', grade: 2 }} onChange={setValue} type="job">
//     <GroupName />
//     <GroupRank />
//   </GroupSelect>
//
// Standalone (just the group name, no rank):
//   <GroupName value="police" onChange={setName} type="job" />
//
// <GroupRank> is compound-only — it reads the currently selected group
// from context and lists that group's grades. Throws when used outside.

import { Select } from "@mantine/core";
import React, { createContext, useContext } from "react";
import {
  FrameworkGroup,
  selectAllGroups,
  useFrameworkGroups,
} from "../utils/useFrameworkGroups";
import { locale } from "../utils/locales";

export type GroupValue = {
  name?: string;
  grade?: number;
};

export type GroupType = "job" | "gang";

type GroupSelectContextShape = {
  value: GroupValue;
  onChange: (next: GroupValue) => void;
  type?: GroupType;
};

const GroupSelectContext = createContext<GroupSelectContextShape | null>(null);

// ── <GroupSelect> ────────────────────────────────────────────────────────────
// Wrapper that owns the {name, grade} pair and exposes it to children via
// context. Renders nothing of its own — children handle presentation. Pass
// any layout props through `style` if needed (e.g. width).

export type GroupSelectProps = {
  value: GroupValue;
  onChange: (next: GroupValue) => void;
  type?: GroupType;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export function GroupSelect({
  value,
  onChange,
  type,
  children,
  style,
}: GroupSelectProps) {
  return (
    <GroupSelectContext.Provider value={{ value, onChange, type }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4vh", ...style }}>
        {children}
      </div>
    </GroupSelectContext.Provider>
  );
}

// ── filtering ────────────────────────────────────────────────────────────────

function filterByType(
  jobs: FrameworkGroup[],
  gangs: FrameworkGroup[],
  type?: GroupType,
): FrameworkGroup[] {
  if (type === "job") return jobs;
  if (type === "gang") return gangs;
  return [...jobs, ...gangs];
}

// ── <GroupName> ──────────────────────────────────────────────────────────────
// Group dropdown. Works standalone (own value/onChange) OR inside
// <GroupSelect> (reads context, ignores standalone props). When the name
// changes inside compound mode, the grade is reset to undefined since the
// previous grade key may not exist in the new group.

export type GroupNameProps = {
  value?: string;
  onChange?: (name: string) => void;
  type?: GroupType;
  label?: string;
  description?: string;
  placeholder?: string;
  size?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
};

export function GroupName(props: GroupNameProps) {
  const ctx = useContext(GroupSelectContext);
  const jobs = useFrameworkGroups((s) => s.jobs);
  const gangs = useFrameworkGroups((s) => s.gangs);

  const inCompound = ctx !== null;
  const currentValue = inCompound ? ctx!.value.name : props.value;
  const filterType = inCompound ? ctx!.type : props.type;

  const list = filterByType(jobs, gangs, filterType);

  // When type is undefined we render Mantine's grouped data shape so the
  // user sees Jobs / Gangs sections in the dropdown.
  const data =
    filterType === undefined
      ? [
          { group: locale("Jobs") || "Jobs", items: jobs.map((g) => ({ value: g.name, label: g.label })) },
          { group: locale("Gangs") || "Gangs", items: gangs.map((g) => ({ value: g.name, label: g.label })) },
        ]
      : list.map((g) => ({ value: g.name, label: g.label }));

  return (
    <Select
      label={props.label}
      description={props.description}
      placeholder={props.placeholder ?? (locale("SelectGroup") || "Select…")}
      size={props.size ?? "xs"}
      disabled={props.disabled}
      style={props.style}
      data={data as any}
      value={currentValue ?? null}
      searchable
      onChange={(v) => {
        const name = v ?? "";
        if (inCompound) {
          // Reset grade when the group changes — old grade likely invalid.
          ctx!.onChange({ name: name || undefined, grade: undefined });
        } else if (props.onChange) {
          props.onChange(name);
        }
      }}
      allowDeselect={false}
    />
  );
}

// ── <GroupRank> ──────────────────────────────────────────────────────────────
// Grade dropdown for the currently-selected group. Compound-only. Disabled
// when no group is selected or the group has no grades.

export type GroupRankProps = {
  label?: string;
  description?: string;
  placeholder?: string;
  size?: string;
  style?: React.CSSProperties;
};

export function GroupRank(props: GroupRankProps) {
  const ctx = useContext(GroupSelectContext);
  if (ctx === null) {
    throw new Error("<GroupRank> must be a child of <GroupSelect>");
  }
  const jobs = useFrameworkGroups((s) => s.jobs);
  const gangs = useFrameworkGroups((s) => s.gangs);

  const all = [...jobs, ...gangs];
  const selectedGroup = all.find((g) => g.name === ctx.value.name) ?? null;
  const grades = selectedGroup?.grades ?? [];

  const data = grades.map((g) => ({
    value: String(g.grade),
    label: `${g.grade} — ${g.label || g.name}${g.isBoss ? " (boss)" : ""}`,
  }));

  return (
    <Select
      label={props.label}
      description={props.description}
      placeholder={props.placeholder ?? (locale("SelectGrade") || "Select grade…")}
      size={props.size ?? "xs"}
      style={props.style}
      data={data}
      value={ctx.value.grade != null ? String(ctx.value.grade) : null}
      onChange={(v) => {
        ctx.onChange({
          ...ctx.value,
          grade: v != null ? Number(v) : undefined,
        });
      }}
      disabled={!selectedGroup || grades.length === 0}
      allowDeselect={false}
    />
  );
}

// Convenience namespace export so consumers can write
// `<GroupSelect.Name>` / `<GroupSelect.Rank>` if they prefer.
GroupSelect.Name = GroupName;
GroupSelect.Rank = GroupRank;
