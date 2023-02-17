import Container from '@mui/material/Container'
import { SongAppBar } from '@/components/appbar'
import { getSingleSong, Song, updateLastRecentsSongs } from '@/logic/local_logic'
import ActionsSong from '@/components/actions_song'
import { ModalBottomSheetSong } from '@/components/bottom_sheet'
import { useEffect, useState } from 'react'
import YouTube from 'react-youtube';
import Box from '@mui/material/Box';
import { useWakeLock } from 'react-screen-wake-lock';
import Typography from '@mui/material/Typography';
import { useAppSelector } from '@/logic/redux/store';
import { InfoLocalSong } from '@/logic/redux/info_song_slice';
import fs from 'fs';
import { NextPageContext } from 'next';
import { renderSong } from '@/logic/handle_text_song'
import { MessageSnackbar } from '@/components/pers_snackbar'
import IconButton from '@mui/material/IconButton'
import CloseRounded from '@mui/icons-material/CloseRounded'

export const getServerSideProps = async (context: NextPageContext) => {
    let song = undefined
    let fileContent = undefined

    const emptyObject = {
        props: {
          fileContent,
          song
        },
    };
    const { id } = context.query;
    if (id === undefined) {
        return emptyObject
    }
    song = getSingleSong(Array.isArray(id!) ? id!.at(0)! : id!)
    if (song === undefined) {
        return emptyObject
    }
    try {
        fileContent = fs.readFileSync(`./public/accordi/${song?.name}.crd`, 'utf-8');
        return {
          props: {
            fileContent,
            song
          },
        };
    } catch {
        return emptyObject
    }
  
}

interface PropsSongPage {
    fileContent: string
    song: Song
}

export default function SongPage(props: PropsSongPage) {
    const song = props.song
    const [openModalPlaylist, setOpenModalPlaylist] = useState(false)
    const [showVideo, setShowVideo] = useState(false)
    const infoSong: InfoLocalSong | undefined = useAppSelector(state => state.infoSongs.infoSongs[props.song.id])
    const showChords = useAppSelector(state => state.settings.showChords)
    const { isSupported, released, request, release } = useWakeLock({});
    const [messageSnackbar, setMessageSnackbar] = useState("")

    useEffect(() => {
        updateLastRecentsSongs(song!)
        request()
        //TODO: Da finire di testare
        return () => {
            release()
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const songToRender = renderSong({
        fileContent: props.fileContent,
        showChords: showChords,
        transpose: infoSong?.transpose
    })

    const handlePressVideo = () => {
        if(song.link !== undefined) {
            setShowVideo(old => !old)
        } else {
            setMessageSnackbar('Link non disponibile per questa canzone')
        }
    }

    return (
        <Container sx={{minHeight: '100vh'}}>
            {
                !isSupported && <Typography>
                    Questo browser non supporta il wakelock
                </Typography>
            }
            <SongAppBar title={song.name} transpose={infoSong?.transpose} wakeLockActive={!released}/>
            <Container sx={{py: 5}}/>
            <ActionsSong song={song} videoIsPlaying={showVideo} onPressVideo={handlePressVideo} 
                setOpenSheet={() => setOpenModalPlaylist(true)}/>
            <Container disableGutters sx={{py: 1}}>
                <Typography style={{fontSize: infoSong?.zoom ?? 17}}>
                    <div dangerouslySetInnerHTML={{__html: songToRender}} />
                </Typography>
            </Container>
            {
            showVideo && song.link && 
            <Box 
                style={{position: 'fixed', bottom: 20, right: 0}} 
                sx={{px: 2, pb: 2, mr: 3, backgroundColor: 'white', borderRadius: 4, boxShadow: 12, maxWidth: '90%'}}
            >
                <IconButton edge="start" onClick={() => setShowVideo(false)}>
                    <CloseRounded />
                </IconButton>
                    <YouTube
                        videoId={song.link?.split('youtu.be/')[1]}
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
            <ModalBottomSheetSong song_id={song.id} open={openModalPlaylist} onClose={() => setOpenModalPlaylist(false)}/>
        </Container>
    )
}