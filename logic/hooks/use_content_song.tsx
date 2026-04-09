'use client';

import { useEffect, useState } from 'react';
import { type CustomSongInfo, getSongInfoVersions } from '../server/database';
import { getVersionSong } from '../server/storage';
import useFirebaseAuth from './use_auth';
import { useRouter } from 'next/router';
import { StorageErrorCode, StorageError } from '@firebase/storage';

// TODO: Prevent scrolling when downloading pdf

export const fetcher = async (
  url: string,
  forceReload: boolean
): Promise<string> => {
  try {
    const res = await fetch(url, {
      cache: forceReload ? 'reload' : 'force-cache',
      next: { revalidate: 3600 }
    });
    const out = await res.json();
    return out;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export default function useContentSong(
  idSong: string,
  stdIdVersion?: string,
  initialContent?: string
): {
  content: string;
  versions: CustomSongInfo[];
  loadingVersions: boolean;
  loadingContent: boolean;
  error: string;
  fetchSong: (idVersion?: string) => Promise<void>;
  fetchVersions: () => Promise<void>;
} {
  const [content, setContent] = useState(initialContent ?? '');
  const [loadingContent, setLoadingContent] = useState(!initialContent);
  const [loadingVersions, setLoadingVersions] = useState(true);
  const [error, setError] = useState('');
  const [versions, setVersions] = useState<CustomSongInfo[]>([]);
  const { authUser, loading } = useFirebaseAuth();
  const router = useRouter();

  /**
   * Collections:
   *   Collection      Document     Collection    Document
   * - custom_songs -> song_id_1 -> versions  ->  version_1  -> {id_version: string, creation_time: timestamp, last_modified: timestamp, author: string, rates?: number}
   *                   song_id_2    parts     ->  part_1     -> {name: string, id_part: string, creation_time: timestamp, last_modified: timestamp, author: string, rates?: number}
   *                   ...
   *
   *
   */

  async function fetchVersions(): Promise<void> {
    if (!authUser) {
      return;
    }
    try {
      const songsLoaded = (
        await getSongInfoVersions(authUser.uid, idSong)
      ).sort((a, b) => b.creationTime.seconds - a.creationTime.seconds); // TODO: If this is the correct order or opposite
      setVersions(songsLoaded);
    } catch (e) {
      setError(e as string);
    } finally {
      setLoadingVersions(false);
    }
  }

  async function fetchSong(idVersion?: string): Promise<void> {
    setLoadingContent(true);
    setError('');
    try {
      let contentSong = '';
      if (idVersion) {
        contentSong = await getVersionSong(idVersion, idSong);
      } else {
        contentSong = await fetcher(
          `/api/song/${encodeURIComponent(idSong)}`,
          (window.performance.getEntries()[0] as PerformanceNavigationTiming)
            .type === 'reload'
        );
      }
      setContent(contentSong);
    } catch (e) {
      if (
        e instanceof StorageError &&
        e.code === `storage/${StorageErrorCode.OBJECT_NOT_FOUND}` &&
        idVersion
      ) {
        // We fallback to fetch the original song if the version is not found
        await fetchSong();
        // Update URL -----------------
        const newQuery = router.query;
        delete newQuery.v;
        void router.replace(
          {
            query: newQuery
          },
          undefined,
          { shallow: true, scroll: false }
        );
        // ---------------------------
        return;
      }
      setError(e as string);
    } finally {
      setLoadingContent(false);
    }
  }

  useEffect(() => {
    if (loading) {
      return;
    }
    void fetchVersions();
    // Skip initial fetch if SSG already provided content and no specific version is requested
    if (!initialContent || stdIdVersion) {
      void fetchSong(stdIdVersion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSong, loading]);

  return {
    content,
    versions,
    loadingContent,
    loadingVersions,
    error,
    fetchSong,
    fetchVersions
  };
}
