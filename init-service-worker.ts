import type { PrecacheEntry, SerwistGlobalConfig, RuntimeCaching } from "serwist";
import { Serwist, StaleWhileRevalidate } from "serwist";
import { getLocalSongs } from "./logic/local_logic";

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
  {url: "/lectures", revision: "2"},
  {url: "/songs", revision: "2"},
  {url: "/", revision: "2"},
  {url: "/playlist", revision: "2"},
  {url: "/feedback", revision: "2"},
  {url: "/contribute", revision: "2"},
  {url: "/settings", revision: "2"},
]
const cachingStrategies: RuntimeCaching[] = [
  {
    matcher: ({ request, url }) => url.pathname.startsWith("/api/song/"),
    handler: new StaleWhileRevalidate({
      cacheName: "songs-v1",
    }),
  },
  {
    matcher: /.*/i,
    handler: new StaleWhileRevalidate(),
  }
];

// 'serwist-runtime-http://localhost:3000/'

const serwist = new Serwist({
  // All assets and "accordi" are automatically cached by default.
  precacheEntries: additionalPrecacheEntries.concat(self.__SW_MANIFEST || []),
  precacheOptions: {
    ignoreURLParametersMatching: [/.*/],
    cleanupOutdatedCaches: true
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: cachingStrategies,
  fallbacks: {
    entries: [{
      matcher: ({ request }) => request.url.startsWith("/lectures"),
      url: "/offline",
    }]
  ,}
});
/*
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin === location.origin && event.request.url.includes("/api/song/")) {
    console.log("Fetch event", url.pathname, url.origin === location.origin );
    const cacheKey = serwist.getPrecacheKeyForUrl(event.request.url);
    if (cacheKey) {
      console.log("Found cache in fetch song")
      event.respondWith((async () => {
        const cache = await caches.open(serwist.precacheStrategy.cacheName);
        return await cache.match(cacheKey) ?? Response.error()
      })());
    }
    console.log("getting song from cache")
    const id_song = url.pathname.split('/').pop()
    if (!id_song) return Response.error()
    const song = getSingleSong(id_song)
    /*if (song) {
      event.respondWith((async () => {
        // const a = await cache.match(cacheKey) ?? Response.error()
        
        return a;
      })());
    }
  }
}); */

self.addEventListener("install", (e) => {
  e.waitUntil(
    (async () => {
      const cache_songs = await caches.open("songs-v1");
      const contentToCache = getLocalSongs().map(song => "/api/song/" + song.id)
      cache_songs.addAll(contentToCache)
      // ---------------------------------
      const cacheNames = await caches.keys();
      const cachess = await Promise.all(
        cacheNames.map(async (cacheName) => {
          console.log("Opening cache", cacheName);
          return caches.open(cacheName);
        }),
      );
      console.log("Installing service worker");
      console.log("Opened caches", cachess);
      for (let i = 0; i < cachess.length; i++) {
        const cache = cachess[i];
        const k = await cache.keys()
        console.log(i, k)
      }
    })(),
  );
});
/*
const putInCache = async (request: Request, response: Response) => {
  const cache = await caches.open("v1");
  await cache.put(request, response);
};

const cacheFirst = async ({ request, fallbackUrl }: {request: Request, fallbackUrl: string}) => {
  // First try to get the resource from the cache.
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }

  // If the response was not found in the cache,
  // try to get the resource from the network.
  try {
    const responseFromNetwork = await fetch(request);
    // If the network request succeeded, clone the response:
    // - put one copy in the cache, for the next time
    // - return the original to the app
    // Cloning is needed because a response can only be consumed once.
    putInCache(request, responseFromNetwork.clone());
    return responseFromNetwork;
  } catch (error) {
    // If the network request failed,
    // get the fallback response from the cache.
    const fallbackResponse = await caches.match(fallbackUrl);
    if (fallbackResponse) {
      return fallbackResponse;
    }
    // When even the fallback response is not available,
    // there is nothing we can do, but we must always
    // return a Response object.
    return new Response("Network error happened", {
      status: 408,
      headers: { "Content-Type": "text/plain" },
    });
  }
};

self.addEventListener("install", (e) => {
  e.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const cachess = await Promise.all(
        cacheNames.map(async (cacheName) => {
          console.log("Opening cache", cacheName);
          return caches.open(cacheName);
        }),
      );
      console.log("Installing service worker");
      console.log("Opened caches", cachess);
      for (let i = 0; i < cachess.length; i++) {
        const cache = cachess[i];
        const k = await cache.keys()
        console.log(i, k)
      }
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  console.log("Fetch event", event.request.url);
  event.respondWith(
    cacheFirst({
      request: event.request,
      fallbackUrl: "/fallback.html",
    }),
  );
});
*/

serwist.addEventListeners();
