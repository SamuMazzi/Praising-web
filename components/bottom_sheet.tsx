import { Sheet } from 'react-modal-sheet';
import ListSongs from './list_songs';
import { getLocalSongs } from '@/logic/local_logic';
import { useAppSelector } from '@/logic/redux/store';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Box from '@mui/material/Box';
import ListPlaylist from './list_playlist';
import Button from '@mui/material/Button';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useTheme } from '@mui/material';
import TextField from '@mui/material/TextField';
import React, { useState, ChangeEvent } from 'react';
import useFirebaseAuth from '@/logic/hooks/use_auth';
import { addPartSongToDatabase } from '@/logic/server/database';
import { EmailPayloadPartSong } from '@/logic/server/emails';
import { addPartSongToServerStorage } from '@/logic/server/storage';
import song from '@/pages/api/song';

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
export function ModalBottomSheetPlaylist(
  props: PropsModalBottomSheetPlaylist
): JSX.Element {
  const songs = getLocalSongs();
  const playlist = useAppSelector(
    (state) => state.playlist.playlist[props.playlistId]
  );
  const theme = useTheme();

  return (
    <Sheet isOpen={props.open} onClose={props.onClose}>
      <Sheet.Container>
        <Sheet.Header>
          <TitleModal
            onClose={props.onClose}
            title={'Canzoni per ' + playlist?.name}
          />
        </Sheet.Header>
        <Sheet.Content className={theme.palette.mode}>
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

export function ModalBottomSheetAddPart(
  props: PropsModalBottomSheetAddPart
): JSX.Element {
  const theme = useTheme();
  const { authUser, loading } = useFirebaseAuth();
  const fileInput = React.useRef<any>();
  const [namePart, setNamePart] = useState('');
  const [file, setFile] = useState<any>(null);

  return (
    <Sheet isOpen={props.open} onClose={props.onClose}>
      <Sheet.Container>
        <Sheet.Header>
          <TitleModal onClose={props.onClose} title={'Carica un audio'} />
        </Sheet.Header>
        <Sheet.Content className={theme.palette.mode}>
          <Sheet.Scroller style={{ marginLeft: 15, marginRight: 15 }}>
            <TextField
              sx={{ mt: 2 }}
              placeholder="Nome della parte"
              value={namePart}
              onChange={(e) => setNamePart(e.target.value)}
            />
            <Button
              sx={{ my: 3 }}
              style={{ textAlign: 'center' }}
              variant="contained"
              component="label"
              color="primary"
            >
              Carica audio
              <input
                hidden
                ref={fileInput}
                multiple={false}
                type="file"
                accept="audio/*"
                onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                  if (!authUser || !e.target.files) return;

                  setFile(e.target.files[0]);
                  return;
                }}
              />
            </Button>

            <Typography>{'Caricato: ' + file?.name}</Typography>
            <Button
              sx={{ mt: 2 }}
              variant="outlined"
              disabled={!namePart || !file}
              onClick={async () => {
                const idPart = await addPartSongToDatabase(
                  authUser?.uid ?? '',
                  props.idSong
                );
                await addPartSongToServerStorage(
                  idPart,
                  file,
                  file.type,
                  props.idSong
                );

                // Email notification
                const emailData: EmailPayloadPartSong = {
                  userId: authUser?.uid ?? '',
                  songId: props.idSong,
                  partId: idPart,
                  nameSong: song?.name ?? '',
                  email: authUser?.email ?? '',
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
                }
                props.afterUpload();
                props.onClose();
              }}
            >
              Invia
            </Button>
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

export function ModalBottomSheetSong(
  props: PropsModalBottomSheetSong
): JSX.Element {
  const theme = useTheme();

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
          <Sheet.Content className={theme.palette.mode}>
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

function TitleModal(props: PropsTitleModal): JSX.Element {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        pt: 1,
        backgroundColor: theme.palette.background.default,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8
      }}
    >
      <IconButton edge="start" onClick={props.onClose} sx={{ ml: 1 }}>
        <CloseRoundedIcon />
      </IconButton>
      <Typography textAlign="center">{props.title}</Typography>
      {props.openModal !== undefined ? (
        <Button
          startIcon={<AddRoundedIcon />}
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
