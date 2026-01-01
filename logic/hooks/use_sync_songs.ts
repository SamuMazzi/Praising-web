'use client';

import { useState } from 'react';
import { db } from '../db';
import {
  getFromStorage,
  getLocalSongs,
  saveToStorage,
  Song,
  VERSION_SONGS
} from '../local_logic';

export const useSync = () => {
  const [syncComplete, setSyncComplete] = useState(false);

  const fetchAndSaveSong = async (song: Song) => {
    console.log('fetching', song.id);
    const res = await fetch(`api/song/${song.id}`);
    if (res.status === 200) {
      const content = await res.json();
      await db.songs.put({ ...song, content }, song.id);
    }
  };

  const syncSongs = async () => {
    try {
      const oldVersion = getFromStorage('versionSongs') as number | null;
      if (oldVersion === null || oldVersion < VERSION_SONGS) {
        const songs = getLocalSongs();
        let futures = [];
        let cnt = 0;
        for (const song of songs) {
          const checked = await db.songs.get(song.id);
          if (!checked) {
            if (cnt >= 5) {
              await Promise.all(futures);
              futures = [];
              cnt = 0;
            }
            futures.push(fetchAndSaveSong(song));
            cnt += 1;
          }
        }
        await Promise.all(futures);
        saveToStorage('versionSongs', VERSION_SONGS);
      }

      console.log('Sync complete!');
      setSyncComplete(true);
    } catch (error) {
      console.error('Sync failed (likely offline):', error);
    }
  };

  return { syncSongs, syncComplete };
};
