import { ActionIcon, Flex, Stack, Text } from "@mantine/core";
import { ChevronDown, ChevronUp, FlaskConical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { isEnvBrowser } from "../../utils/misc";

export interface TestBedItem {
  key: string;
  label: string;
  active: boolean;
  onToggle: (next: boolean) => void;
}

export interface TestBedProps {
  items: TestBedItem[];
  /** localStorage key used to persist toggled state across reloads. Default: "testbed:open-state". */
  storageKey?: string;
  /** Disable localStorage persistence entirely. Default: false. */
  disablePersistence?: boolean;
  /** Header label shown in the collapsed pill. Default: "TestBed". */
  title?: string;
}

const loadPersistedState = (storageKey: string): Record<string, boolean> => {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const savePersistedState = (storageKey: string, state: Record<string, boolean>) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {}
};

export function TestBed({
  items,
  storageKey = "testbed:open-state",
  disablePersistence = false,
  title = "TestBed",
}: TestBedProps) {
  const [open, setOpen] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    if (!isEnvBrowser() || disablePersistence) return;
    const persisted = loadPersistedState(storageKey);
    itemsRef.current.forEach((item) => {
      const persistedValue = persisted[item.key];
      if (typeof persistedValue === "boolean" && persistedValue !== item.active) {
        item.onToggle(persistedValue);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isEnvBrowser()) return null;

  const toggle = (item: TestBedItem) => {
    const next = !item.active;
    item.onToggle(next);
    if (!disablePersistence) {
      const persisted = loadPersistedState(storageKey);
      persisted[item.key] = next;
      savePersistedState(storageKey, persisted);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "1vh",
        left: "1vh",
        zIndex: 2147483647,
        pointerEvents: "auto",
        fontSize: "1.4vh",
      }}
    >
      <Flex
        align="center"
        gap="xs"
        px="sm"
        py="xs"
        onClick={() => setOpen((v) => !v)}
        style={{
          cursor: "pointer",
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(0.6vh)",
          WebkitBackdropFilter: "blur(0.6vh)",
          border: "0.1vh solid rgba(255,255,255,0.1)",
          borderRadius: "var(--mantine-radius-sm)",
          userSelect: "none",
          minWidth: "16vh",
        }}
      >
        <FlaskConical size={14} color="rgba(255,255,255,0.7)" />
        <Text
          size="xs"
          ff="Akrobat Bold"
          tt="uppercase"
          lts="0.08em"
          c="rgba(255,255,255,0.85)"
          style={{ flex: 1 }}
        >
          {title}
        </Text>
        <ActionIcon size="xs" variant="transparent" c="rgba(255,255,255,0.6)">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </ActionIcon>
      </Flex>

      {open && (
        <Stack
          gap={4}
          mt="xxs"
          p="xs"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(0.6vh)",
            WebkitBackdropFilter: "blur(0.6vh)",
            border: "0.1vh solid rgba(255,255,255,0.1)",
            borderRadius: "var(--mantine-radius-sm)",
            minWidth: "16vh",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {items.map((item) => (
            <Flex
              key={item.key}
              align="center"
              justify="space-between"
              gap="xs"
              px="xs"
              py="xxs"
              onClick={() => toggle(item)}
              style={{
                cursor: "pointer",
                borderRadius: "var(--mantine-radius-xs)",
                background: item.active ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.03)",
                border: `0.1vh solid ${item.active ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.05)"}`,
                userSelect: "none",
              }}
            >
              <Text
                size="xs"
                ff="Akrobat Bold"
                c={item.active ? "#f59e0b" : "rgba(255,255,255,0.75)"}
              >
                {item.label}
              </Text>
              <Text
                size="xxs"
                ff="Akrobat Bold"
                tt="uppercase"
                lts="0.06em"
                c={item.active ? "#f59e0b" : "rgba(255,255,255,0.35)"}
              >
                {item.active ? "On" : "Off"}
              </Text>
            </Flex>
          ))}
        </Stack>
      )}
    </div>
  );
}
