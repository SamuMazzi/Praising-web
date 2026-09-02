'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/logic/redux/store';
import { hydrateSettings } from '@/logic/redux/settings_slice';
import { hydrateUserInfo } from '@/logic/redux/user_info_slice';
import { hydratePlaylists } from '@/logic/redux/playlist_slice';
import { hydrateInfoSongs } from '@/logic/redux/info_song_slice';

/**
 * Gli slice partono da valori di default deterministici, cosi' il markup del
 * server e quello del primo render del client coincidono. Subito dopo il mount
 * carichiamo qui i valori salvati in localStorage.
 */
export default function StoreHydration(): null {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrateSettings());
    dispatch(hydrateUserInfo());
    dispatch(hydratePlaylists());
    dispatch(hydrateInfoSongs());
  }, [dispatch]);

  return null;
}
