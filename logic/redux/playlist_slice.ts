import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type DropResult } from 'smooth-dnd/dist/src/exportTypes';
import { getFromStorage, saveToStorage } from '../local_logic';
import { type Playlist } from '../server/database';

interface BoxPlaylistState {
  playlist: Record<string, Playlist>;
}

const initialState: BoxPlaylistState = {
  playlist: {}
};

interface ApplyDragParam {
  id: string;
  dragResult: DropResult;
}

export const handleSongForPlaylist = (playlist: Playlist, idSong: string) => {
  let songs = playlist.songs;
  if (songs.includes(idSong)) {
    songs = [
      ...songs.slice(0, playlist.songs.indexOf(idSong)),
      ...songs.slice(songs.indexOf(idSong) + 1, songs.length)
    ];
  } else {
    songs = [...songs, idSong];
  }
  return songs;
};

const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    /** Applica le playlist salvate in localStorage, dopo il mount */
    hydratePlaylists: (state) => {
      state.playlist =
        (getFromStorage('playlists') as Record<string, Playlist> | null) ?? {};
    },
    applyDrag: (state, action: PayloadAction<ApplyDragParam>) => {
      const { removedIndex, addedIndex, payload } = action.payload.dragResult;
      if (removedIndex === null && addedIndex === null) return;
      const newPlaylist: Playlist = state.playlist[action.payload.id];

      const result = [...newPlaylist.songs];

      let itemToAdd: string = payload;

      if (removedIndex !== null) {
        itemToAdd = result.splice(removedIndex, 1)[0];
      }

      if (addedIndex !== null) {
        result.splice(addedIndex, 0, itemToAdd);
      }
      newPlaylist.songs = [...result];
      state.playlist = {
        ...state.playlist,
        [action.payload.id]: newPlaylist
      };
      saveToStorage('playlists', state.playlist);
    },
    upgradePlaylist: (
      state,
      action: PayloadAction<{ p: Playlist; old_id: string; userId: string }>
    ) => {
      const newPlaylist = { ...action.payload.p };
      const playlists = {
        ...state.playlist,
        [newPlaylist.id]: newPlaylist
      };
      // Move playlist with certain Id to new Id and remove old one
      delete playlists[action.payload.old_id];
      state.playlist = { ...playlists };
      saveToStorage('playlists', state.playlist);
    },
    setPlaylist: (state, action: PayloadAction<Playlist>) => {
      const newPlaylist = action.payload;
      newPlaylist.lastModified = new Date().getTime();
      state.playlist = {
        ...state.playlist,
        [newPlaylist.id]: newPlaylist
      };
      saveToStorage('playlists', state.playlist);
    },
    deletePlaylist: (state, action) => {
      //* Remove
      const { [action.payload]: foo, ...otherPlaylists } = state.playlist;
      state.playlist = {
        ...otherPlaylists
      };
      saveToStorage('playlists', state.playlist);
    },
    setAllPlaylists: (
      state,
      action: PayloadAction<Record<string, Playlist>>
    ) => {
      state.playlist = { ...action.payload };
      saveToStorage('playlists', state.playlist);
    }
  }
});

export const {
  hydratePlaylists,
  setPlaylist,
  deletePlaylist,
  applyDrag,
  upgradePlaylist,
  setAllPlaylists
} = playlistSlice.actions;

export default playlistSlice.reducer;
