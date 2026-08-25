'use client';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { useAppDispatch } from '../logic/redux/store';
import TextField from '@mui/material/TextField';
import { setPlaylist } from '@/logic/redux/playlist_slice';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import {
  addServerPlaylist,
  type Playlist,
  setServerPlaylist
} from '@/logic/server/database';
import useFirebaseAuth from '@/logic/hooks/use_auth';
import { type EmailPayloadProposalSong } from '@/logic/server/emails';
import assert from 'assert';

interface GenericProps {
  open: boolean;
  handleClose: () => void;
}

/*
interface ModalAddSongProps extends GenericProps {
  location: [number, number];
}

export function ModalCreateSession(props: ModalAddSongProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  // TODO: Add "useUser"
  // const dispatch = useAppDispatch();

  const handleConfirm = async (): Promise<void> => {
    setError('');
    if (name === '') {
      setError('Il nome non può essere vuoto');
    } else if (name.length > 25) {
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
) {
  /* const router = useRouter();
  const handleConfirm = async (): Promise<void> => {
    void router.push(Routes.Login);
  }; */

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
          <Grid>
            <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
              {props.title}
            </Typography>
          </Grid>
          <Grid>
            <Typography>{props.message}</Typography>
          </Grid>
          <Grid container direction="row" sx={{ mt: 2 }}>
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
          </Grid>
        </Grid>
      }
    />
  );
}

export function ModalAddPlaylist(props: GenericProps) {
  return <ModalEditNamePlaylist {...props} />;
}

interface PropsModalEditNamePlaylist extends GenericProps {
  playlist?: Playlist;
}

export function ModalEditNamePlaylist(props: PropsModalEditNamePlaylist) {
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
    } else if (name.length > 25) {
      setError('Il nome deve essere più corto di 25 caratteri');
    } else {
      if (props.playlist !== undefined) {
        modifyName();
      } else {
        await createPlaylist();
        if (typeof window === 'undefined') return;

        const { getAnalytics, logEvent } = await import('firebase/analytics');
        const fbApp = (await import('../logic/server/firebase_config')).default;
        const analytics = getAnalytics(fbApp);
        logEvent(analytics, 'create_playlist');
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
          <Grid>
            <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
              {props.playlist !== undefined
                ? 'Modifica nome'
                : 'Aggiungi una playlist'}
            </Typography>
          </Grid>
          <Grid>
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
          <Grid sx={{ mt: 1 }}>
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

const isValidLink = (link: string): boolean => /\S+\/\/\S+/.test(link.trim());

export function ProposeNewSongModal(props: GenericProps) {
  const { authUser, loading } = useFirebaseAuth();
  const [linkSong, setLinkSong] = useState('');
  const [linkChords, setLinkChords] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);

  // The modal stays mounted between openings, so start from a clean form
  // instead of showing the previous links and the previous error.
  useEffect(() => {
    if (props.open) {
      setLinkSong('');
      setLinkChords('');
      setError('');
      setDone(false);
      setLoadingFetch(false);
    }
  }, [props.open]);

  if (loading) {
    return null;
  }

  // Everyone is signed in anonymously on first visit, so `authUser` is
  // practically never null: an anonymous account is what we have to catch here,
  // as it has no email to reply to.
  if (authUser === null || authUser.isAnonymous) {
    return (
      <ModalCreateAccountForThisAction
        open={props.open}
        handleClose={props.handleClose}
        title="Accedi per proporre nuove canzoni"
        message="Crea un account per proporre nuove canzoni"
      />
    );
  }

  const sendProposal = async (): Promise<void> => {
    if (!isValidLink(linkSong)) {
      setError('Inserisci un link valido della canzone.');
      return;
    }
    if (linkChords.trim() !== '' && !isValidLink(linkChords)) {
      setError('Il link degli accordi non è valido.');
      return;
    }

    setError('');
    setLoadingFetch(true);
    try {
      const payload: EmailPayloadProposalSong = {
        linkSong: linkSong.trim(),
        linkChords: linkChords.trim()
      };
      const res = await fetch('/api/propose-song', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await authUser.getIdToken()}`
        },
        body: JSON.stringify(payload)
      });
      if (res.status === 200) {
        setDone(true);
        return;
      }
      if (res.status === 429) {
        setError('Hai inviato troppe proposte. Riprova più tardi.');
        return;
      }
      setError(
        "Errore nell'invio della proposta. Riprova, e se il problema persiste scrivici dalla pagina Feedback."
      );
    } catch (e) {
      console.error('Error sending the song proposal', e);
      setError(
        'Non è stato possibile inviare la proposta: controlla la connessione e riprova.'
      );
    } finally {
      setLoadingFetch(false);
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
          <Grid>
            <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
              Proponi una nuova canzone (beta)
            </Typography>
          </Grid>
          <Grid>
            <Typography>
              Inserisci il link (YouTube, Spotify, ecc.) della canzone che
              vorresti aggiungere. Se vuoi che venga inserita più velocemente,
              inserisci anche il link degli accordi.
            </Typography>
          </Grid>
          <Grid sx={{ mt: 2 }}>
            <TextField
              disabled={loadingFetch || done}
              sx={{ my: 1 }}
              value={linkSong}
              onChange={(e) => {
                setLinkSong(e.currentTarget.value);
              }}
              label="Link della canzone"
              fullWidth
            />
          </Grid>
          <Grid>
            <TextField
              disabled={loadingFetch || done}
              value={linkChords}
              onChange={(e) => {
                setLinkChords(e.currentTarget.value);
              }}
              sx={{ my: 1 }}
              label="Link degli accordi (opzionale)"
              fullWidth
            />
          </Grid>
          <Grid sx={{ mt: 1 }}>
            <Button
              disabled={loadingFetch}
              onClick={() => {
                if (done) {
                  props.handleClose();
                  return;
                }
                void sendProposal();
              }}
              variant="contained"
            >
              {loadingFetch ? (
                <CircularProgress size={20} />
              ) : done ? (
                'Fatto!'
              ) : (
                'Invia proposta'
              )}
            </Button>
          </Grid>
          {error && (
            <Grid sx={{ mt: 2 }}>
              <Typography color="error">{error}</Typography>
            </Grid>
          )}
          {done && (
            <Grid sx={{ mt: 2 }}>
              <Typography sx={{ color: 'green' }}>
                Proposta inviata con successo! Grazie per il tuo contributo.
              </Typography>
            </Grid>
          )}
        </Grid>
      }
    />
  );
}

interface PropsGenericModal extends GenericProps {
  content: React.ReactElement;
}

export const GenericModal = (props: PropsGenericModal) => {
  return (
    <Modal open={props.open} onClose={props.handleClose}>
      <Box
        sx={{
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
        }}
      >
        {props.content}
      </Box>
    </Modal>
  );
};
