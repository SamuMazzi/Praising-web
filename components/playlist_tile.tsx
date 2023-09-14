import ListItemText from '@mui/material/ListItemText'
import { NextLinkComposed } from './link_composed'
import ListItem from '@mui/material/ListItem'
import IconButton from '@mui/material/IconButton'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { deletePlaylist, handleSongForPlaylist, Playlist } from '@/logic/redux/playlist_slice'
import ListItemButton from '@mui/material/ListItemButton'
import { useAppDispatch, useAppSelector } from '@/logic/redux/store'
import { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import PersSnackbar from './pers_snackbar';
import { ModalDeletePlaylist, ModalEditNamePlaylist, ModalExportToPDF } from './modals';
import { RWebShare } from 'react-web-share';
import Routes from '@/logic/routes';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

interface PropsPlaylistTile {
    playlist: Playlist
}

export default function PlaylistTile(props: PropsPlaylistTile) {
    const [openEdit, setOpenEdit] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [message, setMessage] = useState("")
    const [showPDFModal, setShowPDFModal] = useState(false)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
  return (
    <>
    <ListItem 
        component={NextLinkComposed} 
        to={{pathname: '/playlist/' + props.playlist.id}} 
        sx={{backgroundColor: '#F2F2F2', borderRadius: 8, my: 1}}
        secondaryAction={
            <IconButton onClick={(e) => {
                e.preventDefault()
                handleClick(e)
            }}>
                <MoreVertRoundedIcon />
            </IconButton>
        }
        >
        <ListItemText
            primary={props.playlist.name}
        />
    </ListItem>
    <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
    >
        <MenuItem onClick={() => {
            handleClose()
            setOpenEdit(true)
        }}>
            <ListItemIcon>
                <EditRoundedIcon />
            </ListItemIcon>
            <ListItemText primary='Modifica nome'/>
        </MenuItem>
        <RWebShare
            data={{
                text: "Visualizza la playlist " + props.playlist.name + " su 'Praising'",
                url: "https://praising.vercel.app"+ Routes.SharePlaylist +"?name="+props.playlist.name+"&songs="+props.playlist.songs.join(','),
                title: "Condividi la playlist",
            }}
            sites={['facebook', 'twitter', 'whatsapp', 'telegram', 'mail', 'copy']}
            onClick={() => {
                handleClose()
                setMessage('Link copiato')
            }}
        >
        <MenuItem onClick={() => { 
            handleClose()            
            navigator.clipboard.writeText("https://praising.vercel.app"+ Routes.SharePlaylist +"?name="+props.playlist.name+"&songs="+props.playlist.songs.join(','))
        }}>
            <ListItemIcon>
                <ShareRoundedIcon />
            </ListItemIcon>
            <ListItemText primary='Condividi'/>
        </MenuItem>
        </RWebShare>
        <MenuItem onClick={() => {
            handleClose() 
            setShowPDFModal(true)
        }}>
            <ListItemIcon>
                <DownloadRoundedIcon />
            </ListItemIcon>
            <ListItemText primary='Scarica PDF'/>
        </MenuItem>
        <MenuItem onClick={() => {
            handleClose()
            setOpenDelete(true)
        }}>
            <ListItemIcon>
                <DeleteRoundedIcon />
            </ListItemIcon>
            <ListItemText primary='Elimina'/>
        </MenuItem>
    </Menu>

    <PersSnackbar open={message !== ""} handleClose={() => setMessage("")} message={message}/>
    <ModalEditNamePlaylist open={openEdit} handleClose={() => setOpenEdit(false)} playlist={props.playlist}/>
    <ModalExportToPDF open={showPDFModal} handleClose={() => setShowPDFModal(false)} playlist={props.playlist}/>
    <ModalDeletePlaylist open={openDelete} handleClose={() => setOpenDelete(false)} playlist={props.playlist}/>
    </>
  )
  
}

interface PropsSelectablePlaylistTile {
    playlist: Playlist
    songId: string
}

export function SelectablePlaylistTile(props: PropsSelectablePlaylistTile) {
    const dispatch = useAppDispatch()
    return (
        <>
        <ListItemButton
            sx={{backgroundColor: '#F2F2F2', borderRadius: 8, my: 1}}
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