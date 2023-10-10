import Container from '@mui/material/Container'
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar'
import { useState } from 'react'
import Button from '@mui/material/Button'
import { ModalAddPlaylist } from '@/components/modals'
import ListPlaylist from '@/components/list_playlist'
import Box from '@mui/material/Box'

export default function PlaylistPage() {
    const [openModal, setOpenModal] = useState(false)

    return (
        <Container sx={{minHeight: '100vh'}}>
            <PraisingAppBar title='Playlist'/>
            <Container sx={{py: verticalPaddingAppBar + 2}}/>
            <ListPlaylist />
            <Container sx={{pb: 8}}/>
            <Box display='flex' justifyContent='center'>
                <Button 
                    sx={{borderRadius: 4}} 
                    color='primary' 
                    style={{position: 'fixed', bottom: 80}} 
                    variant='contained' 
                    onClick={() => setOpenModal(true)} 
                    disableElevation
                >
                    Aggiungi playlist
                </Button>
            </Box>
            <ModalAddPlaylist open={openModal} handleClose={() => setOpenModal(false)} />
        </Container>
    )
  
}