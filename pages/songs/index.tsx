import Container from '@mui/material/Container'
import NavBar from '@/components/navbar'
import { getLocalSongs } from '@/logic/local_logic'
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar'
import ListSongs from '@/components/list_songs'

export default function SongsPage() {
    const localSongs = getLocalSongs()

    return (
        <Container>
            <PraisingAppBar title='Canzoni'/>
            <Container disableGutters sx={{pt: verticalPaddingAppBar*3 + 2, pb: 7}}>
                <ListSongs songs={localSongs} mode='normal' withSearch/>
            </Container>
            <NavBar />
        </Container>
    )
  
}