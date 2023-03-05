import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { saveToStorage, setLocalChordNotation } from '../local_logic'

export type ChordNotations = 'AMERICAN' | 'ITALIAN'

interface SettingsState {
    showChords: boolean
    chordNotation: ChordNotations
}

const initialState: SettingsState = {
    showChords: true,
    chordNotation: 'AMERICAN'
}

export const settingsSlice = createSlice({
    name: 'settings',
    initialState: initialState,
    reducers: {
        setShowChords: (state, action) => {
            state.showChords = action.payload
            saveToStorage('show_chords', action.payload)
        },
        setChordNotation: (state, action: PayloadAction<ChordNotations>) => {
            state.chordNotation = action.payload
            setLocalChordNotation(action.payload)
        },
    },
})

export const { setShowChords, setChordNotation } = settingsSlice.actions

export default settingsSlice.reducer
