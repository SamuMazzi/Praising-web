'use client';

import List from '@mui/material/List';
import PlaylistTile, {
  SelectablePlaylistTile
} from '@/components/playlist_tile';
import Image from 'next/image';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import React from 'react';
import useFirebaseAuth from '@/logic/hooks/use_auth';
import usePlaylists from '@/logic/hooks/use_playlists';
import CircularProgress from '@mui/material/CircularProgress';

interface PropsListPlaylist {
  fromSongId?: string;
}

/**
 * List of songs displayed in the playlist page.
 * If there are no playlists, a message with an image is displayed.
 */
export default function ListPlaylist(props: PropsListPlaylist) {
  const { authUser } = useFirebaseAuth();
  const { playlists, loadingPlaylists } = usePlaylists();
  const listPlaylists = Object.values(playlists).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  /*    (typeof b.creationTime === 'number'
        ? b.creationTime
        : b.creationTime.toMillis()) -
      (typeof a.creationTime === 'number'
        ? a.creationTime
        : a.creationTime.toMillis())
  */

  if (loadingPlaylists) {
    return (
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        sx={{ mt: 4 }}
      >
        <Grid>
          <CircularProgress />
        </Grid>
      </Grid>
    );
  }

  return (
    <List sx={{ px: 2 }}>
      {listPlaylists.length === 0 && (
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <Grid sx={{ pb: 3, pt: 20 }}>
            <Image
              src="/assets/undraw_illustrations/undraw_compose_music.svg"
              alt="Compose music"
              width="230"
              height="230"
            />
          </Grid>
          <Grid>
            <Typography
              variant="h3"
              component="h3"
              sx={{ textAlign: 'center' }}
            >
              Inizia a creare delle playlist!
            </Typography>
          </Grid>
        </Grid>
      )}
      {listPlaylists.map((playlist) => {
        return props.fromSongId === undefined ||
          props.fromSongId.length === 0 ? (
          <PlaylistTile key={playlist.id} playlist={playlist} />
        ) : playlist.owner == authUser?.uid ? ( // You need to be the owner to add a song
          <SelectablePlaylistTile
            key={playlist.id}
            playlist={playlist}
            songId={props.fromSongId}
          />
        ) : null;
      })}
    </List>
  );
}
