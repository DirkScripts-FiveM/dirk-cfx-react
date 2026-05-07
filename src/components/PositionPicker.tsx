import { alpha, Flex, NumberInput, Text, Tooltip, useMantineTheme } from "@mantine/core";
import { motion } from "framer-motion";
import { Crosshair, Eye, EyeOff, MapPin, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fetchNui } from "../utils/fetchNui";
import { locale } from "../utils/locales";

export type Vector4Value = { x: number; y: number; z: number; w: number };

export type PositionPickerProps = {
  label?: string;
  value: Vector4Value;
  onChange: (v: Vector4Value) => void;
  /**
   * If set, the picker treats `value` as an offset from this entity reference
   * (e.g. "shell"). The Lua side must handle GET_POSITION + relativeTo by
   * returning (playerCoords - entityCoords) instead of world coords, and must
   * resolve the same reference when previewing.
   */
  relativeTo?: string;
  /** Optional NUI event name to fetch the current position. Defaults to GET_POSITION. */
  fetchEvent?: string;
  /** Optional NUI event name to draw a marker at the value. Defaults to PREVIEW_POSITION. */
  previewEvent?: string;
  /** Optional NUI event name to clear the preview marker. Defaults to STOP_PREVIEW_POSITION. */
  stopPreviewEvent?: string;
  description?: string;
  showHeading?: boolean;
};

const ZERO: Vector4Value = { x: 0, y: 0, z: 0, w: 0 };

export function PositionPicker(props: PositionPickerProps) {
  const {
    label,
    value,
    onChange,
    relativeTo,
    fetchEvent = "GET_POSITION",
    previewEvent = "PREVIEW_POSITION",
    stopPreviewEvent = "STOP_PREVIEW_POSITION",
    description,
    showHeading = true,
  } = props;

  const theme = useMantineTheme();
  const color = theme.colors[theme.primaryColor][5];

  const [previewing, setPreviewing] = useState(false);
  const previewingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (previewingRef.current) {
        fetchNui(stopPreviewEvent, { relativeTo }).catch(() => {});
      }
    };
  }, [stopPreviewEvent, relativeTo]);

  const set = <K extends keyof Vector4Value>(key: K, val: number) => {
    const next = { ...value, [key]: val };
    onChange(next);
    if (previewingRef.current) {
      fetchNui(previewEvent, { value: next, relativeTo }).catch(() => {});
    }
  };

  const grab = async () => {
    try {
      const resp = await fetchNui<Vector4Value | null>(fetchEvent, { relativeTo }, value);
      if (resp && typeof resp === "object") {
        const next: Vector4Value = {
          x: Number(resp.x ?? 0),
          y: Number(resp.y ?? 0),
          z: Number(resp.z ?? 0),
          w: Number(resp.w ?? 0),
        };
        onChange(next);
        if (previewingRef.current) {
          fetchNui(previewEvent, { value: next, relativeTo }).catch(() => {});
        }
      }
    } catch {
      // ignore — Lua side may not be wired up yet
    }
  };

  const togglePreview = async () => {
    const nextState = !previewing;
    setPreviewing(nextState);
    previewingRef.current = nextState;
    if (nextState) {
      await fetchNui(previewEvent, { value, relativeTo }).catch(() => {});
    } else {
      await fetchNui(stopPreviewEvent, { relativeTo }).catch(() => {});
    }
  };

  const reset = () => {
    onChange({ ...ZERO });
    if (previewingRef.current) {
      fetchNui(previewEvent, { value: ZERO, relativeTo }).catch(() => {});
    }
  };

  const numberStyles = {
    input: { textAlign: "right" as const, fontFamily: "monospace" },
  };

  return (
    <Flex
      direction="column"
      gap="xxs"
      p="xs"
      style={{
        background: alpha(theme.colors.dark[5], 0.35),
        border: "0.1vh solid rgba(255,255,255,0.05)",
        borderRadius: theme.radius.xs,
      }}
    >
      {(label || description) && (
        <Flex justify="space-between" align="center" gap="xs">
          <Flex direction="column" gap={0} style={{ minWidth: 0 }}>
            {label && (
              <Flex align="center" gap="xxs">
                <MapPin size="1.4vh" color={alpha(color, 0.7)} />
                <Text
                  ff="Akrobat Bold"
                  size="xxs"
                  tt="uppercase"
                  lts="0.05em"
                  c="rgba(255,255,255,0.75)"
                >
                  {locale(label)}
                </Text>
                {relativeTo && (
                  <Text ff="Akrobat Bold" size="xxs" c={alpha(color, 0.5)} lts="0.05em">
                    · {locale("RelativeTo")} {relativeTo}
                  </Text>
                )}
              </Flex>
            )}
            {description && (
              <Text ff="Akrobat Bold" size="xxs" c="dimmed" lh={1.3}>
                {locale(description)}
              </Text>
            )}
          </Flex>

          <Flex gap="xxs" style={{ flexShrink: 0 }}>
            <PickerButton tooltip={locale("GrabMyPosition")} onClick={grab} color={color}>
              <Crosshair size="1.4vh" color={color} />
            </PickerButton>
            <PickerButton
              tooltip={previewing ? locale("StopPreview") : locale("PreviewInWorld")}
              onClick={togglePreview}
              color={color}
              active={previewing}
            >
              {previewing ? (
                <EyeOff size="1.4vh" color={color} />
              ) : (
                <Eye size="1.4vh" color={alpha(color, 0.7)} />
              )}
            </PickerButton>
            <PickerButton tooltip={locale("Reset")} onClick={reset} color="#ef4444">
              <RotateCcw size="1.4vh" color="#ef4444" />
            </PickerButton>
          </Flex>
        </Flex>
      )}

      <Flex gap="xxs">
        <NumberInput
          size="xs"
          label="X"
          value={value.x}
          onChange={(v) => set("x", Number(v))}
          decimalScale={4}
          step={0.1}
          style={{ flex: 1 }}
          styles={numberStyles}
        />
        <NumberInput
          size="xs"
          label="Y"
          value={value.y}
          onChange={(v) => set("y", Number(v))}
          decimalScale={4}
          step={0.1}
          style={{ flex: 1 }}
          styles={numberStyles}
        />
        <NumberInput
          size="xs"
          label="Z"
          value={value.z}
          onChange={(v) => set("z", Number(v))}
          decimalScale={4}
          step={0.1}
          style={{ flex: 1 }}
          styles={numberStyles}
        />
        {showHeading && (
          <NumberInput
            size="xs"
            label="W"
            value={value.w}
            onChange={(v) => set("w", Number(v))}
            decimalScale={2}
            step={1}
            min={0}
            max={360}
            style={{ flex: 1 }}
            styles={numberStyles}
          />
        )}
      </Flex>
    </Flex>
  );
}

function PickerButton({
  children,
  onClick,
  tooltip,
  color,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tooltip: string;
  color: string;
  active?: boolean;
}) {
  const theme = useMantineTheme();
  return (
    <Tooltip label={tooltip} position="top" withArrow>
      <motion.button
        onClick={onClick}
        whileHover={{ background: alpha(color, 0.18) }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: active ? alpha(color, 0.22) : alpha(color, 0.08),
          border: `0.1vh solid ${alpha(color, active ? 0.5 : 0.3)}`,
          borderRadius: theme.radius.xs,
          padding: "0.4vh 0.6vh",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </motion.button>
    </Tooltip>
  );
}
