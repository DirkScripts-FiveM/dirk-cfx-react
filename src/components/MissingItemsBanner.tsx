// Yellow ⚠ warning banner shown at the top of any scriptConfig admin panel
// when one or more configured items aren't registered in the player's
// inventory items table.
//
// Driven by dirk_lib's `<scriptName>:getMissingItems` callback (server-side
// audit walks the schema's x-installItem / x-installItemList annotations,
// cross-references `lib.inventory.item(name)`, and returns the missing names
// + ready-to-paste install snippets per format).
//
// Auto-mounted by ConfigPanel above its tab AnimatePresence so it survives
// tab switches without remounting. Consumers can suppress it by passing
// `suppressMissingItemsBanner` to ConfigPanel.
//
// To use this in another consumer: nothing to do. ConfigPanel mounts it.
// Just annotate the consumer's schema.json with x-installItem /
// x-installItemList on item-name fields, and dirk_lib does the rest.

import { alpha, Flex, Text, useMantineTheme } from "@mantine/core";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ChevronDown, Check, Copy, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { create } from "zustand";
import { fetchNui } from "../utils/fetchNui";

type MissingItem = {
  name: string;
  label?: string;
  weight?: number;
  description?: string;
};

type AuditPayload = {
  missing: MissingItem[];
  snippets: { ox: string; qb: string; esx: string };
};

type AuditResponse = {
  success: boolean;
  _error?: string;
  data?: AuditPayload;
};

type TabId = "ox" | "qb" | "esx";

const TABS: { id: TabId; label: string }[] = [
  { id: "ox", label: "ox_inventory" },
  { id: "qb", label: "qb-inventory" },
  { id: "esx", label: "ESX legacy SQL" },
];

// Module-level audit store. Persists across component re-mounts (ConfigPanel
// keys its tab content by activeTab, so each tab switch unmounts + remounts
// children). Stored data survives, fetch fires once per panel session.
type AuditStore = {
  data: AuditPayload | null;
  loaded: boolean;
  inFlight: boolean;
  refresh: () => Promise<void>;
};

export const useMissingItemsAudit = create<AuditStore>((set, get) => ({
  data: null,
  loaded: false,
  inFlight: false,
  refresh: async () => {
    if (get().inFlight) return;
    set({ inFlight: true });
    try {
      const res = await fetchNui<AuditResponse>("GET_MISSING_ITEMS", undefined, {
        success: true,
        data: { missing: [], snippets: { ox: "", qb: "", esx: "" } },
      });
      if (res?.success && res.data) {
        set({ data: res.data, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    } finally {
      set({ inFlight: false });
    }
  },
}));

export function MissingItemsBanner() {
  const theme = useMantineTheme();
  const audit = useMissingItemsAudit((s) => s.data);
  const loaded = useMissingItemsAudit((s) => s.loaded);
  const inFlight = useMissingItemsAudit((s) => s.inFlight);
  const refresh = useMissingItemsAudit((s) => s.refresh);
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("ox");
  const [hoveredTab, setHoveredTab] = useState<TabId | null>(null);
  const [copied, setCopied] = useState<TabId | null>(null);

  // First fetch — only when not yet loaded. Re-mount across tab switches
  // re-fires this useEffect but the `loaded` guard blocks the second hit.
  useEffect(() => {
    if (!loaded) refresh();
  }, [loaded, refresh]);

  const handleCopy = useCallback((tab: TabId) => {
    if (!audit) return;
    const text = audit.snippets[tab] ?? "";
    navigator.clipboard.writeText(text).then(() => {
      setCopied(tab);
      setTimeout(() => setCopied((c) => (c === tab ? null : c)), 1500);
    }).catch(() => {});
  }, [audit]);

  const handleRefresh = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    refresh();
  }, [refresh]);

  if (!audit || audit.missing.length === 0) return null;

  const warnColor = "#f59e0b"; // amber
  const names = audit.missing.map((m) => m.name);

  return (
    <div
      style={{
        background: alpha(warnColor, 0.06),
        border: `0.1vh solid ${alpha(warnColor, 0.35)}`,
        borderLeft: `0.3vh solid ${warnColor}`,
        borderRadius: theme.radius.xs,
        margin: "0.6vh 1vh",
        overflow: "hidden",
      }}
    >
      {/* Summary row */}
      <Flex align="center" gap="0.8vh" p="0.8vh 1vh" style={{ cursor: "pointer" }} onClick={() => setExpanded((e) => !e)}>
        <AlertTriangle size="1.8vh" color={warnColor} strokeWidth={2.5} />
        <Flex direction="column" style={{ flex: 1, minWidth: 0 }}>
          <Text ff="Akrobat Bold" size="xs" tt="uppercase" lts="0.07em" c={warnColor}>
            {audit.missing.length === 1
              ? "1 item missing from your inventory"
              : `${audit.missing.length} items missing from your inventory`}
          </Text>
          <Text ff="Akrobat Bold" size="xxs" c="rgba(255,255,255,0.5)" lineClamp={1} style={{ fontFamily: "monospace" }}>
            {names.join(", ")}
          </Text>
        </Flex>
        {/* Refresh button — re-runs the audit. Bounded: server callback, no
            event listener loops. */}
        <button
          onClick={handleRefresh}
          disabled={inFlight}
          style={{
            background: "transparent",
            border: "none",
            padding: "0.3vh",
            cursor: inFlight ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: inFlight ? 0.4 : 0.7,
          }}
          title="Re-check"
        >
          <motion.span
            animate={{ rotate: inFlight ? 360 : 0 }}
            transition={inFlight ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <RefreshCw size="1.5vh" color={alpha(warnColor, 0.7)} />
          </motion.span>
        </button>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <ChevronDown size="1.8vh" color={alpha(warnColor, 0.7)} />
        </motion.div>
      </Flex>

      {/* Expandable code view */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{ overflow: "hidden", borderTop: `0.1vh solid ${alpha(warnColor, 0.18)}` }}
          >
            {/* Tab strip — plain buttons. Framer-motion's whileHover/whileTap
                caused two glitches we don't need: a shrink-spring on click
                and stuck hover-tint on the previously-active tab until you
                hover it again. CSS-driven hover state is sync'd with React
                state cleanly. */}
            <Flex gap="0" style={{ borderBottom: `0.1vh solid ${alpha(warnColor, 0.18)}` }}>
              {TABS.map((tab) => {
                const active = tab.id === activeTab;
                const hovered = hoveredTab === tab.id;
                let bg: string = "transparent";
                if (active) bg = alpha(warnColor, 0.12);
                else if (hovered) bg = alpha(warnColor, 0.08);
                return (
                  <button
                    key={tab.id}
                    onClick={(e) => { e.stopPropagation(); setActiveTab(tab.id); }}
                    onMouseEnter={() => setHoveredTab(tab.id)}
                    onMouseLeave={() => setHoveredTab((h) => (h === tab.id ? null : h))}
                    style={{
                      flex: 1,
                      background: bg,
                      border: "none",
                      borderBottom: active ? `0.2vh solid ${warnColor}` : "0.2vh solid transparent",
                      padding: "0.3vh 1vh",
                      cursor: active ? "default" : "pointer",
                      color: active ? warnColor : "rgba(255,255,255,0.5)",
                      fontFamily: "Akrobat Bold",
                      fontSize: "var(--mantine-font-size-xxs)",
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      transition: "background 0.12s",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </Flex>

            <CodeView
              code={audit.snippets[activeTab] ?? ""}
              copied={copied === activeTab}
              onCopy={(e) => { e.stopPropagation(); handleCopy(activeTab); }}
              warnColor={warnColor}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CodeView({
  code,
  copied,
  onCopy,
  warnColor,
}: {
  code: string;
  copied: boolean;
  onCopy: (e: React.MouseEvent) => void;
  warnColor: string;
}) {
  const theme = useMantineTheme();
  const [hovered, setHovered] = useState(false);
  const lines = code === "" ? [""] : code.split("\n");
  const lineNumWidth = String(lines.length).length;

  const copyBg = copied
    ? alpha("#22c55e", 0.15)
    : hovered
      ? alpha(warnColor, 0.18)
      : alpha(warnColor, 0.1);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={onCopy}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "absolute",
          top: "0.6vh",
          right: "0.8vh",
          zIndex: 2,
          background: copyBg,
          border: `0.1vh solid ${alpha(copied ? "#22c55e" : warnColor, 0.35)}`,
          borderRadius: theme.radius.xs,
          padding: "0.4vh 0.7vh",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.4vh",
          transition: "background 0.12s",
        }}
      >
        {copied
          ? <Check size="1.4vh" color="#22c55e" />
          : <Copy size="1.4vh" color={warnColor} />}
        <Text ff="Akrobat Bold" size="xxs" tt="uppercase" lts="0.06em" c={copied ? "#22c55e" : warnColor}>
          {copied ? "Copied" : "Copy"}
        </Text>
      </button>

      <div style={{
        background: alpha(theme.colors.dark[9], 0.6),
        maxHeight: "40vh",
        overflowY: "auto",
        overflowX: "auto",
        padding: "0.6vh 0",
      }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: "monospace", fontSize: "1.2vh", lineHeight: 1.5 }}>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i}>
                <td style={{
                  width: `${lineNumWidth + 2}ch`,
                  textAlign: "right",
                  padding: "0 0.8vh 0 1vh",
                  color: "rgba(255,255,255,0.25)",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                  verticalAlign: "top",
                }}>{i + 1}</td>
                <td style={{
                  padding: "0 1vh",
                  color: "rgba(255,255,255,0.85)",
                  whiteSpace: "pre",
                  verticalAlign: "top",
                }}>{line || "​"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
