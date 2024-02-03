import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getFromStorage, saveToStorage } from '../local_logic'
import { addServerFavoriteSongs, removeServerFavoriteSongs } from '../server/database'

export const UserProfileServerKey = 'userProfile'

interface SettingsState {
    favoriteSongs: string[]
    others: any
}

const initialState: SettingsState = {
    favoriteSongs: getFromStorage('favorite_songs') || [],
    others: {}
}

export const settingsSlice = createSlice({
    name: 'settings',
    initialState: initialState,
    reducers: {
        setUserInfo: (state, action: PayloadAction<any>) => {
            state.favoriteSongs = action.payload.favoriteSongs ?? []
            /** Aggiornare con altri dati */
            saveToStorage('favorite_songs', action.payload)
        },
        /** This is only a local operation */
        setFavoriteSongs: (state, action: PayloadAction<string[]>) => {
            state.favoriteSongs = action.payload
            saveToStorage('favorite_songs', action.payload)
        },
        addSongToFavoriteSongs: (state, action: PayloadAction<string>) => {
            if (state.favoriteSongs.includes(action.payload)) return;
            state.favoriteSongs = [...state.favoriteSongs, action.payload]
            saveToStorage('favorite_songs', state.favoriteSongs)
            const userProfile = getFromStorage(UserProfileServerKey)
            if (userProfile !== null && userProfile.anonymous === false)
                addServerFavoriteSongs(userProfile.uid, action.payload)
        },
        removeSongFromFavoriteSongs: (state, action: PayloadAction<string>) => {
            if (!state.favoriteSongs.includes(action.payload)) return;
            const indexSong = state.favoriteSongs.indexOf(action.payload)
            state.favoriteSongs = [...state.favoriteSongs.slice(0, indexSong), ...state.favoriteSongs.slice(indexSong + 1, state.favoriteSongs.length)]
            saveToStorage('favorite_songs', state.favoriteSongs)
            const userProfile = getFromStorage(UserProfileServerKey)
            if (userProfile !== null && userProfile.anonymous === false)
                removeServerFavoriteSongs(userProfile.uid, action.payload)
        },
    },
})

export const { setFavoriteSongs, addSongToFavoriteSongs, removeSongFromFavoriteSongs, setUserInfo } = settingsSlice.actions

export default settingsSlice.reducer
