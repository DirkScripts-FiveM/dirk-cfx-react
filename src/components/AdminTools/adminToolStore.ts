// Shared store for "in-world admin tools" — flows where the React admin UI
// releases NUI focus, lets the player do something in the game world, and
// resolves a Promise when they confirm or cancel.
//
// Every tool (capture position, place object, etc.) plugs into the same
// store so AdminOverlays can render at most one InstructionPanel at a time
// and the tool's start() returns a typed Promise. Lua side fires the
// matching SendNUIMessage('<TOOL_ID>_RESULT' / '<TOOL_ID>_CANCELLED'),
// which AdminOverlays routes back to whichever tool is active.
import { create } from "zustand";

export type ActiveTool<Result = unknown> = {
  /** Tool id matching the SendNUIMessage event names from Lua. */
  id: string;
  /** Title shown in the InstructionPanel header. */
  title: string;
  /** Optional sub-text under the title. */
  hint?: string;
  /** Key bindings shown as labelled key caps. */
  keys?: { key: string; action: string }[];
  /** Resolve handler for the in-flight Promise. */
  resolve: (v: Result | null) => void;
};

type AdminToolStore = {
  active: ActiveTool | null;
  /**
   * Begin a tool flow. Returns a Promise resolving to the tool's typed
   * result (or null on cancel / replacement). Replaces any currently-active
   * tool by cancelling it first — only one in-world prompt at a time.
   */
  begin: <Result>(spec: Omit<ActiveTool<Result>, "resolve">) => Promise<Result | null>;
  /** Settle the currently-active tool with a value (called by SendNUIMessage handler). */
  resolveActive: (value: unknown) => void;
  /** Cancel the currently-active tool (called by SendNUIMessage handler or programmatic cancel). */
  cancelActive: () => void;
};

export const useAdminToolStore = create<AdminToolStore>((set, get) => ({
  active: null,
  begin: <Result>(spec: Omit<ActiveTool<Result>, "resolve">) =>
    new Promise<Result | null>((resolve) => {
      const prev = get().active;
      if (prev) prev.resolve(null); // bump the previous tool out
      set({ active: { ...spec, resolve: resolve as ActiveTool["resolve"] } });
    }),
  resolveActive: (value) => {
    const cur = get().active;
    if (!cur) return;
    cur.resolve(value);
    set({ active: null });
  },
  cancelActive: () => {
    const cur = get().active;
    if (!cur) return;
    cur.resolve(null);
    set({ active: null });
  },
}));
