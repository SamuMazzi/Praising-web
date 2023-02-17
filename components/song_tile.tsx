import ListItemText from '@mui/material/ListItemText'
import { Song } from '@/logic/local_logic'
import { NextLinkComposed } from './link_composed'
import ListItem from '@mui/material/ListItem'
import IconButton from '@mui/material/IconButton'
import ListItemButton from '@mui/material/ListItemButton'
import { handleSongForPlaylist, Playlist } from '@/logic/redux/playlist_slice'
import { useAppDispatch } from '@/logic/redux/store'
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';

interface PropsSongTile {
    song: Song
    onSecondaryAction: Function
}

export default function SongTile(props: PropsSongTile) {
  return (
    <ListItem component={NextLinkComposed} to={{pathname: '/songs/' + props.song.id}} 
        sx={{backgroundColor: '#F2F2F2', borderRadius: 8, my: 1}}
        secondaryAction={
            <IconButton onClick={(e: any) => {
                e.preventDefault()
                props.onSecondaryAction()
            }}>
                <PlaylistAddRoundedIcon />
            </IconButton>
        }
    >
        <ListItemText
            primary={props.song.name}
        />
    </ListItem>
  )
  
}

interface PropsSelectableSongTile {
    song: Song
    playlist: Playlist
}

export function SelectableSongTile(props: PropsSelectableSongTile) {
    const dispatch = useAppDispatch()
  return (
    <ListItemButton
        sx={{backgroundColor: '#F2F2F2', borderRadius: 8, my: 1}}
        selected={props.playlist.songs.includes(props.song.id)}
        onClick={() => dispatch(handleSongForPlaylist({idSong: props.song.id, id: props.playlist.id}))}
    >
        <ListItemText
            primary={props.song.name}
        />
    </ListItemButton>
  )
}

interface PropsSelectableSongTile {
    song: Song
    playlist: Playlist
}

//TODO: Reorder
//https://www.npmjs.com/package/@edorivai/react-smooth-dnd
//https://github.com/kutlugsahin/react-smooth-dnd
export function PlaylistSongTile(props: PropsSelectableSongTile) {
    //const dispatch = useAppDispatch()
    return (
        <ListItem component={NextLinkComposed} to={{pathname: '/songs/' + props.song.id}} 
        sx={{backgroundColor: '#F2F2F2', borderRadius: 8, my: 1}}
        >
            <ListItemText
                primary={props.song.name}
            />
        </ListItem>
    )
}