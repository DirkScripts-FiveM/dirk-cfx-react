import { create } from "zustand";
import { registerInitialFetch } from "./fetchNui";

export type InventoryItem = {
  name: string;
  label: string;
  weight: number;
  image: string;
};

export type InventoryItems = Record<string, InventoryItem>;

export const useItems = create<InventoryItems>(() => ({}));

export const useItemsList = (excludeItemNames: string[] = []): InventoryItem[] => {
  const excludeSet = new Set(excludeItemNames);
  return Object.values(useItems.getState()).filter((item) => !excludeSet.has(item.name));
};

export const getItemImageUrl = (itemName: string): string => {
  return useItems.getState()[itemName]?.image || "";
};

registerInitialFetch<InventoryItems>("FETCH_ALL_ITEMS", null, {
  item1: { name: "item1", label: "Item 1", weight: 0.5, image: "item1.png" },
  item2: { name: "item2", label: "Item 2", weight: 1.0, image: "item2.png" },
  item3: { name: "item3", label: "Item 3", weight: 2.5, image: "item3.png" },
}).then((fetchedItems) => {
  if (!fetchedItems) return;
  useItems.setState(fetchedItems);
});
