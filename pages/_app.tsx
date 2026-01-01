'use client';

import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { darkThemeOptions, lightThemeOptions } from '../styles/theme';
import { Provider } from 'react-redux';
import { store, useAppSelector } from '../logic/redux/store';
import { useSync } from '../logic/hooks/use_sync_songs';
import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { AuthContextProvider } from '@/logic/context/auth_context';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { itIT } from '@mui/x-date-pickers/locales';
import { DefaultSeo } from 'next-seo';
import SEO from '../next-seo.config';

//TODO: Check out https://vaul.emilkowal.ski/ and https://sonner.emilkowal.ski/

//TODO: Add function in cloud functions to delete old users (based on last access time)
/**
 * Priorities:
 * 0. Improve SEO!
 * 1. Offline
 * 4. Add button to live record backvoice
 * 6. Add song
 * 7. Set Firebase rules
 * 8. Migration to App Router
 * 9. Modify categories songs style
 * 10. Apply "pending" state also for modifications?
 *
 * Later:
 * 1. Add Google Analytics (Just to improve, basic is done)
 * 2. Add Google Ads
 * 3. Transition pages (for example go from page to songs)
 * 3a. Animations on transition from song to page (like button being pressed and then pops up new page from a growing circle)
 * 4. Check loading times of recaptcha (they seem huge and unaffective)
 * 5. Create tmp playlist for the mass of the day (with hints maybe? AI generated maybe?)
 * https://platform.openai.com/docs/assistants/tools/file-search?context=without-streaming
 *
 */

// TODO: Implementare spazi fra accordi senza testo (per ora solo nelle righe intere senza testo, cerca canzoni con cui testare, sicuro "Mi perdo nel tuo amore")
import { useFirebaseRoutesAnalytics } from '@/logic/hooks/use_firebase_analytics';

const isPwa = (): boolean => {
  if (typeof window === 'undefined') return false;

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = (window.navigator as any).standalone === true;

  return isStandalone || isIOSStandalone;
};

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);
  const { syncSongs } = useSync();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // 1. Run sync on every fresh load if online
      if (!isPwa()) {
        console.log('Running in browser: Skipping bulk song sync.');
        return;
      }

      if (navigator.onLine) syncSongs();

      // 2. Listen for Service Worker updates
      const serwist = window.serwist;
      if (serwist) {
        serwist.addEventListener('installed', (event) => {
          if (event.isUpdate) {
            console.log('New version detected! Syncing new songs...');
            syncSongs();
          }
        });
      }
    }
  }, []);

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

function ThemedComponent({ Component, pageProps }: any) {
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
