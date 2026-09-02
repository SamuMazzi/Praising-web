import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getFromStorage, saveToStorage } from '../local_logic';

const FAVORITE_SONGS_KEY = 'favorite_songs';

interface SettingsState {
  favoriteSongs: string[];
  others: Record<string, string>;
}

const initialState: SettingsState = {
  favoriteSongs: [],
  others: {}
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<Partial<SettingsState>>) => {
      state.favoriteSongs = action.payload.favoriteSongs ?? [];
      /** Aggiornare con altri dati */
      saveToStorage(FAVORITE_SONGS_KEY, action.payload);
    },
    /** Applica i preferiti salvati in localStorage, dopo il mount */
    hydrateUserInfo: (state) => {
      state.favoriteSongs =
        (getFromStorage(FAVORITE_SONGS_KEY) as string[] | null) ?? [];
    },
    /** This is only a local operation */
    setFavoriteSongs: (state, action: PayloadAction<string[]>) => {
      state.favoriteSongs = action.payload;
      saveToStorage(FAVORITE_SONGS_KEY, action.payload);
    },
    addSongToFavoriteSongs: (state, action: PayloadAction<string>) => {
      if (state.favoriteSongs.includes(action.payload)) return;
      state.favoriteSongs = [...state.favoriteSongs, action.payload];
      saveToStorage(FAVORITE_SONGS_KEY, state.favoriteSongs);
    },
    removeSongFromFavoriteSongs: (state, action: PayloadAction<string>) => {
      if (!state.favoriteSongs.includes(action.payload)) return;
      const indexSong = state.favoriteSongs.indexOf(action.payload);
      state.favoriteSongs = [
        ...state.favoriteSongs.slice(0, indexSong),
        ...state.favoriteSongs.slice(indexSong + 1, state.favoriteSongs.length)
      ];
      saveToStorage(FAVORITE_SONGS_KEY, state.favoriteSongs);
    }
  }
});

export const {
  // setFavoriteSongs,
  addSongToFavoriteSongs,
  removeSongFromFavoriteSongs,
  setUserInfo,
  hydrateUserInfo
} = settingsSlice.actions;

export default settingsSlice.reducer;
