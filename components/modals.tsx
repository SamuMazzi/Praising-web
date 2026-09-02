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
import { addProposedSong } from '@/logic/server/database';
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

interface PropsConfirmModal extends GenericProps {
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
}

/**
 * Conferma per le azioni distruttive: niente di irreversibile deve partire da
 * un solo tocco, tanto piu' su mobile dove il dito ci finisce per sbaglio.
 */
export function ConfirmModal(props: PropsConfirmModal) {
  return (
    <GenericModal
      open={props.open}
      handleClose={props.handleClose}
      content={
        <Grid container direction="column" alignItems="center">
          <Grid>
            <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
              {props.title}
            </Typography>
          </Grid>
          <Grid>
            <Typography textAlign="center">{props.message}</Typography>
          </Grid>
          <Grid
            container
            direction="row"
            justifyContent="center"
            sx={{ mt: 3, gap: 2 }}
          >
            <Button variant="outlined" onClick={props.handleClose}>
              Annulla
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                props.onConfirm();
                props.handleClose();
              }}
            >
              {props.confirmLabel}
            </Button>
          </Grid>
        </Grid>
      }
    />
  );
}

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
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [chordpro, setChordpro] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);

  // The modal stays mounted between openings, so start from a clean form
  // instead of showing the previous links and the previous error.
  useEffect(() => {
    if (props.open) {
      setLinkSong('');
      setLinkChords('');
      setName('');
      setAuthor('');
      setChordpro('');
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

    if (name.trim() === '') {
      setError('Serve il titolo del canto.');
      return;
    }

    setError('');
    setLoadingFetch(true);
    try {
      // La proposta vive su Firestore: e' li' che la coda di revisione la
      // trova e da li' il build genera il canto. La mail resta, ma come
      // notifica, non piu' come unico posto in cui la proposta esiste.
      await addProposedSong({
        name: name.trim(),
        author: author.trim(),
        linkSong: linkSong.trim(),
        linkChords: linkChords.trim(),
        chordpro: chordpro.trim(),
        userId: authUser.uid,
        email: authUser.email ?? ''
      });

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
      // La proposta e' gia' salvata: se salta solo la mail di notifica
      // l'utente non deve rimandarla, la coda la vede lo stesso.
      if (res.status !== 200) {
        console.error('Proposta salvata ma notifica non inviata', res.status);
      }
      setDone(true);
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
              Inserisci il titolo e il link (YouTube, Spotify, ecc.) della
              canzone che vorresti aggiungere. Se sai trascrivere gli accordi
              puoi incollarli qui sotto: il canto verrà pubblicato molto più in
              fretta.
            </Typography>
          </Grid>
          <Grid sx={{ mt: 2 }} width="100%">
            <TextField
              disabled={loadingFetch || done}
              sx={{ my: 1 }}
              value={name}
              onChange={(e) => {
                setName(e.currentTarget.value);
              }}
              label="Titolo del canto"
              name="titolo"
              fullWidth
            />
          </Grid>
          <Grid width="100%">
            <TextField
              disabled={loadingFetch || done}
              sx={{ my: 1 }}
              value={author}
              onChange={(e) => {
                setAuthor(e.currentTarget.value);
              }}
              label="Autore (opzionale)"
              name="autore"
              fullWidth
            />
          </Grid>
          <Grid width="100%">
            <TextField
              disabled={loadingFetch || done}
              sx={{ my: 1 }}
              value={linkSong}
              onChange={(e) => {
                setLinkSong(e.currentTarget.value);
              }}
              label="Link della canzone"
              name="link-canzone"
              type="url"
              slotProps={{
                htmlInput: {
                  inputMode: 'url',
                  autoComplete: 'off',
                  autoCapitalize: 'off',
                  spellCheck: false
                }
              }}
              fullWidth
            />
          </Grid>
          <Grid width="100%">
            <TextField
              disabled={loadingFetch || done}
              value={linkChords}
              onChange={(e) => {
                setLinkChords(e.currentTarget.value);
              }}
              sx={{ my: 1 }}
              label="Link degli accordi (opzionale)"
              name="link-accordi"
              type="url"
              slotProps={{
                htmlInput: {
                  inputMode: 'url',
                  autoComplete: 'off',
                  autoCapitalize: 'off',
                  spellCheck: false
                }
              }}
              fullWidth
            />
          </Grid>
          <Grid width="100%">
            <TextField
              disabled={loadingFetch || done}
              value={chordpro}
              onChange={(e) => {
                setChordpro(e.currentTarget.value);
              }}
              sx={{ my: 1 }}
              label="Accordi e testo (opzionale)"
              name="accordi"
              slotProps={{
                htmlInput: {
                  autoCapitalize: 'off',
                  autoCorrect: 'off',
                  spellCheck: false
                }
              }}
              placeholder={'[Do]Nel mio [Sol]cuore\n[Lam]canto a [Fa]Te'}
              helperText="Formato ChordPro: gli accordi fra parentesi quadre, prima della sillaba su cui cadono."
              multiline
              minRows={4}
              maxRows={12}
              fullWidth
            />
          </Grid>
          <Grid sx={{ mt: 1 }}>
            <Button
              disabled={loadingFetch}
              aria-label={loadingFetch ? 'Invio in corso…' : undefined}
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
                <CircularProgress size={20} aria-hidden="true" />
              ) : done ? (
                'Fatto!'
              ) : (
                'Invia proposta'
              )}
            </Button>
          </Grid>
          {/* Esito e errore compaiono dopo l'invio: senza `aria-live` chi non
              vede lo schermo non saprebbe se la proposta e' partita. */}
          <Grid sx={{ mt: 2 }} aria-live="polite">
            {error && <Typography color="error">{error}</Typography>}
            {done && (
              <Typography sx={{ color: 'success.main' }}>
                Proposta inviata con successo! Grazie per il tuo contributo.
              </Typography>
            )}
          </Grid>
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
