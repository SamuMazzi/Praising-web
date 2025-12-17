import MuiContainer from '@mui/material/Container';
import List from '@mui/material/List';
import { getSingleSong, type Song } from '@/logic/local_logic';
import SongTile, {
  PlaylistSongTile,
  SelectableSongTile
} from '@/components/song_tile';
import TypeSearch from '@/components/search_field';
import React, { useState } from 'react';
import { applyDrag } from '@/logic/redux/playlist_slice';
import { ModalBottomSheetSong } from './bottom_sheet';
import DragContainer from './react-smooth-dnd/Container';
import { useAppDispatch, useAppSelector } from '@/logic/redux/store';
import { ModalAddPlaylist } from './modals';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import Box from '@mui/material/Box';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import IconButton from '@mui/material/IconButton';
import assert from 'assert';
import { Playlist, setServerPlaylist } from '@/logic/server/database';

const AVOID_SPECIAL_CHARACTERS = /[^a-zA-Z0-9 ]/g;

interface PropsListSongs {
  songs: Song[];
  mode: 'normal' | 'selection_playlist';
  playlist?: Playlist;
  withSearch?: boolean;
  auto_sorting?: boolean;
}
/**
 *
 * @param auto_sorting Default = True
 */
export default function ListSongs(props: PropsListSongs) {
  const [songModal, setSongModal] = useState('');
  const [showModalCreatePlaylist, setShowModalCreatePlaylist] = useState(false);
  const [filter, setFilter] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const favoriteSongs = useAppSelector((state) => state.userInfo.favoriteSongs);

  const filterSong = (v: Song): boolean => {
    const favoritePart =
      !showOnlyFavorites || (showOnlyFavorites && favoriteSongs.includes(v.id));
    const nameToFilter = v.name
      .replace(AVOID_SPECIAL_CHARACTERS, '')
      .toLowerCase();
    const authorToFilter = v.author
      .replace(AVOID_SPECIAL_CHARACTERS, '')
      .toLowerCase();
    const fitInFilter = (nameToFilter + ' ' + authorToFilter).includes(
      filter.replace(AVOID_SPECIAL_CHARACTERS, '').toLowerCase() // This replace is needed to avoid special characters... it could be handled better
    );
    return favoritePart && fitInFilter;
  };

  let localSongs = props.songs.filter(filterSong);
  if (props.auto_sorting !== false) {
    localSongs = localSongs.sort((a, b) => ('' + a.name).localeCompare(b.name));
  }

  return props.songs.length === 0 ? (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      <Grid sx={{ pt: 4 }}>
        <Image
          src="assets/undraw_illustrations/undraw_more_music.svg"
          alt="More music"
          width={200}
          height={200}
        />
      </Grid>
      <Grid sx={{ pt: 2 }}>
        <Typography align="center" style={{ fontWeight: 300 }}>
          Inizia a suonare per riempire la lista
        </Typography>
      </Grid>
    </Grid>
  ) : (
    <MuiContainer>
      {props.withSearch === undefined ||
        (props.withSearch && (
          <Box display="flex">
            <TypeSearch query={filter} setQuery={setFilter} />
            <IconButton
              sx={{ ml: 1 }}
              onClick={() => {
                setShowOnlyFavorites(!showOnlyFavorites);
              }}
            >
              {showOnlyFavorites ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Box>
        ))}
      <List>
        {localSongs.map((song) => {
          if (props.mode === 'normal')
            return (
              <SongTile
                key={song.id}
                song={song}
                onSecondaryAction={() => {
                  setSongModal(song.id);
                }}
              />
            );
          if (props.mode === 'selection_playlist') {
            assert(props.playlist !== undefined, 'Playlist is required');
            return (
              <SelectableSongTile
                key={song.id}
                song={song}
                playlist={props.playlist}
              />
            );
          }
          return <></>;
        })}
      </List>
      <ModalBottomSheetSong
        open={songModal !== ''}
        onClose={() => {
          setSongModal('');
        }}
        songId={songModal}
        openModalCreate={() => {
          setSongModal('');
          setShowModalCreatePlaylist(true);
        }}
      />
      <ModalAddPlaylist
        open={showModalCreatePlaylist}
        handleClose={() => {
          setShowModalCreatePlaylist(false);
        }}
      />
    </MuiContainer>
  );
}

interface PropsListSongsPlaylist {
  playlist: Playlist;
}

export function ListSongsPlaylist(props: PropsListSongsPlaylist) {
  const dispatch = useAppDispatch();
  const [songModal, setSongModal] = useState('');
  const [filter, setFilter] = useState('');
  const songs = props.playlist.songs
    .map((idSong) => getSingleSong(idSong))
    .filter((x) => x !== undefined);
  const localSongs = songs.filter((v) =>
    v.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <MuiContainer sx={{ pb: 3 }}>
      <TypeSearch query={filter} setQuery={setFilter} />
      <List>
        <DragContainer
          dragHandleSelector=".column-drag-handle"
          onDrop={(e: any) => {
            dispatch(
              applyDrag({
                id: props.playlist.id,
                dragResult: e
              })
            );
            void setServerPlaylist(props.playlist);
          }}
        >
          <>
            {localSongs.map((song) => (
              <PlaylistSongTile
                key={song.id}
                song={song}
                playlist={props.playlist}
              />
            ))}
          </>
        </DragContainer>
      </List>
      <ModalBottomSheetSong
        open={songModal !== ''}
        onClose={() => {
          setSongModal('');
        }}
        songId={songModal}
      />
    </MuiContainer>
  );
}
