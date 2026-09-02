'use client';

import Container from '@mui/material/Container';
import { PlaylistAppBar } from '@/components/appbar';
import {
  DELETING_PLAYLIST_KEY,
  getFromStorage,
  saveToStorage
} from '@/logic/local_logic';
import { ListSongsPlaylist } from '@/components/list_songs';
import React, { useEffect, useState } from 'react';
import { ModalBottomSheetPlaylist } from '@/components/bottom_sheet';
import Fab from '@mui/material/Fab';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import useSinglePlaylist from '@/logic/hooks/use_single_playlist';
import CircularProgress from '@mui/material/CircularProgress';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Link from 'next/link';
import Routes from '@/logic/routes';
import { useRouter } from 'next/router';

export default function PlaylistPage() {
  const router = useRouter();
  const { id } = router.query;
  const id_playlist = id as string;
  const { playlist, loadingPlaylist, error, canEdit } =
    useSinglePlaylist(id_playlist);
  const [openModal, setOpenModal] = useState(false);
  /** `undefined` = non abbiamo ancora potuto leggere sessionStorage (server o
   *  primo render): finche' non lo sappiamo non mostriamo l'errore. */
  const [isDeleting, setIsDeleting] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (id_playlist === undefined) return;
    /** Il flag lo scrive menus.tsx in sessionStorage prima di cancellare */
    const deleting =
      getFromStorage(DELETING_PLAYLIST_KEY, 'sessionStorage') === id_playlist;
    if (deleting) saveToStorage(DELETING_PLAYLIST_KEY, '', 'sessionStorage');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDeleting(deleting);
  }, [id_playlist]);

  if (!playlist || loadingPlaylist || error) {
    if (loadingPlaylist) {
      return (
        <Container
          sx={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <CircularProgress aria-label="Caricamento della playlist…" />
        </Container>
      );
    }
    if (isDeleting !== false) {
      /** Stiamo cancellando (o non lo sappiamo ancora): niente errore */
      return <Container sx={{ minHeight: '100vh' }}></Container>;
    }
    return (
      <Container sx={{ minHeight: '100vh' }}>
        <Typography variant="h4" role="alert" sx={{ pt: 15 }}>
          {error ?? 'Non siamo riusciti ad aprire la playlist.'}
        </Typography>
        <Typography sx={{ pt: 1 }}>
          Controlla la connessione e ricarica la pagina, oppure torna all’elenco
          delle playlist.
        </Typography>
        <Button
          variant="contained"
          LinkComponent={Link}
          href={Routes.Playlist}
          sx={{ mt: 3 }}
        >
          Vai alle playlist
        </Button>
      </Container>
    );
  }

  return (
    <main>
      <Container sx={{ minHeight: '100vh' }}>
        <PlaylistAppBar playlist={playlist} />
        <Container sx={{ py: 5 }} />
        <ListSongsPlaylist playlist={playlist} />
        <Container sx={{ py: 2 }} /> {/* Padding necessario per il Fab */}
        {canEdit && (
          <Fab
            variant="extended"
            onClick={() => {
              setOpenModal(true);
            }}
            color="primary"
            sx={{
              position: 'fixed',
              // Sui telefoni senza tasto home il bordo basso e' occupato dalla
              // barra di sistema: il pulsante ci finiva sotto.
              bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))'
            }}
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
    </main>
  );
}
