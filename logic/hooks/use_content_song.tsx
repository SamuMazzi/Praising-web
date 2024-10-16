import { useEffect, useState } from 'react';
import { type CustomSongInfo, getSongInfoVersions } from '../server/database';
import { getVersionSong } from '../server/storage';
import { getFromStorage } from '../local_logic';

export const fetcher = async (url: string): Promise<any> => {
  try {
    const res = await fetch(url);
    const out = await res.json();
    return out;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export default function useContentSong(
  idSong: string,
  stdIdVersion?: string
): {
  content: string;
  versions: CustomSongInfo[];
  loadingVersions: boolean;
  loadingContent: boolean;
  error: string;
  fetchSong: (idVersion?: string) => Promise<void>;
  fetchVersions: () => Promise<void>;
} {
  const [data, setData] = useState('');
  const [loadingContent, setLoadingContent] = useState(true);
  const [loadingVersions, setLoadingVersions] = useState(true);
  const [error, setError] = useState('');
  const [versions, setVersions] = useState<CustomSongInfo[]>([]);

  /**
   * Collections:
   *   Collection      Document     Collection    Document
   * - custom_songs -> song_id_1 -> version_1  -> {name_file_storage: string, creation_time: timestamp, last_modified: timestamp, author: string, rates?: number}
   *                   song_id_2
   *                   ...
   *
   *
   */

  async function fetchVersions(): Promise<void> {
    try {
      const songsLoaded = (await getSongInfoVersions(idSong)).sort(
        (a, b) => b.creationTime.seconds - a.creationTime.seconds
      ); // TODO: If this is the correct order or opposite
      setVersions(songsLoaded);
    } catch (e: any) {
      setError(e as string);
    } finally {
      setLoadingVersions(false);
    }
  }

  async function fetchSong(idVersion?: string): Promise<void> {
    setLoadingContent(true);
    setError('');
    try {
      let content = '';
      if (idVersion !== undefined) {
        content = await getVersionSong(idVersion, idSong);
      } else {
        content = await fetcher(`/api/song/${encodeURIComponent(idSong)}`);
      }
      setData(content);
    } catch (e: any) {
      setError(e as string);
    } finally {
      setLoadingContent(false);
    }
  }

  useEffect(() => {
    if (getFromStorage('debug_admin') !== null) {
      void fetchVersions();
    }
    void fetchSong(stdIdVersion);
  }, []);

  return {
    content: data,
    versions,
    loadingContent,
    loadingVersions,
    error,
    fetchSong,
    fetchVersions
  };
}
