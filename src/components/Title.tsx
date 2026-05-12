import { colorWithAlpha } from "@/utils";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { Flex, MantineSize, Text, useMantineTheme } from "@mantine/core";
import { BorderedIcon } from "./BorderedIcon";
import { useSettings } from "@/utils/useSettings";

export type ButtonProps = {
  icon: string;
  onClick?: () => void;
};

export type TitleSize = "xs" | "sm" | "md" | "lg" | "xl";

export type TitleProps = {
  title: string;
  description: string;
  icon: string;
  iconColor?: string;
  bg?: string;
  w?: string;
  removeBorder?: boolean;
  borderColor?: string;
  p?: string;
  /**
   * Scale of the whole block — icon, title text, description text, and inner
   * spacing all follow this single value. Defaults to "md" to preserve the
   * historical look so existing consumers don't shift.
   */
  size?: TitleSize;
  rightSection?: React.ReactNode;
};

type SizePreset = {
  iconFontSize: string;
  iconPadding: string;
  titleSize: MantineSize | string;
  titleLineHeight: string;
  descriptionSize: MantineSize | string;
  innerGap: MantineSize | string;
  bottomPad: MantineSize | string;
};

function getSizePreset(size: TitleSize, themeMdFontSize: string): SizePreset {
  switch (size) {
    case "xs":
      return { iconFontSize: "1.2vh", iconPadding: "xxs", titleSize: "xxs", titleLineHeight: "1.2vh", descriptionSize: "xxs", innerGap: "xs", bottomPad: "xs" };
    case "sm":
      return { iconFontSize: "1.6vh", iconPadding: "xxs", titleSize: "xs", titleLineHeight: "1.6vh", descriptionSize: "xxs", innerGap: "xs", bottomPad: "xs" };
    case "lg":
      return { iconFontSize: "2.6vh", iconPadding: "sm", titleSize: "md", titleLineHeight: "2.6vh", descriptionSize: "sm", innerGap: "sm", bottomPad: "sm" };
    case "xl":
      return { iconFontSize: "3.2vh", iconPadding: "sm", titleSize: "lg", titleLineHeight: "3.2vh", descriptionSize: "md", innerGap: "md", bottomPad: "md" };
    case "md":
    default:
      return { iconFontSize: themeMdFontSize, iconPadding: "xs", titleSize: "sm", titleLineHeight: themeMdFontSize, descriptionSize: "xs", innerGap: "sm", bottomPad: "sm" };
  }
}

export function Title(props: TitleProps) {
  const game = useSettings((state) => state.game);
  const theme = useMantineTheme();
  const preset = getSizePreset(props.size ?? "md", theme.fontSizes.md);
  return (
    <Flex
      direction="column"
      bg={props.bg || "transparent"}
      gap="xs"
      w={props.w || "100%"}
      p={props.p || "unset"}
      pb={!props.p ? preset.bottomPad : props.p}
      style={{
        userSelect: "none",
        borderBottom: props.removeBorder ? "none" : `0.3vh solid ${props.borderColor || colorWithAlpha(theme.colors[theme.primaryColor][9], 0.5)}`,
      }}
    >
      <Flex align="center" justify={"center"}>
        <Flex align="center" gap={preset.innerGap} pr="xs">
          <BorderedIcon
            icon={props.icon as IconName}
            fontSize={preset.iconFontSize}
            color={props.iconColor}
            p={preset.iconPadding}
          />
          <Flex direction="column" gap="0.25vh">
            <Text
              p="0"
              size={preset.titleSize as MantineSize}
              style={{
                lineHeight: preset.titleLineHeight,
                fontFamily: game == "fivem" ? "Akrobat Bold" : "Red Dead",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {props.title}
            </Text>
            <Text
              size={preset.descriptionSize as MantineSize}
              c="grey"
              style={{ whiteSpace: "normal", wordWrap: "break-word" }}
            >
              {props.description}
            </Text>
          </Flex>
        </Flex>
        <Flex ml="auto" align="center" gap="xs">
          {props.rightSection}
        </Flex>
      </Flex>
    </Flex>
  );
}
