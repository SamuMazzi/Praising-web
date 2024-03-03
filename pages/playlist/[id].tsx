import Container from '@mui/material/Container'
import { PlaylistAppBar } from '@/components/appbar'
import { getFromStorage, getSingleSong, saveToStorage } from '@/logic/local_logic'
import { useAppSelector } from '@/logic/redux/store'
import { ListSongsPlaylist } from '@/components/list_songs'
import { useState } from 'react'
import { ModalBottomSheetPlaylist } from '@/components/bottom_sheet'
import Fab from '@mui/material/Fab'
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Playlist } from '@/logic/redux/playlist_slice'

PlaylistPage.getInitialProps = async (props: any) => {
    const {id} = props.query
  
    return {id}
}

interface PropsSongPage {
    id: string
}

export default function PlaylistPage(props: PropsSongPage) {
    const playlist: Playlist | undefined = useAppSelector(state => state.playlist.playlist[props.id])
    const songs = playlist?.songs.map(id_song => getSingleSong(id_song)!)
    const [openModal, setOpenModal] = useState(false)

    if (!playlist) {
        if (getFromStorage('deleting_playlist') === props.id) {
            /** It means that it's deleting and you shouldn't display an error */
            saveToStorage('deleting_playlist', '')
            return (
                <Container sx={{minHeight: '100vh'}}>
                </Container>
            )
        }
        return (
            <Container sx={{minHeight: '100vh'}}>
                {"C'è stato un errore, riprovare"}
            </Container>
    )}

    return (
        <Container sx={{minHeight: '100vh'}}>
            <PlaylistAppBar playlist_id={playlist.id}/>
            <Container sx={{py: 5}}/>
            <ListSongsPlaylist songs={songs} playlist_id={playlist.id} />
            <Fab variant="extended" onClick={() => setOpenModal(true)} color='primary' style={{position: 'fixed', bottom: 20}}>
                <AddRoundedIcon sx={{ mr: 1 }} />
                Aggiungi dei canti
            </Fab>
            <ModalBottomSheetPlaylist open={openModal} onClose={() => setOpenModal(false)} playlist_id={playlist.id}/>
        </Container>
    )
  
}