import type { AppProps } from 'next/app'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { dark_theme_options, light_theme_options } from '../styles/theme'
import { Provider } from 'react-redux'
import { store, useAppSelector } from '../logic/redux/store'
import '../styles/globals.css'       
import { useEffect, useState } from 'react'
import { AuthContextProvider } from '@/logic/context/auth_context'

// TODO: Fix ritornelli in grassetto in come un fiume d'acqua viva (problema quando hai riga di soli accordi)
// TODO: Offline https://github.com/hanford/next-offline
// TODO: Implementare spazi fra accordi senza testo (per ora solo nelle righe intere senza testo, cerca canzoni con cui testare, sicuro "Mi perdo nel tuo amore")
// TODO: Implement online for:
import Head from 'next/head'
/**
 * Priorities:
 * B
 * - Share playlist (playlist usually privates, when you share it, you actually make a copy and create a separate voice on shared_playlists -> no much sense)
 * - Add song
 * - Modify song WIP  
 * C
 * - Sessions
 * - Download PDF with all the songs
 */

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      console.log("service worker in navigator")
      navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
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
      <title>Praising</title>
      <meta
        name='viewport'
        content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover'
      />
    </Head>
    <Provider store={store}>
      <ThemedComponent Component={Component} pageProps={pageProps}/>
    </Provider>
    </>
  )
}

function ThemedComponent({ Component, pageProps }: any) {
  const darkMode = useAppSelector(state => state.settings.darkMode)
  
  return (
    <ThemeProvider theme={createTheme(darkMode ? dark_theme_options : light_theme_options)}>
      <CssBaseline />
      <AuthContextProvider>
        <Component {...pageProps} />
      </AuthContextProvider>
    </ThemeProvider>
  )
}
