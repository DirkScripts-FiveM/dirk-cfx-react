import { createContext, useContext, type ReactNode } from "react";
import { Flex, Select, TextInput } from "@mantine/core";
import { INPUT_MAPPER_KEYS_BY_PRIMARY, INPUT_MAPPER_PRIMARY_OPTIONS } from "@/utils/inputMapper";

export type FiveMControls = {
  _type: string;
  _key: string;
};

type KeyBindContextValue = {
  value: FiveMControls;
  onChange: (next: FiveMControls) => void;
};

const KeyBindContext = createContext<KeyBindContextValue | null>(null);

function useKeyBindContext(): KeyBindContextValue {
  const ctx = useContext(KeyBindContext);
  if (!ctx) {
    throw new Error("FiveMKeyBindInput.* must be used inside <FiveMKeyBindInput>");
  }
  return ctx;
}

type RootProps = {
  value: FiveMControls;
  onChange: (next: FiveMControls) => void;
  children: ReactNode;
};

function Root({ value, onChange, children }: RootProps) {
  return (
    <KeyBindContext.Provider value={{ value, onChange }}>
      <Flex gap="xs" style={{ flex: 1 }}>
        {children}
      </Flex>
    </KeyBindContext.Provider>
  );
}

type CategoryProps = {
  label?: string;
};

function Category({ label = "Primary" }: CategoryProps) {
  const { value, onChange } = useKeyBindContext();

  return (
    <Select
      label={label}
      size="xs"
      style={{ flex: 1 }}
      value={value._type}
      data={[...INPUT_MAPPER_PRIMARY_OPTIONS]}
      onChange={(nextType) => {
        if (!nextType) return;

        const keyOptions = INPUT_MAPPER_KEYS_BY_PRIMARY[nextType] ?? [];
        const hasCurrentKey = keyOptions.includes(value._key);
        const nextKey = hasCurrentKey ? value._key : (keyOptions[0] ?? value._key);

        onChange({
          ...value,
          _type: nextType,
          _key: nextKey,
        });
      }}
      searchable
      allowDeselect={false}
    />
  );
}

type KeyProps = {
  label?: string;
};

function Key({ label = "Key" }: KeyProps) {
  const { value, onChange } = useKeyBindContext();

  const keyOptions = INPUT_MAPPER_KEYS_BY_PRIMARY[value._type] ?? [];

  if (keyOptions.length === 0) {
    return (
      <TextInput
        label={label}
        size="xs"
        style={{ flex: 1 }}
        value={value._key}
        onChange={(e) => onChange({ ...value, _key: e.currentTarget.value })}
        placeholder="Type key value"
      />
    );
  }

  return (
    <Select
      label={label}
      size="xs"
      style={{ flex: 1 }}
      value={value._key}
      data={keyOptions}
      onChange={(nextKey) => {
        if (!nextKey) return;
        onChange({ ...value, _key: nextKey });
      }}
      searchable
      allowDeselect={false}
    />
  );
}

export const FiveMKeyBindInput = Object.assign(Root, {
  Category,
  Key,
});
