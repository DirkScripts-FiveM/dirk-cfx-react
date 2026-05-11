import { Flex, Image, Select, Text, useMantineTheme } from "@mantine/core";
import { AlertTriangle } from "lucide-react";
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

const MISSING_COLOR = "#f59e0b"; // amber — matches MissingItemsBanner

function LazyImage({ src, style }: { src: string; style?: React.CSSProperties }) {
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

  // No alt — when an item's image src 404s the alt string would render in
  // place of the image and blow the cell out, throwing the input layout
  // off (clicking the icon area then misses the input click target).
  return (
    <div ref={ref} style={{ width: "4vh", height: "4vh" }}>
      {visible && <Image src={src} fit="contain" style={style} />}
    </div>
  );
}

export function SelectItem(props: SelectItemProps) {
  const invItems = useItems();

  // True when something IS configured but it's not registered in the player's
  // items table. Drives all the amber styling below.
  const isMissing = !!props.value && !invItems[props.value];

  const formattedItems = useMemo(() => {
    const seen = new Set<string>();
    const list = useItemsList(props.excludeItemNames ?? [])
      .filter((item) => {
        if (seen.has(item.name)) return false;
        seen.add(item.name);
        return true;
      })
      .map((item) => ({ value: item.name, label: item.label, image: item.image }));

    // If the configured value isn't in the inventory items table, prepend a
    // synthetic entry so Mantine has something to match `value` against —
    // otherwise the input renders blank with no signal that anything's
    // configured. The raw item name doubles as the displayed label.
    if (isMissing) {
      list.unshift({ value: props.value, label: props.value, image: "" });
    }
    return list;
    // `useItemsList` already depends on `invItems` internally; `isMissing`
    // captures the value-vs-inventory delta so this list rebuilds whenever
    // the configured value or the items table changes.
  }, [invItems, props.excludeItemNames, props.value, isMissing]);

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
      // Amber-tint the input text when the configured value isn't registered
      // — a glance is enough to spot which field is broken.
      styles={isMissing ? { input: { color: MISSING_COLOR } } : undefined}
      // Portal the dropdown so it isn't clipped by overflow:hidden parents
      // (e.g. live-editor side panels) and stack it above modal content.
      comboboxProps={{ withinPortal: true, zIndex: 2000 }}
      leftSectionWidth="4vh"
      // Pointer events off on the leftSection so clicks anywhere on the
      // input (including over the item icon) bubble through to the input
      // and open the dropdown.
      leftSectionPointerEvents="none"
      leftSection={
        isMissing ? (
          <Flex align="center" justify="center" w="4vh" h="4vh">
            <AlertTriangle size="2vh" color={MISSING_COLOR} strokeWidth={2.5} />
          </Flex>
        ) : props.value ? (
          <Image
            fallbackSrc="/placeholder.png"
            src={invItems[props.value]?.image || ""}
            fit="contain"
            maw="4vh"
            style={{ aspectRatio: "1 / 1" }}
          />
        ) : null
      }
      nothingFoundMessage={locale("NoItemsFound")}
      renderOption={(item) => {
        const optionMissing = !invItems[item.option.value] && item.option.value === props.value;
        if (optionMissing) {
          return (
            <Flex align="center" gap="xs" w="100%">
              <Flex align="center" justify="center" w="4vh" h="4vh" style={{ flexShrink: 0 }}>
                <AlertTriangle size="2vh" color={MISSING_COLOR} strokeWidth={2.5} />
              </Flex>
              <Flex direction="column" style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" c={MISSING_COLOR} style={{ fontFamily: "monospace" }}>
                  {item.option.value}
                </Text>
                <Text size="xxs" c="dimmed">
                  {locale("ItemNotInInventory")}
                </Text>
              </Flex>
              <div style={{
                background: "rgba(245,158,11,0.12)",
                border: `0.1vh solid ${MISSING_COLOR}59`,
                borderRadius: "0.3vh",
                padding: "0.1vh 0.6vh",
              }}>
                <Text size="xxs" c={MISSING_COLOR} ff="Akrobat Bold" tt="uppercase" lts="0.06em">
                  {locale("Missing")}
                </Text>
              </div>
            </Flex>
          );
        }
        return (
          <Flex align="center" gap="xs" w="100%">
            <LazyImage
              src={invItems[item.option.value]?.image || ""}
              style={{ aspectRatio: "1 / 1" }}
            />
            <Flex direction="column">
              <Text size="sm">{item.option.label}</Text>
              <Text size="xxs" c="dimmed">{item.option.value}</Text>
            </Flex>
          </Flex>
        );
      }}
    />
  );
}
