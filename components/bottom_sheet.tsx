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
import React from 'react';

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
