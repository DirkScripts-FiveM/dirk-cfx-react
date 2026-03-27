import { alpha, Flex, Portal, Text, useMantineTheme } from "@mantine/core";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import React, { useRef } from "react";

export type ModalProps = {
  title: string;
  icon?: React.ElementType;
  iconColor?: string;
  description?: string;
  badge?: { label: string; color: string };
  onClose: () => void;
  width?: string;
  maxHeight?: string;
  height?: string;
  zIndex?: number;
  clickOutside?: boolean;
  children: React.ReactNode;
};

export function Modal({
  title,
  icon: Icon,
  iconColor,
  description,
  badge,
  onClose,
  width = "52vh",
  maxHeight = "85vh",
  height,
  zIndex = 100,
  clickOutside = true,
  children,
}: ModalProps) {
  const theme = useMantineTheme();
  const pointerDownOnOverlay = useRef(false);

  return (
    <Portal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.65)",
        }}
        onPointerDown={(e) => {
          pointerDownOnOverlay.current = e.target === e.currentTarget;
        }}
        onClick={(e) => {
          if (clickOutside && e.target === e.currentTarget && pointerDownOnOverlay.current) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={{
            background: alpha(theme.colors.dark[9], 0.98),
            border: `0.1vh solid ${theme.colors.dark[7]}`,
            borderRadius: theme.radius.sm,
            width,
            maxHeight,
            height,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            userSelect: "none",
          }}
        >
          {/* Header */}
          <Flex
            justify="space-between"
            align="center"
            px="sm"
            py="xs"
            style={{
              borderBottom: `0.1vh solid ${theme.colors.dark[7]}`,
              flexShrink: 0,
            }}
          >
            <Flex align="center" gap="xs">
              {Icon && (
                <Icon
                  color={iconColor ?? "rgba(255,255,255,0.6)"}
                  size="2vh"
                />
              )}
              <Text
                ff="Akrobat Bold"
                size="sm"
                tt="uppercase"
                lts="0.06em"
                c="rgba(255,255,255,0.85)"
              >
                {title}
              </Text>
              {badge && (
                <div
                  style={{
                    background: alpha(badge.color, 0.12),
                    border: `0.1vh solid ${alpha(badge.color, 0.35)}`,
                    borderRadius: theme.radius.xs,
                    padding: `0 ${theme.spacing.xxs}`,
                  }}
                >
                  <Text
                    ff="Akrobat Bold"
                    size="xxs"
                    tt="uppercase"
                    lts="0.06em"
                    c={badge.color}
                  >
                    {badge.label}
                  </Text>
                </div>
              )}
            </Flex>
            <motion.button
              onClick={onClose}
              whileHover={{ background: alpha(theme.colors.dark[7], 0.5) }}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: theme.spacing.xxs,
                borderRadius: theme.radius.xs,
                display: "flex",
              }}
            >
              <X color="rgba(255,255,255,0.4)" />
            </motion.button>
          </Flex>

          {/* Description */}
          {description && (
            <Flex px="sm" pt="xs">
              <Text
                ff="Akrobat Regular"
                size="xs"
                c="rgba(255,255,255,0.65)"
                style={{ lineHeight: 1.5 }}
              >
                {description}
              </Text>
            </Flex>
          )}

          {/* Content */}
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            {children}
          </div>
        </motion.div>
      </motion.div>
    </Portal>
  );
}

export default Modal;
