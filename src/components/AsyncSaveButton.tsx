import { alpha, Loader, Text, useMantineTheme } from "@mantine/core";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useState } from "react";

type SaveState = "idle" | "pending" | "success" | "error";

export function AsyncSaveButton({
  onSave,
  color,
  label = "Save Changes",
  style,
}: {
  onSave: () => Promise<any>;
  color: string;
  label?: string;
  style?: React.CSSProperties;
}) {
  const theme = useMantineTheme();
  const [state, setState] = useState<SaveState>("idle");

  const handleClick = async () => {
    if (state === "pending") return;
    setState("pending");
    try {
      const result = await onSave();
      setState(result?.success === false ? "error" : "success");
    } catch {
      setState("error");
    }
    setTimeout(() => setState("idle"), 2000);
  };

  const c = state === "error" ? "#ef4444" : color;

  return (
    <motion.button
      onClick={handleClick}
      disabled={state === "pending"}
      whileHover={state === "pending" ? {} : { background: alpha(c, 0.25) }}
      whileTap={state === "pending" ? {} : { scale: 0.98 }}
      style={{
        background: alpha(c, 0.14),
        border: `0.1vh solid ${alpha(c, 0.4)}`,
        borderRadius: theme.radius.xs,
        padding: `${theme.spacing.xxs} ${theme.spacing.xs}`,
        cursor: state === "pending" ? "default" : "pointer",
        display: "flex", alignItems: "center",
        justifyContent: "center", gap: theme.spacing.xxs,
        transition: "background 0.2s, border-color 0.2s",
        alignSelf: "flex-end",
        ...style,
      }}
    >
      {state === "pending"
        ? <Loader size="1.4vh" color={c} type="oval" />
        : state === "error"
          ? <X size="1.4vh" color={c} />
          : <Check size="1.4vh" color={c} />
      }
      <Text ff="Akrobat Bold" size="xs" tt="uppercase" lts="0.06em" c={c}>
        {state === "success" ? "Saved!" : state === "error" ? "Failed!" : label}
      </Text>
    </motion.button>
  );
}
