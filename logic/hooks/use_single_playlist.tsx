'use client';

import { useEffect, useState } from 'react';
import {
  type Playlist,
  addServerPlaylist,
  addSharedPlaylist,
  getServerSinglePlaylist
} from '../server/database';
import { useAppDispatch, useAppSelector } from '../redux/store';
import useFirebaseAuth from './use_auth';
import { setPlaylist, upgradePlaylist } from '@/logic/redux/playlist_slice';
import { useRouter } from 'next/router';
import Routes from '../routes';

// TODO: If accessing to a playlist that has been deleted or anyway it doesn't exist, we should delete it from array of shared playlists

export default function useSinglePlaylist(idPlaylist: string): {
  playlist: Playlist | null;
  loadingPlaylist: boolean;
  canEdit: boolean;
  error: string;
} {
  const { authUser, loading } = useFirebaseAuth();
  const [loadingPlaylist, setLoadingPlaylist] = useState(true);
  const all_playlists = useAppSelector((state) => state.playlist.playlist);
  const playlist: Playlist | undefined = all_playlists[idPlaylist];
  const [error, setError] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const onLegacyPlaylist = async () => {
    try {
      const newPlaylist = await addServerPlaylist(
        authUser!.uid,
        playlist.name,
        playlist.songs,
        { convertLocal: true }
      );
      dispatch(
        upgradePlaylist({
          p: { ...newPlaylist },
          old_id: playlist.id,
          userId: authUser!.uid
        })
      );
      await router.replace(Routes.Playlist + '/' + newPlaylist.id);
      // This reload seems to be needed
      window.location.reload();
    } catch (e) {
      console.log('error', e);
    }
  };

  const handleNewPlaylist = (p: Playlist | null) => {
    setLoadingPlaylist(false);
    if (p === null) {
      setError('Playlist non trovata');
      return;
    }
    setCanEdit(p.owner === authUser?.uid);
    dispatch(setPlaylist({ ...p }));
  };

  const fetchPlaylist = async () => {
    setLoadingPlaylist(true);
    try {
      if (
        playlist &&
        ((!Number.isNaN(parseInt(playlist.id)) &&
          parseInt(playlist.id) < 2000) ||
          playlist.shared === undefined)
      ) {
        // If this is true it means this is legacy playlist
        onLegacyPlaylist();
      } else if (playlist && !playlist.shared) {
        handleNewPlaylist(playlist);
      } else if (!playlist && authUser) {
        await addSharedPlaylist(authUser.uid, idPlaylist);
        const newP = await getServerSinglePlaylist(idPlaylist);
        handleNewPlaylist(newP);
      }
    } catch (e) {
      setError(e as string);
      setLoadingPlaylist(false);
    }
  };

  useEffect(() => {
    if (loading) {
      return;
    }
    void fetchPlaylist();
    // FIXME: This doesn't work
    /* return () => {
      if (loadingPlaylist) {
        console.log('unsubscribing');
        listenOnSinglePlaylist(idPlaylist, (playlist) => {
          console.log('playlist found', playlist);
          handleNewPlaylist(playlist);
        });
      }
    }; */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return {
    loadingPlaylist,
    playlist,
    canEdit,
    error
  };
}
