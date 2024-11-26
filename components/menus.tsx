import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { deletePlaylist, setPlaylist } from '@/logic/redux/playlist_slice';
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
import { useTheme } from '@mui/material';
import { playlistToPdf } from '@/logic/song_to_pdf';
import { type ChordNotations } from '@/logic/redux/settings_slice';
import { PrintButton } from './print_button';
import { setServerPlaylist, type Playlist } from '@/logic/server/database';

interface PropsMenuPlaylist {
  anchorEl: HTMLElement | null;
  setAnchorEl: (value: HTMLElement | null) => void;
  playlist: Playlist | undefined;
  back_on_delete?: boolean;
}

export const MenuPlaylist = (props: PropsMenuPlaylist): JSX.Element => {
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
          text:
            'Visualizza la playlist ' +
            props.playlist!.name +
            " su 'Praising'!\n",
          url:
            Routes.Base +
            Routes.Playlist +
            '/' +
            encodeURIComponent(props.playlist!.id),
          title: 'Condividi questa playlist'
        }}
        sites={['facebook', 'whatsapp', 'telegram', 'mail', 'copy']}
        onClick={() => {
          if (props.playlist === undefined) return;
          if (!props.playlist.shared) {
            const newPlaylist = { ...props.playlist, shared: true };
            dispatch(setPlaylist(newPlaylist));
            void setServerPlaylist(props.playlist);
          }
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
      <PrintButton
        onClick={async () => {
          if (props.playlist === undefined) return;

          await playlistToPdf(props.playlist.name, {
            backgroundColor: theme.palette.background.default,
            textColor: theme.palette.text.primary,
            chordNotation,
            songs: props.playlist.songs
          });
        }}
      />
      <MenuItem
        onClick={() => {
          if (props.playlist === undefined) return;
          saveToStorage(
            'deleting_playlist',
            props.playlist.id,
            'sessionStorage'
          );
          dispatch(deletePlaylist(props.playlist.id));
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
        playlist={props.playlist}
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
