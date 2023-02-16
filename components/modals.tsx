import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import Button from '@mui/material/Button'
import { useAppDispatch, useAppSelector } from '../logic/redux/store'
import Container from '@mui/material/Container'
import TextField from '@mui/material/TextField'
import { addPlaylist, deletePlaylist, modifyNamePlaylist, Playlist } from '@/logic/redux/playlist_slice'
import ListItemButton from '@mui/material/ListItemButton'
import List from '@mui/material/List'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { RWebShare } from "react-web-share";
import Grid from '@mui/material/Grid'
import Routes from '@/logic/routes'
import PersSnackbar from './pers_snackbar'

interface GenericProps {
    open: boolean
    handleClose: Function
}

export function ModalAddPlaylist(props: GenericProps) {
    return <ModalEditNamePlaylist {...props}/>
}

interface PropsModalEditNamePlaylist extends GenericProps {
    playlist?: Playlist
}

export function ModalEditNamePlaylist(props: PropsModalEditNamePlaylist) {
    const [name, setName] = useState(props.playlist?.name ?? '')
    const [error, setError] = useState("")
    const dispatch = useAppDispatch()

    const handleConfirm = () => {
        setError("")
        if(name === "") {
            setError("Il nome non può essere vuoto")
        } else if (name.length > 15) {
            setError("Il nome deve essere più corto")
        } else {
            if(props.playlist) {
                modifyName()
            } else {
                creaPlaylist()
            }
            props.handleClose()
        }
    }

    const creaPlaylist = () => {
        dispatch(addPlaylist(name))
    }

    const modifyName = () => {
        dispatch(modifyNamePlaylist({id: props.playlist?.id, name: name}))
    }

    return <GenericModal 
        open={props.open}
        handleClose={props.handleClose}
        content={
            <Grid container direction='column' justifyContent='center' alignItems="center">
                <Grid item>
                    <Typography variant="h2" sx={{mb: 3}}>
                        {props.playlist ? 'Modifica nome' : 'Aggiungi una playlist'}
                    </Typography>
                </Grid>
                <Grid item>
                    <TextField sx={{my: 1}} label="Nome" value={name} onChange={(e) => setName(e.currentTarget.value)} helperText={error}/>
                </Grid>
                <Grid item>
                    <Button onClick={handleConfirm} sx={{mt: 1}}>
                        Conferma
                    </Button>
                </Grid>
            </Grid>
        }
    />
}

interface PropsModalEditPlaylist extends GenericProps {
    playlist_id: string
}

export function ModalEditPlaylist(props: PropsModalEditPlaylist) {
    const [openEdit, setOpenEdit] = useState(false)
    const dispatch = useAppDispatch()
    const playlist: Playlist | undefined = useAppSelector(state => state.playlist.playlist[props.playlist_id])
    const [message, setMessage ] = useState("")

    return <GenericModal 
        open={props.open}
        handleClose={props.handleClose}
        content={
            <>
            <List>
                <ListItemButton onClick={() => setOpenEdit(true)}>
                    <ListItemIcon>
                        <EditRoundedIcon />
                    </ListItemIcon>
                    <ListItemText primary='Modifica nome'/>
                </ListItemButton>
                <RWebShare
                    data={{
                        text: "Visualizza la playlist " + playlist?.name + " su 'Praising'",
                        url: "https://praising.vercel.app"+ Routes.SharePlaylist +"?name="+playlist?.name+"&songs="+playlist?.songs.join(','),
                        title: "Condividi la playlist",
                    }}
                    sites={['facebook', 'twitter', 'whatsapp', 'telegram', 'mail', 'copy']}
                    onClick={() => setMessage('Link copiato')}
                >
                <ListItemButton onClick={() => navigator.clipboard.writeText('')}>
                    <ListItemIcon>
                        <ShareRoundedIcon />
                    </ListItemIcon>
                    <ListItemText primary='Condividi'/>
                </ListItemButton>
                </RWebShare>
                <ListItemButton onClick={() => {
                    dispatch(deletePlaylist(playlist!.id))
                    props.handleClose()
                }}>
                    <ListItemIcon>
                        <DeleteRoundedIcon />
                    </ListItemIcon>
                    <ListItemText primary='Elimina'/>
                </ListItemButton>
            </List>
            <PersSnackbar open={message !== ""} handleClose={() => setMessage("")} message={message}/>
            <ModalEditNamePlaylist open={openEdit} handleClose={() => setOpenEdit(false)} playlist={playlist}/>
            </>
        }
    />
}


const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: 8,
    p: 4,
}

interface PropsGenericModal extends GenericProps {
    content: JSX.Element
}

function GenericModal(props: PropsGenericModal) {
    return (
        <Modal open={props.open} onClose={() => props.handleClose()}>
            <Box sx={style}>{props.content}</Box>
        </Modal>
    )
}
