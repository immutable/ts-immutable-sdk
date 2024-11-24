// theme.ts
import { ThemeConfig, extendTheme } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  styles: {
    global: {
      '#root': {
        minW: '100vw',
        minH: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'scroll'
      }
    }
  }
});

export default theme;
