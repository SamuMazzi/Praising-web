import { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';

export default function Document(): JSX.Element {
  return (
    <Html>
      <Head>
        <meta name="application-name" content="Praising" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Praising" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#F0B647" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#F0B647" />

        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/apple-touch-icon.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-touch-icon.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/icons/apple-touch-icon.png"
        />
        <link rel="apple-touch-startup-image" href="/splash_ios_iphone.png" />

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

        <meta property="og:type" content="website" />
        <meta property="type" content="website" />
        <meta
          property="og:title"
          content="Praising - Gli accordi per i tuoi canti cristiani"
        />
        <meta
          property="title"
          content="Praising - Gli accordi per i tuoi canti cristiani"
        />
        <meta
          property="og:description"
          content="Praising è la tua web-app per visualizzare testi e accordi dei canti cristiani più famosi."
        />
        <meta
          property="description"
          content="Praising è la tua web-app per visualizzare testi e accordi dei canti cristiani più famosi."
        />
        <meta property="og:site_name" content="Praising" />
        <meta property="og:url" content="https://praising.vercel.app" />
        <meta
          property="og:image"
          content="https://praising.vercel.app/icons/apple-touch-icon.png"
        />
        <meta property="site_name" content="Praising" />
        <meta property="url" content="https://praising.vercel.app" />
        <meta
          property="image"
          content="https://praising.vercel.app/icons/apple-touch-icon.png"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
