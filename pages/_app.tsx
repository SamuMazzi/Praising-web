'use client';

import type { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import appTheme from '../styles/theme';
import { Provider } from 'react-redux';
import { store } from '../logic/redux/store';
import '../styles/globals.css';
import { useEffect } from 'react';
import { AuthContextProvider } from '@/logic/context/auth_context';
import StoreHydration from '@/components/store_hydration';
import NotificationSongPublished from '@/components/notification_song_published';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { DefaultSeo, NextSeo } from 'next-seo';
import SEO from '../next-seo.config';
import { useRouter } from 'next/router';

/**
 * Pagine legate allo stato dell'utente: non hanno nulla da offrire in ricerca
 * e vanno tenute fuori dall'indice (e fuori dalla sitemap, vedi script.py).
 */
const NO_INDEX_ROUTES = [
  '/login',
  '/settings',
  '/feedback',
  '/playlist',
  '/playlist/[id]',
  '/songs/[id]/parts',
  '/_offline'
];

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
import { warmOfflineOnStartup } from '@/logic/offline_cache';

export default function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  useFirebaseRoutesAnalytics();

  // Registrazione del service worker.
  //
  // Il codice precedente chiamava `window.serwist.register()` solo se
  // `window.serwist !== undefined`, ma in @serwist/next 9 quel global lo
  // definisce <SerwistProvider>, che l'app non usava: la condizione era
  // sempre falsa e il service worker non e' mai stato registrato. Il
  // provider pero' non si puo' montare qui, perche' importa
  // `@serwist/window` anche lato server e fa fallire l'export statico delle
  // pagine: registriamo direttamente, che e' anche una dipendenza in meno
  // dalle API di contorno della libreria.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV === 'development') {
      // In sviluppo il service worker non viene generato, ma quello installato
      // da una build di produzione sulla stessa origine (localhost) resta
      // registrato e prova a riprecacheare gli asset di quella build: gli hash
      // non esistono piu' e l'install fallisce con `bad-precaching-response`.
      // Lo togliamo di mezzo.
      void navigator.serviceWorker
        .getRegistrations()
        .then(async (registrations) => {
          await Promise.all(registrations.map(async (r) => r.unregister()));
        })
        .catch(() => {});
      return;
    }

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(async () => {
        await navigator.serviceWorker.ready;
        // Scarica in background i dati di tutti i canti (~1,2 MB), una
        // volta per deploy, senza competere col caricamento iniziale.
        window.setTimeout(() => {
          void warmOfflineOnStartup();
        }, 5000);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }, []);

  return (
    <>
      <DefaultSeo {...SEO} />
      {NO_INDEX_ROUTES.includes(pathname) && <NextSeo noindex nofollow />}
      <Provider store={store}>
        <ThemeProvider theme={appTheme} defaultMode="dark">
          <CssBaseline />
          <StoreHydration />
          <AuthContextProvider>
            <Component {...pageProps} />
            <NotificationSongPublished />
            <SpeedInsights />
          </AuthContextProvider>
        </ThemeProvider>
      </Provider>
    </>
  );
}
