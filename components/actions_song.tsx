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
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import IconButton from '@mui/material/IconButton'
import { InfoLocalSong, modifySong } from '@/logic/redux/info_song_slice'
import { setShowChords } from '@/logic/redux/settings_slice'
import Tooltip from '@mui/material/Tooltip';
import { useEffect, useState } from 'react';
import Slide from '@mui/material/Slide';

interface PropsActionSong {
    song: Song
    onPressVideo: Function
    videoIsPlaying: boolean
    setOpenSheet: Function
    fontSize: number
    setEditMode: Function
}

const ActionIconButton = (props: any) => {
    const {title, children, index, visible, ...propsIconButton  } = props

    if (!index) {  // Refactor this
        return (
            <Tooltip title={title} placement="left">
                <IconButton sx={{ boxShadow: 10, p: 1.5, m: 1, backgroundColor: 'background.paper'}} {...propsIconButton}>
                    {children}
                </IconButton>
            </Tooltip>
        )
    }

    return (
        <Slide direction="left" in={visible} timeout={index*0.7*110 + (visible ? 0 : -100)} appear mountOnEnter>
            <Tooltip title={title} placement="left">
                <IconButton sx={{ boxShadow: 10, p: 1.5, m: 1, backgroundColor: 'background.paper'}} {...propsIconButton}>
                    {children}
                </IconButton>
            </Tooltip>
        </Slide>
    )

}

export default function ActionsSong(props: PropsActionSong) {
    const [menuExpanded, setMenuExpanded] = useState(true)
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
        <Container disableGutters sx={{width: 30}} style={{position: 'fixed', top: 70, right: 45, overflow: "inherit !important"}}>
            {/* overflow property is only needed for the tutorial */}
            <ActionIconButton
                id="menuButton"
                color={menuExpanded ? 'primary' : undefined}   
                onClick={() => setMenuExpanded(!menuExpanded)}
                title="Mostra menu"
            >
                <MenuRoundedIcon />
            </ActionIconButton>
            <ActionIconButton 
                id="chordsButton"
                color={showChords ? 'primary' : undefined}   
                onClick={() => dispatch(setShowChords(!showChords))}
                title="Mostra accordi"
                index={1}
                visible={menuExpanded}
            >
                <LyricsRoundedIcon />
            </ActionIconButton>
            <ActionIconButton
                id="transposeUpButton"
                title="+1 #"
                onClick={() => dispatch(modifySong({id: props.song.id, transpose: actualTranspose + 1}))}
                color={actualTranspose > 0 ? 'primary' : undefined}   
                index={2}
                visible={menuExpanded}
            >
                <KeyboardArrowUpRoundedIcon />
            </ActionIconButton>
            <ActionIconButton 
                id="transposeDownButton"
                title="-1 ♭"
                onClick={() => dispatch(modifySong({id: props.song.id, transpose: actualTranspose - 1}))}
                color={actualTranspose < 0 ? 'primary' : undefined}   
                index={3}
                visible={menuExpanded}
            >
                <KeyboardArrowDownRoundedIcon />
            </ActionIconButton>
            <ActionIconButton
                id="zoomInButton"
                title="+ Zoom"
                onClick={() => dispatch(modifySong({id: props.song.id, zoom: fontSize + 1}))}
                color={fontSize > 17 ? 'primary' : undefined}  
                index={4}
                visible={menuExpanded}  
            >
                <ZoomInRoundedIcon />
            </ActionIconButton>
            <ActionIconButton
                id="zoomOutButton"
                title="- Zoom"
                onClick={() => dispatch(modifySong({id: props.song.id, zoom: fontSize - 1}))}
                color={fontSize < 17 ? 'primary' : undefined}
                index={5}
                visible={menuExpanded}
            >
                <ZoomOutRoundedIcon />
            </ActionIconButton>
            <ActionIconButton
                id="playButton"
                title="Riproduci video"
                onClick={() => props.onPressVideo()}
                color={props.videoIsPlaying ? 'primary' : undefined}
                index={6}
                visible={menuExpanded}
            >
                <PlayArrowRoundedIcon />
            </ActionIconButton>
            <ActionIconButton
                id="playlistButton"
                title="Aggiungi a playlist"
                onClick={() => props.setOpenSheet()}
                index={7}
                visible={menuExpanded}
            >
                <PlaylistAddRoundedIcon />
            </ActionIconButton>
            { /* <ActionIconButton 
                title="Modifica la canzone"
                onClick={() => props.setEditMode()}>
                <EditRoundedIcon />
            </ActionIconButton> */ }
        </Container>
    )
  
}