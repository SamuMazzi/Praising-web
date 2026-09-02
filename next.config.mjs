import { withSentryConfig } from '@sentry/nextjs';
import withSerwistInit from '@serwist/next';
import NextBundleAnalyzer from '@next/bundle-analyzer';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

// TODO: Add prompt to install https://stackoverflow.com/questions/50332119/is-it-possible-to-make-an-in-app-button-that-triggers-the-pwa-add-to-home-scree/64727286#64727286
// https://nextjs.org/docs/app/building-your-application/configuring/progressive-web-apps
// Same for iOS https://stackoverflow.com/questions/51160348/pwa-how-to-programmatically-trigger-add-to-homescreen-on-ios-safari
const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  // Scrive i report in .next/analyze senza aprire il browser
  openAnalyzer: false
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true
  }
};

/**
 * Voci di precache per i file di `public/`.
 *
 * Serwist genera questa lista da solo, ma lascia i nomi file cosi' come
 * sono: i 28 canti con una virgola nel nome (`Santo, Vescogni.crd`) finivano
 * nel manifest con la virgola letterale, e su quell'URL il server risponde
 * 404. Siccome il precache e' tutto-o-niente, quel 404 faceva fallire
 * l'installazione del service worker: la PWA non ha mai avuto alcuna cache.
 *
 * Qui gli URL passano per encodeURIComponent segmento per segmento, che e'
 * esattamente come li costruisce il client quando chiede un `.crd`.
 */
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const PUBLIC_IGNORED = ['sw.js', 'sw.js.map'];

const collectPublicFiles = (dir, prefix = '') => {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const absolute = path.join(dir, entry);
    const relative = prefix === '' ? entry : `${prefix}/${entry}`;
    if (statSync(absolute).isDirectory()) {
      out.push(...collectPublicFiles(absolute, relative));
    } else {
      out.push(relative);
    }
  }
  return out;
};

const publicPrecacheEntries = () =>
  collectPublicFiles(PUBLIC_DIR)
    .filter(
      (file) =>
        !PUBLIC_IGNORED.includes(file) && !file.startsWith('swe-worker-')
    )
    .map((file) => ({
      url: `/${file.split('/').map(encodeURIComponent).join('/')}`,
      revision: createHash('md5')
        .update(readFileSync(path.join(PUBLIC_DIR, file)))
        .digest('hex')
    }));

const withSerwist = withSerwistInit({
  swSrc: './init-service-worker.ts',
  swDest: 'public/sw.js',
  additionalPrecacheEntries: publicPrecacheEntries(),
  reloadOnOnline: true,
  register: false, // This is done in _app.tsx
  disable: process.env.NODE_ENV === 'development'
});

// eslint-disable-next-line next-recommended/export-server-actions-only
export default withSentryConfig(withBundleAnalyzer(withSerwist(nextConfig)), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'freetechsam',

  project: 'praising-nextjs',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true
    }
  }
});
