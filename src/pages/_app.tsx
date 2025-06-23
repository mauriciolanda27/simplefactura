import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SWRConfig } from 'swr';
import { ThemeProvider } from '../contexts/ThemeContext';
import { createAppTheme } from '../theme';
import '../styles/globals.css';
import { AlertProvider } from '../components/AlertSystem';
import { useTheme } from '../contexts/ThemeContext';
import { swrConfig } from '../utils/swrConfig';

function AppContent({ Component, pageProps }: AppProps) {
  const { mode } = useTheme();
  const theme = createAppTheme(mode);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <SWRConfig value={swrConfig}>
        <AlertProvider>
          <Component {...pageProps} />
        </AlertProvider>
      </SWRConfig>
    </MuiThemeProvider>
  );
}

export default function App(props: AppProps) {
  return (
    <SessionProvider session={props.pageProps.session}>
      <ThemeProvider>
        <AppContent {...props} />
      </ThemeProvider>
    </SessionProvider>
  );
}
