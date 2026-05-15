// Shared "label + description + Switch on the right" panel used across
// configurators (BasicSection, BackstoriesSection, ThemeOverrideSection, …).
// Centralising it here means a single visual style — dark[5] tinted
// background, faint white outline, primary-colored track when on — instead of
// each consumer hand-rolling slightly different borders/colours.
//
// Variants:
//   • default — tall row with description, used at the top of a tab/section
//   • compact — smaller padding + sm switch, for nested editor cards (e.g.
//     waypoint useNavmesh inside the SceneEditor walk-path block)
//
// `thumbIcon` supports the Lock-on-thumb pattern used by gated toggles.

import { alpha, Flex, Switch, Text, useMantineTheme } from "@mantine/core";
import { ReactNode } from "react";

export type SwitchPanelProps = {
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  /** Icon rendered on the Switch's thumb (e.g. a Lock when locked). */
  thumbIcon?: ReactNode;
  /** Compact variant — used for nested rows inside an editor card. */
  compact?: boolean;
};

export function SwitchPanel({
  label,
  description,
  checked,
  onChange,
  disabled,
  thumbIcon,
  compact,
}: SwitchPanelProps) {
  const theme = useMantineTheme();
  const pc = theme.colors[theme.primaryColor];

  const bg = compact
    ? alpha(theme.colors.dark[6], 0.5)
    : alpha(theme.colors.dark[5], 0.35);
  const border = compact
    ? "0.1vh solid rgba(255,255,255,0.04)"
    : "0.1vh solid rgba(255,255,255,0.05)";

  return (
    <Flex
      justify="space-between"
      align="center"
      px={compact ? "xs" : "xs"}
      py={compact ? "xxs" : "xs"}
      style={{
        background: bg,
        border,
        borderRadius: theme.radius.xs,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Flex direction="column" gap="xxs" style={{ flex: 1, minWidth: 0 }}>
        {typeof label === "string" ? (
          compact ? (
            <Text
              ff="Akrobat Bold"
              size="xxs"
              c="rgba(255,255,255,0.85)"
              tt="uppercase"
              lts="0.05em"
            >
              {label}
            </Text>
          ) : (
            <Text ff="Akrobat Bold" size="xs" c="rgba(255,255,255,0.85)">
              {label}
            </Text>
          )
        ) : (
          label
        )}
        {description && (
          typeof description === "string" ? (
            <Text ff="Akrobat Bold" size="xxs" c={compact ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.45)"}>
              {description}
            </Text>
          ) : (
            description
          )
        )}
      </Flex>
      <Switch
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.currentTarget.checked)}
        size={compact ? "sm" : "md"}
        thumbIcon={thumbIcon}
        styles={{
          track: {
            background: checked ? alpha(pc[6], 0.4) : "rgba(255,255,255,0.08)",
            borderColor: checked ? alpha(pc[6], 0.6) : "rgba(255,255,255,0.1)",
          },
        }}
      />
    </Flex>
  );
}
