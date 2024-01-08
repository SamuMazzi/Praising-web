import type { AppProps } from 'next/app'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { dark_theme_options, light_theme_options } from '../styles/theme'
import { Provider } from 'react-redux'
import { store, useAppSelector } from '../logic/redux/store'
import '../styles/globals.css'
import Head from 'next/head'
import { useEffect } from 'react'

// TODO: Offline https://github.com/hanford/next-offline
// TODO: Implementare spazi fra accordi senza testo (per ora solo nelle righe intere senza testo, cerca canzoni con cui testare, sicuro "Mi perdo nel tuo amore")
// TODO: Implement online for:
/**
 * - Authenticated user
 * - Add song
 * - Share playlist
 * - Sessions
 * - Download PDF with all the songs
 * - Cache all the info about songs (?) (for example, the transpose)
 * - Favorite songs (?)
 */

export default function App({ Component, pageProps }: AppProps) {
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
  }, []);

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
      <CssBaseline />
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
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
