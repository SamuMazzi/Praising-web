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
import { ConfirmModal, ModalEditNamePlaylist } from './modals';
import { DELETING_PLAYLIST_KEY, saveToStorage } from '@/logic/local_logic';
import { useSchemePalette } from '@/styles/theme';
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
  const [openDelete, setOpenDelete] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const palette = useSchemePalette();
  const { authUser } = useFirebaseAuth();

  const closeMenu = (): void => {
    props.setAnchorEl(null);
  };

  const handleDelete = async (): Promise<void> => {
    if (props.playlist === undefined) return;
    saveToStorage(DELETING_PLAYLIST_KEY, props.playlist.id, 'sessionStorage');
    if (props.playlist.owner === authUser?.uid) {
      await deleteServerPlaylist(props.playlist.id);
    } else {
      await removeSharedPlaylist(authUser!.uid, props.playlist.id);
    }
    dispatch(deletePlaylist(props.playlist.id));
    if (props.back_on_delete ?? false) void router.replace(Routes.Playlist);
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

          /** Import dinamico: la catena del PDF resta fuori dal bundle
           *  iniziale e viene caricata solo quando si stampa davvero */
          const { playlistToPdf } = await import('@/logic/song_to_pdf');
          await playlistToPdf(props.playlist.name, {
            backgroundColor: palette.background.default,
            textColor: palette.text.primary,
            chordNotation,
            songs: props.playlist.songs
          });
        }}
      />
      <MenuItem
        onClick={() => {
          setOpenDelete(true);
        }}
      >
        <ListItemIcon>
          <DeleteRoundedIcon />
        </ListItemIcon>
        <ListItemText primary="Elimina" />
      </MenuItem>
      <ConfirmModal
        open={openDelete}
        handleClose={() => {
          setOpenDelete(false);
          closeMenu();
        }}
        title="Eliminare la playlist?"
        message={
          <>
            {props.playlist?.owner === authUser?.uid
              ? 'La playlist verrà eliminata per tutti quelli con cui l’hai condivisa. '
              : 'La playlist verrà rimossa dal tuo elenco. '}
            Non potrai più recuperarla.
          </>
        }
        confirmLabel="Elimina"
        onConfirm={() => {
          void handleDelete();
        }}
      />
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
