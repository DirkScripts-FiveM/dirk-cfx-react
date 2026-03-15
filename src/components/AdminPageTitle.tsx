import { Flex, Text } from "@mantine/core";
import { locale } from "@/utils";
import { LucideProps } from "lucide-react";
import { ComponentType } from "react";

export type AdminPageTitleProps = {
  title: string;
  icon: ComponentType<LucideProps>;
  color: string;
};

export function AdminPageTitle(props: AdminPageTitleProps) {
  return (
    <Flex align="center" gap="xs">
      <props.icon color={props.color} />
      <Text ff="Akrobat Bold" tt="uppercase" lts="0.1em" size="sm" c="rgba(255,255,255,0.6)">
        {locale(props.title)}
      </Text>
    </Flex>
  );
}
