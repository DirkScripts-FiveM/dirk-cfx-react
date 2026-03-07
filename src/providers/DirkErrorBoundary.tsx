"use client";

import React from "react";
import { Box, Code, Stack, Text, Title } from "@mantine/core";

type State = {
  error: Error | null;
  stack?: string;
};

export class DirkErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { error: null, stack: undefined };

  static getDerivedStateFromError(error: Error) {
    // We can't get component stack here, so just store the error
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.group("🔥 Dirk UI Crash");
    console.error("Error:", error);
    console.error("Component Stack:", info.componentStack);
    console.groupEnd();

    // Only log here, don't call setState — the error state is already captured
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <Box
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(10, 10, 12, 0.92)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          zIndex: 999999,
        }}
      >
        <Box
          maw={900}
          w="100%"
          p="lg"
          style={{
            background: "rgba(20,20,24,0.75)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
          }}
        >
          <Stack gap="sm">
            <Title order={2} c="red.5">
              Dirk UI Crash
            </Title>

            <Text c="dimmed" size="sm">
              The interface encountered a fatal error and stopped rendering.
            </Text>

            <Code block style={{ maxHeight: 150, overflow: "auto" }}>
              {this.state.error?.message}
            </Code>

            {/* Optional: show component stack if you pass it from props */}
            <Text size="xs" c="dimmed">
              Check console for full stack trace
            </Text>
          </Stack>
        </Box>
      </Box>
    );
  }
}