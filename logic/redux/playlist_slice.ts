import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type DropResult } from 'smooth-dnd/dist/src/exportTypes';
import { getFromStorage, saveToStorage } from '../local_logic';

export interface Playlist {
  name: string;
  songs: string[];
  id: string;
  notes?: Record<string, string>; //* Notes about song
}

interface BoxPlaylistState {
  playlist: Record<string, Playlist>;
}

const initialState: BoxPlaylistState = {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  playlist: getFromStorage('playlists') || {}
};

const getNewId = (allPlaylist: Record<string, Playlist>): string => {
  const allIds = Object.keys(allPlaylist);
  for (let i = 0; i < 2000; i++) {
    if (!allIds.includes(i.toString())) return i.toString();
  }
  throw Error();
};

interface HandleSongParam {
  idSong: string;
  id: string;
}

interface ApplyDragParam {
  id: string;
  dragResult: DropResult;
}

export const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
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
    copyPlaylist: (state, action) => {
      const id = getNewId(state.playlist);
      const newPlaylist: Playlist = {
        id,
        name: action.payload.name,
        songs: action.payload.songs
      };
      state.playlist = {
        ...state.playlist,
        [id]: newPlaylist
      };
      saveToStorage('playlists', state.playlist);
    },
    addPlaylist: (state, action) => {
      const id = getNewId(state.playlist);
      const newPlaylist: Playlist = {
        id,
        name: action.payload,
        songs: []
      };
      state.playlist = {
        ...state.playlist,
        [id]: newPlaylist
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
    modifyNamePlaylist: (state, action) => {
      const newPlaylist: Playlist = state.playlist[action.payload.id];
      newPlaylist.name = action.payload.name;
      state.playlist = {
        ...state.playlist,
        [action.payload.id]: newPlaylist
      };
      saveToStorage('playlists', state.playlist);
    },
    handleSongForPlaylist: (state, action: PayloadAction<HandleSongParam>) => {
      const newPlaylist: Playlist = state.playlist[action.payload.id];
      const idSong = action.payload.idSong;
      if (newPlaylist.songs.includes(idSong)) {
        newPlaylist.songs = [
          ...newPlaylist.songs.slice(0, newPlaylist.songs.indexOf(idSong)),
          ...newPlaylist.songs.slice(
            newPlaylist.songs.indexOf(idSong) + 1,
            newPlaylist.songs.length
          )
        ];
      } else {
        newPlaylist.songs = [...newPlaylist.songs, idSong];
      }
      state.playlist = {
        ...state.playlist,
        [action.payload.id]: newPlaylist
      };
      saveToStorage('playlists', state.playlist);
    }
  }
});

export const {
  addPlaylist,
  modifyNamePlaylist,
  deletePlaylist,
  handleSongForPlaylist,
  copyPlaylist,
  applyDrag
} = playlistSlice.actions;

export default playlistSlice.reducer;
