// In-world door picker — React side.
//
// Mirrors the WorldPositionPicker pattern: tell the AdminTools store to
// begin a tool flow (renders InstructionPanel bottom-right with title +
// key hints), kick the Lua admin-tool handler over fetchNui, await the
// SendNUIMessage result/cancel that AdminOverlays routes back via the
// store.
//
// Wired to dirk_lib's modules/scriptConfig/admin/tools/door.lua which
// drives lib.doorlock.pick — a multi-pick flow where the admin builds a
// GROUP of 1-2 doors (single door / double-door pair) and confirms it
// as one logical "door entry". Result shape mirrors that:
//
//   {
//     doors: [
//       { model, coords, heading, isDoor },
//       { model, coords, heading, isDoor },   // present only on doubles
//     ]
//   }
//
// Usage:
//   const pickDoor = usePickDoor();
//   const picked = await pickDoor();
//   if (picked) console.log(picked.doors.length, 'doors picked');
//
// Drop-in button (matches WorldPositionPicker styling):
//   <DoorPickerButton onPick={picked => addLabDoor(picked.doors)} />

import { alpha, Text, Tooltip, useMantineTheme } from "@mantine/core";
import { motion } from "framer-motion";
import { DoorOpen } from "lucide-react";
import { fetchNui } from "../../utils/fetchNui";
import { locale } from "../../utils/locales";
import { useAdminToolStore } from "./adminToolStore";

/** A single picked door panel — one entity the admin LMB'd in-world. */
export type PickedDoor = {
  /** Door entity model hash. */
  model: number;
  /** World coords of the door entity, snapshotted at pick time. */
  coords: { x: number; y: number; z: number };
  /** Door entity heading in degrees. */
  heading: number;
  /** True when IsEntityADoor() flagged the entity as a real door (vs a
   *  prop the admin happened to aim at). Informational — pickers accept
   *  any entity. */
  isDoor?: boolean;
};

/**
 * A confirmed pick from the multi-pick door tool. `doors` is 1-2 entries:
 * length 1 = single door, length 2 = double-door pair. Maps cleanly onto
 * ox_doorlock's single-door vs double-door spec.
 */
export type PickedDoorGroup = {
  doors: PickedDoor[];
};

/**
 * Returns a function that triggers the in-world door picker. Renders the
 * standard InstructionPanel while the player is aiming. Resolves with
 * `null` on cancel or backend failure.
 */
export function usePickDoor(): () => Promise<PickedDoorGroup | null> {
  const begin = useAdminToolStore((s) => s.begin);
  return async () => {
    // Order matters: register the resolver in the store FIRST so it's
    // primed by the time Lua fires the result, THEN kick the Lua flow.
    const pending = begin<PickedDoorGroup>({
      id: "pickDoor",
      title: locale("PickDoorTitle"),
      hint: locale("PickDoorHint"),
      keys: [
        { key: "LMB",       action: locale("Toggle")  },
        { key: "E",         action: locale("Confirm") },
        { key: "BACKSPACE", action: locale("Cancel")  },
      ],
    });
    fetchNui("ADMIN_TOOL_BEGIN", { id: "pickDoor" }).catch(() => {
      useAdminToolStore.getState().cancelActive();
    });
    return await pending;
  };
}

/**
 * Drop-in button — same styling as WorldPositionSetButton. Triggers the
 * picker on click and calls `onPick` with the result (or never fires on
 * cancel).
 */
export function DoorPickerButton({
  onPick,
  compact,
  label,
  tooltip,
}: {
  onPick: (picked: PickedDoorGroup) => void;
  compact?: boolean;
  /** Override the button label. Defaults to locale("PickDoor"). */
  label?: string;
  /** Override the tooltip. Defaults to locale("PickDoorTooltip"). */
  tooltip?: string;
}) {
  const theme = useMantineTheme();
  const color = theme.colors[theme.primaryColor][5];
  const pickDoor = usePickDoor();

  const onClick = async () => {
    const picked = await pickDoor();
    if (picked && picked.doors.length > 0) onPick(picked);
  };

  return (
    <Tooltip
      label={tooltip ?? locale("PickDoorTooltip")}
      position="top"
      withArrow
      withinPortal
      zIndex={2000}
    >
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
        <DoorOpen size={compact ? "1.1vh" : "1.3vh"} color={color} />
        <Text ff="Akrobat Bold" size="xxs" tt="uppercase" lts="0.06em" c={color}>
          {label ?? locale("PickDoor")}
        </Text>
      </motion.button>
    </Tooltip>
  );
}
