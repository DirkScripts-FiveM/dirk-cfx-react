// Player picker. Drop-in Mantine <Select> wrapper around usePlayers().
//
// Default mode (online only):
//   <PlayerSelect value={citizenId} onChange={p => set('owner', p?.id)} />
//
// Search-driven offline support (includes the persistent players table):
//   <PlayerSelect includeOffline value={citizenId} onChange={p => set('owner', p?.citizenId)} />
//
// `value` is a citizenId string (or null). `onChange` receives the full
// Player object so callers pick what to persist — server id for live
// targeting, citizenId for persistent ownership.
//
// Each row renders with a colored status dot on the right:
//   • green for online   (id is non-null)
//   • red   for offline  (id is null)
//
// In offline mode, typing into the input triggers debounced server-side
// searches (300ms). react-query caches each unique search so retyping is
// instant. A 🔄 refresh button in the rightSection forces a fresh fetch.

import { ActionIcon, Group, Loader, Select, Text, type SelectProps, useMantineTheme } from "@mantine/core";
import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePlayers, type Player } from "../../hooks/usePlayers";

export type PlayerSelectProps = Omit<SelectProps, "data" | "value" | "onChange" | "rightSection" | "renderOption"> & {
  value: string | null;
  onChange: (player: Player | null) => void;
  /** When true, runs a DB-backed search across offline + online. Enables
   *  the search box behaviour. Default false (online only). */
  includeOffline?: boolean;
  /** Cap on results returned (max 50, server-enforced). */
  limit?: number;
  /** Localisable label overrides. Defaults are English. Pass locale()'d
   *  strings from the consumer to translate the dropdown chrome. */
  loadingLabel?: string;
  onlineLabel?: string;
  offlineLabel?: string;
  refreshLabel?: string;
};

const DEBOUNCE_MS = 300;
const ONLINE_COLOR = "#3FA83F";   // green
const OFFLINE_COLOR = "#E54141";  // red

export function PlayerSelect({
  value,
  onChange,
  includeOffline = false,
  limit = 50,
  searchable: searchableProp,
  placeholder,
  nothingFoundMessage: nothingFoundMessageProp,
  loadingLabel = "Loading…",
  onlineLabel = "Online",
  offlineLabel = "Offline",
  refreshLabel = "Refresh player list",
  ...rest
}: PlayerSelectProps) {
  const theme = useMantineTheme();
  const color = theme.colors[theme.primaryColor][5];

  // Local search input + debounced version we feed the hook — avoids a
  // request per keystroke.
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { players, isFetching, refresh } = usePlayers({
    includeOffline,
    search: includeOffline ? debouncedSearch : undefined,
    limit,
  });

  // Online first, then alphabetical by charName — admins want to see the
  // currently-connected players at the top of the list.
  const sortedPlayers = useMemo(
    () =>
      [...players].sort((a, b) => {
        if (a.online !== b.online) return a.online ? -1 : 1;
        return a.charName.localeCompare(b.charName);
      }),
    [players],
  );

  const playerByCitizen = useMemo(() => {
    const m = new Map<string, Player>();
    for (const p of sortedPlayers) m.set(p.citizenId, p);
    return m;
  }, [sortedPlayers]);

  const data = useMemo(() => {
    const items = sortedPlayers.map((p) => ({
      value: p.citizenId,
      label: formatLabel(p),
    }));
    // If the controlled value isn't in the current player list (e.g. a
    // persistent lab owner who isn't online and hasn't been searched yet),
    // inject a synthetic option so Mantine can render the value text
    // instead of falling back to the placeholder.
    if (value && !items.some((i) => i.value === value)) {
      items.unshift({ value, label: value });
    }
    return items;
  }, [sortedPlayers, value]);

  const selectedPlayer = value ? playerByCitizen.get(value) ?? null : null;
  const selectedLabel = selectedPlayer ? formatLabel(selectedPlayer) : null;

  // Debounce the search → debouncedSearch. Short-circuit when the input
  // exactly matches the currently-selected player's formatted label —
  // Mantine auto-fills the search input with the selected option's label
  // after a pick, and we don't want that to trigger a phantom search
  // (which would empty the data list, fall back to the synthetic option
  // with raw citizenId, then flip back via keepPreviousData → visible
  // label cycling between formatted name and raw id).
  useEffect(() => {
    if (!includeOffline) return;
    if (selectedLabel && searchInput === selectedLabel) return;
    const t = setTimeout(() => setDebouncedSearch(searchInput), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput, includeOffline, selectedLabel]);

  // Custom row renderer — name on the left, colored dot on the right.
  const renderOption: SelectProps["renderOption"] = ({ option }) => {
    const p = playerByCitizen.get(option.value);
    if (!p) return option.label;
    return (
      <Group justify="space-between" wrap="nowrap" gap="xs" style={{ width: "100%" }}>
        <Text size="xs" truncate style={{ flex: 1 }}>
          {formatLabel(p)}
        </Text>
        <StatusDot online={p.online} onlineLabel={onlineLabel} offlineLabel={offlineLabel} />
      </Group>
    );
  };

  return (
    <Select
      {...rest}
      data={data}
      value={value ?? null}
      onChange={(v) => {
        if (!v) return onChange(null);
        const player = playerByCitizen.get(v) ?? null;
        onChange(player);
      }}
      searchable={searchableProp ?? true}
      searchValue={includeOffline ? searchInput : undefined}
      onSearchChange={includeOffline ? setSearchInput : undefined}
      placeholder={placeholder}
      nothingFoundMessage={isFetching ? loadingLabel : (nothingFoundMessageProp ?? "No players found")}
      maxDropdownHeight={300}
      renderOption={renderOption}
      leftSection={selectedPlayer ? <StatusDot online={selectedPlayer.online} onlineLabel={onlineLabel} offlineLabel={offlineLabel} /> : undefined}
      rightSectionWidth="3.5vh"
      rightSectionPointerEvents="all"
      rightSection={
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            refresh();
          }}
          aria-label={refreshLabel}
          title={refreshLabel}
          style={{ marginRight: "0.6vh" }}
        >
          {isFetching ? <Loader size="1.2vh" color={color} /> : <RefreshCw size="1.4vh" color={color} />}
        </ActionIcon>
      }
    />
  );
}

function StatusDot({ online, onlineLabel, offlineLabel }: { online: boolean; onlineLabel: string; offlineLabel: string }) {
  return (
    <span
      title={online ? onlineLabel : offlineLabel}
      style={{
        display: "inline-block",
        width: "0.9vh",
        height: "0.9vh",
        borderRadius: "50%",
        backgroundColor: online ? ONLINE_COLOR : OFFLINE_COLOR,
        boxShadow: `0 0 0.4vh ${online ? ONLINE_COLOR : OFFLINE_COLOR}`,
        flexShrink: 0,
      }}
    />
  );
}

function formatLabel(p: Player): string {
  // "John Doe · Dirk · #42"   (online with display name)
  // "John Doe · #42"          (online, blank display name)
  // "John Doe"                (offline)
  const parts: string[] = [p.charName || p.citizenId];
  if (p.online) {
    if (p.name) parts.push(p.name);
    if (p.id != null) parts.push(`#${p.id}`);
  }
  return parts.join(" · ");
}
