"use client";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import './styles/notify.css';
import './styles/fonts.css';
import './styles/scrollBar.css';
import './styles/tornEdge.css';


import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
library.add(fas, far, fab);

import { MantineProvider, BackgroundImage, MantineColorShade } from "@mantine/core";
import { useMemo, useEffect, useLayoutEffect } from "react";
import theme from "@/theme";

import { SettingsState, useSettings } from "@/utils/useSettings";
import { mergeMantineThemeSafe } from "@/utils/mergeMantineTheme";
import { DirkErrorBoundary } from "./DirkErrorBoundary";
import { fetchNui, isEnvBrowser } from "@/utils";

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

  // useEffect(() => {
  //   fetchNui<Partial<SettingsState>>('GET_SETTINGS').then((data) => {
  //     useSettings.setState({
  //       ...data,
  //     });
  //   }).catch((err) => {
  //     console.error("Failed to fetch initial settings within dirk-cfx-react:", err);
  //   });
  // }, []);

  // 🚫 do not render until state is stable

  const mergedTheme = useMemo(
    () =>
      mergeMantineThemeSafe(
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
