// Per-resource ACCESS-OVERRIDES editor. Rendered inside a consumer resource's
// configurator (e.g. dirk_weed, dirk_fishing) to let admins grant access to a
// resource's admin/config panel to specific ACE groups/permissions and
// individual players (by identifier) — on top of whatever dirk_lib's global
// admin gate already allows.
//
// Data shape (driven by a schema block on the consumer side):
//   access: {
//     groups: string[],        // ACE groups / permissions, checked server-side
//                              // via IsPlayerAceAllowed (e.g. group.admin,
//                              // dirkscripts.command.fishing). NOT jobs/gangs.
//     identifiers: string[],   // persistent player ids as PlayerSelect yields
//                              // them — citizenid (qb/qbx) or license (esx).
//   }
//
// dirk_lib's server-side check matches each stored id against BOTH the
// framework's persistent id (lib.player.identifier — what we store here, so it
// works even for players granted while offline) AND raw FiveM identifiers
// (GetPlayerIdentifiers — license:/discord:/…), so a hand-entered license: also
// works.
//
// Editor-ONLY. This component just edits the block — it does NOT enforce
// anything. Enforcement is entirely server-side in dirk_lib, which reads the
// same scriptConfig path and decides whether a given source is allowed.
//
// Mirrors ThemeOverrideSection's idiom: AdminPageTitle header, a short
// description, then editable rows. Each list normalises against an empty array
// so the inputs always render even before the schema block hydrates.

import { ActionIcon, alpha, Flex, Text, TextInput, useMantineTheme } from "@mantine/core";
import { ShieldCheck, Plus, Trash2, Users, UserRound } from "lucide-react";
import { useState } from "react";
import { useFormActions, useFormField } from "@/hooks/useForm";
import { locale } from "@/utils/locales";
import { AdminPageTitle } from "./AdminPageTitle";
import { PlayerSelect } from "./AdminTools/PlayerSelect";

// Common ACE groups offered as one-click quick-adds. Access is enforced
// server-side via IsPlayerAceAllowed, so these are ACE group/permission
// strings — NOT in-game jobs/gangs.
const COMMON_ACE_GROUPS = ["group.admin", "group.mod", "group.superadmin"];

// locale() returns the **key itself** on miss (see utils/locales.ts), so the
// classic `locale(k) || fallback` pattern never falls through. This helper
// returns `fallback` whenever locale gave us the key back unchanged.
const t = (key: string, fallback: string) => {
  const v = locale(key);
  return v === key ? fallback : v;
};

export type AccessOverrideValue = {
  /** ACE groups / permissions allowed to access this resource. Checked
   *  server-side via IsPlayerAceAllowed (e.g. group.admin). NOT jobs/gangs. */
  groups: string[];
  /** Persistent player ids (citizenid on qb/qbx, license on esx — what
   *  PlayerSelect yields). dirk_lib also matches raw FiveM identifiers. */
  identifiers: string[];
};

const DEFAULT_VALUE: AccessOverrideValue = {
  groups: [],
  identifiers: [],
};

function SectionLabel({ icon: Icon, label }: { icon: typeof Users; label: string }) {
  return (
    <Flex align="center" gap="xs" mt="xs">
      <Icon size="1.4vh" color="rgba(255,255,255,0.3)" />
      <Text ff="Akrobat Bold" size="xxs" tt="uppercase" lts="0.07em" c="rgba(255,255,255,0.2)">
        {label}
      </Text>
      <div style={{ flex: 1, height: "0.05vh", background: "rgba(255,255,255,0.06)" }} />
    </Flex>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <Text ff="Akrobat Bold" size="xxs" c="rgba(255,255,255,0.25)" ta="center" py="xs">
      {text}
    </Text>
  );
}

export type AccessOverrideSectionProps = {
  /**
   * Schema path the consumer stores its access block under. Defaults to
   * "access" — matches the recommended schema key.
   */
  schemaKey?: string;
  /**
   * Optional title for the AdminPageTitle. Defaults to the localized
   * "Access" string with a fallback.
   */
  title?: string;
  /**
   * Optional description shown under the title. Defaults to a localized
   * explanation with a fallback.
   */
  description?: string;
  /**
   * When true, the player picker searches offline players (DB-backed) too.
   * Defaults to true so admins can grant access to players who aren't online.
   */
  includeOffline?: boolean;
};

export function AccessOverrideSection({
  schemaKey = "access",
  title,
  description,
  includeOffline = true,
}: AccessOverrideSectionProps) {
  const mantineTheme = useMantineTheme();
  const color = mantineTheme.colors[mantineTheme.primaryColor][5];

  const raw = useFormField<Record<string, AccessOverrideValue>>(schemaKey as never) as
    | Partial<AccessOverrideValue>
    | undefined;

  // Normalise — the form field could be undefined at first paint, and either
  // inner array could be missing if the schema default block hasn't fully
  // hydrated. Merge against DEFAULT_VALUE so the lists always render.
  const value: AccessOverrideValue = {
    groups: Array.isArray(raw?.groups) ? (raw!.groups as string[]) : DEFAULT_VALUE.groups,
    identifiers: Array.isArray(raw?.identifiers)
      ? (raw!.identifiers as string[])
      : DEFAULT_VALUE.identifiers,
  };

  const { setValue } = useFormActions<Record<string, AccessOverrideValue>>();
  const set = <K extends keyof AccessOverrideValue>(key: K, val: AccessOverrideValue[K]) =>
    setValue(schemaKey as never, { ...value, [key]: val } as never);

  // An in-progress "add" row is LOCAL state only — it isn't written to the form
  // (and so never persists an empty "" entry to the DB) until a real value is
  // picked. Committed rows live in the form. Only one pending add row per list.
  const [addingGroup, setAddingGroup] = useState(false);
  const [addingPlayer, setAddingPlayer] = useState(false);

  // ── groups (ACE) ──────────────────────────────────────────────────────────
  const commitGroup = (name: string) => {
    const g = name.trim();
    if (!g) return;
    if (!value.groups.includes(g)) set("groups", [...value.groups, g]);
    setAddingGroup(false);
  };
  const setGroup = (index: number, name: string) => {
    const next = [...value.groups];
    next[index] = name;
    set("groups", next);
  };
  // Quick-add a common ACE group; skip if it's already present.
  const quickAddGroup = (name: string) => {
    if (value.groups.includes(name)) return;
    set("groups", [...value.groups, name]);
  };
  const removeGroup = (index: number) =>
    set("groups", value.groups.filter((_, i) => i !== index));

  // ── identifiers ─────────────────────────────────────────────────────────
  const commitIdentifier = (id: string) => {
    if (!id) return;
    set("identifiers", [...value.identifiers, id]);
    setAddingPlayer(false);
  };
  const setIdentifier = (index: number, id: string) => {
    const next = [...value.identifiers];
    next[index] = id;
    set("identifiers", next.filter((x) => x !== ""));
  };
  const removeIdentifier = (index: number) =>
    set("identifiers", value.identifiers.filter((_, i) => i !== index));

  return (
    <Flex
      direction="column"
      gap="xs"
      p="sm"
      style={{ flex: 1, minHeight: 0, overflowY: "auto" }}
    >
      <AdminPageTitle
        icon={ShieldCheck}
        title={title || t("Access", "Access")}
        color={color}
      />

      <Text ff="Akrobat Bold" size="xxs" c="rgba(255,255,255,0.4)">
        {description ||
          t(
            "AccessOverrideDesc",
            "Grant access to this resource's admin panel to specific ACE groups and players, in addition to your global dirk_lib admins. Enforcement is server-side.",
          )}
      </Text>

      {/* ── Admin groups (ACE) ──────────────────────────────────────────── */}
      <SectionLabel icon={Users} label={t("AccessGroups", "Admin groups (ACE)")} />

      {/* Quick-add chips for the common ACE groups. */}
      <Flex gap="xs" wrap="wrap">
        {COMMON_ACE_GROUPS.map((g) => {
          const added = value.groups.includes(g);
          return (
            <Flex
              key={g}
              align="center"
              gap="xxs"
              onClick={added ? undefined : () => quickAddGroup(g)}
              role="button"
              tabIndex={added ? -1 : 0}
              aria-disabled={added}
              onKeyDown={(e) => {
                if (added) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  quickAddGroup(g);
                }
              }}
              px="xs"
              py="xxs"
              style={{
                cursor: added ? "default" : "pointer",
                opacity: added ? 0.4 : 1,
                background: alpha(color, 0.12),
                border: `0.1vh solid ${alpha(color, 0.4)}`,
                borderRadius: "0.4vh",
                transition: "background 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (added) return;
                e.currentTarget.style.background = alpha(color, 0.22);
              }}
              onMouseLeave={(e) => {
                if (added) return;
                e.currentTarget.style.background = alpha(color, 0.12);
              }}
            >
              {!added && <Plus size="1.2vh" color={color} />}
              <Text ff="Akrobat Bold" size="xxs" lts="0.04em" c={color}>
                {g}
              </Text>
            </Flex>
          );
        })}
      </Flex>

      <Flex direction="column" gap="xxs">
        {value.groups.length === 0 && !addingGroup && (
          <EmptyHint
            text={t("AccessNoGroups", "No ACE groups added. e.g. group.admin")}
          />
        )}
        {value.groups.map((name, i) => (
          <Flex key={i} align="center" gap="xs">
            <TextInput
              value={name}
              onChange={(e) => setGroup(i, e.currentTarget.value)}
              placeholder={t("AccessGroupPlaceholder", "ACE group or permission, e.g. group.admin")}
              size="xs"
              style={{ flex: 1 }}
            />
            <ActionIcon
              variant="subtle"
              color="red"
              size="md"
              onClick={() => removeGroup(i)}
              title={t("Remove", "Remove")}
              aria-label={t("Remove", "Remove")}
            >
              <Trash2 size="1.4vh" />
            </ActionIcon>
          </Flex>
        ))}
        {addingGroup && (
          <AceGroupAddRow
            placeholder={t("AccessGroupPlaceholder", "ACE group or permission, e.g. group.admin")}
            onCommit={commitGroup}
            onCancel={() => setAddingGroup(false)}
            removeLabel={t("Remove", "Remove")}
          />
        )}
      </Flex>

      {!addingGroup && (
        <AddRowButton label={t("AccessAddGroup", "Add group")} onClick={() => setAddingGroup(true)} />
      )}

      {/* ── Players / identifiers ───────────────────────────────────────── */}
      <SectionLabel icon={UserRound} label={t("AccessPlayers", "Players")} />

      <Flex direction="column" gap="xxs">
        {value.identifiers.length === 0 && !addingPlayer && (
          <EmptyHint text={t("AccessNoPlayers", "No players added.")} />
        )}
        {value.identifiers.map((id, i) => (
          <Flex key={i} align="center" gap="xs">
            <PlayerSelect
              value={id || null}
              onChange={(p) => setIdentifier(i, p?.citizenId ?? "")}
              includeOffline={includeOffline}
              placeholder={t("AccessPickPlayer", "Pick a player…")}
              style={{ flex: 1 }}
              size="xs"
            />
            <ActionIcon
              variant="subtle"
              color="red"
              size="md"
              onClick={() => removeIdentifier(i)}
              title={t("Remove", "Remove")}
              aria-label={t("Remove", "Remove")}
            >
              <Trash2 size="1.4vh" />
            </ActionIcon>
          </Flex>
        ))}
        {addingPlayer && (
          <Flex align="center" gap="xs">
            <PlayerSelect
              value={null}
              onChange={(p) => commitIdentifier(p?.citizenId ?? "")}
              includeOffline={includeOffline}
              placeholder={t("AccessPickPlayer", "Pick a player…")}
              style={{ flex: 1 }}
              size="xs"
            />
            <ActionIcon
              variant="subtle"
              color="red"
              size="md"
              onClick={() => setAddingPlayer(false)}
              title={t("Remove", "Remove")}
              aria-label={t("Remove", "Remove")}
            >
              <Trash2 size="1.4vh" />
            </ActionIcon>
          </Flex>
        )}
      </Flex>

      {!addingPlayer && (
        <AddRowButton label={t("AccessAddPlayer", "Add player")} onClick={() => setAddingPlayer(true)} />
      )}
    </Flex>
  );
}

function AddRowButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Flex
      align="center"
      justify="center"
      gap="xs"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      py="xs"
      style={{
        cursor: "pointer",
        border: "0.1vh dashed rgba(255,255,255,0.12)",
        borderRadius: "0.4vh",
        transition: "background 0.15s, border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
      }}
    >
      <Plus size="1.4vh" color="rgba(255,255,255,0.4)" />
      <Text ff="Akrobat Bold" size="xxs" tt="uppercase" lts="0.06em" c="rgba(255,255,255,0.4)">
        {label}
      </Text>
    </Flex>
  );
}

// Pending "add ACE group" row. Holds the draft text in LOCAL state and only
// commits (to the form) on Enter / blur, so an empty "" entry never persists —
// mirroring the local pending-row pattern used for the other lists.
function AceGroupAddRow({
  placeholder,
  onCommit,
  onCancel,
  removeLabel,
}: {
  placeholder: string;
  onCommit: (value: string) => void;
  onCancel: () => void;
  removeLabel: string;
}) {
  const [draft, setDraft] = useState("");
  const commit = () => {
    if (draft.trim()) onCommit(draft);
    else onCancel();
  };
  return (
    <Flex align="center" gap="xs">
      <TextInput
        value={draft}
        onChange={(e) => setDraft(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
        onBlur={commit}
        placeholder={placeholder}
        size="xs"
        autoFocus
        style={{ flex: 1 }}
      />
      <ActionIcon
        variant="subtle"
        color="red"
        size="md"
        onClick={onCancel}
        title={removeLabel}
        aria-label={removeLabel}
      >
        <Trash2 size="1.4vh" />
      </ActionIcon>
    </Flex>
  );
}
