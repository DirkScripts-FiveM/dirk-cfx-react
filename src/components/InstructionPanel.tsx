// General-purpose bottom-right "do this in-world" instruction overlay.
//
// Reused by every admin-tool flow that releases NUI focus and asks the
// player to do something in the game world: capture a position, place an
// object, paint a navmesh, etc. The card itself is dumb — it just renders
// a title + hint + list of key labels and stays out of the way.
//
// While visible it hides every other body child via a CSS attribute trick,
// so the admin panel underneath keeps its React state intact (we never
// unmount it). Set hideRestOfAdmin={false} on rare cases where you want
// the panel to overlay alongside other UI rather than replace it.
import { alpha, Flex, Text, useMantineTheme } from "@mantine/core";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { MapPin } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export type InstructionKey = {
  /** Short label drawn inside the key cap (e.g. "E", "⌫", "F"). */
  key: string;
  /** What the key does (e.g. "Set", "Cancel"). */
  action: string;
};

export type InstructionPanelProps = {
  visible: boolean;
  title: string;
  /** One- or two-line subtext explaining what to do. */
  hint?: string;
  /** List of key bindings shown as labelled key caps. */
  keys?: InstructionKey[];
  /** Override the default MapPin icon next to the title. */
  icon?: LucideIcon;
  /**
   * When true (default) every direct child of <body> except this overlay is
   * hidden via a CSS rule. Lets the admin panel stay mounted (React state
   * preserved) while the player sees only the game world + this card.
   * Set false if you want the card to sit alongside other UI.
   */
  hideRestOfAdmin?: boolean;
};

const BODY_HIDE_STYLE_ID = "dirk-instruction-panel-style";
const BODY_HIDE_ATTR = "data-dirk-instruction-active";
const OVERLAY_ATTR = "data-dirk-instruction-overlay";

function ensureBodyHideStyle() {
  if (document.getElementById(BODY_HIDE_STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = BODY_HIDE_STYLE_ID;
  // Belt-and-braces: visibility alone gets overridden by Mantine animations
  // on some children (modal backdrops, transition wrappers etc), so combine
  // it with opacity + pointer-events to make sure everything goes dark
  // while preserving React state via the still-mounted DOM tree.
  el.textContent = `
    body[${BODY_HIDE_ATTR}] > *:not([${OVERLAY_ATTR}]) {
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;
  document.head.appendChild(el);
}

export function InstructionPanel({
  visible,
  title,
  hint,
  keys,
  icon: Icon = MapPin,
  hideRestOfAdmin = true,
}: InstructionPanelProps) {
  const theme = useMantineTheme();
  const pc = theme.colors[theme.primaryColor];

  useEffect(() => {
    if (!visible || !hideRestOfAdmin) return;
    ensureBodyHideStyle();
    document.body.setAttribute(BODY_HIDE_ATTR, "");
    return () => {
      document.body.removeAttribute(BODY_HIDE_ATTR);
    };
  }, [visible, hideRestOfAdmin]);

  if (!visible) return null;

  return createPortal(
    <div
      {...{ [OVERLAY_ATTR]: "" }}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 10000 }}
    >
      <AnimatePresence>
        <motion.div
          key="instruction-card"
          initial={{ opacity: 0, y: 12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.92 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          style={{ position: "absolute", bottom: "3vh", right: "3vh", userSelect: "none" }}
        >
          <Flex
            direction="column"
            gap="0.8vh"
            style={{
              background: alpha(theme.colors.dark[9], 0.55),
              border: "0.1vh solid rgba(255,255,255,0.07)",
              borderRadius: theme.radius.sm,
              boxShadow: "0 0.74vh 2.96vh rgba(0,0,0,0.5)",
              padding: "1.4vh 1.6vh",
              minWidth: "22vh",
              maxWidth: "28vh",
            }}
          >
            <Flex align="center" gap="0.6vh">
              <Icon size="1.6vh" color={pc[6]} strokeWidth={2.5} />
              <Text
                style={{
                  fontFamily: "Akrobat Bold, sans-serif",
                  fontSize: "1.7vh",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: pc[6],
                  textShadow: `0 0 0.8vh ${alpha(pc[7], 0.5)}, 0 0 1.6vh ${alpha(pc[9], 0.3)}`,
                }}
              >
                {title}
              </Text>
            </Flex>

            {(hint || (keys && keys.length > 0)) && (
              <div style={{ height: "0.1vh", background: "rgba(255,255,255,0.06)", margin: "0.1vh 0" }} />
            )}

            {hint && (
              <Text
                style={{
                  fontFamily: "Akrobat Bold, sans-serif",
                  fontSize: "1.05vh",
                  color: "rgba(255,255,255,0.45)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  lineHeight: 1.4,
                }}
              >
                {hint}
              </Text>
            )}

            {keys && keys.length > 0 && (
              <>
                {hint && (
                  <div style={{ height: "0.1vh", background: "rgba(255,255,255,0.06)", margin: "0.1vh 0" }} />
                )}
                <Flex direction="column" gap="0.5vh">
                  {keys.map((k, i) => (
                    <InstructionKeyRow key={i} keyLabel={k.key} action={k.action} />
                  ))}
                </Flex>
              </>
            )}
          </Flex>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body,
  );
}

function InstructionKeyRow({ keyLabel, action }: { keyLabel: string; action: string }) {
  return (
    <Flex align="center" gap="0.6vh">
      <div
        style={{
          width: "2.2vh",
          height: "2.2vh",
          borderRadius: "0.3vh",
          border: "0.15vh solid rgba(255,255,255,0.35)",
          background: "rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.85,
          filter: "drop-shadow(0 0 0.3vh rgba(0,0,0,0.5))",
          flexShrink: 0,
        }}
      >
        <Text
          style={{
            fontFamily: "Akrobat Bold, sans-serif",
            fontSize: "1.2vh",
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1,
          }}
        >
          {keyLabel}
        </Text>
      </div>
      <Text
        style={{
          fontFamily: "Akrobat Bold, sans-serif",
          fontSize: "1.05vh",
          color: "rgba(255,255,255,0.45)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {action}
      </Text>
    </Flex>
  );
}
