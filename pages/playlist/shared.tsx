import { copyPlaylist } from '@/logic/redux/playlist_slice';
import { useAppDispatch, useAppSelector } from '@/logic/redux/store';
import Routes from '@/logic/routes';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import PlaylistPage from './index';

PlaylisSharedPage.getInitialProps = async (context: any) => {
  const { name, songs } = context.query;

  return { name, songs };
};

interface PropsPlaylistSharedPage {
  name: string;
  songs: string[] | string;
}

export default function PlaylisSharedPage(
  props: PropsPlaylistSharedPage
): JSX.Element {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const allPlaylists = useAppSelector((state) => state.playlist.playlist);

  useEffect(() => {
    if (props.name.length > 0 && props.songs.length > 0) {
      const songs =
        typeof props.songs === 'string' ? props.songs.split(',') : props.songs;
      for (const playlist of Object.values(allPlaylists)) {
        if (
          playlist.name === props.name &&
          [...playlist.songs].sort().join(',') === songs.sort().join(',')
        ) {
          // If the playlist is already present, we don't copy it
          void router.replace(Routes.Playlist);
          return;
        }
      }
      dispatch(copyPlaylist({ name: props.name, songs }));
    }
    void router.replace(Routes.Playlist);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <PlaylistPage />;
}
