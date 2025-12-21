'use client';

import { useEffect, useState } from 'react';
import { type PartSongInfo, getSongInfoParts } from '../server/database';
import { getPartSong } from '../server/storage';
import { getFromStorage } from '../local_logic';
import useFirebaseAuth from './use_auth';

export default function usePartsSong(idSong: string): {
  content: string;
  parts: PartSongInfo[];
  loadingParts: boolean;
  loadingSinglePart: boolean;
  error: string;
  fetchSinglePart: (idPart: string) => Promise<void>;
  fetchParts: () => Promise<void>;
} {
  const [loadingParts, setLoadingParts] = useState(true);
  const [loadingSinglePart, setLoadingSinglePart] = useState(true);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [parts, setParts] = useState<PartSongInfo[]>([]);
  const { authUser, loading } = useFirebaseAuth();

  async function fetchParts(): Promise<void> {
    if (!authUser) {
      return;
    }
    try {
      const songsLoaded = (await getSongInfoParts(authUser.uid, idSong)).sort(
        (a, b) => b.creationTime.seconds - a.creationTime.seconds
      ); // TODO: If this is the correct order or opposite
      setParts(songsLoaded);
    } catch (e) {
      setError(e as string);
    } finally {
      setLoadingParts(false);
    }
  }

  async function fetchSinglePart(idPart: string): Promise<void> {
    setLoadingSinglePart(true);
    setError('');
    try {
      const contentPart = await getPartSong(idPart, idSong);
      setContent(contentPart);
    } catch (e) {
      setError(e as string);
    } finally {
      setLoadingSinglePart(false);
    }
  }

  useEffect(() => {
    if (loading) {
      return;
    }
    void fetchParts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return {
    content,
    loadingSinglePart,
    loadingParts,
    parts,
    error,
    fetchSinglePart,
    fetchParts
  };
}
