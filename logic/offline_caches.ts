/**
 * Nomi delle cache offline, condivisi fra il service worker
 * (`init-service-worker.ts`) e il client (`logic/offline_cache.ts`).
 *
 * Sono cache *senza* ExpirationPlugin: niente scadenza e niente tetto di
 * voci, al contrario di quelle di `defaultCache` (32 voci / 24 ore), che per
 * un repertorio di oltre 200 canti non bastano.
 */
export const OFFLINE_CACHES = {
  /** Documenti HTML delle pagine (apertura a freddo / refresh / link diretto). */
  pages: 'praising-pages-v1',
  /** JSON di `_next/data`: servono alla navigazione interna del router. */
  pageData: 'praising-page-data-v1',
  /** Accordi: `.crd` da public (gia' in precache) e `/api/song/*` di scorta. */
  chords: 'praising-chords-v1',
  /** Versioni personali degli utenti, scaricate da Firebase Storage. */
  userSongs: 'praising-user-songs-v1'
} as const;

/** Messaggio inviato dal client per riempire una cache in background. */
export interface WarmOfflineMessage {
  type: 'PRAISING_WARM_OFFLINE';
  cacheName: string;
  urls: string[];
  /** Identifica la richiesta nelle risposte di avanzamento. */
  jobId: string;
}

/** Risposta periodica verso il client che ha chiesto il warm-up. */
export interface WarmOfflineProgress {
  type: 'PRAISING_WARM_OFFLINE_PROGRESS';
  jobId: string;
  done: number;
  total: number;
  failed: number;
  finished: boolean;
}
