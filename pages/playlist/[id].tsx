import Container from '@mui/material/Container'
import { PlaylistAppBar } from '@/components/appbar'
import { getSingleSong } from '@/logic/local_logic'
import { useAppSelector } from '@/logic/redux/store'
import ListSongs from '@/components/list_songs'
import { useState } from 'react'
import { ModalBottomSheetPlaylist } from '@/components/bottom_sheet'
import Fab from '@mui/material/Fab'
import AddRoundedIcon from '@mui/icons-material/AddRounded';
//TODO Reorder
//https://codesandbox.io/s/material-ui-sortable-list-with-react-smooth-dnd-swrqx?file=/src/index.js
PlaylistPage.getInitialProps = async (props: any) => {
    const {id} = props.query
  
    return {id}
}

interface PropsSongPage {
    id: string
}

export default function PlaylistPage(props: PropsSongPage) {
    const playlist = useAppSelector(state => state.playlist.playlist[props.id])
    const songs = playlist.songs.map(id_song => getSingleSong(id_song)!)
    const [openModal, setOpenModal] = useState(false)

    return (
        <Container sx={{minHeight: '100vh'}}>
            <PlaylistAppBar title={playlist.name}/>
            <Container sx={{py: 5}}/>
            <ListSongs songs={songs} mode='inside_playlist' />

            <Fab variant="extended" onClick={() => setOpenModal(true)} color='primary' style={{position: 'fixed', bottom: 20}}>
                <AddRoundedIcon sx={{ mr: 1 }} />
                Aggiungi dei canti
            </Fab>
            <ModalBottomSheetPlaylist open={openModal} onClose={() => setOpenModal(false)} playlist_id={playlist.id}/>
        </Container>
    )
  
}