// Drop-in Set + Goto button pair for "pick a world coord" admin fields.
//
// Replaces the old immediate-grab WorldPositionSetButton / WorldPositionGotoButton
// from PositionPicker.tsx with a walk-and-pick flow:
//
//   1. Set click → fetchNui('ADMIN_TOOL_BEGIN', { id: 'capturePosition' })
//      → dirk_lib's modules/scriptConfig/admin/tools/position.lua handler
//   2. Lua releases NUI focus, polls E (set) / Backspace (cancel)
//   3. On confirm → SendNUIMessage({ action: 'capturePosition_RESULT', data: {x,y,z,w} })
//      On cancel  → SendNUIMessage({ action: 'capturePosition_CANCELLED' })
//   4. AdminOverlays routes the message into useAdminToolStore.resolveActive /
//      cancelActive, which resolves the start() Promise.
//   5. onChange fires with the captured value, admin re-shows automatically
//      via the body-attribute trick in InstructionPanel.
//
// Goto is straightforward — one-way fetchNui to the gotoCoord NUI callback.
import { alpha, Text, Tooltip, useMantineTheme } from "@mantine/core";
import { motion } from "framer-motion";
import { Crosshair, MapPin } from "lucide-react";
import { fetchNui } from "../../utils/fetchNui";
import { locale } from "../../utils/locales";
import type { Vector4Value } from "../PositionPicker";
import { useAdminToolStore } from "./adminToolStore";

export type WorldPositionPickerSlot = {
  value: Vector4Value;
  onChange: (v: Vector4Value) => void;
  compact?: boolean;
  /** Show only the Set button (no Goto). Defaults to false. */
  setOnly?: boolean;
  /** Show only the Goto button (no Set). Defaults to false. */
  gotoOnly?: boolean;
};

export function WorldPositionPicker({ value, onChange, compact, setOnly, gotoOnly }: WorldPositionPickerSlot) {
  return (
    <>
      {!gotoOnly && <WorldPositionSetButton value={value} onChange={onChange} compact={compact} />}
      {!setOnly && <WorldPositionGotoButton value={value} compact={compact} />}
    </>
  );
}

// Internal: subcomponent of WorldPositionPicker. Not exported — consumers
// use <WorldPositionPicker> which renders both Set and Goto together. The
// legacy named exports of the same shape live in PositionPicker.tsx for
// backwards-compat with the immediate-grab pattern; that file is being
// phased out as consumers migrate to <WorldPositionPicker>.
function WorldPositionSetButton({
  value,
  onChange,
  compact,
}: {
  value: Vector4Value;
  onChange: (v: Vector4Value) => void;
  compact?: boolean;
}) {
  const theme = useMantineTheme();
  const color = theme.colors[theme.primaryColor][5];
  const begin = useAdminToolStore((s) => s.begin);
  void value;

  const onClick = async () => {
    // Order matters: register the resolver in the store FIRST so it's ready
    // by the time Lua fires back the result, THEN kick off the Lua flow,
    // THEN await the eventual resolution.
    const pendingResult = begin<Vector4Value>({
      id: "capturePosition",
      title: locale("PickPositionTitle") || "Pick Position",
      hint: locale("PickPositionHint") || "Walk to where you want this set",
      keys: [
        { key: "E", action: locale("Set") || "Set" },
        { key: "⌫", action: locale("Cancel") || "Cancel" },
      ],
    });
    fetchNui("ADMIN_TOOL_BEGIN", { id: "capturePosition" }).catch(() => {
      // If the NUI bridge fails, cancel the store entry so we don't leak.
      useAdminToolStore.getState().cancelActive();
    });
    const result = await pendingResult;
    if (result) onChange(result);
  };

  return (
    <Tooltip label={locale("SetWorldTooltip")} position="top" withArrow withinPortal zIndex={2000}>
      <motion.button
        onClick={onClick}
        whileHover={{ background: alpha(color, 0.18) }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: alpha(color, 0.1),
          border: `0.1vh solid ${alpha(color, 0.35)}`,
          borderRadius: theme.radius.xs,
          padding: compact ? "0.25vh 0.6vh" : "0.5vh 0.8vh",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: compact ? "0.3vh" : "0.4vh",
        }}
      >
        <Crosshair size={compact ? "1.1vh" : "1.3vh"} color={color} />
        <Text ff="Akrobat Bold" size="xxs" tt="uppercase" lts="0.06em" c={color}>
          {locale("Set")}
        </Text>
      </motion.button>
    </Tooltip>
  );
}

function WorldPositionGotoButton({
  value,
  compact,
}: {
  value: Vector4Value;
  compact?: boolean;
}) {
  const theme = useMantineTheme();
  const color = theme.colors[theme.primaryColor][5];
  const onClick = () => {
    fetchNui("ADMIN_TOOL_INVOKE", { id: "gotoCoord", value }).catch(() => {});
  };
  return (
    <Tooltip label={locale("GotoWorldTooltip")} position="top" withArrow withinPortal zIndex={2000}>
      <motion.button
        onClick={onClick}
        whileHover={{ background: alpha(color, 0.18) }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: alpha(color, 0.1),
          border: `0.1vh solid ${alpha(color, 0.35)}`,
          borderRadius: theme.radius.xs,
          padding: compact ? "0.25vh 0.6vh" : "0.5vh 0.8vh",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: compact ? "0.3vh" : "0.4vh",
        }}
      >
        <MapPin size={compact ? "1.1vh" : "1.3vh"} color={color} />
        <Text ff="Akrobat Bold" size="xxs" tt="uppercase" lts="0.06em" c={color}>
          {locale("Goto")}
        </Text>
      </motion.button>
    </Tooltip>
  );
}
