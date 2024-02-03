import ListItemText from '@mui/material/ListItemText'
import { NextLinkComposed } from './link_composed'
import ListItem from '@mui/material/ListItem'
import IconButton from '@mui/material/IconButton'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { handleSongForPlaylist, Playlist } from '@/logic/redux/playlist_slice'
import ListItemButton from '@mui/material/ListItemButton'
import { useAppDispatch } from '@/logic/redux/store'

interface PropsPlaylistTile {
    playlist: Playlist
    onOptionsClick: Function
}

export default function PlaylistTile(props: PropsPlaylistTile) {    
  return (
    <>
    <ListItem 
        component={NextLinkComposed} 
        to={{pathname: '/playlist/' + props.playlist.id}} 
        sx={{borderRadius: 8, my: 1}}
        secondaryAction={
            <IconButton onClick={(e) => {
                e.preventDefault()
                props.onOptionsClick()
            }}>
                <MoreVertRoundedIcon />
            </IconButton>
        }
        >
        <ListItemText
            primary={props.playlist.name}
        />
    </ListItem>
    </>
  )
  
}

interface PropsSelectablePlaylistTile {
    playlist: Playlist
    songId: string
}

export function SelectablePlaylistTile(props: PropsSelectablePlaylistTile) {
    const dispatch = useAppDispatch()
    // TODO: Should change color
    return (
        <>
        <ListItemButton
            sx={{borderRadius: 8, my: 1}}
            selected={props.playlist.songs.includes(props.songId)}
            onClick={() => dispatch(handleSongForPlaylist({id: props.playlist.id, idSong: props.songId}))}
        >
            <ListItemText
                primary={props.playlist.name}
            />
        </ListItemButton>
        </>
    )
}