import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getFromStorage, saveToStorage } from '../local_logic';

const INFO_SONGS_KEY = 'info_songs';

export interface InfoLocalSong {
  transpose?: number;
  zoom?: number;
}

interface BoxInfoSongsState {
  infoSongs: Record<string, InfoLocalSong>;
}

const initialState: BoxInfoSongsState = {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  infoSongs: getFromStorage(INFO_SONGS_KEY) || {}
};

interface PayloadModifySong {
  id: string;
  transpose?: number;
  zoom?: number;
}

export const infoSongsSlice = createSlice({
  name: INFO_SONGS_KEY,
  initialState,
  reducers: {
    modifySong: (state, action: PayloadAction<PayloadModifySong>) => {
      const idS = action.payload.id;
      state.infoSongs = {
        ...state.infoSongs,
        [idS]: {
          transpose:
            action.payload.transpose ?? state.infoSongs[idS]?.transpose,
          zoom: action.payload.zoom ?? state.infoSongs[idS]?.zoom
        }
      };
      saveToStorage(INFO_SONGS_KEY, state.infoSongs);
    }
  }
});

export const { modifySong } = infoSongsSlice.actions;

export default infoSongsSlice.reducer;
