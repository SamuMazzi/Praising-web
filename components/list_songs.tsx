'use client';

import MuiContainer from '@mui/material/Container';
import List from '@mui/material/List';
import { getSingleSong, type Song } from '@/logic/local_logic';
import SongTile, {
  PlaylistSongTile,
  SelectableSongTile
} from '@/components/song_tile';
import TypeSearch from '@/components/search_field';
import VirtualizedSongList from '@/components/virtualized_song_list';
import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState
} from 'react';
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
import { type Playlist } from '@/logic/server/database';
/** Firestore (~250 kB) non serve per disegnare la pagina: lo carichiamo solo
 *  quando l'utente fa davvero un'azione che tocca il server. */
const database = async () => await import('@/logic/server/database');

import { type DropResult } from 'smooth-dnd';
import { useRouter } from 'next/router';
import Routes from '@/logic/routes';

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
  const router = useRouter();
  const [songModal, setSongModal] = useState('');
  const [showModalCreatePlaylist, setShowModalCreatePlaylist] = useState(false);
  const [filter, setFilter] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const favoriteSongs = useAppSelector((state) => state.userInfo.favoriteSongs);

  /** Il filtro applicato alla lista resta indietro di un frame rispetto al
   *  campo di testo: cosi' la digitazione non aspetta il ridisegno delle
   *  tile. */
  const deferredFilter = useDeferredValue(filter);

  const openSongModal = useCallback((idSong: string): void => {
    setSongModal(idSong);
  }, []);

  /**
   * Tutte le tile puntano alla stessa rotta `/songs/[id]`, quindi un solo
   * prefetch basta a scaricare e compilare il chunk della pagina canto: al
   * primo tap resta da prendere solo il JSON dei dati. Lo facciamo quando il
   * browser e' inattivo, per non rubare banda al caricamento della lista.
   */
  const firstSongId = props.songs[0]?.id;
  useEffect(() => {
    if (props.mode !== 'normal' || firstSongId === undefined) return;
    const schedule =
      window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500));
    const handle = schedule(() => {
      void router.prefetch(`${Routes.Songs}/${firstSongId}`).catch(() => {});
    });
    return () => {
      window.cancelIdleCallback?.(handle as number);
    };
  }, [router, props.mode, firstSongId]);

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
      deferredFilter.replace(AVOID_SPECIAL_CHARACTERS, '').toLowerCase() // This replace is needed to avoid special characters... it could be handled better
    );
    return favoritePart && fitInFilter;
  };

  // Filtro + ordinamento su 234 canti (con una localeCompare per confronto)
  // giravano a ogni render, anche quando cambiava solo lo stato di un modale.
  const localSongs = useMemo(() => {
    const filtered = props.songs.filter(filterSong);
    return props.auto_sorting !== false
      ? filtered.sort((a, b) => ('' + a.name).localeCompare(b.name))
      : filtered;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.songs,
    props.auto_sorting,
    deferredFilter,
    showOnlyFavorites,
    favoriteSongs
  ]);

  return props.songs.length === 0 ? (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      <Grid sx={{ pt: 4 }}>
        <Image
          src="/assets/undraw_illustrations/undraw_more_music.svg"
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
              aria-label="Mostra solo i preferiti"
              aria-pressed={showOnlyFavorites}
              sx={{ ml: 1 }}
              onClick={() => {
                setShowOnlyFavorites(!showOnlyFavorites);
              }}
            >
              {showOnlyFavorites ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Box>
        ))}
      <VirtualizedSongList songs={localSongs}>
        {(song) => {
          if (props.mode === 'normal')
            return <SongTile song={song} onSecondaryAction={openSongModal} />;
          if (props.mode === 'selection_playlist') {
            assert(props.playlist !== undefined, 'Playlist is required');
            return <SelectableSongTile song={song} playlist={props.playlist} />;
          }
          return null;
        }}
      </VirtualizedSongList>
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
          onDrop={(e: DropResult) => {
            dispatch(
              applyDrag({
                id: props.playlist.id,
                dragResult: e
              })
            );
            void database().then(
              async (db) => await db.setServerPlaylist(props.playlist)
            );
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
