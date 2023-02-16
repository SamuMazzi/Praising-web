import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getFromStorage, saveToStorage } from '../local_logic'

export interface InfoLocalSong {
    transpose?: number
    zoom?: number
}

interface BoxInfoSongsState {
    infoSongs: Record<string, InfoLocalSong>
}

const initialState: BoxInfoSongsState = {
    infoSongs: getFromStorage('info_songs') || {}
}

interface PayloadModifySong {
    id: string
    transpose?: number
    zoom?: number
}

export const infoSongsSlice = createSlice({
    name: 'info_songs',
    initialState: initialState,
    reducers: {
        modifySong: (state, action: PayloadAction<PayloadModifySong>) => {
            const idS = action.payload.id
            state.infoSongs = {
                ...state.infoSongs,
                [idS]: {
                    transpose: action.payload.transpose ?? state.infoSongs[idS]?.transpose,
                    zoom: action.payload.zoom ?? state.infoSongs[idS]?.zoom
                }
            }
            saveToStorage('info_songs', state.infoSongs)
        },
    },
})

export const { modifySong } = infoSongsSlice.actions

export default infoSongsSlice.reducer
