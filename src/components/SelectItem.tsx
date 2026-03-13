import { Flex, Image, Select, Text, useMantineTheme } from "@mantine/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { locale } from "../utils/locales";
import { useItems, useItemsList } from "../utils/useItems";

export type SelectItemProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
  excludeItemNames?: string[];
};

function LazyImage({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ width: "4vh", height: "4vh" }}>
      {visible && <Image src={src} alt={alt} fit="contain" style={style} />}
    </div>
  );
}

export function SelectItem(props: SelectItemProps) {
  const invItems = useItems();
  const formattedItems = useMemo(() => {
    const seen = new Set<string>();
    return useItemsList(props.excludeItemNames ?? [])
      .filter((item) => {
        if (seen.has(item.name)) return false;
        seen.add(item.name);
        return true;
      })
      .map((item) => ({ value: item.name, label: item.label, image: item.image }));
  }, [invItems, props.excludeItemNames]);

  return (
    <Select
      maxDropdownHeight="30vh"
      label={locale(props.label)}
      size="xs"
      flex={1}
      style={props.style}
      limit={50}
      value={props.value}
      onChange={(v) => props.onChange(v as string)}
      data={formattedItems}
      allowDeselect={false}
      searchable
      leftSectionWidth="4vh"
      leftSection={
        props.value ? (
          <Image
            fallbackSrc="/placeholder.png"
            src={invItems[props.value]?.image || ""}
            alt={props.value}
            fit="contain"
            maw="4vh"
            style={{ aspectRatio: "1 / 1" }}
          />
        ) : null
      }
      nothingFoundMessage={locale("NoItemsFound")}
      renderOption={(item) => (
        <Flex align="center" gap="xs" w="100%">
          <LazyImage
            src={invItems[item.option.value]?.image || ""}
            alt={item.option.label}
            style={{ aspectRatio: "1 / 1" }}
          />
          <Flex direction="column">
            <Text size="sm">{item.option.label}</Text>
            <Text size="xxs" c="dimmed">{item.option.value}</Text>
          </Flex>
        </Flex>
      )}
    />
  );
}
