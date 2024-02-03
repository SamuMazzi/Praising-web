import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import Button from '@mui/material/Button'
import { useAppDispatch, useAppSelector } from '../logic/redux/store'
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
import NewspaperRoundedIcon from '@mui/icons-material/NewspaperRounded';
import Image from 'next/image'
import { useTheme } from '@mui/material'
import { addActiveSession } from '@/logic/server/database'
import { setActiveSession } from '@/logic/redux/sessions_slice'

interface GenericProps {
    open: boolean
    handleClose: Function
}

interface ModalAddSongProps extends GenericProps {
    location: [number, number]
}

export function ModalCreateSession(props: ModalAddSongProps) {
    const [name, setName] = useState('')
    const [error, setError] = useState("")
    // TODO: Add "useUser"
    const dispatch = useAppDispatch()

    const handleConfirm = async () => {
        setError("")
        if(name === "") {
            setError("Il nome non può essere vuoto")
        } else if (name.length > 15) {
            setError("Il nome deve essere più corto")
        } else {
            try {
                const id_session = await addActiveSession(name, props.location)
                dispatch(setActiveSession({id_session: id_session, name: name, owner_id: "TODO"}))
                props.handleClose()
            } catch (e: any) {
                setError(e.message)
            }
        }
    }

    return <GenericModal 
        open={props.open}
        handleClose={props.handleClose}
        content={
            <Grid container direction='column' justifyContent='center' alignItems="center">
                <Grid item>
                    <Typography variant="h2" sx={{mb: 3}}>
                        Crea una sessione
                    </Typography>
                </Grid>
                <Grid item>
                    <TextField sx={{my: 1}} label="Nome" value={name} onChange={(e) => setName(e.currentTarget.value)} helperText={error}
                     FormHelperTextProps={{ style: { color: 'red' }}}/>
                </Grid>
                <Grid item>
                    <Button onClick={handleConfirm} sx={{mt: 1}} variant="contained">
                        Conferma
                    </Button>
                </Grid>
            </Grid>
        }
    />
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
                    <TextField sx={{my: 1}} label="Nome" value={name} onChange={(e) => setName(e.currentTarget.value)} helperText={error}
                     FormHelperTextProps={{ style: { color: 'red' }}}/>
                </Grid>
                <Grid item>
                    <Button onClick={handleConfirm} sx={{mt: 1}} variant="contained">
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
                <ListItemButton>
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

export function ModalNews(props: GenericProps) {
    const theme = useTheme()

    return <GenericModal 
        open={props.open}
        handleClose={props.handleClose}
        content={
            <>
            <Grid container direction="column" justifyContent="center" alignItems="center">
                <Grid item>
                    <Box display='flex' justifyContent='center' alignItems="center">
                        <NewspaperRoundedIcon />
                        <Typography variant="h2" sx={{pl: 2 }}>
                            Novità!
                        </Typography>    
                    </Box>
                </Grid>
                <Grid item sx={{py: 2}}>
                    <Image src='/assets/undraw_illustrations/undraw_happy_news.svg' alt="Happy news" width={100} height={100}/>
                </Grid>
                <Grid item>
                    <Typography>
                        Ecco alcune novità di Praising:
                    </Typography>
                    <List sx={{ listStyleType: 'disc', pl: 4, py: 2, my: 1, borderRadius: 8, backgroundColor: theme.palette.mode === 'light' ? '#F2F2F2' : '#3A3A3A', maxHeight: 400, overflow: 'auto'}}>
                        <ListItemText sx={{ display: 'list-item' }}>
                            <strong>Schermo sempre attivo:</strong> quando utilizzerai Praising non dovrai preoccuparti di toccare lo schermo per non farlo spegnere, ora rimarrà sempre acceso!
                        </ListItemText>
                        <ListItemText sx={{ display: 'list-item' }}>
                            <strong>Playlist condivisibili:</strong>{" hai scelto i canti che vuoi fare e non ti va cercarli nell'elenco ogni volta? Ora puoi creare una playlist e condividerla con i tuoi amici!"}
                        </ListItemText>
                        <ListItemText sx={{ display: 'list-item' }}>
                            <strong>Sezioni espandibili:</strong> le sezioni dei canti sono ora espandibili, così puoi scegliere quali parti visualizzare e quali no! Per farlo basta toccare la sezione che vuoi espandere.
                        </ListItemText>
                        <ListItemText sx={{ display: 'list-item' }}>
                            <strong>Feedback:</strong>{" qualcosa non ti piace o vuoi suggerire delle modifiche? Clicca sull'icona in alto a destra per inviarmi un messaggio!"}
                        </ListItemText>
                        <ListItemText sx={{ display: 'list-item' }}>
                            <strong>Altre:</strong>{" tante altre funzionalità fra cui la trasposizione degli accordi, ascoltare l'audio originale direttamente dalla pagina della canzone e tanto altro!"}
                        </ListItemText>
                    </List>
                </Grid>
                <Grid item>
                    <Button onClick={() => props.handleClose()} variant="contained">
                        Ho capito!
                    </Button>
                </Grid>
            </Grid>
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
    borderColor: 'background.paper',
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
