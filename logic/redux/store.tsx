import { configureStore } from '@reduxjs/toolkit'
import playlistReducer from './playlist_slice'
import infoSongsReducer from './info_song_slice'
import settingsReducer from './settings_slice'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

export const store = configureStore({
    reducer: {
        playlist: playlistReducer,
        infoSongs: infoSongsReducer,
        settings: settingsReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
