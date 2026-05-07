// Curated list of FiveM control IDs (the IsControlPressed / DisableControlAction
// numeric IDs). Sourced from https://docs.fivem.net/docs/game-references/controls/.
// Not every control is included — the full list is ~349 entries and most are
// obscure cellphone-scroll / replay-editor inputs no script ever cares about.
// What's here covers the practical surface for scene whitelisting, raid
// keybinds, vehicle scripts, etc. Add more as needed.

export type GtaControl = {
  /** Numeric control ID passed to IsControlPressed / EnableControlAction. */
  id: number;
  /** Symbolic name as it appears in the FiveM docs (e.g. INPUT_LOOK_LR). */
  symbol: string;
  /** Friendly label suitable for UI display (e.g. "Look Left/Right"). */
  label: string;
  /** Default keyboard binding shown for context (e.g. "Mouse X", "E"). */
  defaultKey?: string;
  /** Group used for ordering and section headers in pickers. */
  group: GtaControlGroup;
};

export type GtaControlGroup =
  | "Camera"
  | "Movement"
  | "Combat"
  | "Cover"
  | "Vehicle"
  | "Vehicle (Plane/Heli)"
  | "Vehicle (Boat/Bike)"
  | "Phone"
  | "Frontend / UI"
  | "Multiplayer"
  | "Misc";

export const GTA_CONTROLS: GtaControl[] = [
  // ── Camera ─────────────────────────────────────────────────────────────────
  { id: 0,   symbol: "INPUT_NEXT_CAMERA",       label: "Switch Camera",        defaultKey: "V",        group: "Camera" },
  { id: 1,   symbol: "INPUT_LOOK_LR",           label: "Look Left/Right",      defaultKey: "Mouse X",  group: "Camera" },
  { id: 2,   symbol: "INPUT_LOOK_UD",           label: "Look Up/Down",         defaultKey: "Mouse Y",  group: "Camera" },
  { id: 3,   symbol: "INPUT_LOOK_UP_ONLY",      label: "Look Up Only",                                  group: "Camera" },
  { id: 4,   symbol: "INPUT_LOOK_DOWN_ONLY",    label: "Look Down Only",                                group: "Camera" },
  { id: 5,   symbol: "INPUT_LOOK_LEFT_ONLY",    label: "Look Left Only",                                group: "Camera" },
  { id: 6,   symbol: "INPUT_LOOK_RIGHT_ONLY",   label: "Look Right Only",                               group: "Camera" },
  { id: 8,   symbol: "INPUT_CINEMATIC_SLOWMO", label: "Cinematic Slowmo",      defaultKey: "Insert",    group: "Camera" },
  { id: 26,  symbol: "INPUT_LOOK_BEHIND",       label: "Look Behind",          defaultKey: "C",        group: "Camera" },
  { id: 27,  symbol: "INPUT_PHONE",             label: "Phone",                defaultKey: "Up Arrow", group: "Phone" },

  // ── Movement ───────────────────────────────────────────────────────────────
  { id: 21,  symbol: "INPUT_SPRINT",            label: "Sprint",               defaultKey: "Left Shift", group: "Movement" },
  { id: 22,  symbol: "INPUT_JUMP",              label: "Jump",                 defaultKey: "Space",     group: "Movement" },
  { id: 23,  symbol: "INPUT_ENTER",             label: "Enter Vehicle",        defaultKey: "F",         group: "Movement" },
  { id: 30,  symbol: "INPUT_MOVE_LR",           label: "Move Left/Right",                                group: "Movement" },
  { id: 31,  symbol: "INPUT_MOVE_UD",           label: "Move Up/Down",                                   group: "Movement" },
  { id: 32,  symbol: "INPUT_MOVE_UP_ONLY",      label: "Move Forward (W)",                               group: "Movement" },
  { id: 33,  symbol: "INPUT_MOVE_DOWN_ONLY",    label: "Move Back (S)",                                  group: "Movement" },
  { id: 34,  symbol: "INPUT_MOVE_LEFT_ONLY",    label: "Move Left (A)",                                  group: "Movement" },
  { id: 35,  symbol: "INPUT_MOVE_RIGHT_ONLY",   label: "Move Right (D)",                                 group: "Movement" },
  { id: 36,  symbol: "INPUT_DUCK",              label: "Duck / Stealth",       defaultKey: "Left Ctrl", group: "Movement" },
  { id: 37,  symbol: "INPUT_SELECT_WEAPON",     label: "Weapon Wheel",         defaultKey: "Tab",       group: "Combat" },
  { id: 38,  symbol: "INPUT_PICKUP",            label: "Pickup / Interact",    defaultKey: "E",         group: "Movement" },

  // ── Combat ─────────────────────────────────────────────────────────────────
  { id: 24,  symbol: "INPUT_ATTACK",            label: "Attack / Fire",        defaultKey: "Mouse 1",   group: "Combat" },
  { id: 25,  symbol: "INPUT_AIM",               label: "Aim",                  defaultKey: "Mouse 2",   group: "Combat" },
  { id: 45,  symbol: "INPUT_RELOAD",            label: "Reload",               defaultKey: "R",         group: "Combat" },
  { id: 47,  symbol: "INPUT_DETONATE",          label: "Detonate",             defaultKey: "G",         group: "Combat" },
  { id: 257, symbol: "INPUT_ATTACK2",           label: "Attack 2",                                       group: "Combat" },
  { id: 140, symbol: "INPUT_MELEE_ATTACK_LIGHT",     label: "Melee Light",     defaultKey: "R",         group: "Combat" },
  { id: 141, symbol: "INPUT_MELEE_ATTACK_HEAVY",     label: "Melee Heavy",     defaultKey: "Q",         group: "Combat" },
  { id: 142, symbol: "INPUT_MELEE_ATTACK_ALTERNATE", label: "Melee Alternate", defaultKey: "Mouse 1",   group: "Combat" },
  { id: 263, symbol: "INPUT_MELEE_ATTACK1",     label: "Melee Attack 1",                                 group: "Combat" },
  { id: 264, symbol: "INPUT_MELEE_ATTACK2",     label: "Melee Attack 2",                                 group: "Combat" },

  // ── Cover ──────────────────────────────────────────────────────────────────
  { id: 44,  symbol: "INPUT_COVER",             label: "Cover",                defaultKey: "Q",         group: "Cover" },

  // ── Vehicle (general) ──────────────────────────────────────────────────────
  { id: 59,  symbol: "INPUT_VEH_MOVE_LR",       label: "Vehicle Steering",                               group: "Vehicle" },
  { id: 63,  symbol: "INPUT_VEH_MOVE_LEFT_ONLY",  label: "Vehicle Steer Left",                           group: "Vehicle" },
  { id: 64,  symbol: "INPUT_VEH_MOVE_RIGHT_ONLY", label: "Vehicle Steer Right",                          group: "Vehicle" },
  { id: 71,  symbol: "INPUT_VEH_ACCELERATE",    label: "Vehicle Accelerate",   defaultKey: "W",         group: "Vehicle" },
  { id: 72,  symbol: "INPUT_VEH_BRAKE",         label: "Vehicle Brake",        defaultKey: "S",         group: "Vehicle" },
  { id: 73,  symbol: "INPUT_VEH_DUCK",          label: "Vehicle Duck",         defaultKey: "X",         group: "Vehicle" },
  { id: 74,  symbol: "INPUT_VEH_HEADLIGHT",     label: "Headlights",           defaultKey: "H",         group: "Vehicle" },
  { id: 75,  symbol: "INPUT_VEH_EXIT",          label: "Exit Vehicle",         defaultKey: "F",         group: "Vehicle" },
  { id: 76,  symbol: "INPUT_VEH_HANDBRAKE",     label: "Handbrake",            defaultKey: "Space",     group: "Vehicle" },
  { id: 80,  symbol: "INPUT_VEH_CIN_CAM",       label: "Cinematic Cam",        defaultKey: "R",         group: "Vehicle" },
  { id: 81,  symbol: "INPUT_VEH_NEXT_RADIO",    label: "Radio Next",                                     group: "Vehicle" },
  { id: 82,  symbol: "INPUT_VEH_PREV_RADIO",    label: "Radio Prev",                                     group: "Vehicle" },
  { id: 83,  symbol: "INPUT_VEH_NEXT_RADIO_TRACK", label: "Radio Next Track",                            group: "Vehicle" },
  { id: 84,  symbol: "INPUT_VEH_PREV_RADIO_TRACK", label: "Radio Prev Track",                            group: "Vehicle" },
  { id: 85,  symbol: "INPUT_VEH_RADIO_WHEEL",   label: "Radio Wheel",          defaultKey: "Q",         group: "Vehicle" },
  { id: 86,  symbol: "INPUT_VEH_HORN",          label: "Horn",                 defaultKey: "E",         group: "Vehicle" },
  { id: 90,  symbol: "INPUT_VEH_AIM",           label: "Vehicle Aim",                                    group: "Vehicle" },
  { id: 91,  symbol: "INPUT_VEH_ATTACK",        label: "Vehicle Attack",                                 group: "Vehicle" },
  { id: 92,  symbol: "INPUT_VEH_ATTACK2",       label: "Vehicle Attack 2",                               group: "Vehicle" },
  { id: 99,  symbol: "INPUT_VEH_SELECT_NEXT_WEAPON", label: "Veh Next Weapon",                           group: "Vehicle" },
  { id: 100, symbol: "INPUT_VEH_SELECT_PREV_WEAPON", label: "Veh Prev Weapon",                           group: "Vehicle" },

  // ── Vehicle (Plane/Heli) ───────────────────────────────────────────────────
  { id: 152, symbol: "INPUT_VEH_FLY_THROTTLE_UP",   label: "Plane Throttle Up",   defaultKey: "W",       group: "Vehicle (Plane/Heli)" },
  { id: 153, symbol: "INPUT_VEH_FLY_THROTTLE_DOWN", label: "Plane Throttle Down", defaultKey: "S",       group: "Vehicle (Plane/Heli)" },
  { id: 154, symbol: "INPUT_VEH_FLY_YAW_LEFT",      label: "Plane Yaw Left",      defaultKey: "A",       group: "Vehicle (Plane/Heli)" },
  { id: 155, symbol: "INPUT_VEH_FLY_YAW_RIGHT",     label: "Plane Yaw Right",     defaultKey: "D",       group: "Vehicle (Plane/Heli)" },
  { id: 158, symbol: "INPUT_VEH_FLY_ATTACK",        label: "Plane Attack",        defaultKey: "Mouse 1", group: "Vehicle (Plane/Heli)" },

  // ── Vehicle (Boat / Bike) ──────────────────────────────────────────────────
  { id: 198, symbol: "INPUT_VEH_BICYCLE_PEDAL", label: "Bike Pedal",                                     group: "Vehicle (Boat/Bike)" },

  // ── Phone ──────────────────────────────────────────────────────────────────
  { id: 137, symbol: "INPUT_FRONTEND_SOCIAL_CLUB_SECONDARY", label: "Toggle Phone (alt)",                group: "Phone" },

  // ── Frontend / UI ──────────────────────────────────────────────────────────
  { id: 199, symbol: "INPUT_FRONTEND_PAUSE",           label: "Pause Menu",         defaultKey: "P",     group: "Frontend / UI" },
  { id: 200, symbol: "INPUT_FRONTEND_PAUSE_ALTERNATE", label: "Pause Menu (alt)",   defaultKey: "Esc",   group: "Frontend / UI" },
  { id: 201, symbol: "INPUT_FRONTEND_ACCEPT",          label: "Accept",             defaultKey: "Enter", group: "Frontend / UI" },
  { id: 202, symbol: "INPUT_FRONTEND_CANCEL",          label: "Cancel",             defaultKey: "Esc",   group: "Frontend / UI" },
  { id: 244, symbol: "INPUT_INTERACTION_MENU",         label: "Interaction Menu",   defaultKey: "M",     group: "Frontend / UI" },

  // ── Multiplayer ────────────────────────────────────────────────────────────
  { id: 245, symbol: "INPUT_MP_TEXT_CHAT_ALL",  label: "Chat (All)",          defaultKey: "T",         group: "Multiplayer" },
  { id: 246, symbol: "INPUT_MP_TEXT_CHAT_TEAM", label: "Chat (Team)",         defaultKey: "Y",         group: "Multiplayer" },
  { id: 247, symbol: "INPUT_MP_TEXT_CHAT_FRIENDS", label: "Chat (Friends)",                            group: "Multiplayer" },
  { id: 248, symbol: "INPUT_MP_TEXT_CHAT_CREW", label: "Chat (Crew)",                                  group: "Multiplayer" },
  { id: 249, symbol: "INPUT_PUSH_TO_TALK",      label: "Push To Talk",        defaultKey: "N",         group: "Multiplayer" },

  // ── Misc ───────────────────────────────────────────────────────────────────
  { id: 51,  symbol: "INPUT_CONTEXT",           label: "Context (E)",         defaultKey: "E",         group: "Misc" },
  { id: 52,  symbol: "INPUT_CONTEXT_SECONDARY", label: "Context Secondary",   defaultKey: "Q",         group: "Misc" },
  { id: 19,  symbol: "INPUT_CHARACTER_WHEEL",   label: "Character Wheel",     defaultKey: "Left Alt",  group: "Misc" },
  { id: 105, symbol: "INPUT_HUD_SPECIAL",       label: "Special Ability",     defaultKey: "Caps Lock", group: "Misc" },
  { id: 121, symbol: "INPUT_MULTIPLAYER_INFO",  label: "Player List",         defaultKey: "Z",         group: "Misc" },
  { id: 170, symbol: "INPUT_SAVE_REPLAY_CLIP",  label: "Save Replay Clip",    defaultKey: "F1",        group: "Misc" },
  { id: 288, symbol: "INPUT_REPLAY_START_STOP_RECORDING",  label: "Replay Record",      defaultKey: "F1", group: "Misc" },
  { id: 289, symbol: "INPUT_REPLAY_START_STOP_RECORDING_SECONDARY", label: "Replay Record (alt)",       group: "Misc" },
];

const BY_ID = new Map<number, GtaControl>(GTA_CONTROLS.map((c) => [c.id, c]));

export function getGtaControl(id: number): GtaControl | undefined {
  return BY_ID.get(id);
}

/** Format a control id as `Label (id)`, falling back to `Control id` if unknown. */
export function formatGtaControl(id: number): string {
  const c = BY_ID.get(id);
  if (!c) return `Control ${id}`;
  return c.defaultKey ? `${c.label} (${id} · ${c.defaultKey})` : `${c.label} (${id})`;
}

/** Group order used by ControlSelect / ControlMultiSelect for the dropdown headings. */
export const GTA_CONTROL_GROUP_ORDER: GtaControlGroup[] = [
  "Camera",
  "Movement",
  "Combat",
  "Cover",
  "Vehicle",
  "Vehicle (Plane/Heli)",
  "Vehicle (Boat/Bike)",
  "Phone",
  "Frontend / UI",
  "Multiplayer",
  "Misc",
];
