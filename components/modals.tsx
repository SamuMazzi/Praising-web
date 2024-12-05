import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { useAppDispatch } from '../logic/redux/store';
import TextField from '@mui/material/TextField';
import { setPlaylist } from '@/logic/redux/playlist_slice';
import Grid from '@mui/material/Grid';
import Grid2 from '@mui/material/Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import {
  addServerPlaylist,
  type Playlist,
  setServerPlaylist
} from '@/logic/server/database';
import useFirebaseAuth from '@/logic/hooks/use_auth';
import assert from 'assert';

interface GenericProps {
  open: boolean;
  handleClose: () => void;
}

/*
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
*/

interface PropsModalCreateAccountForThisAction extends GenericProps {
  title: string;
  message: string;
}

export function ModalCreateAccountForThisAction(
  props: PropsModalCreateAccountForThisAction
): JSX.Element {
  /* const router = useRouter();
  const handleConfirm = async (): Promise<void> => {
    void router.push(Routes.Login);
  }; */

  return (
    <GenericModal
      open={props.open}
      handleClose={props.handleClose}
      content={
        <Grid2
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <Grid2>
            <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
              {props.title}
            </Typography>
          </Grid2>
          <Grid2>
            <Typography>{props.message}</Typography>
          </Grid2>
          <Grid2 container direction="row" sx={{ mt: 2 }}>
            <Button
              onClick={() => {
                props.handleClose();
              }}
              sx={{ mt: 1, mr: 3, textTransform: 'none' }}
              variant="outlined"
            >
              {'Ok' /* "Annulla" */}
            </Button>
            {/* <Button
              onClick={() => {
                void handleConfirm();
              }}
              sx={{ mt: 1 }}
              variant="contained"
            >
              Registrati
            </Button> */}
          </Grid2>
        </Grid2>
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
  const [loading, setLoading] = useState(false);
  const { authUser } = useFirebaseAuth();
  const [error, setError] = useState('');
  const dispatch = useAppDispatch();

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    if (name === '') {
      setError('Il nome non può essere vuoto');
    } else if (name.length > 15) {
      setError('Il nome deve essere più corto');
    } else {
      if (props.playlist !== undefined) {
        modifyName();
      } else {
        await createPlaylist();
      }
      props.handleClose();
    }
    setLoading(false);
  };

  const createPlaylist = async () => {
    if (authUser === null) {
      return;
    }
    const p = await addServerPlaylist(authUser.uid, name, []);
    dispatch(setPlaylist(p));
  };

  const modifyName = (): void => {
    assert(props.playlist !== undefined);
    const newPlaylist = { ...props.playlist, name };
    dispatch(setPlaylist(newPlaylist));
    void setServerPlaylist(newPlaylist);
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
            <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
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
          <Grid item sx={{ mt: 1 }}>
            {loading ? (
              <CircularProgress />
            ) : (
              <Button onClick={handleConfirm} variant="contained">
                Conferma
              </Button>
            )}
          </Grid>
        </Grid>
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

export const GenericModal = (props: PropsGenericModal): JSX.Element => {
  return (
    <Modal open={props.open} onClose={props.handleClose}>
      <Box sx={style}>{props.content}</Box>
    </Modal>
  );
};
