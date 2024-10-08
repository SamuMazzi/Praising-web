import ListItemText from '@mui/material/ListItemText';
import { NextLinkComposed } from './link_composed';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import {
  handleSongForPlaylist,
  type Playlist
} from '@/logic/redux/playlist_slice';
import ListItemButton from '@mui/material/ListItemButton';
import { useAppDispatch } from '@/logic/redux/store';
import Routes from '@/logic/routes';
import { MenuPlaylist } from './menus';
import React from 'react';
import { useTheme, alpha } from '@mui/material';

interface PropsPlaylistTile {
  playlist: Playlist;
}

export default function PlaylistTile(props: PropsPlaylistTile): JSX.Element {
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
          <IconButton onClick={openMenu}>
            <MoreVertRoundedIcon />
          </IconButton>
        }
      >
        <ListItemText primary={props.playlist.name} />
      </ListItem>
      <MenuPlaylist
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        playlistId={props.playlist.id}
      />
    </>
  );
}

interface PropsSelectablePlaylistTile {
  playlist: Playlist;
  songId: string;
}

export function SelectablePlaylistTile(
  props: PropsSelectablePlaylistTile
): JSX.Element {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const selected = props.playlist.songs.includes(props.songId);

  return (
    <>
      <ListItemButton
        sx={{ borderRadius: 8, my: 1 }}
        selected={selected}
        onClick={() =>
          dispatch(
            handleSongForPlaylist({
              id: props.playlist.id,
              idSong: props.songId
            })
          )
        }
        style={{
          backgroundColor: selected
            ? alpha(theme.palette.primary.main, 0.4)
            : theme.palette.divider,
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <ListItemText primary={props.playlist.name} />
      </ListItemButton>
    </>
  );
}
