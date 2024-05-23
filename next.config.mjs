import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "./init-service-worker.ts",
  swDest: "public/sw.js",
  // TODO: problema con apostrofi
  reloadOnOnline: true,
  register: true,
  disable: process.env.NODE_ENV === 'development',
});

export default withSerwist({
  reactStrictMode: true,
  // Your Next.js config
});