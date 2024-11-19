import { useEffect, useState } from 'react';
import {
  Playlist,
  getMyPlaylists,
  getSharedPlaylists
} from '../server/database';
import { saveToStorage } from '../local_logic';
import useFirebaseAuth from './use_auth';

export default function usePlaylist(): {
  playlists: Playlist[];
  loadingPlaylists: boolean;
  error: string;
  fetchAllPlaylists: () => Promise<void>;
} {
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [error, setError] = useState('');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const { authUser, loading, infoProfile } = useFirebaseAuth();

  async function fetchAllPlaylists(): Promise<void> {
    if (!authUser) {
      return;
    }
    setLoadingPlaylists(true);
    try {
      const idSharedPlaylists = infoProfile?.sharedPlaylists ?? [];
      const sharedPlaylists = await getSharedPlaylists(idSharedPlaylists);
      const myPlaylist = await getMyPlaylists(authUser.uid);
      const playlistsLoaded = sharedPlaylists
        .concat(myPlaylist)
        .sort((a, b) => b.creationTime.seconds - a.creationTime.seconds);
      setPlaylists(playlistsLoaded);
      saveToStorage('playlists', playlistsLoaded);
    } catch (e: any) {
      setError(e as string);
    } finally {
      setLoadingPlaylists(false);
    }
  }

  useEffect(() => {
    if (loading) {
      return;
    }
    void fetchAllPlaylists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return {
    loadingPlaylists,
    playlists,
    error,
    fetchAllPlaylists
  };
}
