import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { useAppDispatch } from '../logic/redux/store';
import TextField from '@mui/material/TextField';
import {
  addPlaylist,
  modifyNamePlaylist,
  type Playlist
} from '@/logic/redux/playlist_slice';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import Grid from '@mui/material/Grid';
import NewspaperRoundedIcon from '@mui/icons-material/NewspaperRounded';
import Image from 'next/image';
import { useTheme } from '@mui/material';
// import { addActiveSession } from '@/logic/server/database'
// import { setActiveSession } from '@/logic/redux/sessions_slice'

interface GenericProps {
  open: boolean;
  handleClose: () => void;
}

interface ModalAddSongProps extends GenericProps {
  location: [number, number];
}

export function ModalCreateSession(props: ModalAddSongProps): JSX.Element {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  // TODO: Add "useUser"
  // const dispatch = useAppDispatch();

  const handleConfirm = async (): Promise<void> => {
    setError('');
    if (name === '') {
      setError('Il nome non può essere vuoto');
    } else if (name.length > 15) {
      setError('Il nome deve essere più corto');
    } else {
      try {
        // const id_session = await addActiveSession(name, props.location)
        // dispatch(setActiveSession({id_session: id_session, name: name, owner_id: "TODO"}))
        props.handleClose();
      } catch (e: any) {
        setError(e.message as string);
      }
    }
  };

  return (
    <GenericModal
      open={props.open}
      handleClose={props.handleClose}
      content={
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item>
            <Typography variant="h2" sx={{ mb: 3 }}>
              Crea una sessione
            </Typography>
          </Grid>
          <Grid item>
            <TextField
              sx={{ my: 1 }}
              label="Nome"
              value={name}
              onChange={(e) => {
                setName(e.currentTarget.value);
              }}
              helperText={error}
              FormHelperTextProps={{ style: { color: 'red' } }}
            />
          </Grid>
          <Grid item>
            <Button
              onClick={() => {
                void handleConfirm();
              }}
              sx={{ mt: 1 }}
              variant="contained"
            >
              Conferma
            </Button>
          </Grid>
        </Grid>
      }
    />
  );
}

export function ModalAddPlaylist(props: GenericProps): JSX.Element {
  return <ModalEditNamePlaylist {...props} />;
}

interface PropsModalEditNamePlaylist extends GenericProps {
  playlist?: Playlist;
}

export function ModalEditNamePlaylist(
  props: PropsModalEditNamePlaylist
): JSX.Element {
  const [name, setName] = useState(props.playlist?.name ?? '');
  const [error, setError] = useState('');
  const dispatch = useAppDispatch();

  const handleConfirm = (): void => {
    setError('');
    if (name === '') {
      setError('Il nome non può essere vuoto');
    } else if (name.length > 15) {
      setError('Il nome deve essere più corto');
    } else {
      if (props.playlist !== undefined) {
        modifyName();
      } else {
        creaPlaylist();
      }
      props.handleClose();
    }
  };

  const creaPlaylist = (): void => {
    dispatch(addPlaylist(name));
  };

  const modifyName = (): void => {
    dispatch(modifyNamePlaylist({ id: props.playlist?.id, name }));
  };

  return (
    <GenericModal
      open={props.open}
      handleClose={props.handleClose}
      content={
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item>
            <Typography variant="h2" sx={{ mb: 3 }}>
              {props.playlist !== undefined
                ? 'Modifica nome'
                : 'Aggiungi una playlist'}
            </Typography>
          </Grid>
          <Grid item>
            <TextField
              sx={{ my: 1 }}
              label="Nome"
              value={name}
              onChange={(e) => {
                setName(e.currentTarget.value);
              }}
              helperText={error}
              FormHelperTextProps={{ style: { color: 'red' } }}
            />
          </Grid>
          <Grid item>
            <Button onClick={handleConfirm} sx={{ mt: 1 }} variant="contained">
              Conferma
            </Button>
          </Grid>
        </Grid>
      }
    />
  );
}

export function ModalNews(props: GenericProps): JSX.Element {
  const theme = useTheme();

  return (
    <GenericModal
      open={props.open}
      handleClose={props.handleClose}
      content={
        <>
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            <Grid item>
              <Box display="flex" justifyContent="center" alignItems="center">
                <NewspaperRoundedIcon />
                <Typography variant="h2" sx={{ pl: 2 }}>
                  Novità!
                </Typography>
              </Box>
            </Grid>
            <Grid item sx={{ py: 2 }}>
              <Image
                src="/assets/undraw_illustrations/undraw_happy_news.svg"
                alt="Happy news"
                width={100}
                height={100}
              />
            </Grid>
            <Grid item>
              <Typography>Ecco alcune novità di Praising:</Typography>
              <List
                sx={{
                  listStyleType: 'disc',
                  pl: 4,
                  py: 2,
                  my: 1,
                  borderRadius: 8,
                  backgroundColor:
                    theme.palette.mode === 'light' ? '#F2F2F2' : '#3A3A3A',
                  maxHeight: { xs: 250, sm: 400 },
                  overflow: 'auto'
                }}
              >
                <ListItemText sx={{ display: 'list-item' }}>
                  <strong>Schermo sempre attivo:</strong> quando utilizzerai
                  Praising non dovrai preoccuparti di toccare lo schermo per non
                  farlo spegnere, ora rimarrà sempre acceso!
                </ListItemText>
                <ListItemText sx={{ display: 'list-item' }}>
                  <strong>Playlist condivisibili:</strong>
                  {
                    " hai scelto i canti che vuoi fare e non ti va cercarli nell'elenco ogni volta? Ora puoi creare una playlist e condividerla con i tuoi amici!"
                  }
                </ListItemText>
                <ListItemText sx={{ display: 'list-item' }}>
                  <strong>Sezioni espandibili:</strong> le sezioni dei canti
                  sono ora espandibili, così puoi scegliere quali parti
                  visualizzare e quali no! Per farlo basta toccare la sezione
                  che vuoi espandere.
                </ListItemText>
                <ListItemText sx={{ display: 'list-item' }}>
                  <strong>Feedback:</strong>
                  {
                    " qualcosa non ti piace o vuoi suggerire delle modifiche? Clicca sull'icona in alto a destra per inviarmi un messaggio!"
                  }
                </ListItemText>
                <ListItemText sx={{ display: 'list-item' }}>
                  <strong>Altre:</strong>
                  {
                    " tante altre funzionalità fra cui la trasposizione degli accordi, ascoltare l'audio originale direttamente dalla pagina della canzone e tanto altro!"
                  }
                </ListItemText>
              </List>
            </Grid>
            <Grid item>
              <Button
                onClick={() => {
                  props.handleClose();
                }}
                variant="contained"
              >
                Ho capito!
              </Button>
            </Grid>
          </Grid>
        </>
      }
    />
  );
}

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  maxWidth: '90%',
  maxHeight: '85%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 8,
  borderColor: 'background.paper',
  p: 4
};

interface PropsGenericModal extends GenericProps {
  content: JSX.Element;
}

function GenericModal(props: PropsGenericModal): JSX.Element {
  return (
    <Modal open={props.open} onClose={props.handleClose}>
      <Box sx={style}>{props.content}</Box>
    </Modal>
  );
}
