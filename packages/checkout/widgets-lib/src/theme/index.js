import React, { useMemo } from 'react';
// @mui
import { CssBaseline } from '@mui/material';
import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider as MUIThemeProvider,
} from '@mui/material/styles';
//
import palette from './palette';
import typography from './typography';
import shadows from './shadows';
import customShadows from './customShadows';
import componentsOverride from './overrides';
import GlobalStyles from './globalStyles';

export default function ThemeProvider({ children }) {
  const themeMode = 'light';
  const themeDirection = 'ltr';
  const themeOptions = useMemo(
    () => ({
      palette: palette(themeMode),
      // typography,
      // shape: { borderRadius: 8 },
      // direction: themeDirection,
      // shadows: shadows(themeMode),
      // customShadows: customShadows(themeMode),
      applyDarkStyles: () => {}
    }),
    [themeDirection, themeMode]
  );

  const theme = createTheme(themeOptions);

  theme.components = componentsOverride(theme);

  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles />
        {children}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}
