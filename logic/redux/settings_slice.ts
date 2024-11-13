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
  darkMode: boolean;
}

const initialState: SettingsState = {
  showChords: getFromStorage('show_chords') !== false,
  chordNotation: getLocalChordNotation(),
  darkMode: getFromStorage('dark_mode') !== false
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
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      saveToStorage('dark_mode', action.payload);
    }
  }
});

export const { setShowChords, setChordNotation, setDarkMode } =
  settingsSlice.actions;

export default settingsSlice.reducer;
