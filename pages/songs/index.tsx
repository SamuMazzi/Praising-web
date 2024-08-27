import Container from '@mui/material/Container'
import NavBar from '@/components/navbar'
import { getLocalSongs } from '@/logic/local_logic'
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar'
import ListSongs from '@/components/list_songs'
import Head from 'next/head'

export default function SongsPage() {
    const localSongs = getLocalSongs()

    return (
        <>
        <Head>
            <title>Canzoni</title>
            <meta property="og:title" content={"Canzoni"} key="title" />
            <meta name="og:description" content={"Qui troverai tutti i testi e accordi dei tuoi canti preferiti!"}/>
            <meta name="og:keywords" content={"accordi, canzoniere, chords, cristiani, testi" }/>
        </Head>
        <main>
        <Container>
            <PraisingAppBar title='Canzoni' homeVersion/>
            <Container disableGutters sx={{pt: verticalPaddingAppBar*3 + 2, pb: 7}}>
                <ListSongs songs={localSongs} mode='normal' withSearch/>
            </Container>
            <NavBar />
        </Container>
        </main>
        </>
    )
  
}