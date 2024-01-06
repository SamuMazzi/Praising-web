import Container from '@mui/material/Container'
import { SongAppBar } from '@/components/appbar'
import { getSingleSong, updateLastRecentsSongs } from '@/logic/local_logic'
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
import useSWR from 'swr'
import { Playlist } from '@/logic/redux/playlist_slice'
import ShimmerSegments from '@/components/shimmer_effect/shimmer_segments'

// TODO: Add highlight of parts of text in song (also for sessions) -> take a look at transitions/modal/popover

SongPage.getInitialProps = async (props: any) => {
    const {id, playlist_id} = props.query
    return {id, playlist_id}
}

interface PropsSongPage {
    id: string
    playlist_id: string | undefined
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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

    useEffect(() => {
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
    const songToRender: string = info.songText
    const sections: string[] = info.sections
    const fontSize: number = info.fontSize
    // fontsize std: lineHeigth 68, poi -4 tutte le volte

    return (
        <Container sx={{minHeight: '100vh'}}>
            {
                !isSupported && <Typography>
                    Questo browser non supporta il wakelock
                </Typography>
            }
            <SongAppBar id={song?.id || ''} title={song!.name} transpose={infoSong?.transpose} playlist={playlist}/>
            <Container sx={{py: 3.5}}/>
            <ActionsSong song={song!} fontSize={fontSize} videoIsPlaying={showVideo} onPressVideo={handlePressVideo} 
                setOpenSheet={() => setOpenModalPlaylist(true)}/>
            <Container disableGutters sx={{py: 1}}>
                <Typography style={{fontSize: infoSong?.zoom ?? 17}}> {/** FIXME: e font size???? */}
                    <div dangerouslySetInnerHTML={{__html: songToRender}} />
                </Typography>
                {
                    
                    sections.map((section, index) => {
                        return (
                            <SectionSong key={index} section={section} infoSong={infoSong}/>
                        )
                    })
                }
            </Container>
            {
            showVideo && song?.link && 
            <Box 
                style={{position: 'fixed', bottom: 20, right: 0}} 
                sx={{px: 2, pb: 2, mr: 3, backgroundColor: 'white', borderRadius: 4, boxShadow: 12, maxWidth: '90%'}}
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
    )
}

function SectionSong(props: {section: string, infoSong: InfoLocalSong | undefined}) {
    return (
        <Typography style={{fontSize: props.infoSong?.zoom ?? 17}}>
            <div className='expandable' onClick={(e) => {
                const isCompressed = e.currentTarget.classList.toggle("compressed");
                const classToPut = !isCompressed ? 'chord' : 'no-chord';
                const classToRemove = !isCompressed ? 'no-chord' : 'chord';

                const children = e.currentTarget.querySelectorAll('.' + classToRemove);
                children.forEach(child => child.classList.replace(classToRemove, classToPut));
            }}>
                <div dangerouslySetInnerHTML={{__html: props.section}} />
            </div>
        </Typography>
    )
}