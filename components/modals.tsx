import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import Button from '@mui/material/Button'
import { useAppDispatch } from '../logic/redux/store'
import TextField from '@mui/material/TextField'
import { addPlaylist, deletePlaylist, modifyNamePlaylist, Playlist } from '@/logic/redux/playlist_slice'
import Grid from '@mui/material/Grid'
import Checkbox from '@mui/material/Checkbox'
import { ChordNotations } from '@/logic/redux/settings_slice'
import { PDFDownloadButton } from './pdf_song'

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

interface PropsModalExportToPDF extends GenericProps {
    playlist: Playlist
}

export function ModalExportToPDF(props: PropsModalExportToPDF) {
    const [showChords, setShowChords] = useState(true)
    const [chordNotation, setChordNotation] = useState<ChordNotations>('ITALIAN')

    return <GenericModal 
        open={props.open}
        handleClose={props.handleClose}
        content={
            <Grid container direction='column' justifyContent='center' alignItems="center">
                <Grid item>
                    <Box display='flex' alignItems='center' justifyContent="center">
                        <Checkbox 
                            checked={showChords}
                            value={showChords}
                            onChange={(e) => setShowChords(e.target.checked)}
                        />
                        <Typography variant="h2" sx={{mb: 3}}>
                            Mostra gli accordi nei testi
                        </Typography>
                    </Box>
                </Grid>
                { false && //TODO: Da aggiungere in futuro, non mi andava di settare Select
                <Grid item>
                    <Box display='flex' alignItems='center'>
                        <Checkbox 
                            value={chordNotation}
                        />
                        <Typography variant="h2" sx={{mb: 3}}>
                            Mostra gli accordi nei testi
                        </Typography>
                    </Box>
                </Grid>}
                <Grid item>
                    <PDFDownloadButton playlist={props.playlist} show_chords={showChords}/>
                </Grid>
            </Grid>
        }
    />
}

interface PropsModalDeletePlaylist extends GenericProps {
    playlist: Playlist
}

export function ModalDeletePlaylist(props: PropsModalDeletePlaylist) {
    const dispatch = useAppDispatch()

    return <GenericModal 
        open={props.open}
        handleClose={props.handleClose}
        content={
            <Grid container direction='column' justifyContent='center' alignItems="center">
                <Grid item>
                    <Typography variant="h2" sx={{mb: 3}}>
                        {"Vuoi veramente eliminare la playlist \"" + props.playlist.name + "\"?"}
                    </Typography>
                </Grid>
                <Grid item>
                    <Box display="flex" alignItems="center">
                        <Button variant="outlined" onClick={() => props.handleClose} sx={{mr: 2}}>
                            Indietro
                        </Button>
                        <Button variant='contained' onClick={() => {
                            //FIXME: Delete non funziona
                            dispatch(deletePlaylist(props.playlist))
                            props.handleClose()
                        }}>
                            Elimina!
                        </Button>
                    </Box>
                </Grid>
            </Grid>
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
