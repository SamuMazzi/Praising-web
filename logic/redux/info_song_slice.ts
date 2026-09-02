import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getFromStorage, saveToStorage } from '../local_logic';

const INFO_SONGS_KEY = 'info_songs';

export interface InfoLocalSong {
  transpose?: number;
  zoom?: number;
  versionId?: string;
}

interface BoxInfoSongsState {
  infoSongs: Record<string, InfoLocalSong>;
}

const initialState: BoxInfoSongsState = {
  infoSongs: {}
};

interface PayloadModifySong {
  id: string;
  transpose?: number;
  zoom?: number;
}

interface PayloadSetLocalVersionSong {
  id: string;
  versionId?: string;
}

const infoSongsSlice = createSlice({
  name: INFO_SONGS_KEY,
  initialState,
  reducers: {
    /** Applica le info locali dei canti salvate in localStorage, dopo il mount */
    hydrateInfoSongs: (state) => {
      state.infoSongs =
        (getFromStorage(INFO_SONGS_KEY) as Record<
          string,
          InfoLocalSong
        > | null) ?? {};
    },
    modifySong: (state, action: PayloadAction<PayloadModifySong>) => {
      const idS = action.payload.id;
      const songToModify = {
        transpose: action.payload.transpose ?? state.infoSongs[idS]?.transpose,
        zoom: action.payload.zoom ?? state.infoSongs[idS]?.zoom
      };
      state.infoSongs = {
        ...state.infoSongs,
        [idS]: songToModify
      };
      saveToStorage(INFO_SONGS_KEY, state.infoSongs);
    },
    setLocalVersionSong: (
      state,
      action: PayloadAction<PayloadSetLocalVersionSong>
    ) => {
      const idS = action.payload.id;
      state.infoSongs = {
        ...state.infoSongs,
        [idS]: {
          ...state.infoSongs[idS],
          versionId: action.payload.versionId
        }
      };
      saveToStorage(INFO_SONGS_KEY, state.infoSongs);
    }
  }
});

export const { modifySong, setLocalVersionSong, hydrateInfoSongs } =
  infoSongsSlice.actions;

export default infoSongsSlice.reducer;
