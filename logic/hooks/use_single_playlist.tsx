import { useEffect, useState } from 'react';
import { type Playlist, listenOnSinglePlaylist } from '../server/database';
import { useAppSelector } from '../redux/store';

export default function usePlaylist(
  idPlaylist: string,
  shared: boolean
): {
  playlist: Playlist | null;
  loadingPlaylist: boolean;
  error: string;
} {
  const [loadingPlaylist, setLoadingPlaylist] = useState(true);
  const local_playlist_state = useAppSelector((state) => state.playlist);
  const [error, setError] = useState('');
  const [playlist, setPlaylist] = useState<Playlist | null>(null);

  function fetchPlaylist() {
    setLoadingPlaylist(true);
    try {
      if (!shared) {
        const p = local_playlist_state.playlist[idPlaylist];
        setPlaylist(p);
        setLoadingPlaylist(false);
        return null;
      }
      const unsubscribe = listenOnSinglePlaylist(idPlaylist, (playlist) => {
        setPlaylist(playlist);
        if (loadingPlaylist) {
          setLoadingPlaylist(false);
        }
      });
      setLoadingPlaylist(false);
      return unsubscribe;
    } catch (e: any) {
      setError(e as string);
    } finally {
      setLoadingPlaylist(false);
    }
  }

  useEffect(() => {
    const unsubscribe = fetchPlaylist();
    return () => {
      if (unsubscribe) unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    loadingPlaylist,
    playlist,
    error
  };
}
