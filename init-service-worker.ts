import type {
  PrecacheEntry,
  SerwistGlobalConfig,
  RuntimeCaching
} from 'serwist';
import {
  Serwist,
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate
} from 'serwist';
import { defaultCache } from '@serwist/next/worker';
import {
  OFFLINE_CACHES,
  type WarmOfflineMessage,
  type WarmOfflineProgress
} from './logic/offline_caches';

/**
 * Strategia offline di Praising.
 *
 * Il precache (generato in build da Serwist) contiene gia' i chunk JS/CSS e
 * tutti i file `.crd` di `public/accordi`: quella roba e' permanente, non
 * scade mai e viene ripulita solo quando cambia la sua `revision`.
 *
 * Quello che il precache NON puo' contenere sono gli artefatti che Next
 * genera lato server: gli HTML delle pagine e i JSON di `_next/data`. Con
 * `defaultCache` finivano in cache runtime da 32 voci con scadenza 24h, per
 * cui l'app risultava utilizzabile offline solo per le ultime canzoni aperte
 * e solo entro il giorno stesso. Le regole qui sotto li spostano in cache
 * dedicate senza ExpirationPlugin (quindi senza scadenza ne' tetto di voci),
 * e il warm-up via messaggio le riempie in background per tutto il
 * repertorio.
 */

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: Array<PrecacheEntry | string> | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const isSongData = (pathname: string): boolean =>
  /^\/_next\/data\/[^/]+\/.+\.json$/.test(pathname);

const cachingStrategies: RuntimeCaching[] = [
  // --- Accordi ------------------------------------------------------------
  // In pratica risponde sempre il precache (la sua route viene registrata
  // prima di queste), ma la regola copre i file aggiunti dopo l'ultimo build.
  {
    matcher: ({ sameOrigin, url }) =>
      sameOrigin && url.pathname.startsWith('/accordi/'),
    handler: new CacheFirst({ cacheName: OFFLINE_CACHES.chords })
  },
  {
    matcher: ({ sameOrigin, url }) =>
      sameOrigin && url.pathname.startsWith('/api/song/'),
    handler: new StaleWhileRevalidate({ cacheName: OFFLINE_CACHES.chords })
  },
  // Versioni personali: Firebase Storage passa da normali richieste HTTPS,
  // quindi a differenza di Firestore il service worker puo' intercettarle.
  {
    matcher: ({ url }) => url.hostname === 'firebasestorage.googleapis.com',
    handler: new StaleWhileRevalidate({ cacheName: OFFLINE_CACHES.userSongs })
  },
  // --- Dati delle pagine --------------------------------------------------
  // `ignoreSearch` e' indispensabile: per una rotta dinamica Next chiede
  // `/_next/data/<buildId>/songs/1.json?id=1`, con i parametri di rotta in
  // query, mentre in cache l'URL e' senza. Senza questa opzione il match
  // fallisce, il router non trova i dati e ripiega su una navigazione
  // completa, che offline finisce sulla pagina di fallback.
  {
    matcher: ({ sameOrigin, url }) => sameOrigin && isSongData(url.pathname),
    handler: new StaleWhileRevalidate({
      cacheName: OFFLINE_CACHES.pageData,
      matchOptions: { ignoreSearch: true }
    })
  },
  // --- Documenti HTML -----------------------------------------------------
  // `request.mode === 'navigate'` e' il test corretto per una navigazione:
  // defaultCache guarda invece l'header Content-Type della *richiesta*, che
  // su una navigazione non c'e'. networkTimeoutSeconds evita che con una
  // riga di segnale scarsa la pagina resti appesa invece di usare la cache.
  {
    matcher: ({ request, sameOrigin, url }) =>
      sameOrigin &&
      request.mode === 'navigate' &&
      !url.pathname.startsWith('/api/'),
    handler: new NetworkFirst({
      cacheName: OFFLINE_CACHES.pages,
      networkTimeoutSeconds: 4
    })
  },
  ...defaultCache
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    ignoreURLParametersMatching: [/.*/],
    cleanupOutdatedCaches: true
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: cachingStrategies,
  fallbacks: {
    entries: [
      {
        // `offline.html` sta in `public/`, quindi il precache lo prende da
        // solo: e' l'unico modo di avere una fallback sempre disponibile.
        matcher: ({ request }) => request.destination === 'document',
        url: '/offline.html'
      }
    ]
  }
});

// ---------------------------------------------------------------------------
// Warm-up
// ---------------------------------------------------------------------------

/**
 * Quante richieste in volo insieme. Il motivo per cui il warm-up non sta
 * nell'evento `install` e' proprio questo: li' 233 richieste bloccano
 * l'attivazione del service worker e un singolo fallimento fa fallire tutta
 * l'installazione, lasciando l'utente senza *nulla* in cache.
 */
const WARM_CONCURRENCY = 4;

const warmUrls = async (
  message: WarmOfflineMessage,
  client: Client | null
): Promise<void> => {
  const cache = await caches.open(message.cacheName);
  const total = message.urls.length;
  let done = 0;
  let failed = 0;
  let lastNotified = 0;

  const notify = (finished: boolean): void => {
    if (client === null) return;
    const progress: WarmOfflineProgress = {
      type: 'PRAISING_WARM_OFFLINE_PROGRESS',
      jobId: message.jobId,
      done,
      total,
      failed,
      finished
    };
    client.postMessage(progress);
  };

  const queue = [...message.urls];
  const worker = async (): Promise<void> => {
    for (;;) {
      const url = queue.shift();
      if (url === undefined) return;
      try {
        // Se c'e' gia', non la riscarichiamo: il warm-up e' ripetibile e
        // riprende da dove si era interrotto.
        const hit = await cache.match(url);
        if (hit === undefined) {
          const res = await fetch(url, { credentials: 'same-origin' });
          if (res.ok) {
            await cache.put(url, res);
          } else {
            failed += 1;
          }
        }
      } catch {
        // Rete caduta a meta' warm-up: si riprende alla prossima apertura.
        failed += 1;
      }
      done += 1;
      // Una notifica ogni 10 per non intasare il canale di messaggi.
      if (done - lastNotified >= 10) {
        lastNotified = done;
        notify(false);
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(WARM_CONCURRENCY, total) }, worker)
  );
  notify(true);
};

self.addEventListener('message', (event) => {
  const data = event.data as Partial<WarmOfflineMessage> | undefined;
  if (data?.type !== 'PRAISING_WARM_OFFLINE') return;
  if (!Array.isArray(data.urls) || typeof data.cacheName !== 'string') return;

  event.waitUntil(
    warmUrls(
      {
        type: 'PRAISING_WARM_OFFLINE',
        cacheName: data.cacheName,
        urls: data.urls,
        jobId: data.jobId ?? 'unknown'
      },
      event.source instanceof Client ? event.source : null
    )
  );
});

serwist.addEventListeners();
