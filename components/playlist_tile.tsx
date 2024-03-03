import ListItemText from '@mui/material/ListItemText'
import { NextLinkComposed } from './link_composed'
import ListItem from '@mui/material/ListItem'
import IconButton from '@mui/material/IconButton'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { handleSongForPlaylist, Playlist } from '@/logic/redux/playlist_slice'
import ListItemButton from '@mui/material/ListItemButton'
import { useAppDispatch } from '@/logic/redux/store'
import Routes from '@/logic/routes';
import { MenuPlaylist } from './menus';
import React from 'react';

interface PropsPlaylistTile {
    playlist: Playlist
}

export default function PlaylistTile(props: PropsPlaylistTile) {   
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
    <ListItem 
        component={NextLinkComposed} 
        to={{pathname: Routes.Playlist + '/' + props.playlist.id}} 
        sx={{borderRadius: 8, my: 1}}
        secondaryAction={
            <IconButton onClick={openMenu}>
                <MoreVertRoundedIcon />
            </IconButton>
        }
        >
        <ListItemText
            primary={props.playlist.name}
        />
    </ListItem>
    <MenuPlaylist anchorEl={anchorEl} setAnchorEl={setAnchorEl} playlist_id={props.playlist.id}/>
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