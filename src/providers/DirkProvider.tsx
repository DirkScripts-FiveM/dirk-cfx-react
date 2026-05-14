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
import { BackgroundImage, MantineColorShade, MantineProvider } from "@mantine/core";
import { useEffect, useLayoutEffect, useMemo } from "react";

import { useNuiEvent } from "@/hooks/useNuiEvent";
import { fetchNui, isEnvBrowser } from "@/utils";
import { localeStore } from "@/utils/locales";
import { mergeMantineThemeSafe } from "@/utils/mergeMantineTheme";
import { SettingsState, useSettings } from "@/utils/useSettings";
import { DirkErrorBoundary } from "./DirkErrorBoundary";

export type DirkProviderProps = {
  children: React.ReactNode;
  overideResourceName?: string;
  themeOverride?: any;
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
  // without a resource restart.
  //
  // Per-resource theme override gate: when the local snapshot has
  // `themeOverride: true`, the consumer's GET_SETTINGS callback has already
  // hydrated us with its own primaryColor / primaryShade / customTheme. Any
  // incoming global push for those keys is silently dropped so editing the
  // dirk_lib appearance tab doesn't clobber the resource's local theme.
  useNuiEvent<Partial<SettingsState>>('UPDATE_DIRK_LIB_SETTINGS', (data) => {
    if (!data || typeof data !== 'object') return;
    const current = useSettings.getState();
    if (current.themeOverride) {
      const { primaryColor: _pc, primaryShade: _ps, customTheme: _ct, ...rest } = data;
      void _pc; void _ps; void _ct;
      useSettings.setState(rest);
      return;
    }
    useSettings.setState(data);
  });

  // 🚫 do not render until state is stable

  const mergedTheme = useMemo(
    () => mergeMantineThemeSafe(
      { ...theme, primaryColor, primaryShade: primaryShade as MantineColorShade },
      customTheme,
      themeOverride
    ),
    [primaryColor, primaryShade, customTheme, themeOverride]
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
      <MantineProvider theme={mergedTheme} defaultColorScheme="dark">
        <DirkErrorBoundary>
            {content}
        </DirkErrorBoundary>
      </MantineProvider>
  );
}
