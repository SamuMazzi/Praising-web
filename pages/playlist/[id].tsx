import Container from '@mui/material/Container';
import { PlaylistAppBar } from '@/components/appbar';
import {
  getFromStorage,
  getSingleSong,
  saveToStorage
} from '@/logic/local_logic';
import { ListSongsPlaylist } from '@/components/list_songs';
import React, { useState } from 'react';
import { ModalBottomSheetPlaylist } from '@/components/bottom_sheet';
import Fab from '@mui/material/Fab';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import useSinglePlaylist from '@/logic/hooks/use_single_playlist';
import CircularProgress from '@mui/material/CircularProgress';
import { Typography } from '@mui/material';

PlaylistPage.getInitialProps = async (props: any) => {
  const { id } = props.query;

  return { id };
};

interface PropsSongPage {
  id: string;
}

export default function PlaylistPage(props: PropsSongPage) {
  const { playlist, loadingPlaylist, error, canEdit } = useSinglePlaylist(
    props.id
  );
  const songs = playlist?.songs
    .map((idSong) => getSingleSong(idSong))
    .filter((x) => x !== undefined);
  const [openModal, setOpenModal] = useState(false);

  if (!playlist || songs === undefined || loadingPlaylist || error) {
    if (getFromStorage('deleting_playlist') === props.id) {
      /** It means that it's deleting and you shouldn't display an error */
      saveToStorage('deleting_playlist', '');
      return <Container sx={{ minHeight: '100vh' }}></Container>;
    }
    if (loadingPlaylist) {
      return (
        <Container sx={{ minHeight: '100vh' }}>
          <CircularProgress />
        </Container>
      );
    }
    return (
      <Container sx={{ minHeight: '100vh' }}>
        <Typography variant="h4">
          {error ?? "C'è stato un errore, riprovare"}
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ minHeight: '100vh' }}>
      <PlaylistAppBar playlist={playlist} />
      <Container sx={{ py: 5 }} />
      <ListSongsPlaylist songs={songs} playlist={playlist} />
      <Container sx={{ py: 2 }} /> {/* Padding necessario per il Fab */}
      {canEdit && (
        <Fab
          variant="extended"
          onClick={() => {
            setOpenModal(true);
          }}
          color="primary"
          style={{ position: 'fixed', bottom: 20 }}
        >
          <AddRoundedIcon sx={{ mr: 1 }} />
          Aggiungi dei canti
        </Fab>
      )}
      <ModalBottomSheetPlaylist
        open={openModal}
        onClose={() => {
          setOpenModal(false);
        }}
        playlistId={playlist.id}
      />
    </Container>
  );
}
