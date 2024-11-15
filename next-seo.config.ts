import { DefaultSeoProps } from 'next-seo';

const config: DefaultSeoProps = {
  defaultTitle: 'Praising - Gli accordi per i tuoi canti cristiani',
  titleTemplate: '%s - Praising',
  description:
    'Praising è la tua web-app per visualizzare gli accordi per dei canti cristiani più famosi, insieme a tante utilissime funzionalità',
  themeColor: '#F0B647',
  additionalMetaTags: [
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'default'
    },
    {
      name: 'apple-mobile-web-app-title',
      content: 'Praising'
    },
    {
      name: 'format-detection',
      content: 'telephone=no'
    },
    {
      name: 'mobile-web-app-capable',
      content: 'yes'
    },
    {
      name: 'msapplication-config',
      content: '/icons/browserconfig.xml'
    },
    {
      name: 'msapplication-TileColor',
      content: '#F0B647'
    },
    {
      name: 'msapplication-tap-highlight',
      content: 'no'
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes'
    },
    {
      name: 'viewport',
      content:
        'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover'
    },
    {
      name: 'application-name',
      content: 'Praising'
    }
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/icons/favicon-32x32.ico',
      sizes: '32x32'
    },
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/icons/favicon-16x16.ico',
      sizes: '16x16'
    },
    {
      rel: 'mask-icon',
      href: '/icons/safari-pinned-tab.svg',
      color: '#F0B647'
    },
    {
      rel: 'apple-touch-icon',
      href: '/icons/apple-touch-icon.ico',
      sizes: '76x76'
    },
    {
      rel: 'apple-touch-icon',
      href: '/icons/apple-touch-icon.ico',
      sizes: '152x152'
    },
    {
      rel: 'apple-touch-icon',
      href: '/icons/apple-touch-icon.ico',
      sizes: '180x180'
    },
    {
      rel: 'apple-touch-icon',
      href: '/icons/apple-touch-icon.ico',
      sizes: '167x167'
    },
    {
      rel: 'shortcut icon',
      type: 'image/x-icon',
      href: '/favicon.ico'
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/splash_ios_iphone.png'
    },
    {
      rel: 'manifest',
      href: '/manifest.json'
    }
  ],
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: 'https://www.praising.vercel.app/',
    title: 'Praising - Gli accordi per i tuoi canti cristiani',
    description:
      'Visualizza gli accordi per i tuoi canti cristiani, insieme a tante utilissime funzionalità'
  }
};

export default config;
