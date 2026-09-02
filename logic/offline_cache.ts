import { getLocalSongs } from './local_logic';
import {
  OFFLINE_CACHES,
  type WarmOfflineMessage,
  type WarmOfflineProgress
} from './offline_caches';

/**
 * Lato client del sistema offline: costruisce gli elenchi di URL da mettere
 * in cache e li passa al service worker, che li scarica in background.
 *
 * Due livelli, con costi molto diversi:
 * - `data`  -> i JSON di `_next/data` (~5 KB a canto, ~1,2 MB in tutto).
 *              Bastano per aprire qualsiasi canto navigando dentro l'app.
 *              Si scaricano da soli.
 * - `pages` -> i documenti HTML (~60 KB a canto, ~16 MB in tutto).
 *              Servono solo per aprire un canto "a freddo": link condiviso,
 *              refresh, o riapertura della PWA su quell'indirizzo. Su
 *              richiesta esplicita dell'utente.
 */

export type WarmKind = 'data' | 'pages';

export interface WarmProgress {
  done: number;
  total: number;
  failed: number;
  finished: boolean;
}

const WARMED_KEY = 'offline_warmed_build';

interface NextDataWindow {
  __NEXT_DATA__?: { buildId?: string };
}

/** Il buildId cambia a ogni deploy: e' anche la nostra invalidazione. */
export const getBuildId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return (window as unknown as NextDataWindow).__NEXT_DATA__?.buildId ?? null;
};

export const isOfflineSupported = (): boolean =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'caches' in window;

const getSongIds = (): string[] => getLocalSongs().map((song) => song.id);

/** `/_next/data/<buildId>/songs/<id>.json` per ogni canto del repertorio. */
export const getSongDataUrls = (): string[] => {
  const buildId = getBuildId();
  if (buildId === null) return [];
  return getSongIds().map(
    (id) => `/_next/data/${buildId}/songs/${encodeURIComponent(id)}.json`
  );
};

/** I documenti HTML delle pagine canto, piu' le pagine principali. */
export const getSongPageUrls = (): string[] => [
  '/',
  '/songs',
  '/playlist',
  '/settings',
  ...getSongIds().map((id) => `/songs/${encodeURIComponent(id)}`)
];

const urlsFor = (kind: WarmKind): string[] =>
  kind === 'data' ? getSongDataUrls() : getSongPageUrls();

const cacheNameFor = (kind: WarmKind): string =>
  kind === 'data' ? OFFLINE_CACHES.pageData : OFFLINE_CACHES.pages;

/**
 * Quante delle URL previste sono gia' in cache. La CacheStorage e'
 * leggibile anche dalla finestra, quindi non serve chiedere al worker.
 */
export const countCached = async (kind: WarmKind): Promise<number> => {
  if (!isOfflineSupported()) return 0;
  const urls = urlsFor(kind);
  if (urls.length === 0) return 0;
  try {
    const cache = await caches.open(cacheNameFor(kind));
    const keys = await cache.keys();
    const cachedPaths = new Set(
      keys.map((request) => new URL(request.url).pathname)
    );
    return urls.filter((url) =>
      cachedPaths.has(new URL(url, location.origin).pathname)
    ).length;
  } catch {
    return 0;
  }
};

/** Numero di elementi previsti per un livello (per le percentuali). */
export const countExpected = (kind: WarmKind): number => urlsFor(kind).length;

/**
 * Chiede al service worker di riempire la cache del livello indicato.
 * Risolve quando il warm-up e' finito; `onProgress` viene chiamata durante.
 */
export const warmOffline = async (
  kind: WarmKind,
  onProgress?: (progress: WarmProgress) => void
): Promise<WarmProgress> => {
  const empty: WarmProgress = { done: 0, total: 0, failed: 0, finished: true };
  if (!isOfflineSupported()) return empty;

  const urls = urlsFor(kind);
  if (urls.length === 0) return empty;

  const registration = await navigator.serviceWorker.ready;
  const worker = registration.active;
  if (worker === null) return empty;

  const jobId = `${kind}-${Date.now()}`;
  const message: WarmOfflineMessage = {
    type: 'PRAISING_WARM_OFFLINE',
    cacheName: cacheNameFor(kind),
    urls,
    jobId
  };

  return await new Promise<WarmProgress>((resolve) => {
    const onMessage = (event: MessageEvent): void => {
      const data = event.data as WarmOfflineProgress | undefined;
      if (data?.type !== 'PRAISING_WARM_OFFLINE_PROGRESS') return;
      if (data.jobId !== jobId) return;

      const progress: WarmProgress = {
        done: data.done,
        total: data.total,
        failed: data.failed,
        finished: data.finished
      };
      onProgress?.(progress);
      if (data.finished) {
        navigator.serviceWorker.removeEventListener('message', onMessage);
        resolve(progress);
      }
    };

    navigator.serviceWorker.addEventListener('message', onMessage);
    worker.postMessage(message);
  });
};

/**
 * Warm-up automatico del livello `data`, una volta per deploy.
 *
 * Si tira indietro se il dispositivo e' offline o in risparmio dati: in quel
 * caso riprovera' alla prossima apertura, e nel frattempo la navigazione
 * riempie comunque la cache canto per canto.
 */
export const warmOfflineOnStartup = async (): Promise<void> => {
  if (!isOfflineSupported()) return;
  if (!navigator.onLine) return;

  const connection = (
    navigator as unknown as { connection?: { saveData?: boolean } }
  ).connection;
  if (connection?.saveData === true) return;

  const buildId = getBuildId();
  if (buildId === null) return;
  if (window.localStorage.getItem(WARMED_KEY) === buildId) return;

  await warmOffline('data');
  window.localStorage.setItem(WARMED_KEY, buildId);
};
