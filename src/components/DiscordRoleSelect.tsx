// Discord role picker. Mantine Select / MultiSelect populated from a NUI
// callback the consumer registers (which in turn calls lib.discord.getRoles
// on the server). Each role shows its actual Discord colour as a swatch.
//
// The consumer wires up the NUI side once:
//
//   RegisterNuiCallback('LIST_DISCORD_ROLES', function(_, cb)
//     local roles, err = lib.callback.await('myresource:listDiscordRoles')
//     cb({ ok = roles ~= nil, _error = err, roles = roles or {} })
//   end)
//
//   server callback:
//   lib.callback.register('myresource:listDiscordRoles', function(src)
//     -- (admin perm check here)
//     local roles, err = lib.discord.getRoles()
//     return roles, err
//   end)
//
// And then renders:
//   <DiscordRoleSelect endpoint="LIST_DISCORD_ROLES" value={...} onChange={...} />
//
// When lib.discord returns 'NotConfigured' the picker swaps in a friendly
// banner pointing the admin at /dirk_lib so they go set credentials.

import { ActionIcon, Flex, MultiSelect, Select, Text } from "@mantine/core";
import type { ComboboxItem, SelectProps, MultiSelectProps } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { fetchNui } from "@/utils/fetchNui";
import { locale } from "@/utils/locales";

// locale() returns the **key itself** on miss (see utils/locales.ts), so the
// classic `locale(k) || fallback` pattern never falls through. This helper
// returns `fallback` whenever locale gave us the key back unchanged.
const t = (key: string, fallback: string) => {
  const v = locale(key);
  return v === key ? fallback : v;
};

// Subset of the Discord role payload we actually use. Everything else
// (mentionable, hoist, permissions, etc.) is on the server-side cache;
// the picker only needs id/name/colour/position.
export type DiscordRole = {
  id: string;
  name: string;
  color: number;        // 24-bit integer; 0 = no colour (Discord default)
  position?: number;
};

type ListResponse = {
  ok: boolean;
  _error?: string;
  roles?: DiscordRole[];
};

function decimalToHex(color: number): string | null {
  if (!color || color === 0) return null;
  return "#" + color.toString(16).padStart(6, "0");
}

// Custom option renderer — swatch + role name. Falls back to a neutral
// grey dot when the role has no Discord colour set (decimal 0).
function RoleOption({ role }: { role: DiscordRole }) {
  const swatch = decimalToHex(role.color) || "rgba(255,255,255,0.25)";
  return (
    <Flex align="center" gap="0.6vh">
      <div
        style={{
          width: "1vh",
          height: "1vh",
          borderRadius: "50%",
          background: swatch,
          flexShrink: 0,
          boxShadow: role.color ? `0 0 0.4vh ${swatch}` : undefined,
        }}
      />
      <Text size="xs" c="rgba(255,255,255,0.9)">
        {role.name}
      </Text>
    </Flex>
  );
}

// Styling shared by the not-configured stand-in — a disabled Select that
// shares the exact same shell as a real picker, so neighbouring inputs
// (e.g. a NumberInput sitting next to us in a flex row) line up. The tint
// is a subtle amber so the admin notices it's degraded without losing
// the form's visual rhythm.
const NOT_CONFIGURED_TINT = "rgba(255,184,0,0.35)";
const NOT_CONFIGURED_FILL = "rgba(255,184,0,0.05)";

type SharedProps = {
  /** NUI callback name registered by the consumer that returns ListResponse. */
  endpoint: string;
  /** Optional label / size / placeholder forwarded to the underlying Mantine Select. */
  label?: React.ReactNode;
  size?: SelectProps["size"];
  placeholder?: string;
  disabled?: boolean;
  /** Style props applied to the wrapping Select/MultiSelect. */
  style?: React.CSSProperties;
  styles?: SelectProps["styles"];
};

type SingleProps = SharedProps & {
  multi?: false;
  value: string | null;
  onChange: (id: string | null) => void;
};

type MultiProps = SharedProps & {
  multi: true;
  value: string[];
  onChange: (ids: string[]) => void;
};

export type DiscordRoleSelectProps = SingleProps | MultiProps;

export function DiscordRoleSelect(props: DiscordRoleSelectProps) {
  const { endpoint, label, size = "xs", placeholder, disabled, style, styles } = props;
  const [roles, setRoles] = useState<DiscordRole[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetchNui<ListResponse>(endpoint, {}, {
        // Browser dev fallback so the component renders something useful
        // outside FiveM.
        ok: true,
        roles: [
          { id: "1", name: "Admin",    color: 0xed4245, position: 5 },
          { id: "2", name: "VIP Gold", color: 0xfaa61a, position: 4 },
          { id: "3", name: "Member",   color: 0x57f287, position: 3 },
          { id: "4", name: "Guest",    color: 0,        position: 2 },
        ],
      });
      if (res?.ok) {
        setRoles(res.roles ?? []);
        setErrorCode(null);
      } else {
        setRoles(null);
        setErrorCode(res?._error || "FetchFailed");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const rolesById = useMemo(() => {
    const map: Record<string, DiscordRole> = {};
    for (const r of roles ?? []) map[r.id] = r;
    return map;
  }, [roles]);

  // Show a disabled stand-in instead of a broken empty picker. Uses the
  // exact same Mantine Select/MultiSelect shell as the real component so
  // neighbouring inputs (NumberInputs in the same flex row, etc.) line up
  // pixel-for-pixel — only the input border tints amber to signal "not
  // wired up yet, see /dirk_lib".
  if (errorCode === "NotConfigured") {
    const notConfiguredPlaceholder = t(
      "DiscordNotConfigured",
      "Not configured — set in /dirk_lib",
    );
    const notConfiguredStyles = {
      ...(styles as Record<string, unknown> | undefined),
      input: {
        ...((styles as { input?: Record<string, unknown> } | undefined)?.input ?? {}),
        borderColor: NOT_CONFIGURED_TINT,
        backgroundColor: NOT_CONFIGURED_FILL,
      },
    } as SelectProps["styles"];
    const warnIcon = (
      <AlertTriangle size="1.2vh" color={NOT_CONFIGURED_TINT.replace(/0\.35\)$/, "0.85)")} />
    );
    if (props.multi) {
      return (
        <MultiSelect
          label={label}
          size={size}
          placeholder={notConfiguredPlaceholder}
          data={[]}
          value={[]}
          onChange={() => {}}
          disabled
          rightSection={warnIcon}
          style={style}
          styles={notConfiguredStyles as MultiSelectProps["styles"]}
        />
      );
    }
    return (
      <Select
        label={label}
        size={size}
        placeholder={notConfiguredPlaceholder}
        data={[]}
        value={null}
        onChange={() => {}}
        disabled
        rightSection={warnIcon}
        style={style}
        styles={notConfiguredStyles}
      />
    );
  }

  // Mantine Select expects {value, label} options. We also pass the role
  // object inline so the custom renderer can read the colour.
  const data: ComboboxItem[] = (roles ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));

  const renderOption: SelectProps["renderOption"] = ({ option }) => {
    const role = rolesById[option.value];
    return role ? <RoleOption role={role} /> : <Text size="xs">{option.label}</Text>;
  };

  // Mantine Select default `rightSectionPointerEvents="none"` makes the
  // icon visual-only — clicks fall through to the combobox toggle. We
  // explicitly enable pointer events here so the refresh button actually
  // refreshes, and stopPropagation prevents the dropdown from opening
  // when the icon is clicked.
  const refreshButton = (
    <ActionIcon
      size="xs"
      variant="subtle"
      onMouseDown={(e) => { e.stopPropagation(); }}
      onClick={(e) => { e.stopPropagation(); refresh(); }}
      title={t("Refresh", "Refresh")}
      loading={loading}
      aria-label={t("Refresh", "Refresh")}
    >
      <RefreshCw size="1.2vh" />
    </ActionIcon>
  );

  if (props.multi) {
    return (
      <MultiSelect
        label={label}
        size={size}
        placeholder={placeholder || t("PickRoles", "Pick roles...")}
        data={data}
        value={props.value || []}
        onChange={(ids) => props.onChange(ids)}
        renderOption={renderOption as MultiSelectProps["renderOption"]}
        searchable
        clearable
        disabled={disabled || (loading && !roles)}
        rightSection={refreshButton}
        rightSectionPointerEvents="all"
        style={style}
        styles={styles as MultiSelectProps["styles"]}
        nothingFoundMessage={
          errorCode
            ? `${t("Error", "Error")} (${errorCode})`
            : t("NoRoles", "No roles found")
        }
      />
    );
  }

  return (
    <Select
      label={label}
      size={size}
      placeholder={placeholder || t("PickRole", "Pick a role...")}
      data={data}
      value={props.value || null}
      onChange={(id) => props.onChange(id)}
      renderOption={renderOption}
      searchable
      clearable
      disabled={disabled || (loading && !roles)}
      rightSection={refreshButton}
      rightSectionPointerEvents="all"
      style={style}
      styles={styles}
      nothingFoundMessage={
        errorCode
          ? `${t("Error", "Error")} (${errorCode})`
          : t("NoRoles", "No roles found")
      }
    />
  );
}
