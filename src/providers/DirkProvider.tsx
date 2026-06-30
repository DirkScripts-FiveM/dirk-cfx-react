"use client";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import './styles/fonts.css';
import './styles/notify.css';
import './styles/scrollBar.css';
import './styles/tornEdge.css';


import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
library.add(fas, far, fab);

import theme from "@/theme";
import { BackgroundImage, MantineColorShade, MantineColorsTuple, MantineProvider } from "@mantine/core";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";

import { useNuiEvent } from "@/hooks/useNuiEvent";
import { fetchNui, isEnvBrowser } from "@/utils";
import { localeStore } from "@/utils/locales";
import { mergeMantineThemeSafe } from "@/utils/mergeMantineTheme";
import { SettingsState, useSettings } from "@/utils/useSettings";
import { getScriptConfigInstance } from "@/hooks/useScriptConfig";
import { DirkErrorBoundary } from "./DirkErrorBoundary";
import { AdminOverlays } from "@/components/AdminTools/AdminOverlays";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Shared QueryClient for every consumer of <DirkProvider>. Hooks in this
// library (usePlayers, ConfigPanel's history pagination, MissingItemsBanner
// audit, etc.) all consume this so consumers don't need to wire their own
// QueryClientProvider. Defaults match what ConfigPanel previously used in
// its private QueryClient so the move doesn't change refetch cadence.
//
// Consumers that already wrap in their own outer QueryClientProvider (e.g.
// dirk_fishing's App.tsx) still work — react-query picks the nearest
// provider in the tree, and "nearest" here means this inner one. Anything
// inside DirkProvider uses this client; anything outside uses the consumer's
// outer one (if present).
export const dirkQueryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, gcTime: 5 * 60_000 } },
});

export type DirkProviderProps = {
  children: React.ReactNode;
  overideResourceName?: string;
  themeOverride?: any;
};

// Shape DirkProvider looks for at `scriptConfig.theme` to detect a per-resource
// theme override. Consumers opt in by adding a `theme` block to their schema.json
// with these four fields — DirkProvider auto-detects and applies it. Resources
// with no `theme` block (or `useOverride: false`) follow the global dirk_lib
// theme as before. No bridge component, no extra wiring required from consumers.
type ScriptConfigThemeOverride = {
  useOverride?: boolean;
  primaryColor?: string;
  primaryShade?: number;
  customTheme?: MantineColorsTuple | string[];
};

export function DirkProvider({ children, overideResourceName, themeOverride }: DirkProviderProps) {
  const {
    primaryColor,
    primaryShade,
    customTheme,
    game,
  } = useSettings();

  // Subscribe to locale changes so the entire tree re-renders when an admin
  // updates `language` via dirk_lib's scriptConfig — components calling
  // `locale("Foo")` directly (no hook) get fresh strings on the next render.
  const _locales = localeStore((s) => s.locales);
  void _locales;

  // Per-resource theme override snapshot, read from `scriptConfig.theme` when
  // the consumer has a scriptConfig registered. Updated by the subscription
  // below; survives Mantine recomputes via useMemo deps.
  const [scTheme, setScTheme] = useState<ScriptConfigThemeOverride | null>(null);

  useLayoutEffect(() => {
    useSettings.setState({
      overideResourceName,
    });
  }, [overideResourceName]);

  useEffect(() => {
    fetchNui('NUI_READY').catch(() => {});
    Promise.all([
      fetchNui<Partial<SettingsState>>('GET_SETTINGS'),
      fetchNui<{ version?: string }>('GET_RESOURCE_VERSION', undefined, { version: 'dev' }),
    ]).then(([data, resourceInfo]) => {
      useSettings.setState({
        ...data,
        resourceVersion: resourceInfo?.version || 'dev',
      });
    }).catch((err) => {
      console.error("Failed to fetch initial settings within dirk-cfx-react:", err);
    });
  }, []);

  // Live updates: dirk_lib broadcasts UPDATE_DIRK_LIB_SETTINGS whenever an admin
  // changes appearance/localization via the scriptConfig UI. Merge the partial
  // patch into the settings store so theme / currency / branding update live
  // without a resource restart. Per-resource theme override is handled below
  // via the scriptConfig subscription — pushes here can flow through unchanged.
  useNuiEvent<Partial<SettingsState>>('UPDATE_DIRK_LIB_SETTINGS', (data) => {
    if (!data || typeof data !== 'object') return;
    useSettings.setState(data);
  });

  // ── Per-resource theme auto-detect ────────────────────────────────────────
  // If the consumer has called createScriptConfig() (i.e. has a registered
  // scriptConfig instance) AND their schema has a `theme` block with
  // `useOverride: true`, DirkProvider uses those theme values instead of
  // dirk_lib's global appearance. Consumers don't have to write any glue
  // code — they just add the `theme` block to schema.json and a Theme tab
  // (via ThemeOverrideSection) to their configurator. Everything else is
  // handled here.
  //
  // We also forward UPDATE_SCRIPT_CONFIG pushes into the store so this works
  // whether or not the consumer remembers to call useScriptConfigHooks().
  useNuiEvent<{ config?: Record<string, unknown>; clientVersion?: number }>(
    'UPDATE_SCRIPT_CONFIG',
    (data) => {
      if (!data || !data.config || typeof data.config !== 'object') return;
      try {
        const inst = getScriptConfigInstance<Record<string, unknown>>();
        inst.store.setState((prev) => ({ ...prev, ...(data.config as Record<string, unknown>) }));
      } catch {
        // No scriptConfig instance registered — consumer doesn't use scriptConfig, ignore.
      }
    }
  );

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const inst = getScriptConfigInstance<{ theme?: ScriptConfigThemeOverride }>();

      // Seed from whatever's already in the store (covers cases where the
      // store was hydrated before DirkProvider mounted, e.g. by an upstream
      // ConfigPanel open).
      setScTheme((inst.store.getState() as { theme?: ScriptConfigThemeOverride })?.theme ?? null);

      // Subscribe to store mutations so live edits / hydration completion
      // re-trigger the override application.
      const subscribable = inst.store as unknown as {
        subscribe?: (listener: (s: { theme?: ScriptConfigThemeOverride }) => void) => () => void;
      };
      if (typeof subscribable.subscribe === 'function') {
        unsubscribe = subscribable.subscribe((s) => {
          setScTheme(s?.theme ?? null);
        });
      }

      // Option B: NO proactive GET_FULL_SCRIPT_CONFIG round-trip here. The
      // client-visible config (which includes the `theme` block — it is NOT
      // server-only) is pushed by dirk_lib via UPDATE_SCRIPT_CONFIG and lands
      // in the store. The store `subscribe` above updates `scTheme` the moment
      // that push arrives, and the seed `setScTheme(...)` from the current
      // store state covers the case where the push beat this mount. This drops
      // the per-mount full-config fetch entirely — reopen/reload = store hit,
      // 0 bytes. The cold-start NUI-readiness race is handled on the Lua side
      // (the push is (re)sent once the NUI signals NUI_READY).
    } catch {
      // No scriptConfig instance — consumer doesn't use scriptConfig at all.
      // Fall through silently; global theme behaviour is unchanged.
    }
    return () => { unsubscribe?.(); };
  }, []);

  const overrideActive = scTheme?.useOverride === true;
  const effectivePrimaryColor = overrideActive ? (scTheme!.primaryColor ?? primaryColor) : primaryColor;
  const effectivePrimaryShade = overrideActive ? (scTheme!.primaryShade ?? primaryShade) : primaryShade;
  const effectiveCustomTheme = overrideActive
    ? ((scTheme!.customTheme as MantineColorsTuple | undefined) ?? customTheme)
    : customTheme;

  const mergedTheme = useMemo(
    () => mergeMantineThemeSafe(
      { ...theme, primaryColor: effectivePrimaryColor, primaryShade: effectivePrimaryShade as MantineColorShade },
      effectiveCustomTheme,
      themeOverride
    ),
    [effectivePrimaryColor, effectivePrimaryShade, effectiveCustomTheme, themeOverride]
  );

  useEffect(() => {
    document.body.style.fontFamily =
      game === "rdr3"
        ? '"Red Dead", sans-serif'
        : '"Akrobat Regular", sans-serif';
  }, [game]);

  const content = isEnvBrowser() ? (
    <BackgroundImage
      w="100vw"
      h="100vh"
      src={game === "fivem"
        ? "https://i.ytimg.com/vi/TOxuNbXrO28/maxresdefault.jpg"
        : "https://raw.githubusercontent.com/Jump-On-Studios/RedM-jo_libs/refs/heads/main/source-repositories/Menu/public/assets/images/background_dev.jpg"}
    >
      {children}
    </BackgroundImage>
  ) : (
    children
  );

  return (
      <QueryClientProvider client={dirkQueryClient}>
        <MantineProvider theme={mergedTheme} defaultColorScheme="dark">
          <DirkErrorBoundary>
              {content}
              {/* Auto-mounted. Renders nothing unless an admin tool is active.
                  Consumers never have to wire this up themselves — every admin
                  tool flow that uses useAdminToolStore.begin() gets the
                  bottom-right InstructionPanel + NUI message routing for free. */}
              <AdminOverlays />
          </DirkErrorBoundary>
        </MantineProvider>
      </QueryClientProvider>
  );
}
