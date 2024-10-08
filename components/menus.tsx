import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { type Playlist, deletePlaylist } from '@/logic/redux/playlist_slice';
import Routes from '@/logic/routes';
import { useAppDispatch, useAppSelector } from '@/logic/redux/store';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ShareIcon from '@mui/icons-material/Share';
import { RWebShare } from 'react-web-share';
import PersSnackbar from './pers_snackbar';
import { ModalEditNamePlaylist } from './modals';
import { saveToStorage } from '@/logic/local_logic';
import PrintIcon from '@mui/icons-material/PrintRounded';
import { useTheme } from '@mui/material';
import { playlistToPdf } from '@/logic/song_to_pdf';
import { type ChordNotations } from '@/logic/redux/settings_slice';

interface PropsMenuPlaylist {
  anchorEl: HTMLElement | null;
  setAnchorEl: (value: HTMLElement | null) => void;
  playlistId: string;
  back_on_delete?: boolean;
}

export const MenuPlaylist = (props: PropsMenuPlaylist): JSX.Element => {
  const playlist: Playlist | undefined = useAppSelector(
    (state) => state.playlist.playlist[props.playlistId]
  );
  const chordNotation: ChordNotations = useAppSelector(
    (state) => state.settings.chordNotation
  );
  const [openEdit, setOpenEdit] = useState(false);
  const [snackbar, openSnackbar] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const closeMenu = (): void => {
    props.setAnchorEl(null);
  };

  const getSongsParameter = (): string => {
    if (playlist?.songs.length === 0) return '';

    return '&songs=' + encodeURIComponent(playlist?.songs.join(','));
  };

  return (
    <Menu
      anchorEl={props.anchorEl}
      open={Boolean(props.anchorEl)}
      onClose={() => {
        openSnackbar(false);
        closeMenu();
      }}
    >
      <RWebShare
        data={{
          text: 'Visualizza la playlist ' + playlist.name + " su 'Praising'!",
          url:
            Routes.Base +
            Routes.SharePlaylist +
            '?name=' +
            encodeURIComponent(playlist?.name) +
            getSongsParameter(),
          title: 'Condividi questa playlist'
        }}
        sites={['facebook', 'whatsapp', 'telegram', 'mail', 'copy']}
        onClick={() => {
          setMessage('Link copiato');
          openSnackbar(true);
        }}
      >
        <MenuItem>
          <ListItemIcon>
            <ShareIcon />
          </ListItemIcon>
          <ListItemText primary="Condividi" />
        </MenuItem>
      </RWebShare>
      <MenuItem
        onClick={() => {
          setOpenEdit(true);
        }}
      >
        <ListItemIcon>
          <EditRoundedIcon />
        </ListItemIcon>
        <ListItemText primary="Modifica il nome" />
      </MenuItem>
      <MenuItem
        onClick={() => {
          void playlistToPdf(playlist.name, {
            backgroundColor: theme.palette.background.default,
            textColor: theme.palette.text.primary,
            chordNotation,
            songs: playlist.songs
          });
        }}
      >
        <ListItemIcon>
          <PrintIcon />
        </ListItemIcon>
        <ListItemText primary="Stampa (beta)" />
      </MenuItem>
      <MenuItem
        onClick={() => {
          saveToStorage('deleting_playlist', playlist.id, 'sessionStorage');
          dispatch(deletePlaylist(playlist.id));
          if (props.back_on_delete ?? false)
            void router.replace(Routes.Playlist);
        }}
      >
        <ListItemIcon>
          <DeleteRoundedIcon />
        </ListItemIcon>
        <ListItemText primary="Elimina" />
      </MenuItem>
      <ModalEditNamePlaylist
        open={openEdit}
        handleClose={() => {
          setOpenEdit(false);
          closeMenu();
        }}
        playlist={playlist}
      />
      <PersSnackbar
        open={snackbar}
        handleClose={() => {
          openSnackbar(false);
        }}
        message={message}
      />
    </Menu>
  );
};
