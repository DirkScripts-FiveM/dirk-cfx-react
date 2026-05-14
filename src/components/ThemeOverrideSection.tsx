// Per-resource theme override editor. Rendered inside a consumer resource's
// configurator (e.g. dirk_multichar, dirk_fishing) to let admins decouple
// that resource's theme from dirk_lib's global appearance.
//
// Data shape (driven by a schema block on the consumer side):
//   theme: {
//     useOverride: boolean,
//     primaryColor: string,    // "dirk" | "custom" | mantine palette name
//     primaryShade: 0..9,
//     customTheme: string[10], // hex stops
//   }
//
// The override flag goes through the same scriptConfig path as everything
// else — the resource's GET_SETTINGS callback is responsible for deciding
// whether to push the global theme keys or the override keys to NUI on
// hydration. DirkProvider's UPDATE_DIRK_LIB_SETTINGS listener gates global
// pushes when the consumer has its own override active (see useSettings).
//
// Reset-to-global = flip the override switch off. The saved palette stays so
// admins can re-enable without re-picking colours. A separate wipe trash icon
// nukes the local palette back to the schema default.

import { generateColors } from "@mantine/colors-generator";
import {
  ActionIcon,
  ColorInput,
  Flex,
  NumberInput,
  Popover,
  Select,
  Switch,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { Palette, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useFormActions, useFormField } from "@/hooks/useForm";
import { locale } from "@/utils/locales";
import { AdminPageTitle } from "./AdminPageTitle";

const MANTINE_COLOR_OPTIONS = [
  "dirk",
  "red",
  "pink",
  "grape",
  "violet",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "green",
  "lime",
  "yellow",
  "orange",
].map((value) => ({ value, label: value }));

export type ThemeOverrideValue = {
  useOverride: boolean;
  primaryColor: string;
  primaryShade: number;
  customTheme: string[];
};

const DEFAULT_PALETTE: string[] = [
  "#f0f4ff",
  "#d9e3ff",
  "#bfcfff",
  "#a6bbff",
  "#8ca7ff",
  "#7393ff",
  "#5a7fff",
  "#406bff",
  "#2547ff",
  "#0b33ff",
];

const DEFAULT_VALUE: ThemeOverrideValue = {
  useOverride: false,
  primaryColor: "dirk",
  primaryShade: 5,
  customTheme: DEFAULT_PALETTE,
};

function GroupLabel({ label }: { label: string }) {
  return (
    <Flex align="center" gap="xs" mt="xxs">
      <Text ff="Akrobat Bold" size="xxs" tt="uppercase" lts="0.07em" c="rgba(255,255,255,0.2)">
        {label}
      </Text>
      <div style={{ flex: 1, height: "0.05vh", background: "rgba(255,255,255,0.06)" }} />
    </Flex>
  );
}

export type ThemeOverrideSectionProps = {
  /**
   * Schema path the consumer stores its override block under. Defaults to
   * "theme" — matches the recommended schema key.
   */
  schemaKey?: string;
  /**
   * Optional title for the AdminPageTitle. Defaults to the localized
   * "Theme" string with a fallback.
   */
  title?: string;
};

export function ThemeOverrideSection({
  schemaKey = "theme",
  title,
}: ThemeOverrideSectionProps) {
  const mantineTheme = useMantineTheme();
  const color = mantineTheme.colors[mantineTheme.primaryColor][5];

  const raw = useFormField<Record<string, ThemeOverrideValue>>(schemaKey as never) as
    | Partial<ThemeOverrideValue>
    | undefined;
  // Normalise — the form field could be undefined at first paint, and any of
  // the inner fields could be missing if the schema default block hasn't
  // fully hydrated. Merge against DEFAULT_VALUE so the inputs always have
  // something to render.
  const value: ThemeOverrideValue = {
    useOverride: raw?.useOverride ?? DEFAULT_VALUE.useOverride,
    primaryColor: raw?.primaryColor ?? DEFAULT_VALUE.primaryColor,
    primaryShade: raw?.primaryShade ?? DEFAULT_VALUE.primaryShade,
    customTheme:
      Array.isArray(raw?.customTheme) && raw!.customTheme.length === 10
        ? (raw!.customTheme as string[])
        : DEFAULT_VALUE.customTheme,
  };

  const { setValue } = useFormActions<Record<string, ThemeOverrideValue>>();
  const set = <K extends keyof ThemeOverrideValue>(key: K, val: ThemeOverrideValue[K]) =>
    setValue(schemaKey as never, { ...value, [key]: val } as never);

  const useCustom = value.primaryColor === "custom";
  const editable = value.useOverride;

  const setSwatch = (index: number, hex: string) => {
    const next = [...value.customTheme];
    next[index] = hex;
    set("customTheme", next);
  };

  const generateFromBase = (hex: string) => {
    try {
      const generated = generateColors(hex);
      set("customTheme", generated as unknown as string[]);
    } catch {
      // invalid colour — ignore
    }
  };

  const resetPalette = () => set("customTheme", DEFAULT_PALETTE);

  return (
    <Flex
      direction="column"
      gap="xs"
      p="sm"
      style={{ flex: 1, minHeight: 0, overflowY: "auto" }}
    >
      <AdminPageTitle
        icon={Palette}
        title={title || locale("Theme") || "Theme"}
        color={color}
      />

      {/* Master toggle — flipping this off resets the resource to follow the
          global dirk_lib theme. The saved palette is preserved so re-enabling
          doesn't lose work. */}
      <Flex
        align="center"
        justify="space-between"
        p="xs"
        style={{
          background: `rgba(255,255,255,${editable ? 0.04 : 0.02})`,
          border: `0.1vh solid ${editable ? color : "rgba(255,255,255,0.08)"}`,
          borderRadius: mantineTheme.radius.xs,
          transition: "background 0.15s, border-color 0.15s",
        }}
      >
        <Flex direction="column" gap="xxs" style={{ flex: 1, minWidth: 0 }}>
          <Text ff="Akrobat Bold" size="xs" c="rgba(255,255,255,0.9)">
            {locale("OverrideGlobalTheme") || "Override global theme"}
          </Text>
          <Text ff="Akrobat Bold" size="xxs" c="rgba(255,255,255,0.4)">
            {locale("OverrideGlobalThemeDesc") ||
              "When on, this resource uses its own primary colour and palette instead of dirk_lib's. Turn off to fall back to the global theme — your custom palette is kept."}
          </Text>
        </Flex>
        <Switch
          size="md"
          checked={value.useOverride}
          onChange={(e) => set("useOverride", e.currentTarget.checked)}
        />
      </Flex>

      <div
        style={{
          opacity: editable ? 1 : 0.4,
          pointerEvents: editable ? "auto" : "none",
          transition: "opacity 0.15s",
        }}
      >
        <GroupLabel label={locale("PrimaryColor") || "Primary Colour"} />

        <Switch
          label={locale("UseCustomPalette") || "Use custom palette"}
          size="md"
          mt="xs"
          checked={useCustom}
          onChange={(e) => set("primaryColor", e.currentTarget.checked ? "custom" : "dirk")}
          styles={{
            label: {
              fontFamily: "Akrobat Bold",
              fontSize: "0.65em",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
            },
          }}
        />

        <Flex gap="xs" mt="xs">
          {!useCustom && (
            <Select
              label={locale("MantinePalette") || "Mantine palette"}
              size="xs"
              style={{ flex: 1 }}
              value={value.primaryColor}
              data={MANTINE_COLOR_OPTIONS}
              allowDeselect={false}
              onChange={(v) => v && set("primaryColor", v)}
            />
          )}
          <NumberInput
            label={locale("Shade") || "Shade"}
            size="xs"
            style={{ flex: 1 }}
            min={0}
            max={9}
            value={value.primaryShade}
            onChange={(v) => set("primaryShade", Number(v))}
          />
        </Flex>

        {useCustom && (
          <>
            <Flex align="center" justify="space-between" mt="sm">
              <Text
                ff="Akrobat Bold"
                size="xxs"
                tt="uppercase"
                lts="0.07em"
                c="rgba(255,255,255,0.2)"
              >
                {locale("CustomPalette") || "Custom palette"}
              </Text>
              <ActionIcon
                size="sm"
                variant="subtle"
                onClick={resetPalette}
                title={locale("ResetPalette") || "Reset palette"}
              >
                <RotateCcw size="1.4vh" />
              </ActionIcon>
            </Flex>

            <ColorInput
              label={locale("BaseColor") || "Base colour"}
              size="xs"
              value={value.customTheme[value.primaryShade] ?? value.customTheme[5] ?? "#000000"}
              onChange={generateFromBase}
              eyeDropperIcon={<></>}
            />

            <Flex gap="xxs" mt="xxs">
              {value.customTheme.map((swatch, i) => (
                <SwatchTile
                  key={i}
                  index={i}
                  value={swatch}
                  isPrimary={i === value.primaryShade}
                  onChange={(v) => setSwatch(i, v)}
                />
              ))}
            </Flex>
          </>
        )}
      </div>
    </Flex>
  );
}

function SwatchTile({
  index,
  value,
  isPrimary,
  onChange,
}: {
  index: number;
  value: string;
  isPrimary: boolean;
  onChange: (v: string) => void;
}) {
  const [opened, setOpened] = useState(false);
  return (
    <Popover opened={opened} onChange={setOpened} position="bottom" withArrow zIndex={10000}>
      <Popover.Target>
        <button
          onClick={() => setOpened((o) => !o)}
          title={`${index} · ${value}`}
          style={{
            flex: 1,
            aspectRatio: "1 / 1",
            background: value,
            border: isPrimary
              ? "0.2vh solid rgba(255,255,255,0.85)"
              : "0.1vh solid rgba(255,255,255,0.15)",
            borderRadius: "0.4vh",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            position: "relative",
          }}
        >
          <span
            style={{
              fontFamily: "Akrobat Bold",
              fontSize: "0.9vh",
              lineHeight: 1,
              padding: "0.2vh 0.3vh",
              color: "rgba(0,0,0,0.55)",
              background: "rgba(255,255,255,0.55)",
              borderRadius: "0.25vh",
              margin: "0.2vh",
            }}
          >
            {index}
          </span>
        </button>
      </Popover.Target>
      <Popover.Dropdown p="xs">
        <ColorInput
          size="xs"
          value={value}
          onChange={onChange}
          format="hex"
          eyeDropperIcon={<></>}
        />
      </Popover.Dropdown>
    </Popover>
  );
}
