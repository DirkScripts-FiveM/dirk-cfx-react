// Renders a GTA-V blip on a Leaflet map at the given world coords.
// Uses the same sprite/color id system the game uses, looked up against
// the BLIP_ENTRIES / BLIP_COLORS tables in BlipSelect.tsx so the visual
// matches whatever the admin picked in <BlipIconSelect> / <BlipColorSelect>.
//
// The colour comes from the GTA blip palette and is applied as a tinted
// background behind the white sprite, mimicking the in-game look. For
// labs/shops/etc that have no blip configured, pass `fallbackSprite` and
// `fallbackColor` and the marker still renders with a neutral look.
//
// Use:
//   <BlipMarker
//     position={{ x: lab.door.x, y: lab.door.y }}
//     sprite={lab.blip?.sprite}
//     color={lab.blip?.color}
//     onClick={() => openEdit(lab.name)}
//     selected={selectedId === lab.name}
//   />
import { Marker } from "@adamscybot/react-leaflet-component-marker";
import { alpha } from "@mantine/core";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { gameToMap } from "../../utils/map";
import { blipUrlForSprite, getBlipColor } from "../BlipSelect";

export type BlipMarkerProps = {
  /** Game-world coordinates. z is ignored; map is 2D. */
  position: { x: number; y: number };
  /** Blip sprite id (0..830ish) — see BLIP_ENTRIES. */
  sprite?: number | null;
  /** Blip color id (0..85) — see BLIP_COLORS. */
  color?: number | null;
  /** Display scale multiplier. Default 1.0 → ~3vh visual size. */
  scale?: number;
  /** Click handler. Fires `e.originalEvent.stopPropagation()` before yours. */
  onClick?: () => void;
  /** When true, marker gets a brighter glow + bigger size to indicate
   *  this is the currently-selected entry. */
  selected?: boolean;
  /** When true, marker is rendered at low opacity and clicks no-op —
   *  for "this entry is broken / unavailable" states. */
  disabled?: boolean;
  /** Sprite id used when `sprite` is null/missing. Defaults to 162
   *  (radar_poi — neutral grey dot). */
  fallbackSprite?: number;
  /** Color id used when `color` is null/missing. Defaults to 0 (white). */
  fallbackColor?: number;
};

const DEFAULT_SPRITE = 162; // radar_poi
const DEFAULT_COLOR = 5;     // yellow — readable on the GTA map (color 0/white blends in)

export function BlipMarker({
  position,
  sprite,
  color,
  scale = 1,
  onClick,
  selected,
  disabled,
  fallbackSprite = DEFAULT_SPRITE,
  fallbackColor = DEFAULT_COLOR,
}: BlipMarkerProps) {
  const [hovered, setHovered] = useState(false);

  const mapCoords = useMemo(() => gameToMap(position.x, position.y), [position.x, position.y]);

  const effectiveSprite = sprite ?? fallbackSprite;
  const effectiveColor = color ?? fallbackColor;
  const url = blipUrlForSprite(effectiveSprite);
  const colorHex = getBlipColor(effectiveColor)?.hex ?? "#ffffff";

  const handleClick = (e: any) => {
    e.originalEvent?.stopPropagation?.();
    if (disabled) return;
    onClick?.();
  };

  // Default ~1.8vh — Rockstar's sprite pngs are tiny (32px-ish), going much
  // bigger amplifies the pixelation. Scale prop lets consumers nudge up
  // for high-importance markers.
  const baseSize = 1.8 * scale;
  const size = `${baseSize}vh`;
  const ringSize = `${baseSize * 1.6}vh`;

  return (
    <Marker
      position={mapCoords}
      eventHandlers={onClick ? { click: handleClick } : undefined}
      icon={
        <motion.div
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: disabled ? "not-allowed" : onClick ? "pointer" : "default",
            opacity: disabled ? 0.35 : 1,
            width: size,
            height: size,
          }}
          animate={{ scale: hovered && !disabled ? 1.2 : selected ? 1.15 : 1 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          {/* Selection / hover ring (no solid disk behind the sprite — the
              old version's white-tinted disk looked bad over the map). */}
          {(selected || hovered) && !disabled && (
            <motion.div
              style={{
                position: "absolute",
                width: ringSize,
                height: ringSize,
                borderRadius: "50%",
                border: `0.18vh solid ${alpha(colorHex, 0.85)}`,
                boxShadow: `0 0 1vh ${alpha(colorHex, 0.55)}`,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            />
          )}

          {/* Tinted sprite via CSS mask. Rockstar's blip pngs are white
              silhouettes — using mask-image + background-color paints them
              in the blip's GTA color cleanly, no halo, no double-render.
              The stacked 1px drop-shadows in 4 cardinal directions fake a
              uniform 1px black outline (CSS has no native stroke for masked
              elements). Final big drop-shadow adds the soft halo for depth. */}
          {url && (
            <div
              style={{
                width: size,
                height: size,
                backgroundColor: colorHex,
                WebkitMaskImage: `url(${url})`,
                maskImage: `url(${url})`,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                filter: [
                  "drop-shadow(0.12vh 0 0 #000)",
                  "drop-shadow(-0.12vh 0 0 #000)",
                  "drop-shadow(0 0.12vh 0 #000)",
                  "drop-shadow(0 -0.12vh 0 #000)",
                  `drop-shadow(0 0 0.4vh ${alpha("#000", 0.7)})`,
                ].join(" "),
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          )}
        </motion.div>
      }
    />
  );
}
