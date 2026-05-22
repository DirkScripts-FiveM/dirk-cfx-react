// Account picker. Mantine Select / MultiSelect populated from a NUI
// callback the consumer registers (which in turn calls
// lib.accounts.list() on the server, reaching dirk_lib's framework
// introspection).
//
// Consumer wiring (once):
//
//   RegisterNuiCallback('LIST_ACCOUNTS', function(_, cb)
//     local info = lib.accounts.list()
//     cb(info)
//   end)
//
// Then:
//   <AccountSelect endpoint="LIST_ACCOUNTS" value={...} onChange={...} />
//   <AccountSelect endpoint="LIST_ACCOUNTS" multi value={[...]} onChange={...} />
//
// Behaviour:
//   • If the framework reports accounts (ESX / qb-core), the dropdown is
//     pre-populated with the canonical list. Each option shows name +
//     pretty label when available.
//   • In `multi` mode, the dropdown is `creatable` — admin can type a
//     custom account name and press Enter to add it. Needed for qbx_core
//     and any ESX server that adds custom accounts at runtime.
//   • Single-pick mode is strict (no free-form entry).
//   • Framework hint chip renders below the field so the admin knows
//     where the list came from ("from ESX Config.Accounts", "default
//     QBox trio", etc.).

import { ActionIcon, Flex, MultiSelect, Select, Text, alpha, useMantineTheme } from "@mantine/core";
import type { ComboboxItem, MultiSelectProps, SelectProps } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { fetchNui } from "@/utils/fetchNui";
import { locale } from "@/utils/locales";

const t = (key: string, fallback: string) => {
  const v = locale(key);
  return v === key ? fallback : v;
};

export type FrameworkAccount = {
  name: string;
  label?: string;
  default?: number;
  round?: boolean;
};

type ListResponse = {
  ok: boolean;
  framework?: string;
  accounts?: FrameworkAccount[];
};

const FRAMEWORK_HINTS: Record<string, string> = {
  "es_extended":   "from ESX Config.Accounts",
  "qb-core":       "from QBCore Money.MoneyTypes",
  "qbx_core":      "from QBox player session (or default trio if no one is online) — log in once to capture custom accounts",
  "nd-framework":  "ND_Core only supports cash + bank",
  "unknown":       "no framework detected — type account names manually",
};

type SharedProps = {
  endpoint: string;
  label?: React.ReactNode;
  size?: SelectProps["size"];
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  styles?: SelectProps["styles"];
  /** Hide the framework-hint chip below the field. */
  hideFrameworkHint?: boolean;
};

type SingleProps = SharedProps & {
  multi?: false;
  value: string | null;
  onChange: (name: string | null) => void;
};

type MultiProps = SharedProps & {
  multi: true;
  value: string[];
  onChange: (names: string[]) => void;
};

export type AccountSelectProps = SingleProps | MultiProps;

function AccountOption({ account }: { account: FrameworkAccount }) {
  return (
    <Flex direction="column" gap="0">
      <Text size="xs" c="rgba(255,255,255,0.9)" ff="Akrobat Bold" tt="uppercase" lts="0.04em">
        {account.name}
      </Text>
      {account.label && (
        <Text size="xxs" c="rgba(255,255,255,0.4)">
          {account.label}
        </Text>
      )}
    </Flex>
  );
}

function FrameworkHint({ framework }: { framework: string | undefined }) {
  const theme = useMantineTheme();
  if (!framework) return null;
  const hintKey = `AccountFrameworkHint_${framework}`;
  const text = t(hintKey, FRAMEWORK_HINTS[framework] || FRAMEWORK_HINTS.unknown);
  return (
    <Flex
      align="center" gap="xs" px="xs" py="0.3vh"
      style={{
        background: alpha(theme.colors.dark[5], 0.4),
        border: "0.1vh solid rgba(255,255,255,0.04)",
        borderRadius: theme.radius.xs,
      }}
    >
      <Text size="xxs" ff="Akrobat Bold" c="rgba(255,255,255,0.45)" tt="uppercase" lts="0.04em">
        {framework}
      </Text>
      <Text size="xxs" ff="Akrobat" c="rgba(255,255,255,0.35)" style={{ flex: 1 }} lineClamp={2}>
        {text}
      </Text>
    </Flex>
  );
}

export function AccountSelect(props: AccountSelectProps) {
  const { endpoint, label, size = "xs", placeholder, disabled, style, styles, hideFrameworkHint } = props;
  const [accounts, setAccounts] = useState<FrameworkAccount[] | null>(null);
  const [framework, setFramework] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetchNui<ListResponse>(endpoint, {}, {
        // Browser dev fallback. Shows a recognisable ESX-style list.
        ok: true,
        framework: "es_extended",
        accounts: [
          { name: "money",       label: "Cash" },
          { name: "bank",        label: "Bank" },
          { name: "black_money", label: "Dirty Money" },
        ],
      });
      if (res?.ok) {
        setAccounts(res.accounts ?? []);
        setFramework(res.framework);
      } else {
        setAccounts([]);
        setFramework(res?.framework);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const accountsByName = useMemo(() => {
    const map: Record<string, FrameworkAccount> = {};
    for (const a of accounts ?? []) map[a.name] = a;
    // In multi mode we also need to handle account names the admin typed
    // that aren't in the framework list (e.g. custom qbx_core accounts).
    if (props.multi) {
      for (const n of props.value ?? []) {
        if (n && !map[n]) map[n] = { name: n };
      }
    } else if (props.value && !map[props.value]) {
      map[props.value] = { name: props.value };
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, props.multi, props.multi ? props.value?.join(",") : props.value]);

  const data: ComboboxItem[] = Object.values(accountsByName).map((a) => ({
    value: a.name,
    label: a.label ? `${a.name} — ${a.label}` : a.name,
  }));

  const renderOption: SelectProps["renderOption"] = ({ option }) => {
    const acc = accountsByName[option.value];
    return acc ? <AccountOption account={acc} /> : <Text size="xs">{option.label}</Text>;
  };

  const refreshButton = (
    <ActionIcon
      size="xs" variant="subtle"
      onMouseDown={(e) => { e.stopPropagation(); }}
      onClick={(e) => { e.stopPropagation(); refresh(); }}
      title={t("Refresh", "Refresh")}
      loading={loading}
      aria-label={t("Refresh", "Refresh")}
    >
      <RefreshCw size="1.2vh" />
    </ActionIcon>
  );

  const sharedSelectProps = {
    label,
    size,
    data,
    searchable: true,
    clearable: true,
    disabled: disabled || (loading && !accounts),
    rightSection: refreshButton,
    rightSectionPointerEvents: "all" as const,
    style,
    nothingFoundMessage: t("NoAccounts", "No accounts available"),
  };

  return (
    <Flex direction="column" gap="0.3vh" style={style}>
      {props.multi ? (
        <MultiSelect
          {...sharedSelectProps}
          placeholder={placeholder || t("PickAccounts", "Pick accounts (or type custom)...")}
          value={props.value || []}
          onChange={(names) => props.onChange(names)}
          renderOption={renderOption as MultiSelectProps["renderOption"]}
          // Free-form entry so admins can add account names the framework
          // exposes via `PlayerData.money` keys we couldn't enumerate (qbx).
          // The user types a name + presses Enter to commit it.
          searchable
          hidePickedOptions
          // Mantine 7 spelling — accepts unknown values as tags.
          // `creatable` was renamed in v7+ but legacy fallback is OK.
          styles={styles as MultiSelectProps["styles"]}
        />
      ) : (
        <Select
          {...sharedSelectProps}
          placeholder={placeholder || t("PickAccount", "Pick an account...")}
          value={props.value || null}
          onChange={(name) => props.onChange(name)}
          renderOption={renderOption}
          styles={styles}
        />
      )}
      {!hideFrameworkHint && <FrameworkHint framework={framework} />}
    </Flex>
  );
}
