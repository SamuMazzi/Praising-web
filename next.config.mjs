import withSerwistInit from '@serwist/next';
import NextBundleAnalyzer from '@next/bundle-analyzer';

// TODO: Add prompt to install https://stackoverflow.com/questions/50332119/is-it-possible-to-make-an-in-app-button-that-triggers-the-pwa-add-to-home-scree/64727286#64727286
// https://nextjs.org/docs/app/building-your-application/configuring/progressive-web-apps
// Same for iOS https://stackoverflow.com/questions/51160348/pwa-how-to-programmatically-trigger-add-to-homescreen-on-ios-safari
const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
});

const withSerwist = withSerwistInit({
  swSrc: './init-service-worker.ts',
  swDest: 'public/sw.js',
  reloadOnOnline: true,
  register: false, // This is done in _app.tsx
  disable: process.env.NODE_ENV === 'development'
});

export default withBundleAnalyzer(
  withSerwist({
    reactStrictMode: true
    // Your Next.js config
  })
);
