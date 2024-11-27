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
import { DefaultSeo } from 'next-seo';
import SEO from '../next-seo.config';

//TODO: Add function in cloud functions to delete old users (based on last access time)
/**
 * Priorities:
 * IMPLEMENT BUDGET QUOTA IN VERCEL!!!
 * 0. Improve SEO!!!
 * 1. Offline
 * 2. Tutorial (finish and better styling, actually also the initial one should be changed)
 * 3. PDF (finish, broken at least in smarthpones) -> size of print depend on size of the screen from which you print
 * https://stackoverflow.com/questions/45868042/figuring-out-how-to-mock-the-window-size-changing-for-a-react-component-test
 * https://stackoverflow.com/questions/63510429/how-to-test-different-screen-widths-using-jest
 * 4. Add button to live record backvoice
 * 6. Add song
 * 7. Set Firebase rules
 * 8. Migration to App Router
 * 9. Modify categories songs
 * 10. Apply "pending" state also for modifications?
 *
 * Later:
 * 1. Add Google Analytics (Just to improve, basic is done)
 * 2. Add Google Ads
 * 3. Transition pages (for example go from page to songs)
 * 4. Check loading times of recaptcha (they seem huge and unaffective)
 * 5. Create tmp playlist for the mass of the day (with hints maybe? AI generated maybe?)
 */

// TODO: Offline https://github.com/hanford/next-offline
// TODO: Implementare modo per evitare reload della canzone se già caricata (a volte succede inaspettatamente)
// TODO: Implementare spazi fra accordi senza testo (per ora solo nelle righe intere senza testo, cerca canzoni con cui testare, sicuro "Mi perdo nel tuo amore")
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
      <DefaultSeo {...SEO} />
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
