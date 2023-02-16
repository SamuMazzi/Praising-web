import { createSlice } from '@reduxjs/toolkit'
import { saveToStorage } from '../local_logic'

interface SettingsState {
    showChords: boolean
}

const initialState: SettingsState = {
    showChords: true
}

export const settingsSlice = createSlice({
    name: 'settings',
    initialState: initialState,
    reducers: {
        setShowChords: (state, action) => {
            state.showChords = action.payload
            saveToStorage('show_chords', action.payload)
        },
    },
})

export const { setShowChords } = settingsSlice.actions

export default settingsSlice.reducer
