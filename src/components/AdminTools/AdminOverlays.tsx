// Internal. Auto-mounted by DirkProvider. Consumers never reference this
// directly — it just exists in the tree so any admin-tool flow has its
// NUI-message routing and admin-UI-hide effect wired up automatically.
//
// What it does (and DOESN'T do anymore):
//   • Subscribes to <toolId>_RESULT and <toolId>_CANCELLED NUI messages
//     from any admin tool and routes them into useAdminToolStore so
//     `await pickDoor()` etc. resolve.
//   • While a tool is active, applies a body attribute so the consumer
//     admin UI hides itself (so the player sees the world).
//
// What used to live here but doesn't anymore:
//   • Rendering the bottom-right InstructionPanel — that's now ALWAYS
//     driven by dirk_lib's own NUI via `lib.showInstructions`, so the
//     panel renders in one place regardless of where the tool was
//     triggered from. Avoids dual code paths and per-resource iframe
//     compositing differences that were eating immediate-mode draws.

import { useEffect } from "react";
import { useAdminToolStore } from "./adminToolStore";

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

// CSS injected once that hides every body child except things tagged
// with data-dirk-instruction-overlay. Used to make the consumer's
// admin panel disappear so the player sees the world while picking.
const BODY_HIDE_STYLE_ID = "dirk-instruction-panel-style";
const BODY_HIDE_ATTR = "data-dirk-instruction-active";
const OVERLAY_ATTR = "data-dirk-instruction-overlay";

function ensureBodyHideStyle() {
  if (typeof document === "undefined") return;
  if (document.getElementById(BODY_HIDE_STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = BODY_HIDE_STYLE_ID;
  el.textContent = `
    body[${BODY_HIDE_ATTR}] > *:not([${OVERLAY_ATTR}]) {
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;
  document.head.appendChild(el);
}

export function AdminOverlays() {
  const active = useAdminToolStore((s) => s.active);

  useEffect(() => {
    installNuiListener();
  }, []);

  // Body-hide effect — toggles the attribute while a tool is in flight
  // so the consumer admin UI vanishes and the player sees the world.
  useEffect(() => {
    if (!active || typeof document === "undefined") return;
    ensureBodyHideStyle();
    document.body.setAttribute(BODY_HIDE_ATTR, "");
    return () => {
      document.body.removeAttribute(BODY_HIDE_ATTR);
    };
  }, [active]);

  // Nothing visual to render — dirk_lib's NUI handles the bottom-right
  // InstructionPanel via lib.showInstructions.
  return null;
}
