import Container from '@mui/material/Container'
import useSWR from 'swr'
import { SongAppBar } from '@/components/appbar'
import { getSingleSong, updateLastRecentsSongs } from '@/logic/local_logic'
import ChordSheetJS from 'chordsheetjs';
import ActionsSong from '@/components/actions_song'
import { ModalBottomSheetSong } from '@/components/bottom_sheet'
import { useEffect, useState } from 'react'
import YouTube from 'react-youtube';
import Box from '@mui/material/Box';
import { useWakeLock } from 'react-screen-wake-lock';
import Typography from '@mui/material/Typography';
import { useAppSelector } from '@/logic/redux/store';
import { InfoLocalSong } from '@/logic/redux/info_song_slice';

SongPage.getInitialProps = async (props: any) => {
    const {id} = props.query
  
    return {id}
}

interface PropsSongPage {
    id: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SongPage(props: PropsSongPage) {
    const { data, error, isLoading } = useSWR('/api/song/' + props.id, fetcher)
    const song = getSingleSong(props.id)
    const [openModalPlaylist, setOpenModalPlaylist] = useState(false)
    const [showVideo, setShowVideo] = useState(false)
    const infoSong: InfoLocalSong | undefined = useAppSelector(state => state.infoSongs.infoSongs[props.id])
    const showChords = useAppSelector(state => state.settings.showChords)
    const { isSupported, released, request, release } = useWakeLock({
        /* onRequest: () => alert('Screen Wake Lock: requested!'),
        onError: () => alert('An error happened 💥'),
        onRelease: () => alert('Screen Wake Lock: released!'), */
    });

    useEffect(() => {
        updateLastRecentsSongs(song!)
        request()

        return () => {
            release()
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const renderSong = () => {
        const parser = new ChordSheetJS.ChordProParser();
        const song_parsed = parser.parse(data);
        //TODO: Fallo diventare div per essere responsive
        const formatterDiv = new ChordSheetJS.HtmlDivFormatter();
        const serializedSong = new ChordSheetJS.ChordSheetSerializer().serialize(song_parsed);
        //serializedSong.lines.filter(line => !(line.items.length === 1 && line.items[0].type === 'tag' && line.items[0].value.startsWith('{capo')))
        serializedSong.lines.map(line => {
            if(line.items.length === 0 || (line.items.length === 1 && line.items[0].type === 'tag')) {
                line.items = [...line.items, {
                    type: 'chordLyricsPair',
                    chords: '',
                    lyrics: ' '
                }]
            }
            return line
        })
        if (!showChords) {
            serializedSong.lines.map(line => {
                line.items.map(v => {
                    if(v.type === 'chordLyricsPair') {
                        v.chords = ''
                        v.chord = null
                    }
                    return v
                })
            })
        }
        const deserialized = new ChordSheetJS.ChordSheetSerializer().deserialize(serializedSong);
        const newSong = deserialized.mapLines((line) => {
            //* Rimuovi le righe di accordi vuote
            if (
                line.items.every(item => item instanceof ChordSheetJS.ChordLyricsPair 
                    && item.chords.trim() === '' 
                    && (item.lyrics === null || item.lyrics?.trim() === '') )) {
                return null;
            }
            //* Rimuovi le righe di Tag
            if (line.items.every(item => item instanceof ChordSheetJS.Tag )) {
                return null;
            }
            //* Aggiungi spazi fra chord senza testo sotto di loro (non funziona)
            for(let i = 0; i < line.items.length - 1; i++) {
                const item1 = line.items[i]
                const item2 = line.items[i+1]
                if(item1 instanceof ChordSheetJS.ChordLyricsPair && item2 instanceof ChordSheetJS.ChordLyricsPair) {
                    if((item1.lyrics === null || item1.lyrics === '') && (item2.lyrics === null || item2.lyrics === '')) {
                        item1.chords += ' '
                    }
                }
            }
          
            return line;
          });
        const disp = formatterDiv.format(newSong);
        const serializedSong2 = new ChordSheetJS.ChordSheetSerializer().serialize(song_parsed);

        console.log(serializedSong2)

        return disp
    }

    if (error || !song) return <div>failed to load</div>
    if (isLoading) return <div>loading...</div>

    const songToRender = renderSong()

    return (
        <Container sx={{minHeight: '100vh'}}>
            {
                !isSupported && <Typography>
                    Questo browser non supporta il wakelock
                </Typography>
            }
            <SongAppBar title={song.name}/>
            <Container sx={{py: 5}}/>
            <ActionsSong song={song} videoIsPlaying={showVideo} onPressVideo={() => setShowVideo(old => !old)} setOpenSheet={() => setOpenModalPlaylist(true)}/>
            <Container disableGutters sx={{py: 1}}>
                <Typography style={{fontSize: infoSong?.zoom ?? 17}}>
                    <div dangerouslySetInnerHTML={{__html: songToRender}} />
                </Typography>
            </Container>
            {
            showVideo && song.link && 
            <Box style={{position: 'fixed', bottom: 20, left: '50%'}}>
                <YouTube
                    videoId={song.link?.split('youtu.be/')[1]}
                    //title={'string'} // defaults -> null
                    opts={{
                        playerVars: {
                            autoplay: 1,
                        },
                    }}
                    //onReady={func} // defaults -> noop
                    //onPlay={func} // defaults -> noop
                    //onPause={func} // defaults -> noop
                />
            </Box>
            }
            <ModalBottomSheetSong song_id={song.id} open={openModalPlaylist} onClose={() => setOpenModalPlaylist(false)}/>
        </Container>
    )
}