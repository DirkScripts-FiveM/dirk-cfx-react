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

// Specials: when the consumer passes 'LMB' / 'RMB' / 'BACKSPACE' / '⌫' as
// the key label, render an icon instead of plain text so the cap reads at
// a glance. Anything else falls through to text rendering with extra
// horizontal padding so long labels like 'ESC' / 'TAB' don't look cramped.
function renderKeyContent(keyLabel: string): React.ReactNode {
  const normalized = keyLabel.trim().toUpperCase();
  if (normalized === "LMB") return <MouseIcon side="left" />;
  if (normalized === "RMB") return <MouseIcon side="right" />;
  if (normalized === "BACKSPACE" || keyLabel === "⌫") return <BackspaceIcon />;
  return (
    <Text
      style={{
        fontFamily: "Akrobat Bold, sans-serif",
        fontSize: "1.2vh",
        color: "rgba(255,255,255,0.85)",
        lineHeight: 1,
        padding: "0 0.3vh",
      }}
    >
      {keyLabel}
    </Text>
  );
}

function InstructionKeyRow({ keyLabel, action }: { keyLabel: string; action: string }) {
  // Special icon labels read better on a slightly wider cap (the mouse
  // glyph is wider than a letter). Text-only caps stay square.
  const normalized = keyLabel.trim().toUpperCase();
  const isIconKey = normalized === "LMB" || normalized === "RMB"
    || normalized === "BACKSPACE" || keyLabel === "⌫";
  const minWidth = isIconKey ? "2.6vh" : "2.4vh";

  return (
    <Flex align="center" gap="0.6vh">
      <div
        style={{
          minWidth,
          height: "2.4vh",
          padding: "0 0.4vh",
          borderRadius: "0.3vh",
          border: "0.15vh solid rgba(255,255,255,0.35)",
          background: "rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.85,
          filter: "drop-shadow(0 0 0.3vh rgba(0,0,0,0.5))",
          flexShrink: 0,
          boxSizing: "border-box",
        }}
      >
        {renderKeyContent(keyLabel)}
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

// Inline mouse-body SVG with one half highlighted. Matches the visual
// convention of left/right click hints used elsewhere in the dirk UIs
// (e.g. dirk_fishing's DUI rod indicator).
function MouseIcon({ side }: { side: "left" | "right" }) {
  const stroke = "rgba(255,255,255,0.85)";
  const fillActive = "rgba(255,255,255,0.85)";
  return (
    <svg viewBox="0 0 16 22" width="1.4vh" height="1.9vh" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinejoin="round">
      {/* Mouse body */}
      <rect x="1" y="1" width="14" height="20" rx="6" />
      {/* Centre divider */}
      <line x1="8" y1="1" x2="8" y2="9" />
      {/* Highlighted button — fill the left or right top quadrant */}
      <path
        d={
          side === "left"
            ? "M 7.4 1.6 L 2 1.6 A 5 5 0 0 0 1 6 L 1 9 L 7.4 9 Z"
            : "M 8.6 1.6 L 14 1.6 A 5 5 0 0 1 15 6 L 15 9 L 8.6 9 Z"
        }
        fill={fillActive}
        stroke="none"
      />
    </svg>
  );
}

function BackspaceIcon() {
  // Backspace key shape (chevron pointing left into a tag). Matches the
  // shape of a physical Backspace key on a US layout. Plain SVG so it
  // ships without an asset file.
  const stroke = "rgba(255,255,255,0.85)";
  return (
    <svg viewBox="0 0 22 16" width="1.7vh" height="1.3vh" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
      <path d="M 21 2 L 8 2 L 2 8 L 8 14 L 21 14 Z" />
      <line x1="11" y1="6" x2="16" y2="11" />
      <line x1="16" y1="6" x2="11" y2="11" />
    </svg>
  );
}
