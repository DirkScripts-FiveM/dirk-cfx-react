// Internal. Auto-mounted by DirkProvider. Consumers never reference this
// directly — it just exists in the tree so any admin-tool flow has its
// InstructionPanel + NUI-message routing wired up automatically.
//
// What it does:
//   • Subscribes to <toolId>_RESULT and <toolId>_CANCELLED NUI messages
//     from any admin tool and routes them into useAdminToolStore.
//   • Renders the active tool's InstructionPanel (bottom-right card) while
//     a tool is in flight.
//
// Adding a new admin tool? No changes here — the store-driven plumbing
// handles arbitrary tool ids. Just have the new tool's Lua side fire
// SendNUIMessage({ action: '<id>_RESULT', data: <payload> }) and call
// useAdminToolStore.begin({ id: '<id>', title, hint, keys }) from the
// React side that triggers it.
import { useEffect } from "react";
import { useAdminToolStore } from "./adminToolStore";
import { InstructionPanel } from "../InstructionPanel";

// Single global listener registration so multiple DirkProviders (if a
// consumer ever stacks them) don't multiply-route the same message into
// the store. Guarded by a module-level flag.
let listenerInstalled = false;

function installNuiListener() {
  if (listenerInstalled || typeof window === "undefined") return;
  listenerInstalled = true;
  window.addEventListener("message", (e) => {
    const msg = e?.data;
    if (!msg || typeof msg !== "object" || typeof msg.action !== "string") return;
    const action: string = msg.action;
    const cur = useAdminToolStore.getState().active;
    if (!cur) return;
    if (action === `${cur.id}_RESULT`) {
      useAdminToolStore.getState().resolveActive(msg.data ?? null);
    } else if (action === `${cur.id}_CANCELLED`) {
      useAdminToolStore.getState().cancelActive();
    }
  });
}

export function AdminOverlays() {
  const active = useAdminToolStore((s) => s.active);

  useEffect(() => {
    installNuiListener();
  }, []);

  return (
    <InstructionPanel
      visible={!!active}
      title={active?.title ?? ""}
      hint={active?.hint}
      keys={active?.keys}
    />
  );
}
