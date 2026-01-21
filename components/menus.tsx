'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { deletePlaylist } from '@/logic/redux/playlist_slice';
import Routes from '@/logic/routes';
import { useAppDispatch, useAppSelector } from '@/logic/redux/store';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { ModalEditNamePlaylist } from './modals';
import { saveToStorage } from '@/logic/local_logic';
import { useTheme } from '@mui/material/styles';
import { playlistToPdf } from '@/logic/song_to_pdf';
import { type ChordNotations } from '@/logic/redux/settings_slice';
import { PrintButton } from './print_button';
import {
  deleteServerPlaylist,
  removeSharedPlaylist,
  type Playlist
} from '@/logic/server/database';
import { SharePlaylist } from './shares';
import useFirebaseAuth from '@/logic/hooks/use_auth';

interface PropsMenuPlaylist {
  anchorEl: HTMLElement | null;
  setAnchorEl: (value: HTMLElement | null) => void;
  playlist: Playlist | undefined;
  back_on_delete?: boolean;
}

export const MenuPlaylist = (props: PropsMenuPlaylist) => {
  const chordNotation: ChordNotations = useAppSelector(
    (state) => state.settings.chordNotation
  );
  const [openEdit, setOpenEdit] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { authUser } = useFirebaseAuth();

  const closeMenu = (): void => {
    props.setAnchorEl(null);
  };

  return (
    <Menu
      anchorEl={props.anchorEl}
      open={Boolean(props.anchorEl)}
      onClose={() => {
        closeMenu();
      }}
    >
      <SharePlaylist playlist={props.playlist!} />
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
        onClick={async () => {
          if (props.playlist === undefined) return;
          saveToStorage(
            'deleting_playlist',
            props.playlist.id,
            'sessionStorage'
          );
          if (props.playlist.owner === authUser?.uid) {
            await deleteServerPlaylist(props.playlist.id);
          } else {
            await removeSharedPlaylist(authUser!.uid, props.playlist.id);
          }
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
    </Menu>
  );
};
