import { alpha, Box, Flex, JsonInput, Loader, Text, TextInput, useMantineTheme } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useInfiniteQuery } from "@tanstack/react-query";
import { locale } from "../utils/locales";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, Check, ChevronDown, Code2, Filter, History, Redo2, RotateCcw,
  Save as SaveIcon, Search, Undo2, User, X, XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { UIEvent } from "react";
import { ConfirmModal } from "./ConfirmModal";
import { Modal } from "./Modal";
import { MissingItemsBanner, useMissingItemsAudit } from "./MissingItemsBanner";
import { MotionFlex } from "./Motion";
import { FormProvider, useForm, useFormActions } from "../hooks/useForm";
import { useAdminState } from "../hooks/useAdminState";
import { useSettings } from "../utils/useSettings";
import { dirkQueryClient } from "../providers/DirkProvider";
import { fetchNui } from "../utils/fetchNui";
import { getScriptConfigInstance } from "../hooks/useScriptConfig";
import type {
  ScriptConfigHistoryEntry,
  ScriptConfigHistoryRequest,
  ScriptConfigHistoryResponse,
} from "../hooks/useScriptConfig";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
}

export interface ConfigPanelProps<T extends Record<string, any> = Record<string, any>> {
  navItems: readonly NavItem[];
  title: string;
  subtitle?: string;
  open: boolean;
  /** Defaults to fetchNui("CLOSE_ADMIN_SECTION") */
  onClose?: () => void;
  children: (activeTab: string) => React.ReactNode;
  /** Default config for reset */
  defaultConfig: T;
  /** Zod schema for JSON validation (.safeParse) */
  schema?: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: { issues: { path: PropertyKey[]; message: string }[] } } };
  /** Reset confirm typed text (e.g. "dirk_fishing") */
  resetConfirmText?: string;
  width?: string;
  height?: string;
  /** Skip the auto-mounted MissingItemsBanner. Default: false (banner shown).
      The banner self-hides when nothing is missing, so leaving it on costs
      nothing visually. */
  suppressMissingItemsBanner?: boolean;
}

// ── NavItem Button ────────────────────────────────────────────────────────────

function NavItemButton({
  icon: Icon, label, active, onClick,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const theme = useMantineTheme();
  const color = theme.colors[theme.primaryColor][5];

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ background: active ? alpha(color, 0.15) : "rgba(255,255,255,0.04)" }}
      whileTap={{ scale: 0.97 }}
      style={{
        width: "100%",
        background: active ? alpha(color, 0.12) : "transparent",
        border: "none",
        borderLeft: `0.2vh solid ${active ? color : "transparent"}`,
        borderRadius: `0 ${theme.radius.xs} ${theme.radius.xs} 0`,
        padding: "0.7vh 1vh",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.7vh",
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      <Icon color={active ? color : "rgba(255,255,255,0.35)"} />
      <Text ff="Akrobat Bold" size="xs" tt="uppercase" lts="0.06em" c={active ? color : "rgba(255,255,255,0.35)"}>
        {label}
      </Text>
      {active && (
        <motion.div
          layoutId="nav-active-dot"
          style={{ marginLeft: "auto", width: "0.4vh", height: "0.4vh", borderRadius: "50%", background: color }}
        />
      )}
    </motion.button>
  );
}

// ── Config JSON Modal ─────────────────────────────────────────────────────────

function ConfigJsonModal<T extends Record<string, any>>({
  onClose, schema,
}: {
  onClose: () => void;
  schema?: ConfigPanelProps<T>["schema"];
}) {
  const theme = useMantineTheme();
  const color = theme.colors[theme.primaryColor][5];
  const form = useForm<T>();
  const [json, setJson] = useState(() => JSON.stringify(form.values, null, 2));
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(json);
      if (schema) {
        const result = schema.safeParse(parsed);
        if (!result.success) {
          setError(result.error!.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n"));
          return;
        }
        const current = form.values as T;
        (Object.keys(result.data!) as (keyof T)[]).forEach((key) => {
          if (JSON.stringify(result.data![key]) !== JSON.stringify(current[key])) {
            form.setValue(key as string, result.data![key]);
          }
        });
      } else {
        const current = form.values as T;
        (Object.keys(parsed) as (keyof T)[]).forEach((key) => {
          if (JSON.stringify(parsed[key]) !== JSON.stringify(current[key])) {
            form.setValue(key as string, parsed[key]);
          }
        });
      }
      onClose();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Modal title="Config JSON" icon={Code2} iconColor={color} onClose={onClose} width="60vh" maxHeight="80vh" zIndex={200}>
      <Box flex={1} p="0.8vh" style={{ overflowY: "auto" }}>
        <JsonInput
          value={json}
          spellCheck={false}
          onChange={setJson}
          rows={22}
          formatOnBlur
          validationError="Invalid JSON"
          styles={() => ({
            input: { fontFamily: "monospace", fontSize: "1.3vh", lineHeight: 1.6, resize: "none" },
          })}
        />
        {error && <Text ff="Akrobat Bold" size="xxs" c="#ef4444" mt="xxs">{error}</Text>}
      </Box>
      <Flex justify="flex-end" gap="xs" px="sm" py="xs" style={{ borderTop: `0.1vh solid ${theme.colors.dark[7]}`, flexShrink: 0 }}>
        <motion.button onClick={onClose} whileHover={{ background: alpha(theme.colors.dark[7], 0.5) }} whileTap={{ scale: 0.97 }}
          style={{ background: "transparent", border: `0.1vh solid ${theme.colors.dark[6]}`, borderRadius: theme.radius.xs, padding: `${theme.spacing.xxs} ${theme.spacing.xs}`, cursor: "pointer", display: "flex", alignItems: "center", gap: theme.spacing.xxs }}>
          <X color="rgba(255,255,255,0.4)" />
          <Text ff="Akrobat Bold" size="xs" tt="uppercase" lts="0.05em" c="rgba(255,255,255,0.4)">Cancel</Text>
        </motion.button>
        <motion.button onClick={handleSave} whileHover={{ background: alpha(color, 0.25) }} whileTap={{ scale: 0.97 }}
          style={{ background: alpha(color, 0.14), border: `0.1vh solid ${alpha(color, 0.4)}`, borderRadius: theme.radius.xs, padding: `${theme.spacing.xxs} ${theme.spacing.xs}`, cursor: "pointer", display: "flex", alignItems: "center", gap: theme.spacing.xxs }}>
          <Check color={color} />
          <Text ff="Akrobat Bold" size="xs" tt="uppercase" lts="0.05em" c={color}>Apply</Text>
        </motion.button>
      </Flex>
    </Modal>
  );
}

// ── History helpers ───────────────────────────────────────────────────────────

function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try { return JSON.stringify(value); } catch { return String(value); }
}

function formatHistoryDateTime(entry: ScriptConfigHistoryEntry): string {
  if (entry.at_unix) {
    const date = new Date(entry.at_unix * 1000);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    }
  }
  if (entry.at_utc) {
    const date = new Date(entry.at_utc);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    }
  }
  return "Unknown time";
}

function historyEntryKey(entry: ScriptConfigHistoryEntry, index: number) {
  return `${entry.at_unix}-${entry.applied_version}-${index}`;
}

// ── History sub-components ────────────────────────────────────────────────────

function ChangeDetails({ entry }: { entry: ScriptConfigHistoryEntry }) {
  const theme = useMantineTheme();
  return (
    <Flex direction="column" gap="0.45vh" p="0.8vh" style={{ border: `0.1vh solid ${alpha(theme.colors.dark[6], 0.8)}`, borderRadius: theme.radius.xs, background: alpha(theme.colors.dark[9], 0.35) }}>
      <Text ff="Akrobat Bold" size="xxs" c="rgba(255,255,255,0.45)">
        Version {entry.expected_version ?? "?"} {"\u2192"} {entry.applied_version ?? "?"}
      </Text>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(18vh, 22vh) minmax(0, 1fr) minmax(0, 1fr)", gap: "0.1vh", border: `0.1vh solid ${alpha(theme.colors.dark[6], 0.9)}`, borderRadius: theme.radius.xs, overflow: "hidden", background: alpha(theme.colors.dark[6], 0.8) }}>
        <Text ff="Akrobat Bold" size="xxs" c="rgba(255,255,255,0.45)" px="0.6vh" py="0.45vh" style={{ background: alpha(theme.colors.dark[8], 0.85) }}>Path</Text>
        <Text ff="Akrobat Bold" size="xxs" c="rgba(255,255,255,0.45)" px="0.6vh" py="0.45vh" style={{ background: alpha(theme.colors.dark[8], 0.85) }}>From</Text>
        <Text ff="Akrobat Bold" size="xxs" c="rgba(255,255,255,0.45)" px="0.6vh" py="0.45vh" style={{ background: alpha(theme.colors.dark[8], 0.85) }}>To</Text>
        {(entry.changes || []).map((change, idx) => {
          const bg = idx % 2 === 0 ? alpha(theme.colors.dark[9], 0.5) : alpha(theme.colors.dark[8], 0.42);
          return [
            <Text key={`${idx}-p`} ff="Akrobat Bold" size="xxs" c="#8ad1ff" px="0.6vh" py="0.55vh" style={{ background: bg, wordBreak: "break-word" }}>{change.path}</Text>,
            <Text key={`${idx}-o`} ff="monospace" size="xxs" c="rgba(255,255,255,0.5)" px="0.6vh" py="0.55vh" style={{ background: bg, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>{formatValue(change.old)}</Text>,
            <Text key={`${idx}-n`} ff="monospace" size="xxs" c="rgba(255,255,255,0.78)" px="0.6vh" py="0.55vh" style={{ background: bg, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>{formatValue(change.new)}</Text>,
          ];
        })}
      </div>
    </Flex>
  );
}

function HistoryTableRow({ entry, expanded, onToggle }: { entry: ScriptConfigHistoryEntry; expanded: boolean; onToggle: () => void }) {
  const theme = useMantineTheme();
  const admin = entry.admin?.name || entry.admin?.identifier || "unknown";
  const firstPath = entry.changes?.[0]?.path || "-";
  const changeCount = entry.changes?.length || 0;
  const versionText = `${entry.expected_version ?? "?"} \u2192 ${entry.applied_version ?? "?"}`;

  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.16, ease: "easeOut" }}>
      <Flex direction="column" gap="0.45vh">
        <motion.button onClick={onToggle} whileHover={{ scale: 1.002 }} whileTap={{ scale: 0.997 }} transition={{ duration: 0.12 }}
          style={{ background: expanded ? alpha(theme.colors.dark[7], 0.45) : alpha(theme.colors.dark[8], 0.35), border: `0.1vh solid ${expanded ? alpha(theme.colors[theme.primaryColor][5], 0.35) : alpha(theme.colors.dark[6], 0.75)}`, borderRadius: theme.radius.xs, padding: "0.65vh 0.75vh", cursor: "pointer", textAlign: "left" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2.2vh 20vh 12vh 6vh 1fr minmax(16vh, auto)", gap: "0.8vh", alignItems: "center" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <motion.div animate={{ rotate: expanded ? 0 : -90 }} transition={{ duration: 0.18, ease: "easeOut" }}>
                <ChevronDown size="1.5vh" color={expanded ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.45)"} />
              </motion.div>
            </div>
            <Text ff="Akrobat Bold" size="xxs" c="rgba(255,255,255,0.75)" lineClamp={1}>{formatHistoryDateTime(entry)}</Text>
            <Text ff="Akrobat Bold" size="xxs" c="rgba(255,255,255,0.68)" lineClamp={1}>{admin}</Text>
            <Text ff="Akrobat Bold" size="xxs" c="rgba(255,255,255,0.68)">{changeCount}</Text>
            <Text ff="Akrobat Bold" size="xxs" c="rgba(255,255,255,0.58)" lineClamp={1}>{firstPath}</Text>
            <Text ff="monospace" size="xxs" c="rgba(255,255,255,0.68)">{versionText}</Text>
          </div>
        </motion.button>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div key="details" initial={{ opacity: 0, height: 0, y: -4 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0, y: -4 }} transition={{ duration: 0.2, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
              <ChangeDetails entry={entry} />
            </motion.div>
          )}
        </AnimatePresence>
      </Flex>
    </motion.div>
  );
}

function HistoryTableHeader() {
  const theme = useMantineTheme();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "2.2vh 20vh 12vh 6vh 1fr minmax(16vh, auto)", gap: "0.8vh", alignItems: "center", border: `0.1vh solid ${alpha(theme.colors.dark[6], 0.8)}`, borderRadius: theme.radius.xs, background: alpha(theme.colors.dark[8], 0.55), padding: "0.55vh 0.75vh" }}>
      <Text ff="Akrobat Bold" size="xxs" c="rgba(255,255,255,0.35)"> </Text>
      <Text ff="Akrobat Bold" size="xxs" c="rgba(255,255,255,0.45)">Time</Text>
      <Text ff="Akrobat Bold" size="xxs" c="rgba(255,255,255,0.45)">Admin</Text>
      <Text ff="Akrobat Bold" size="xxs" c="rgba(255,255,255,0.45)">#</Text>
      <Text ff="Akrobat Bold" size="xxs" c="rgba(255,255,255,0.45)">First Change</Text>
      <Text ff="Akrobat Bold" size="xxs" c="rgba(255,255,255,0.45)">Version</Text>
    </div>
  );
}

// ── History Modal ─────────────────────────────────────────────────────────────

function ConfigHistoryModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const { getHistory } = getScriptConfigInstance();
  const theme = useMantineTheme();
  const color = theme.colors[theme.primaryColor][5];
  const [queryInput, setQueryInput] = useState("");
  const [pathInput, setPathInput] = useState("");
  const [adminInput, setAdminInput] = useState("");
  const [query, setQuery] = useState("");
  const [path, setPath] = useState("");
  const [admin, setAdmin] = useState("");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const filters = useMemo(() => ({ query, path, admin }), [query, path, admin]);

  const historyQuery = useInfiniteQuery({
    queryKey: ["scriptConfigHistory", filters],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const response = await getHistory({
        offset: pageParam,
        limit: 25,
        query: filters.query || undefined,
        path: filters.path || undefined,
        admin: filters.admin || undefined,
      });
      if (!response?.success || !response.data) {
        throw new Error(response?._error || "Failed to load config history");
      }
      return response.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });

  const rows = historyQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const total = historyQuery.data?.pages[0]?.total ?? 0;

  const handleListScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 280 && historyQuery.hasNextPage && !historyQuery.isFetchingNextPage) {
      historyQuery.fetchNextPage();
    }
  };

  return (
    <Modal title="Config History" icon={History} iconColor={color} onClose={onClose} width="88vh" maxHeight="82vh" zIndex={260}>
      <Flex direction="column" style={{ flex: 1, minHeight: 0 }}>
        <Flex gap="xs" p="sm" style={{ borderBottom: `0.1vh solid ${alpha(theme.colors.dark[7], 0.8)}` }}>
          <TextInput leftSection={<Search size="1.4vh" />} placeholder="Search path/admin/value" value={queryInput} onChange={(e) => setQueryInput(e.currentTarget.value)} size="xs" style={{ flex: 1 }} />
          <TextInput leftSection={<Filter size="1.4vh" />} placeholder="Path filter (e.g. basic.weightUnit)" value={pathInput} onChange={(e) => setPathInput(e.currentTarget.value)} size="xs" style={{ flex: 1 }} />
          <TextInput leftSection={<User size="1.4vh" />} placeholder="Admin filter" value={adminInput} onChange={(e) => setAdminInput(e.currentTarget.value)} size="xs" style={{ flex: 1 }} />
          <motion.button
            onClick={() => { setExpandedKey(null); setQuery(queryInput.trim()); setPath(pathInput.trim().toLowerCase()); setAdmin(adminInput.trim().toLowerCase()); }}
            whileHover={{ background: alpha(color, 0.2) }} whileTap={{ scale: 0.97 }}
            style={{ background: alpha(color, 0.12), border: `0.1vh solid ${alpha(color, 0.35)}`, borderRadius: theme.radius.xs, padding: "0.55vh 0.85vh", cursor: "pointer" }}>
            <Text ff="Akrobat Bold" size="xxs" c={color}>Apply</Text>
          </motion.button>
        </Flex>

        <Flex direction="column" gap="xs" p="sm" style={{ flex: 1, minHeight: 0, overflowY: "auto" }} onScroll={handleListScroll}>
          <Text ff="Akrobat Bold" size="xxs" c="rgba(255,255,255,0.45)">
            {historyQuery.isFetching && !historyQuery.data ? "Loading history..." : `${total} entries`}
          </Text>
          <HistoryTableHeader />
          {historyQuery.isError && <Text ff="Akrobat Bold" size="xs" c="#ef4444">{(historyQuery.error as Error).message}</Text>}
          {!historyQuery.isLoading && rows.length === 0 && !historyQuery.isError && (
            <Text ff="Akrobat Bold" size="xs" c="rgba(255,255,255,0.45)">No history found for current filters.</Text>
          )}
          <AnimatePresence initial={false}>
            {rows.map((entry, index) => {
              const key = historyEntryKey(entry, index);
              return <HistoryTableRow key={key} entry={entry} expanded={expandedKey === key} onToggle={() => setExpandedKey(expandedKey === key ? null : key)} />;
            })}
          </AnimatePresence>
          {(historyQuery.isFetchingNextPage || historyQuery.isLoading) && (
            <Flex justify="center" py="sm"><Loader size="sm" color={color} /></Flex>
          )}
        </Flex>
      </Flex>
      <Flex justify="flex-end" gap="xs" px="sm" py="xs" style={{ borderTop: `0.1vh solid ${theme.colors.dark[7]}`, flexShrink: 0 }}>
        <motion.button onClick={onClose} whileHover={{ background: alpha(theme.colors.dark[7], 0.5) }} whileTap={{ scale: 0.97 }}
          style={{ background: "transparent", border: `0.1vh solid ${theme.colors.dark[6]}`, borderRadius: theme.radius.xs, padding: `${theme.spacing.xxs} ${theme.spacing.xs}`, cursor: "pointer", display: "flex", alignItems: "center", gap: theme.spacing.xxs }}>
          <X color="rgba(255,255,255,0.4)" size="1.5vh" />
          <Text ff="Akrobat Bold" size="xs" tt="uppercase" lts="0.05em" c="rgba(255,255,255,0.4)">Close</Text>
        </motion.button>
      </Flex>
    </Modal>
  );
}

// ── ConfigPanel Inner ─────────────────────────────────────────────────────────

function ConfigPanelInner<T extends Record<string, any>>({
  navItems, title, subtitle, children, isSaving, onClose,
  schema, resetConfirmText, defaultConfig,
  width, height, suppressMissingItemsBanner,
}: Omit<ConfigPanelProps<T>, "open" | "onClose"> & { isSaving: boolean; onClose: () => void }) {
  const { updateConfig, resetConfig, getHistory } = getScriptConfigInstance<T>();
  const form = useForm<T>();
  const theme = useMantineTheme();
  const color = theme.colors[theme.primaryColor][5];
  const version = useSettings((s) => s.resourceVersion);
  // useAdminState so the selected tab survives close/reopen. The whole
  // ConfigPanel tree unmounts on close (line ~670: `if (!open) return null`),
  // so plain useState would reset to navItems[0] every time.
  const [activeTab, setActiveTab] = useAdminState("__dirkConfigPanel:activeTab", navItems[0]?.id ?? "");
  const firstMountRef = useRef(true);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"close" | "back" | null>(null);
  const changedCount = form.changedCount ?? 0;
  const isDirty = changedCount > 0;

  const goBack = () => fetchNui("CONFIG_PANEL_BACK");

  const handleBack = () => {
    if (isDirty) {
      setPendingAction("back");
      return;
    }
    goBack();
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (isDirty) {
        e.preventDefault();
        setPendingAction("close");
        return;
      }
      onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDirty, onClose]);

  return (
    <>
      <AnimatePresence>{jsonOpen && <ConfigJsonModal onClose={() => setJsonOpen(false)} schema={schema} />}</AnimatePresence>
      <AnimatePresence>{historyOpen && <ConfigHistoryModal onClose={() => setHistoryOpen(false)} />}</AnimatePresence>
      <AnimatePresence>
        {resetOpen && (
          <ConfirmModal
            title="Reset to Defaults"
            description="This will permanently reset ALL config back to the defaults. Every value you have configured will be overwritten. This cannot be undone."
            confirmLabel="Reset Config"
            confirmText={resetConfirmText}
            onConfirm={async () => {
              setResetOpen(false);
              const result = await resetConfig();
              if (result?.success) {
                const { store } = getScriptConfigInstance<T>();
                form.reinitialize(cloneConfig(store.getState()));
                // Mirror the save-success toast so the admin gets visible
                // feedback that the reset actually applied — previously the
                // modal just closed silently and admins had no way to tell
                // whether it had worked.
                notifications.show({
                  color: "green",
                  title: locale("ConfigResetSuccessTitle"),
                  message: locale("ConfigResetSuccessBody"),
                  autoClose: 3000,
                });
                return;
              }
              const err = result?._error || "Unknown";
              console.warn(`[ConfigPanel] config reset failed: ${err}`);
              notifications.show({
                color: "red",
                title: locale("ConfigResetFailedTitle"),
                message: locale("ConfigResetFailedBody", err),
                autoClose: 6000,
              });
            }}
            onClose={() => setResetOpen(false)}
            zIndex={300}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {pendingAction !== null && (
          <ConfirmModal
            title="Discard Unsaved Changes?"
            description={
              pendingAction === "back"
                ? "You have unsaved changes. Going back now will discard them."
                : "You have unsaved changes. Closing now will discard them."
            }
            confirmLabel={pendingAction === "back" ? "Go Back Without Saving" : "Close Without Saving"}
            onConfirm={() => {
              const action = pendingAction;
              setPendingAction(null);
              if (action === "back") goBack();
              else onClose();
            }}
            onClose={() => setPendingAction(null)}
            zIndex={300}
          />
        )}
      </AnimatePresence>

      <MotionFlex
        pos="absolute" left="50%" top="50%"
        bg={alpha(theme.colors.dark[9], 0.9)}
        w={width ?? "120vh"} h={height ?? "80vh"} bdrs="sm"
        style={{
          userSelect: "none", overflow: "hidden",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 10px rgba(0,0,0,0.5)",
          border: `0.1vh solid ${theme.colors.dark[7]}`,
        }}
        direction="row"
        initial={{ scale: 0.3, opacity: 0, transform: "translate(-50%, -50%)" }}
        animate={{ scale: 1, opacity: 1, transform: "translate(-50%, -50%)" }}
        exit={{ scale: 0.3, opacity: 0, transform: "translate(-50%, -50%)" }}
      >
        {/* ── Sidebar ── */}
        <Flex direction="column" style={{ width: "18vh", flexShrink: 0, borderRight: `0.1vh solid ${alpha(theme.colors.dark[6], 0.8)}`, background: alpha(theme.colors.dark[8], 0.6), overflow: "hidden" }}>
          <Flex align="center" gap="0.6vh" px="sm" py="sm" style={{ borderBottom: `0.1vh solid ${alpha(theme.colors.dark[6], 0.5)}`, flexShrink: 0 }}>
            <motion.button
              title="Back to script list"
              onClick={handleBack}
              whileHover={{ background: alpha(color, 0.16), borderColor: alpha(color, 0.45) }}
              whileTap={{ scale: 0.95 }}
              style={{
                aspectRatio: "1 / 1",
                height: "2.4vh",
                background: alpha(color, 0.08),
                border: `0.1vh solid ${alpha(color, 0.3)}`,
                borderRadius: theme.radius.xs,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ArrowLeft size="1.4vh" color={color} />
            </motion.button>
            <Flex direction="column" style={{ minWidth: 0, flex: 1, lineHeight: 1, overflow: "hidden" }}>
              <Text size="md" ff="Akrobat Bold" tt="uppercase" lts="0.04em" truncate>{title}</Text>
              {subtitle && (
                <Text ff="Akrobat Bold" size="xxs" tt="uppercase" lts="0.08em" c={color} truncate>
                  {subtitle}
                </Text>
              )}
            </Flex>
          </Flex>

          {/* Quick controls */}
          <Flex gap="xxs" px="xs" py="xs" style={{ borderBottom: `0.1vh solid ${alpha(theme.colors.dark[6], 0.4)}`, flexShrink: 0 }}>
            <motion.button title="Undo" onClick={() => form.canBack && form.back()} disabled={!form.canBack}
              whileHover={form.canBack ? { background: "rgba(255,255,255,0.07)" } : undefined}
              whileTap={form.canBack ? { scale: 0.97 } : undefined}
              style={{ flex: 1, aspectRatio: "1 / 1", background: "transparent", border: `0.1vh solid ${alpha(theme.colors.dark[5], form.canBack ? 0.6 : 0.3)}`, borderRadius: theme.radius.xs, cursor: form.canBack ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", opacity: form.canBack ? 1 : 0.35, transition: "opacity 0.2s" }}>
              <Undo2 size="1.5vh" color="rgba(255,255,255,0.7)" />
            </motion.button>
            <motion.button title="Redo" onClick={() => form.canForward && form.forward()} disabled={!form.canForward}
              whileHover={form.canForward ? { background: "rgba(255,255,255,0.07)" } : undefined}
              whileTap={form.canForward ? { scale: 0.97 } : undefined}
              style={{ flex: 1, aspectRatio: "1 / 1", background: "transparent", border: `0.1vh solid ${alpha(theme.colors.dark[5], form.canForward ? 0.6 : 0.3)}`, borderRadius: theme.radius.xs, cursor: form.canForward ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", opacity: form.canForward ? 1 : 0.35, transition: "opacity 0.2s" }}>
              <Redo2 size="1.5vh" color="rgba(255,255,255,0.7)" />
            </motion.button>
            <motion.button title={isSaving ? "Saving..." : isDirty ? `Save (${changedCount})` : "Save"}
              onClick={() => isDirty && !isSaving && form.submit()} disabled={!isDirty || isSaving}
              whileHover={isDirty && !isSaving ? { background: alpha(color, 0.25), borderColor: alpha(color, 0.5) } : undefined}
              whileTap={isDirty && !isSaving ? { scale: 0.97 } : undefined}
              style={{ flex: 1, aspectRatio: "1 / 1", background: isDirty ? alpha(color, 0.14) : "transparent", border: `0.1vh solid ${isDirty ? alpha(color, 0.35) : alpha(theme.colors.dark[5], 0.3)}`, borderRadius: theme.radius.xs, cursor: isDirty && !isSaving ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", opacity: isDirty ? 1 : 0.35, transition: "opacity 0.2s, background 0.15s" }}>
              {isSaving ? <Loader size="1.5vh" color={color} type="dots" /> : <SaveIcon color={isDirty ? color : "rgba(255,255,255,0.35)"} size="1.5vh" />}
            </motion.button>
            <motion.button title="History" onClick={() => setHistoryOpen(true)}
              whileHover={{ background: alpha("#22d3ee", 0.16), borderColor: alpha("#22d3ee", 0.5) }}
              whileTap={{ scale: 0.97 }}
              style={{ flex: 1, aspectRatio: "1 / 1", background: alpha("#22d3ee", 0.07), border: `0.1vh solid ${alpha("#22d3ee", 0.25)}`, borderRadius: theme.radius.xs, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <History color="#22d3ee" size="1.5vh" />
            </motion.button>
          </Flex>

          {/* Nav items */}
          <Flex direction="column" gap="xxs" p="xs" style={{ flex: 1, overflowY: "auto" }}>
            {navItems.map((item) => (
              <NavItemButton key={item.id} icon={item.icon} label={item.label} active={activeTab === item.id} onClick={() => setActiveTab(item.id)} />
            ))}
          </Flex>

          {/* Bottom actions */}
          <Flex direction="column" p="xs" gap="xs" style={{ borderTop: `0.1vh solid ${alpha(theme.colors.dark[6], 0.5)}`, flexShrink: 0 }}>
            <motion.button onClick={() => isDirty && form.reset()} disabled={!isDirty}
              whileHover={isDirty ? { background: alpha("#f97316", 0.12), borderColor: alpha("#f97316", 0.45) } : undefined}
              whileTap={isDirty ? { scale: 0.97 } : undefined}
              style={{ width: "100%", background: "transparent", border: `0.1vh solid ${isDirty ? alpha("#f97316", 0.35) : alpha(theme.colors.dark[5], 0.3)}`, borderRadius: theme.radius.xs, padding: "0.65vh 0.8vh", cursor: isDirty ? "pointer" : "default", display: "flex", alignItems: "center", gap: "0.55vh", opacity: isDirty ? 1 : 0.35, transition: "opacity 0.2s" }}>
              <XCircle color={isDirty ? "#f97316" : "rgba(255,255,255,0.35)"} size="1.6vh" />
              <Text ff="Akrobat Bold" size="xxs" tt="uppercase" lts="0.06em" c={isDirty ? "#f97316" : "rgba(255,255,255,0.35)"}>Discard</Text>
            </motion.button>

            <div style={{ height: "0.05vh", background: "rgba(255,255,255,0.07)", margin: "0.1vh 0" }} />

            <motion.button onClick={() => setJsonOpen(true)}
              whileHover={{ background: alpha(color, 0.16), borderColor: alpha(color, 0.45) }}
              whileTap={{ scale: 0.97 }}
              style={{ width: "100%", background: alpha(color, 0.07), border: `0.1vh solid ${alpha(color, 0.28)}`, borderRadius: theme.radius.xs, padding: "0.65vh 0.8vh", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.55vh" }}>
              <Code2 color={color} size="1.6vh" />
              <Text ff="Akrobat Bold" size="xxs" tt="uppercase" lts="0.06em" c={color}>Manual Edit</Text>
            </motion.button>

            <motion.button onClick={() => setResetOpen(true)}
              whileHover={{ background: alpha("#ef4444", 0.16), borderColor: alpha("#ef4444", 0.5) }}
              whileTap={{ scale: 0.97 }}
              style={{ width: "100%", background: alpha("#ef4444", 0.07), border: `0.1vh solid ${alpha("#ef4444", 0.25)}`, borderRadius: theme.radius.xs, padding: "0.65vh 0.8vh", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.55vh" }}>
              <RotateCcw color="#ef4444" size="1.6vh" />
              <Text ff="Akrobat Bold" size="xxs" tt="uppercase" lts="0.06em" c="#ef4444">Reset Defaults</Text>
            </motion.button>

            {version && (
              <Text size="0.95vh" c="dimmed" ta="center" style={{ letterSpacing: "0.04em", opacity: 0.8 }}>
                Version {version}
              </Text>
            )}
          </Flex>
        </Flex>

        {/* ── Right column: banner stacked above content ── */}
        {/* Wrapped in a column flex so the banner sits on top of the tab
            content. The parent MotionFlex is `direction="row"` for sidebar +
            content-area, so without this wrapper the banner becomes a third
            column and gets squeezed to the left edge of the content area. */}
        <Flex direction="column" style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          {/* Above the AnimatePresence so it doesn't unmount on every tab
              switch. Self-hides when nothing's missing; consumers can disable
              entirely via `suppressMissingItemsBanner`. */}
          {!suppressMissingItemsBanner && <MissingItemsBanner />}

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={firstMountRef.current ? (firstMountRef.current = false, false) : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
              style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
              {children(activeTab)}
            </motion.div>
          </AnimatePresence>
        </Flex>
      </MotionFlex>
    </>
  );
}

// ── Utility ───────────────────────────────────────────────────────────────────

function cloneConfig<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// ── ServerOnly Fetcher (merges x-serverOnly paths into form on admin open) ───

function ServerOnlyFetcher<T extends Record<string, any>>() {
  const { fetchConfig } = getScriptConfigInstance<T>();
  const { reinitialize } = useFormActions<T>();

  useEffect(() => {
    let cancelled = false;
    fetchConfig().then((full) => {
      if (!cancelled && full) reinitialize(full as Partial<T>);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return null;
}

// ── Public ConfigPanel ────────────────────────────────────────────────────────

const defaultOnClose = () => fetchNui("CLOSE_ADMIN_SECTION");

export function ConfigPanel<T extends Record<string, any>>(props: ConfigPanelProps<T>) {
  const { open, onClose = defaultOnClose } = props;
  const { store, updateConfig } = getScriptConfigInstance<T>();
  const [isSaving, setIsSaving] = useState(false);

  if (!open) return null;

  // No internal QueryClientProvider — DirkProvider now mounts a shared
  // client (dirkQueryClient) that this component, the missing-items audit,
  // usePlayers etc. all consume. Invalidations below use the same client.
  return (
    <>
      <FormProvider<T>
        initialValues={cloneConfig(store.getState())}
        onSubmit={async (form) => {
          if (isSaving) return;
          setIsSaving(true);
          try {
            const result: any = await updateConfig(form.values as T);
            if (result?.success) {
              form.reinitialize(cloneConfig(form.values as T));
              dirkQueryClient.invalidateQueries({ queryKey: ["scriptConfigHistory"] });
              // Re-run the missing-items audit since item-name fields might
              // have changed in this save. One-shot per save — not an event
              // listener loop, no spam.
              useMissingItemsAudit.getState().refresh();
              notifications.show({
                color: "green",
                title: locale("ConfigSaveSuccessTitle"),
                message: locale("ConfigSaveSuccessBody"),
                autoClose: 3000,
              });
              return;
            }
            form.reinitialize(cloneConfig(store.getState()));
            const err = result?._error || "Unknown";
            console.warn(`[ConfigPanel] config save failed: ${err}`);
            // Map common server-side error codes to friendlier copy. Falls
            // back to the raw code so unknown errors still surface something
            // visible instead of swallowing silently.
            const titleKey = err === "NoPermission"     ? "ConfigSaveNoPermissionTitle"
                          : err === "VersionConflict"  ? "ConfigSaveVersionConflictTitle"
                          : err === "NotReady"         ? "ConfigSaveNotReadyTitle"
                          : "ConfigSaveFailedTitle";
            const bodyKey  = err === "NoPermission"     ? "ConfigSaveNoPermissionBody"
                          : err === "VersionConflict"  ? "ConfigSaveVersionConflictBody"
                          : err === "NotReady"         ? "ConfigSaveNotReadyBody"
                          : "ConfigSaveFailedBody";
            notifications.show({
              color: "red",
              title: locale(titleKey),
              message: locale(bodyKey, err),
              autoClose: 6000,
            });
          } finally {
            setIsSaving(false);
          }
        }}
      >
        <ServerOnlyFetcher<T> />
        <AnimatePresence>
          {open && (
            <ConfigPanelInner<T>
              {...props}
              onClose={onClose}
              isSaving={isSaving}
            />
          )}
        </AnimatePresence>
      </FormProvider>
    </>
  );
}
