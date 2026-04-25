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
  useNuiEvent<Partial<SettingsState>>('UPDATE_DIRK_LIB_SETTINGS', (data) => {
    if (!data || typeof data !== 'object') return;
    useSettings.setState(data);
  });

  // 🚫 do not render until state is stable

  const mergedTheme = useMemo(
    () => {
      const merged = mergeMantineThemeSafe(
        { ...theme, primaryColor, primaryShade: primaryShade as MantineColorShade },
        customTheme,
        themeOverride
      );
      console.log('[DirkProvider:theme]', {
        primaryColor,
        primaryShade,
        customTheme,
        mergedPrimaryColor: merged.primaryColor,
        mergedColorsKeys: Object.keys(merged.colors ?? {}),
        mergedCustomPalette: (merged.colors as Record<string, unknown> | undefined)?.custom,
      });
      return merged;
    },
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
