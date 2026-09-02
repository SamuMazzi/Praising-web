import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  getFromStorage,
  getLocalChordNotation,
  saveToStorage,
  setLocalChordNotation
} from '../local_logic';

export type ChordNotations = 'symbol' | 'solfege'; // It refers to the chordsheetjs library

interface SettingsState {
  showChords: boolean;
  chordNotation: ChordNotations;
}

/**
 * Valori di default deterministici: devono essere identici sul server e al
 * primo render del client, altrimenti l'hydration di React fallisce. I valori
 * salvati in localStorage vengono applicati dopo il mount da `hydrateSettings`
 * (vedi `components/store_hydration.tsx`).
 * Il tema non e' piu' qui: lo gestisce MUI tramite `data-mui-color-scheme`.
 */
const initialState: SettingsState = {
  showChords: true,
  chordNotation: getLocalChordNotation()
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setShowChords: (state, action: PayloadAction<boolean>) => {
      state.showChords = action.payload;
      saveToStorage('show_chords', action.payload);
    },
    setChordNotation: (state, action: PayloadAction<ChordNotations>) => {
      state.chordNotation = action.payload;
      setLocalChordNotation(action.payload);
    },
    /** Applica le preferenze salvate in localStorage, dopo il mount */
    hydrateSettings: (state) => {
      state.showChords = getFromStorage('show_chords') !== false;
      state.chordNotation = getLocalChordNotation();
    }
  }
});

export const { setShowChords, setChordNotation, hydrateSettings } =
  settingsSlice.actions;

export default settingsSlice.reducer;
