import { useEffect, useState } from 'react';
import { type CustomSongInfo, getSongInfoVersions } from '../server/database';
import { getVersionSong } from '../server/storage';

const fetcher = async (url: string): Promise<any> => {
  try {
    const res = await fetch(url);
    const out = await res.json();
    return out;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export default function useContentSong(idSong: string): {
  content: string;
  versions: CustomSongInfo[];
  loadingVersions: boolean;
  loadingContent: boolean;
  error: string;
  fetchSong: (nameFileVersion?: string) => Promise<void>;
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

  async function fetchSong(nameFileVersion?: string): Promise<void> {
    setLoadingContent(true);
    setError('');
    try {
      let content = '';
      if (nameFileVersion !== undefined) {
        content = await getVersionSong(nameFileVersion, idSong);
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
    // void fetchVersions();
    void fetchSong();
  }, []);

  return {
    content: data,
    versions,
    loadingContent,
    loadingVersions,
    error,
    fetchSong
  };
}
