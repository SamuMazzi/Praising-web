import { SOLFEGE } from 'chordsheetjs';
import { type ChordNotations } from './redux/settings_slice';
import songs from './songs.config.json';

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
  value: any,
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
): any => {
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

interface InfoLocalSong {
  transpose?: number;
  scaleFactor?: number;
}

export const getSingleSong = (id: string): Song | undefined => {
  const songs = getLocalSongs();
  let song: Song | undefined;

  for (const s of songs) {
    if (s.id === id) {
      song = s;
      break;
    }
  }
  if (song === undefined) return;
  const infoLocalSong: InfoLocalSong | null = getFromStorage('song_' + song.id);
  if (infoLocalSong !== null) {
    song.transpose = infoLocalSong.transpose;
    song.scaleFactor = infoLocalSong.scaleFactor;
  }
  return song;
};

export const updateLastRecentsSongs = (song: Song): string[] | undefined => {
  const limit = 7;
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  let recents: string[] = getFromStorage('recents') || [];
  if (recents.includes(song.id) && recents[0] === song.id) return;
  else if (recents.includes(song.id) && recents[0] !== song.id) {
    // Song exists but it's not the first one
    recents = recents.filter((v) => v !== song.id);
  }

  const newRec = [song.id, ...recents];
  let out = newRec;
  if (newRec.length > limit) {
    out = newRec.splice(limit - 1);
  }
  saveToStorage('recents', out);
  return out;
};

export const getLastRecentsSongs = (): string[] => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const recents: string[] = getFromStorage('recents') || [];
  return recents;
};

export const getLocalChordNotation = (): ChordNotations => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const out: ChordNotations = getFromStorage('chordNotation') || SOLFEGE;
  return out;
};

export const setLocalChordNotation = (notation: ChordNotations): void => {
  saveToStorage('chordNotation', notation);
};
