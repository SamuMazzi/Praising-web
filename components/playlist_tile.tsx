'use client';

import ListItemText from '@mui/material/ListItemText';
import { NextLinkComposed } from './link_composed';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import {
  handleSongForPlaylist,
  setPlaylist
} from '@/logic/redux/playlist_slice';
import ListItemButton from '@mui/material/ListItemButton';
import { useAppDispatch } from '@/logic/redux/store';
import Routes from '@/logic/routes';
import { MenuPlaylist } from './menus';
import React from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import { type Playlist } from '@/logic/server/database';
/** Firestore (~250 kB) non serve per disegnare la pagina: lo carichiamo solo
 *  quando l'utente fa davvero un'azione che tocca il server. */
const database = async () => await import('@/logic/server/database');

interface PropsPlaylistTile {
  playlist: Playlist;
}

export default function PlaylistTile(props: PropsPlaylistTile) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <ListItem
        component={NextLinkComposed}
        to={{ pathname: Routes.Playlist + '/' + props.playlist.id }}
        sx={{ borderRadius: 8, my: 1 }}
        secondaryAction={
          <IconButton
            aria-label={'Opzioni della playlist ' + props.playlist.name}
            onClick={openMenu}
          >
            <MoreVertRoundedIcon />
          </IconButton>
        }
      >
        <ListItemText primary={props.playlist.name} />
      </ListItem>
      <MenuPlaylist
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        playlist={props.playlist}
      />
    </>
  );
}

interface PropsSelectablePlaylistTile {
  playlist: Playlist;
  songId: string;
}

export function SelectablePlaylistTile(props: PropsSelectablePlaylistTile) {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const selected = props.playlist.songs.includes(props.songId);

  return (
    <>
      <ListItemButton
        sx={{
          borderRadius: 8,
          my: 1,
          backgroundColor: selected
            ? alpha(theme.palette.primary.main, 0.4)
            : 'divider'
        }}
        selected={selected}
        onClick={() => {
          const songs = handleSongForPlaylist(props.playlist, props.songId);
          const newPlaylist = { ...props.playlist, songs };
          dispatch(setPlaylist(newPlaylist));
          void database().then(
            async (db) => await db.setServerPlaylist(newPlaylist)
          );
        }}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <ListItemText primary={props.playlist.name} />
      </ListItemButton>
    </>
  );
}
