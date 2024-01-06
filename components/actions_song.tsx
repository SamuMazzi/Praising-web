import { useAppDispatch, useAppSelector } from '@/logic/redux/store'
import { Song } from '@/logic/local_logic'
import Container from '@mui/material/Container'
import LyricsRoundedIcon from '@mui/icons-material/LyricsRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import IconButton from '@mui/material/IconButton'
import { InfoLocalSong, modifySong } from '@/logic/redux/info_song_slice'
import { setShowChords } from '@/logic/redux/settings_slice'
import Tooltip from '@mui/material/Tooltip';
import { useEffect, useState } from 'react';

interface PropsActionSong {
    song: Song
    onPressVideo: Function
    videoIsPlaying: boolean
    setOpenSheet: Function
    fontSize: number
}

const ActionIconButton = (props: any) => {
    const {title, children, ...propsIconButton  } = props

    return (
        <Tooltip title={title} placement="left">
            <IconButton sx={{ boxShadow: 10, p: 1.5, m: 1, backgroundColor: 'white' }} {...propsIconButton}>
                {children}
            </IconButton>
        </Tooltip>
    )

}

export default function ActionsSong(props: PropsActionSong) {
    const [menuExpanded, setMenuExpanded] = useState(false)  // TODO: Add animation (CSS)
    const infoSong: InfoLocalSong | undefined = useAppSelector(state => state.infoSongs.infoSongs[props.song.id])
    const showChords = useAppSelector(state => state.settings.showChords)
    const dispatch = useAppDispatch()
    const actualTranspose = infoSong?.transpose ?? 0
    const fontSize = infoSong?.zoom ?? 17
    useEffect(() => {
        if(props.fontSize !== undefined && props.fontSize !== fontSize) {
            dispatch(modifySong({id: props.song.id, zoom: props.fontSize}))
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Container disableGutters sx={{width: 30}} style={{position: 'fixed', top: 70, right: 45}}>
            <ActionIconButton 
                color={menuExpanded ? 'primary' : undefined}   
                onClick={() => setMenuExpanded(!menuExpanded)}
                title="Mostra menu"
            >
                <MenuRoundedIcon />
            </ActionIconButton>
            {
                menuExpanded && <>
                <ActionIconButton 
                    color={showChords ? 'primary' : undefined}   
                    onClick={() => dispatch(setShowChords(!showChords))}
                    title="Mostra accordi"
                >
                    <LyricsRoundedIcon />
                </ActionIconButton>
                <ActionIconButton 
                    title="+1 #"
                    onClick={() => dispatch(modifySong({id: props.song.id, transpose: actualTranspose + 1}))}
                    color={actualTranspose > 0 ? 'primary' : undefined}   
                >
                    <KeyboardArrowUpRoundedIcon />
                </ActionIconButton>
                <ActionIconButton 
                    title="-1 ♭"
                    onClick={() => dispatch(modifySong({id: props.song.id, transpose: actualTranspose - 1}))}
                    color={actualTranspose < 0 ? 'primary' : undefined}   
                >
                    <KeyboardArrowDownRoundedIcon />
                </ActionIconButton>
                <ActionIconButton 
                    title="+ Zoom"
                    onClick={() => dispatch(modifySong({id: props.song.id, zoom: fontSize + 1}))}
                    color={fontSize > 17 ? 'primary' : undefined}    
                >
                    <ZoomInRoundedIcon />
                </ActionIconButton>
                <ActionIconButton 
                    title="- Zoom"
                    onClick={() => dispatch(modifySong({id: props.song.id, zoom: fontSize - 1}))}
                    color={fontSize < 17 ? 'primary' : undefined}
                >
                    <ZoomOutRoundedIcon />
                </ActionIconButton>
                <ActionIconButton 
                    title="Riproduci video"
                    onClick={() => props.onPressVideo()}
                    color={props.videoIsPlaying ? 'primary' : undefined}  
                >
                    <PlayArrowRoundedIcon />
                </ActionIconButton>
                <ActionIconButton 
                    title="Aggiungi a playlist"
                    onClick={() => props.setOpenSheet()}>
                    <PlaylistAddRoundedIcon />
                </ActionIconButton>
                </>
            }
        </Container>
    )
  
}