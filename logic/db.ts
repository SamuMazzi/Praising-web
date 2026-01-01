import Dexie, { type Table } from 'dexie';
import { Song } from './local_logic';

export interface LocalDBSong extends Song {
  content: string;
}

export class SongDatabase extends Dexie {
  songs!: Table<LocalDBSong>;

  constructor() {
    super('SongDatabase');
    this.version(1).stores({
      songs: 'id, nameFile'
    });
  }
}

export const db = new SongDatabase();
