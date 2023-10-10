import ListItemText from '@mui/material/ListItemText'
import { Song } from '@/logic/local_logic'
import ListItem from '@mui/material/ListItem'
import IconButton from '@mui/material/IconButton'
import ListItemButton from '@mui/material/ListItemButton'
import { handleSongForPlaylist, Playlist } from '@/logic/redux/playlist_slice'
import { useAppDispatch } from '@/logic/redux/store'
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';
import Draggable from './react-smooth-dnd/Draggable';
import DragHandleRoundedIcon from '@mui/icons-material/DragHandleRounded';
import Typography from '@mui/material/Typography'
import RoutePaths from '@/logic/routes'
import { Link } from 'react-router-dom'

interface PropsSongTile {
    song: Song
    onSecondaryAction: Function
}

export default function SongTile(props: PropsSongTile) {
  return (
    <ListItem component={Link} to={{pathname: RoutePaths.Songs + '/' + props.song.id}} 
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

export function PlaylistSongTile(props: PropsSelectableSongTile) {
    return (
        <Draggable key={props.song.id}>
            <ListItem 
                sx={{backgroundColor: '#F2F2F2', borderRadius: 8, my: 1}}
                secondaryAction={
                    <IconButton className='column-drag-handle'>
                        <DragHandleRoundedIcon />
                    </IconButton>
                }
            >
                <ListItemText
                    disableTypography
                    primary={
                    <Typography>
                        <Link to={{pathname: RoutePaths.Songs + '/' + props.song.id, search: `?playlist_id=${props.playlist.id}`}} >
                            {props.song.name}
                        </Link>
                    </Typography>}
                />
            </ListItem>
        </Draggable>
            
    )
}