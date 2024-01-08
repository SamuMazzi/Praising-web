import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ActiveSessionState {
    id_session: string 
    name: string
    owner_id: string
}

interface BoxSessionsState {
    active_session: ActiveSessionState | undefined
}

const initialState: BoxSessionsState = {
    active_session: undefined
}

export const sessionSlice = createSlice({
    name: 'session',
    initialState: initialState,
    reducers: {
        setActiveSession: (state, action: PayloadAction<ActiveSessionState>) => {
            state.active_session = action.payload
        },
    },
})

export const { setActiveSession } = sessionSlice.actions

export default sessionSlice.reducer
