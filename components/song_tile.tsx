import ListItemText from '@mui/material/ListItemText';
import { type Song } from '@/logic/local_logic';
import { NextLinkComposed } from './link_composed';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import {
  handleSongForPlaylist,
  setPlaylist
} from '@/logic/redux/playlist_slice';
import { useAppDispatch } from '@/logic/redux/store';
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';
import Draggable from './react-smooth-dnd/Draggable';
import DragHandleRoundedIcon from '@mui/icons-material/DragHandleRounded';
import Routes from '@/logic/routes';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import ListItemIcon from '@mui/material/ListItemIcon';
import { useTheme, alpha } from '@mui/material';
import React from 'react';
import { setServerPlaylist, type Playlist } from '@/logic/server/database';

/**
 * 
            <ListItemAvatar>
                <Avatar 
                    alt="Copertina" 
                    src={'https://img.youtube.com/vi/'+ props.song.link?.split('/').pop() +'/mqdefault.jpg'} 
                />
            </ListItemAvatar> :
 */

interface PropsSongTile {
  song: Song;
  onSecondaryAction: () => void;
}

export default function SongTile(props: PropsSongTile): JSX.Element {
  return (
    <ListItem
      component={NextLinkComposed}
      to={{ pathname: Routes.Songs + '/' + props.song.id }}
      sx={{ borderRadius: 8, my: 1 }}
      style={{ WebkitTapHighlightColor: 'transparent' }}
      secondaryAction={
        <IconButton
          onClick={(e: any) => {
            e.preventDefault();
            props.onSecondaryAction();
          }}
        >
          <PlaylistAddRoundedIcon />
        </IconButton>
      }
    >
      <ListItemIcon>
        <MusicNoteRoundedIcon />
      </ListItemIcon>
      <ListItemText primary={props.song.name} secondary={props.song.author} />
    </ListItem>
  );
}

interface PropsSelectableSongTile {
  song: Song;
  playlist: Playlist;
}

export function SelectableSongTile(
  props: PropsSelectableSongTile
): JSX.Element {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const selected = props.playlist.songs.includes(props.song.id);

  return (
    <ListItemButton
      sx={{ borderRadius: 8, my: 1 }}
      selected={selected}
      onClick={() => {
        const songs = handleSongForPlaylist(props.playlist, props.song.id);
        dispatch(setPlaylist({ ...props.playlist, songs }));
        void setServerPlaylist(props.playlist);
      }}
      style={{
        backgroundColor: selected
          ? alpha(theme.palette.primary.main, 0.4)
          : theme.palette.divider,
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <ListItemText primary={props.song.name} secondary={props.song.author} />
    </ListItemButton>
  );
}

interface PropsSelectableSongTile {
  song: Song;
  playlist: Playlist;
}

export function PlaylistSongTile(props: PropsSelectableSongTile): JSX.Element {
  // FIXME: Sometimes it throws "TypeError: Illegal invocation"
  return (
    <Draggable key={props.song.id}>
      <ListItem
        sx={{ borderRadius: 8, my: 1 }}
        secondaryAction={
          <IconButton className="column-drag-handle">
            <DragHandleRoundedIcon />
          </IconButton>
        }
      >
        <ListItemButton
          component={NextLinkComposed}
          to={{
            pathname: Routes.Songs + '/' + props.song.id,
            query: { playlistId: props.playlist.id }
          }}
        >
          <ListItemText
            primary={props.song.name}
            secondary={props.song.author}
          />
        </ListItemButton>
      </ListItem>
    </Draggable>
  );
}
