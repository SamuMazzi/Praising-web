import Container from '@mui/material/Container'
import { SongAppBar } from '@/components/appbar'
import { getFromStorage, getSingleSong, saveToStorage, updateLastRecentsSongs } from '@/logic/local_logic'
import ActionsSong from '@/components/actions_song'
import { ModalBottomSheetSong } from '@/components/bottom_sheet'
import { useEffect, useState } from 'react'
import YouTube from 'react-youtube';
import Box from '@mui/material/Box';
import { useWakeLock } from 'react-screen-wake-lock';
import Typography from '@mui/material/Typography';
import { useAppSelector } from '@/logic/redux/store';
import { InfoLocalSong } from '@/logic/redux/info_song_slice';
import { renderSong } from '@/logic/handle_text_song'
import { MessageSnackbar } from '@/components/pers_snackbar'
import IconButton from '@mui/material/IconButton'
import CloseRounded from '@mui/icons-material/CloseRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import useSWR from 'swr'
import { Playlist } from '@/logic/redux/playlist_slice'
import ShimmerSegments from '@/components/shimmer_effect/shimmer_segments'
import TextField from '@mui/material/TextField'
import Fab from '@mui/material/Fab'
import { useTheme } from '@mui/material'
// import LinearProgress from '@mui/material/LinearProgress'
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
// import { renderToString } from 'react-dom/server';
import Head from 'next/head'

// TODO: Add highlight of parts of text in song (also for sessions) -> take a look at transitions/modal/popover

SongPage.getInitialProps = async (props: any) => {
    const {id, playlist_id} = props.query
    return {id, playlist_id}
}

interface PropsSongPage {
    id: string
    playlist_id: string | undefined
}

const fetcher = (url: string) => fetch(url).then((res) => res.json()).catch((err) => console.log(err));


const driverObj = driver({
    // TODO: Sistema progress
    nextBtnText: 'Avanti',
    prevBtnText: 'Indietro',
    // doneBtnText: '✕',
    showProgress: true,
    disableActiveInteraction: true,
    /* onPopoverRender: (popover, { config, state }) => {
        const index = state.activeIndex ?? 0
        const len = config.steps?.length ?? 1
        const firstButton = <LinearProgress variant="determinate" sx={{width: 20}} value={index/len} />
        popover.footer.innerHTML = renderToString(firstButton);
    }, */
    progressText: "{{current}} di {{total}}",
    steps: [
      { popover: { title: 'Tutorial', description: 'Ecco un paio di informazioni per usare al meglio Praising.' } },
      { element: 'div #menuButton', popover: { title: 'Funzionalità', description: 'Premendo questo pulsante puoi sbloccare molte funzionalità di Praising.' } },
      { element: 'div #chordsButton', popover: { title: 'Accordi', description: 'Mostra o nascondi gli accordi' } },
      { element: 'div #transposeUpButton', popover: { title: 'Trasporta', description: 'Trasporta gli accordi in altre tonalità' } },
      { element: 'div #zoomInButton', popover: { title: 'Zoom', description: 'Ingrandisci o rimpicciolisci i caratteri' } },
      { element: 'div #playButton', popover: { title: 'Ascolta la canzone', description: 'Ascolta la canzone direttamente da Youtube (se possibile).' } },
      { element: 'div #playlistButton', popover: { title: 'Playlist', description: 'Aggiungi la canzone ad una playlist.' } },
      { popover: { title: 'Schermo', description: 'Grazie a Praising lo schermo non si spegnerà mai automaticamente mentre sei su una canzone.' } },
      { popover: { title: 'Buon divertimento!', description: ':)' } },
    ]
});

const TUTORIAL_SHOWN = 'tutorialShown_0'

export default function SongPage(props: PropsSongPage) {
    const { data, error, isLoading } = useSWR('/api/song/' + props.id, fetcher)
    const song = getSingleSong(props.id)
    const playlist: Playlist | undefined = useAppSelector(state => props.playlist_id !== undefined ? state.playlist.playlist[props.playlist_id] : undefined)
    const [openModalPlaylist, setOpenModalPlaylist] = useState(false)
    const [showVideo, setShowVideo] = useState(false)
    const infoSong: InfoLocalSong | undefined = useAppSelector(state => song?.id ? state.infoSongs.infoSongs[song.id] : undefined)
    const showChords = useAppSelector(state => state.settings.showChords)
    const { isSupported, released, request, release } = useWakeLock({});
    const [messageSnackbar, setMessageSnackbar] = useState("")
    const chordNotation = useAppSelector(state => state.settings.chordNotation)
    const [editMode, setEditMode] = useState(false)
    const theme = useTheme()

    useEffect(() => {
        const tutorial_not_shown = !(getFromStorage(TUTORIAL_SHOWN) ?? false)
        if (tutorial_not_shown) {
            saveToStorage(TUTORIAL_SHOWN, true)
            driverObj.drive();
        }
        const handleVisibilityChange = async () => {
            if (isSupported && (released === true || released === undefined) && document.visibilityState === 'visible') {
                await request()
            }
        };
        
        updateLastRecentsSongs(song!)
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        request()

        return () => {
            if (released === false) { //Return of useEffect get executed also on mount, this snippet prevent this
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                release()
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handlePressVideo = () => {
        if(song?.link !== undefined) {
            setShowVideo(old => !old)
        } else {
            setMessageSnackbar('Link non disponibile per questa canzone')
        }
    }

    //if(props.fileContent === undefined || props.song === undefined) {
    if(error || isLoading) {
        return (
            <Container sx={{minHeight: '100vh'}}>
                <SongAppBar id={''} title={''}/>
                {
                    isLoading ? <Box sx={{mt: 15}}>
                            <ShimmerSegments numSegments={30}/>
                        </Box> :
                    <Typography sx={{pt: 15}} textAlign="center">
                        {"C'è stato un'errore, riprovare"}
                    </Typography>
                }
            </Container>
        )
    }

    const info = renderSong({
        fileContent: data, //props.fileContent
        showChords: showChords,
        transpose: infoSong?.transpose,
        fontSize: infoSong?.zoom,
        chordNotation: chordNotation,
    })

    if (info.error) {
        return (
            <Container sx={{minHeight: '100vh'}}>
                <SongAppBar id={''} title={''}/>
                <Typography sx={{pt: 15}} textAlign="center">
                    {info.error}
                </Typography>
            </Container>
        )
    }

    const sections: string[] = info.sections
    const fontSize: number = info.fontSize
    // fontsize std: lineHeigth 68, poi -4 tutte le volte

    return (
        <>
        <Head>
            <title>{song?.name} - Praising</title>
            <meta property="og:title" content={"Praising - " + song?.name} key="title" />
            <meta name="og:description" content={"Guarda gli accordi della canto " + song?.name}/>
            <meta name="og:keywords" content={song?.name + ", accordi, " + song?.author + ", canzoniere, chords" }/>
        </Head>
        <main>
        <Container sx={{minHeight: '100vh', width: '100vw'}} style={{backgroundColor: theme.palette.background.default}}>
            {
                !isSupported && <Typography>
                    Questo browser non supporta il wakelock
                </Typography>
            }
            <SongAppBar id={song?.id || ''} title={song!.name} transpose={infoSong?.transpose} playlist={playlist}/>
            <Container sx={{py: 3.5}}/>
            {
                !editMode &&
                <ActionsSong song={song!} fontSize={fontSize} videoIsPlaying={showVideo} onPressVideo={handlePressVideo} 
                setOpenSheet={() => setOpenModalPlaylist(true)} setEditMode={() => setEditMode(true)}/>
            }
            <Container id="songDiv" disableGutters sx={{py: 1}}>
                {
                    editMode ? <EditableSong data={data} setEditMode={() => setEditMode(false)}/> : 
                    <>
                    {
                        /**
                         * 
                        <Typography style={{fontSize: infoSong?.zoom ?? 17}}> // FIXME: e font size????
                        <div dangerouslySetInnerHTML={{__html: songToRender}} />
                        </Typography>
                        */
                    }
                    {
                        sections.map((section, index) => {
                            return (
                                <SectionSong key={index} section={section} infoSong={infoSong}/>
                            )
                        })
                    }
                    </>
                }
            </Container>
            {
                showVideo && song?.link && 
                <Box 
                style={{position: 'fixed', bottom: 20, right: 0}} 
                sx={{px: 2, pb: 2, mr: 3, backgroundColor: 'background.paper', borderRadius: 4, boxShadow: 12, maxWidth: '90%'}}
                >
                <IconButton edge="start" onClick={() => setShowVideo(false)}>
                    <CloseRounded />
                </IconButton>
                    <YouTube
                        videoId={song?.link?.split('youtu.be/')[1]}
                        opts={{
                            width: typeof window !== "undefined" ? (window.screen.availWidth < 700 ? (window.screen.availWidth*(4/5)).toString() : '640') : '640',
                            playerVars: {
                                autoplay: 1,
                            },
                        }}
                        />
            </Box>
            }
            <MessageSnackbar handleClose={() => setMessageSnackbar('')} message={messageSnackbar} />
            <ModalBottomSheetSong song_id={song!.id} open={openModalPlaylist} onClose={() => setOpenModalPlaylist(false)}/>
        </Container>
        </main>
        </>
    )
}

function SectionSong(props: {section: string, infoSong: InfoLocalSong | undefined}) {
    return (
        <Typography style={{fontSize: props.infoSong?.zoom ?? 17}}>
            <p className='expandable' onClick={(e) => {
                const isCompressed = e.currentTarget.classList.toggle("compressed");
                const classToPut = !isCompressed ? 'chord' : 'no-chord';
                const classToRemove = !isCompressed ? 'no-chord' : 'chord';

                const children = e.currentTarget.querySelectorAll('.' + classToRemove);
                children.forEach(child => child.classList.replace(classToRemove, classToPut));
            }}>
                <p dangerouslySetInnerHTML={{__html: props.section}} />
            </p>
        </Typography>
    )
}

function EditableSong(props: {data: string, setEditMode: Function}) {
    const [data, setData] = useState(props.data)
    const theme = useTheme()
    // TODO: Ora va aggiunto upload canzone modificata e check se canzone modificata ad ogni apertura file (si potrebbe tenere un indice per ogni profilo utente per ridurre letture)
    return (
        <>
            <TextField
                // style={{textAlign: 'left'}}
                fullWidth
                multiline
                value={data}
                onChange={(e) => setData(e.target.value)}
                rows={data.split('\n').length}
                sx={{my: 2}}
                InputProps={{
                    style: { color: theme.palette.mode === 'dark' ? 'white' : 'black' }
                }}
            />
            <Fab style={{
                margin: 0,
                top: 'auto',
                right: 20,
                bottom: 20,
                left: 'auto',
                position: 'fixed',
            }} color="primary" aria-label="Confirm" onClick={() => props.setEditMode()}>
                <CheckRoundedIcon />
            </Fab>
        </>
    )
}