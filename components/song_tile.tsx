'use client';

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
import Routes from '@/logic/routes';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import ListItemIcon from '@mui/material/ListItemIcon';
import { useTheme, alpha } from '@mui/material/styles';
import React from 'react';
import { type Playlist } from '@/logic/server/database';
/** Firestore (~250 kB) non serve per disegnare la pagina: lo carichiamo solo
 *  quando l'utente fa davvero un'azione che tocca il server. */
const database = async () => await import('@/logic/server/database');

import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { GenericModal } from './modals';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

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

export default function SongTile(props: PropsSongTile) {
  return (
    <ListItem
      component={NextLinkComposed}
      to={{ pathname: Routes.Songs + '/' + props.song.id }}
      sx={{ borderRadius: 8, my: 1 }}
      style={{ WebkitTapHighlightColor: 'transparent' }}
      secondaryAction={
        <IconButton
          aria-label={'Aggiungi ' + props.song.name + ' a una playlist'}
          onClick={(e) => {
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

export function SelectableSongTile(props: PropsSelectableSongTile) {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const selected = props.playlist.songs.includes(props.song.id);

  return (
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
        const songs = handleSongForPlaylist(props.playlist, props.song.id);
        const newPlaylist = { ...props.playlist, songs };
        dispatch(setPlaylist(newPlaylist));
        void database().then(
          async (db) => await db.setServerPlaylist(newPlaylist)
        );
      }}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <ListItemText primary={props.song.name} secondary={props.song.author} />
    </ListItemButton>
  );
}

interface PropsSelectableSongTile {
  song: Song;
  playlist: Playlist;
}

export function PlaylistSongTile(props: PropsSelectableSongTile) {
  const dispatch = useAppDispatch();
  const [openConfirm, setOpenConfirm] = React.useState(false);

  const handleDelete = () => {
    const songs = handleSongForPlaylist(props.playlist, props.song.id);
    const newPlaylist = { ...props.playlist, songs };
    dispatch(setPlaylist(newPlaylist));
    void database().then(async (db) => await db.setServerPlaylist(newPlaylist));
  };

  // FIXME: Sometimes it throws "TypeError: Illegal invocation"
  return (
    <>
      <Draggable key={props.song.id}>
        <ListItem
          className="column-drag-handle"
          sx={{ borderRadius: 8, my: 1 }}
          secondaryAction={
            <IconButton
              aria-label={'Rimuovi ' + props.song.name + ' dalla playlist'}
              onClick={(e) => {
                e.preventDefault();
                setOpenConfirm(true);
              }}
            >
              <DeleteRoundedIcon />
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
      <GenericModal
        open={openConfirm}
        handleClose={() => setOpenConfirm(false)}
        content={
          <Grid container direction="column" alignItems="center">
            <Grid>
              <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
                Rimuovere il canto?
              </Typography>
            </Grid>
            <Grid>
              <Typography>
                Vuoi rimuovere <strong>{props.song.name}</strong> dalla
                playlist?
              </Typography>
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="center"
              sx={{ mt: 3, gap: 2 }}
            >
              <Button variant="outlined" onClick={() => setOpenConfirm(false)}>
                Annulla
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleDelete();
                  setOpenConfirm(false);
                }}
              >
                Rimuovi
              </Button>
            </Grid>
          </Grid>
        }
      />
    </>
  );
}
