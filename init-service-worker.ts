import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const additionalPrecacheEntries: (string | PrecacheEntry)[] = [
  {url: "/pages/_app.js", revision: "1"}, 
  {url: "/pages/_document.js", revision: "1"}, 
  {url: "/pages/_error.js", revision: "1"}, 
  {url: "/pages/songs/index.tsx", revision: "1"}, 
  {url: "/pages/songs/[id].tsx", revision: "1"},
  {url: "/pages/settings.tsx", revision: "1"},
  {url: "/pages/feedback.tsx", revision: "1"},
  {url: "/pages/contribute.tsx", revision: "1"},
  {url: "/pages/login.tsx", revision: "1"},
  {url: "/pages/404.tsx", revision: "1"},
  {url: "/pages/playlist/index.tsx", revision: "1"},
  {url: "/pages/accordi/index.tsx", revision: "1"},
  {url: "/pages/lectures/index.tsx", revision: "1"},
  {url: "/pages/playlist/index.tsx", revision: "1"},
  {url: "/pages/index.tsx", revision: "1"},
]

const serwist = new Serwist({
  precacheEntries: additionalPrecacheEntries.concat(self.__SW_MANIFEST || []),
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});
// TODO: Add revision to precache entries
const urlsToCache: (string | PrecacheEntry)[] = ["/", "/accordi/", 
  {
    url: "/assets/Illustrazioni/Adorazione2.png",
    revision: "1"
  },
  {
    url: "/assets/Illustrazioni/Avvento2.png",
    revision: "1"
  },
  {
    url: "/assets/Illustrazioni/Canone2.png",
    revision: "1"
  },
  {
    url: "/assets/Illustrazioni/Inglese2.png",
    revision: "1"
  },
  {
    url: "/assets/undraw_illustrations/undraw_compose_music.svg",
    revision: "1"
  },
  "/assets/undraw_illustrations/"];
serwist.addToPrecacheList(urlsToCache);

serwist.addEventListeners();
