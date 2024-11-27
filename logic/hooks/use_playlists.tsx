import { useEffect, useState } from 'react';
import {
  Playlist,
  getMyPlaylists,
  getSharedPlaylists
} from '../server/database';
import useFirebaseAuth from './use_auth';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { setAllPlaylists } from '../redux/playlist_slice';
import { getFromStorage } from '../local_logic';

export default function usePlaylists(): {
  playlists: Record<string, Playlist>;
  loadingPlaylists: boolean;
  error: string;
  fetchAllPlaylists: () => Promise<void>;
} {
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [error, setError] = useState('');
  const playlists = useAppSelector((state) => state.playlist.playlist);
  const { authUser, loading, infoProfile } = useFirebaseAuth();
  const dispatch = useAppDispatch();

  const getOldLegacyPlaylists = () => {
    const listPlaylists = (getFromStorage('playlists') || []) as
      | Playlist[]
      | Record<string, Playlist>;
    if (
      typeof listPlaylists === 'object' &&
      !Array.isArray(listPlaylists) &&
      listPlaylists !== null
    ) {
      // In this case it's already a record
      return listPlaylists;
    }
    // In this case it's a list
    return listPlaylists.reduce((a, v) => {
      return { ...a, [v.id]: v };
    }, {});
  };

  async function fetchAllPlaylists(): Promise<void> {
    if (!authUser) {
      return;
    }
    setLoadingPlaylists(true);
    try {
      // TODO: Sooner or later we'll remove caching in localStorage, but for legacy reasons let's keep it like this
      const oldPlaylists = getOldLegacyPlaylists();
      const idSharedPlaylists = infoProfile?.sharedPlaylists ?? [];
      const sharedPlaylists = await getSharedPlaylists(idSharedPlaylists);
      const myPlaylists = await getMyPlaylists(authUser.uid);
      dispatch(
        setAllPlaylists({ ...oldPlaylists, ...sharedPlaylists, ...myPlaylists })
      );
    } catch (e: any) {
      console.error('error', e);
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
