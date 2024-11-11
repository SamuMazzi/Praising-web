import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { darkThemeOptions, lightThemeOptions } from '../styles/theme';
import { Provider } from 'react-redux';
import { store, useAppSelector } from '../logic/redux/store';
import '../styles/globals.css';
import React, { useEffect, useState } from 'react';
import { AuthContextProvider } from '@/logic/context/auth_context';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { itIT } from '@mui/x-date-pickers/locales';
/**
 * Priorities:
 * 0. Improve SEO!!!
 * 1. Offline
 * 3. Edit song -> add reviews -> add check by admin(s) like back voices
 * 4. Tutorial (finish and better styling, actually also the initial one should be changed)
 * 5. PDF (finish) -> size of print depend on size of the screen from which you print
 * https://stackoverflow.com/questions/45868042/figuring-out-how-to-mock-the-window-size-changing-for-a-react-component-test
 * https://stackoverflow.com/questions/63510429/how-to-test-different-screen-widths-using-jest
 * 6. Share back voices -> put them in a tmp part before accepting them and also add button to let user segnalate them
 * 7. Share playlist -> you simply save the playlist on playlist collection (with user as owner), until it's private you don't even check online if there are modifications
 * 8. Add song
 * 9. Set Firebase rules
 * 10. Check loading times of recaptcha (they seem huge and unaffective)
 * 11. Add Google Analytics (Just to improve, basic is done)
 * 12. Add Google Ads
 * 2a. Transition pages (for example go from page to songs)
 */

// TODO: Offline https://github.com/hanford/next-offline
// TODO: Implementare modo per evitare reload della canzone se già caricata (a volte succede inaspettatamente)
// TODO: Implementare spazi fra accordi senza testo (per ora solo nelle righe intere senza testo, cerca canzoni con cui testare, sicuro "Mi perdo nel tuo amore")
import Head from 'next/head';
import { useFirebaseRoutesAnalytics } from '@/logic/hooks/use_firebase_analytics';

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  const [mounted, setMounted] = useState(false);
  useFirebaseRoutesAnalytics();

  useEffect(() => {
    if ('serviceWorker' in navigator && window.serwist !== undefined) {
      // console.log('service worker in navigator');
      window.serwist
        .register()
        .then((registration) => {
          if (registration === undefined) return;
          console.log(
            'Service Worker registered with scope:',
            registration.scope
          );
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
    setMounted(true);
  }, []);

  // Maybe it disables SSR? But it solves the problem of themes
  if (!mounted) return <></>;

  return (
    <>
      <Head>
        <title>Praising - Gli accordi per i tuoi canti cristiani</title>
        <meta
          name="og:title"
          content="Praising - Gli accordi per i tuoi canti cristiani"
        />
        <meta
          name="description"
          content="Gli accordi per i tuoi canti cristiani"
        />
        <meta
          name="og:description"
          content="Gli accordi per i tuoi canti cristiani"
        />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="mask-icon"
          href="/icons/safari-pinned-tab.svg"
          color="#F0B647"
        />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <Provider store={store}>
        <ThemedComponent Component={Component} pageProps={pageProps} />
      </Provider>
    </>
  );
}

function ThemedComponent({ Component, pageProps }: any): JSX.Element {
  const darkMode = useAppSelector((state) => state.settings.darkMode);

  return (
    <ThemeProvider
      theme={createTheme(darkMode ? darkThemeOptions : lightThemeOptions, itIT)}
    >
      <CssBaseline />
      <AuthContextProvider>
        <Component {...pageProps} />
        <SpeedInsights />
      </AuthContextProvider>
    </ThemeProvider>
  );
}
