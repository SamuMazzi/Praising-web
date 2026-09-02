import { type ChordNotations } from './redux/settings_slice';

/**
 * Stessi valori delle costanti omonime di chordsheetjs. Ridichiararle qui
 * evita di tirare dentro la libreria (~1 MB) solo per due stringhe:
 * chordsheetjs serve davvero solo dove si rende un canto.
 */
export const SOLFEGE: ChordNotations = 'solfege';
export const SYMBOL: ChordNotations = 'symbol';
import songs from './songs.config.json';

export const VERSION_APP = '0.8.1';

export const filterMomenti: Record<string, string> = {
  Ingr: 'Introduzione',
  G: 'Gloria',
  S: 'Salmo',
  All: 'Alleluia',
  Lode: 'Lode a Te',
  Off: 'Offertorio',
  San: 'Santo',
  Agn: 'Agnello di Dio',
  Com: 'Comunione',
  Fin: 'Finale'
};

export const filterArgomenti: Record<string, string> = {
  Qua: 'Quaresima',
  Avv: 'Avvento',
  Nat: 'Natale',
  Pas: 'Pasqua',
  SS: 'Spirito Santo',
  Mar: 'Maria',
  Matr: 'Matrimonio',
  Ado: 'Adorazione',
  Ingl: 'Inglese',
  Can: 'Canone'
};

export const saveToStorage = (
  key: string,
  value: unknown,
  type: 'localStorage' | 'sessionStorage' = 'localStorage'
): void => {
  if (typeof window !== 'undefined') {
    window[type].setItem(
      key,
      value !== undefined ? JSON.stringify(value) : 'null'
    );
  }
};

/** Returns the saved object, otherwise returns null */
export const getFromStorage = (
  key: string,
  type: 'localStorage' | 'sessionStorage' = 'localStorage'
): unknown => {
  if (typeof window !== 'undefined') {
    const res = window[type].getItem(key);
    if (
      res !== null &&
      res !== undefined &&
      res !== 'undefined' &&
      res !== 'null'
    ) {
      return JSON.parse(res);
    }
  }
  return null;
};

export const clearStorage = (): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.clear();
  }
};

export interface Song {
  name: string;
  nameFile: string;
  author: string;
  id: string;
  link?: string;
  argomento?: string[];
  parteMessa?: string[];
  transpose?: number;
  scaleFactor?: number;
}

let localSongs: Song[] = [];

export const getLocalSongs = (): Song[] => {
  if (localSongs.length === 0) {
    localSongs = songs.map((v) => ({
      name: v.Nome,
      nameFile: v['Nome file'],
      author: v.Autore ?? '',
      id: v.Id.toString(),
      link: v.Link,
      argomento: v.Caratteristica?.split('-'),
      parteMessa: v['Parte della messa']?.split('-')
    }));
  }
  return localSongs;
};

/**
 * I canti di un filtro, sia esso una parte della messa o un argomento: e' la
 * stessa condizione della pagina /songs/filter/[filter], tenuta in un posto
 * solo cosi' il numero mostrato in home e la lista che si apre non possono
 * divergere.
 */
export const getSongsForFilter = (filter: string): Song[] =>
  getLocalSongs().filter(
    (v) =>
      (v.argomento?.includes(filter) ?? false) ||
      (v.parteMessa?.includes(filter) ?? false)
  );

/** Conteggi per filtro, calcolati in una passata sola e tenuti da parte: la
 *  home ne chiede dieci di fila a ogni render. */
let filterCounts: Record<string, number> | undefined;

export const getFilterCount = (filter: string): number => {
  if (filterCounts === undefined) {
    const counts: Record<string, number> = {};
    for (const song of getLocalSongs()) {
      // Un canto vale uno anche se ripete la stessa chiave nei due campi.
      const chiavi = new Set([
        ...(song.argomento ?? []),
        ...(song.parteMessa ?? [])
      ]);
      for (const chiave of chiavi) {
        counts[chiave] = (counts[chiave] ?? 0) + 1;
      }
    }
    filterCounts = counts;
  }
  return filterCounts[filter] ?? 0;
};

interface InfoLocalSong {
  transpose?: number;
  scaleFactor?: number;
}

export const getSingleSong = (id: string): Song | undefined => {
  const songs = getLocalSongs();
  const song: Song | undefined = songs.find((v) => v.id === id);

  if (song === undefined) return;
  const infoLocalSong = getFromStorage(
    'song_' + song.id
  ) as InfoLocalSong | null;
  if (infoLocalSong !== null) {
    song.transpose = infoLocalSong.transpose;
    song.scaleFactor = infoLocalSong.scaleFactor;
  }
  return song;
};

export const updateLastRecentsSongs = (song: Song): string[] | undefined => {
  const limit = 7;
  let recents = (getFromStorage(RECENTS_KEY) as string[]) || [];
  if (recents.includes(song.id) && recents[0] === song.id) return;
  else if (recents.includes(song.id) && recents[0] !== song.id) {
    // Song exists but it's not the first one
    recents = recents.filter((v) => v !== song.id);
  }

  const newRec = [song.id, ...recents];
  if (newRec.length > limit) {
    newRec.splice(limit - 1);
  }
  saveToStorage(RECENTS_KEY, newRec);
  return newRec;
};

export const RECENTS_KEY = 'recents';

/** Flag transitorio in sessionStorage: la playlist sta per essere cancellata */
export const DELETING_PLAYLIST_KEY = 'deleting_playlist';

export const getLastRecentsSongs = (): string[] => {
  const recents = (getFromStorage(RECENTS_KEY) as string[]) || [];
  return recents;
};

export const getLocalChordNotation = (): ChordNotations => {
  const out: ChordNotations = SOLFEGE; // getFromStorage('chordNotation') ||
  return out;
};

export const setLocalChordNotation = (notation: ChordNotations): void => {
  saveToStorage('chordNotation', notation);
};
