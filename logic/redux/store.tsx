import { configureStore } from '@reduxjs/toolkit';
import playlistReducer from './playlist_slice';
import infoSongsReducer from './info_song_slice';
import settingsReducer from './settings_slice';
// import sessionsReducer from './sessions_slice';
import userInfoReducer from './user_info_slice';
import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector
} from 'react-redux';

export const store = configureStore({
  reducer: {
    playlist: playlistReducer,
    infoSongs: infoSongsReducer,
    settings: settingsReducer,
    userInfo: userInfoReducer
    // sessions: sessionsReducer
  }
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
