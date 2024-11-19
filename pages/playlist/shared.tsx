import Routes from '@/logic/routes';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import PlaylistPage from './index';
import { addSharedPlaylist } from '@/logic/server/database';
import useFirebaseAuth from '@/logic/hooks/use_auth';
import CircularProgress from '@mui/material/CircularProgress';

PlaylisSharedPage.getInitialProps = async (context: any) => {
  const { p } = context.query;

  return { p };
};

interface PropsPlaylistSharedPage {
  p: string;
}

export default function PlaylisSharedPage(
  props: PropsPlaylistSharedPage
): JSX.Element {
  const router = useRouter();
  const { authUser, loading } = useFirebaseAuth();

  // TODO: Handle better
  useEffect(() => {
    if (loading || !authUser) {
      return;
    }
    if (props.p.length > 0) {
      addSharedPlaylist(authUser.uid, props.p).then(() => {
        router.replace(Routes.Playlist);
      });
    } else {
      router.replace(Routes.Playlist);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return <CircularProgress />;
  }

  return <PlaylistPage />;
}
