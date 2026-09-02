'use client';

import { Sheet } from 'react-modal-sheet';
import ListSongs from './list_songs';
import { getLocalSongs, getSingleSong } from '@/logic/local_logic';
import { useAppSelector } from '@/logic/redux/store';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Box from '@mui/material/Box';
import ListPlaylist from './list_playlist';
import Button from '@mui/material/Button';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import React, { useState, ChangeEvent } from 'react';
import useFirebaseAuth from '@/logic/hooks/use_auth';
import {
  addPartSongToDatabase,
  checkNamePartSongToDatabase
} from '@/logic/server/database';
import { EmailPayloadPartSong } from '@/logic/server/emails';
import { addPartSongToServerStorage } from '@/logic/server/storage';
import * as Sentry from '@sentry/nextjs';
import { styled } from '@mui/material/styles';

/** Pattern MUI: l'input resta nel flusso (quindi focusabile e attivabile con
 *  Invio) ma invisibile, al posto di `hidden` che lo toglie dal tab order. */
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
});

interface PropsModalBottomSheet {
  open: boolean;
  onClose: () => void;
}

interface PropsModalBottomSheetPlaylist extends PropsModalBottomSheet {
  playlistId: string;
}

/**
 * This is used to show all the songs that can be added to a playlist, from the same playlist page
 */
export function ModalBottomSheetPlaylist(props: PropsModalBottomSheetPlaylist) {
  const songs = getLocalSongs();
  const playlist = useAppSelector(
    (state) => state.playlist.playlist[props.playlistId]
  );

  return (
    <Sheet isOpen={props.open} onClose={props.onClose}>
      <Sheet.Container>
        <Sheet.Header>
          <TitleModal
            onClose={props.onClose}
            title={'Canzoni per ' + playlist?.name}
          />
        </Sheet.Header>
        <Sheet.Content>
          <Sheet.Scroller>
            <ListSongs
              songs={songs}
              playlist={playlist}
              mode="selection_playlist"
              withSearch
            />
          </Sheet.Scroller>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  );
}

interface PropsModalBottomSheetAddPart extends PropsModalBottomSheet {
  idSong: string;
  afterUpload: () => void;
}

export function ModalBottomSheetAddPart(props: PropsModalBottomSheetAddPart) {
  const { authUser } = useFirebaseAuth();
  const fileInput = React.useRef<HTMLInputElement>(null);
  const [namePart, setNamePart] = useState('');
  const [nameAuthor, setNameAuthor] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const song = getSingleSong(props.idSong);

  const toBase64 = (file: File) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const onSubmit = async () => {
    if (!authUser || !file || !nameAuthor) return;

    const sameNameAlreadyExists = await checkNamePartSongToDatabase(
      namePart,
      props.idSong
    );
    if (sameNameAlreadyExists) {
      // TODO: Change this alert with a snackbar
      alert('Esiste già una parte con lo stesso nome.');
      return;
    }
    const base64File = ((await toBase64(file)) as string).split(',')[1];

    const idPart = await addPartSongToDatabase(
      authUser.uid,
      nameAuthor,
      props.idSong,
      namePart
    );
    await addPartSongToServerStorage(
      idPart,
      base64File,
      file.type,
      props.idSong
    );

    // Email notification
    const emailData: EmailPayloadPartSong = {
      userName: nameAuthor,
      songId: props.idSong,
      partId: idPart,
      nameSong: song?.name ?? '',
      email: authUser.email ?? '',
      namePart
    };
    const response = await fetch('/api/notification-song-part', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });
    if (response.status !== 200) {
      const text = await response.text();
      console.error('Error sending email.', text);
      Sentry.captureMessage(
        'Error sending part song email notification: ' + text
      );
    }
    props.afterUpload();
    props.onClose();
  };

  return (
    <Sheet isOpen={props.open} onClose={props.onClose}>
      <Sheet.Container>
        <Sheet.Header>
          <TitleModal onClose={props.onClose} title={'Carica una parte'} />
        </Sheet.Header>
        <Sheet.Content>
          <Sheet.Scroller style={{ marginLeft: 15, marginRight: 15 }}>
            <Grid
              container
              spacing={0}
              direction="column"
              alignItems="center"
              sx={{ mt: 4 }}
            >
              <Grid>
                <Typography variant="body2" component="p">
                  {
                    "Carica una parte della canzone per poterla condividere con gli altri membri della comunità. Dovrà prima essere approvata dall'amministratore, poi sarà visibile a tutti"
                  }
                </Typography>
                <Typography variant="h2" component="h2" sx={{ mt: 4 }}>
                  Nome della parte
                </Typography>
                <Typography variant="body2" component="p">
                  {
                    'Inserisci il nome della parte che stai per caricare. (Per esempio: "Contralti", "Tenori", ecc.)'
                  }
                </Typography>
              </Grid>
              <Grid sx={{ mb: 2 }}>
                <TextField
                  sx={{ mt: 2 }}
                  label="Nome della parte"
                  name="nome-parte"
                  placeholder="Per esempio: Contralti"
                  value={namePart}
                  onChange={(e) => setNamePart(e.target.value)}
                />
              </Grid>
              <Grid>
                <Typography variant="h2" component="h2" sx={{ mt: 4 }}>
                  Autore
                </Typography>
                <Typography variant="body2" component="p">
                  {
                    "Inserisci il nome dell'autore della parte che stai per caricare."
                  }
                </Typography>
              </Grid>
              <Grid sx={{ mb: 2 }}>
                <TextField
                  sx={{ mt: 2 }}
                  label="Autore"
                  name="autore"
                  autoComplete="name"
                  value={nameAuthor}
                  onChange={(e) => setNameAuthor(e.target.value)}
                />
              </Grid>
              <Grid>
                <Button
                  sx={{ my: 3 }}
                  style={{ textAlign: 'center' }}
                  variant="contained"
                  component="label"
                  color="primary"
                >
                  Carica audio
                  {/* `hidden` toglie l'input dall'ordine di tabulazione e la
                      <label> non e' focusabile: da tastiera il caricamento
                      diventava irraggiungibile. Lo nascondiamo alla vista
                      lasciandolo focusabile. */}
                  <VisuallyHiddenInput
                    ref={fileInput}
                    multiple={false}
                    type="file"
                    accept="audio/*"
                    onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                      if (!authUser || !e.target.files) return;
                      setFile(e.target.files[0]);
                    }}
                  />
                </Button>
              </Grid>
              <Grid>
                <Typography>
                  {file ? 'Caricato: ' + file?.name : 'Nessun file caricato'}
                </Typography>
              </Grid>
              <Grid sx={{ mt: 2 }}>
                {loadingUpload ? (
                  <CircularProgress />
                ) : (
                  <Button
                    variant="outlined"
                    disabled={!namePart || !file || !nameAuthor}
                    onClick={async () => {
                      setLoadingUpload(true);
                      try {
                        await onSubmit();
                      } finally {
                        setLoadingUpload(false);
                      }
                    }}
                  >
                    Invia
                  </Button>
                )}
              </Grid>
            </Grid>
          </Sheet.Scroller>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  );
}

interface PropsModalBottomSheetSong extends PropsModalBottomSheet {
  songId: string;
  openModalCreate?: () => void;
}

export function ModalBottomSheetSong(props: PropsModalBottomSheetSong) {
  return (
    <>
      <Sheet isOpen={props.open} onClose={props.onClose}>
        <Sheet.Container>
          <Sheet.Header>
            <TitleModal
              onClose={props.onClose}
              title="Playlist"
              openModal={props.openModalCreate}
            />
          </Sheet.Header>
          <Sheet.Content>
            <Sheet.Scroller>
              <ListPlaylist fromSongId={props.songId} />
            </Sheet.Scroller>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop />
      </Sheet>
    </>
  );
}

interface PropsTitleModal {
  onClose: () => void;
  title: string;
  openModal?: () => void;
}

function TitleModal(props: PropsTitleModal) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        pt: 1,
        backgroundColor: 'background.default',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8
      }}
    >
      <IconButton
        edge="start"
        aria-label="Chiudi"
        onClick={props.onClose}
        sx={{ ml: 1 }}
      >
        <CloseRoundedIcon />
      </IconButton>
      <Typography textAlign="center" noWrap sx={{ minWidth: 0, px: 1 }}>
        {props.title}
      </Typography>
      {props.openModal !== undefined ? (
        // Il testo e' nascosto a tutte le larghezze: senza `aria-label` il
        // pulsante resterebbe senza nome accessibile.
        <Button
          startIcon={<AddRoundedIcon />}
          aria-label="Nuova playlist"
          sx={{ mr: 2 }}
          onClick={props.openModal}
        >
          <Typography display={{ xs: 'none', md: 'none' }}>
            Nuova playlist
          </Typography>
        </Button>
      ) : (
        <Box />
      )}
    </Box>
  );
}
