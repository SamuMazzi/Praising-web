'use client';

import Container from '@mui/material/Container';
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar';
import { useState } from 'react';
import Button from '@mui/material/Button';
import Image from 'next/image';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import {
  SignError,
  signInWithGoogle,
  signInWithEmail,
  logout
} from '@/logic/server/auth';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useRouter } from 'next/router';
import useFirebaseAuth from '@/logic/hooks/use_auth';
import { type User } from 'firebase/auth';
import { GenericModal } from '@/components/modals';

export default function LoginPage() {
  const { authUser, loading } = useFirebaseAuth();
  return (
    <main>
      <Container sx={{ minHeight: '100vh' }}>
        <PraisingAppBar
          title={
            !loading ? (authUser !== null ? 'Dettagli account' : 'Accedi') : ''
          }
          backIcon
        />
        <Container sx={{ py: verticalPaddingAppBar + 2 }} />
        <SignCard />
      </Container>
    </main>
  );
}

interface PropsInfoUserPage {
  authUser: User;
}

function InfoUser(props: PropsInfoUserPage) {
  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      spacing={2}
    >
      <Grid>
        <Typography whiteSpace="pre-wrap" textAlign="center">
          {'Ciao, ora che sei iscritto puoi salvare le tue preferenze e i tuoi canti preferiti.\n' +
            'Presto saranno disponibili nuove funzionalità!'}
        </Typography>
      </Grid>
      <Grid display="flex" whiteSpace="pre-wrap" alignItems="center">
        <Typography>La tua email:</Typography>
        <Typography variant="h5" component="h5">
          {' ' + props.authUser.email}
        </Typography>
      </Grid>
      <Grid>
        <Button
          variant="contained"
          onClick={() => {
            void logout();
          }}
        >
          Logout
        </Button>
      </Grid>
    </Grid>
  );
}

function SignCard() {
  const { authUser, loading } = useFirebaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [loadingSign, setLoadingSign] = useState(false);
  const [warningModal, setWarningModal] = useState(false);
  const [callbackSign, setCallbackSign] = useState<CallableFunction>(() => {});
  const router = useRouter();

  const onSignEmailClick = async (type: 'login' | 'signup'): Promise<void> => {
    if (loading || !authUser) return;
    setErrorEmail('');
    setErrorPassword('');
    if (email === '') {
      setErrorEmail('Inserisci una email');
      return;
    }
    if (password === '' || password.length < 6) {
      setErrorPassword('Inserisci una password di almeno 6 caratteri');
      return;
    }
    try {
      setLoadingSign(true);
      await signInWithEmail(type, authUser, email, password);
      void router.replace('/');
    } catch (e: unknown) {
      if (e instanceof SignError) {
        setErrorEmail(e.message);
      }
    } finally {
      setLoadingSign(false);
    }
  };

  const onGoogleClick = async (): Promise<void> => {
    if (loading || !authUser) return;
    try {
      setLoadingSign(true);
      await signInWithGoogle(authUser);
    } catch (e) {
      console.log(e);
      if (e instanceof Error) {
        setErrorEmail(e.message as string);
      }
    } finally {
      setLoadingSign(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="90vh"
    >
      <Card
        elevation={8}
        sx={{ borderRadius: 8, borderWidth: 10, borderColor: 'black', p: 3 }}
      >
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <Grid sx={{ mb: 1 }}>
            <Typography
              variant="h3"
              component="h3"
              sx={{ textAlign: 'center' }}
            >
              {!loading && authUser?.email != null
                ? 'Benvenuti!'
                : 'Entra su Praising!'}
            </Typography>
          </Grid>
          <Grid sx={{ pb: 6, pt: 3 }}>
            <Image
              src="assets/undraw_illustrations/undraw_access_account.svg"
              alt="Compose music"
              width="230"
              height="230"
            />
          </Grid>
          {!loading ? (
            authUser?.email !== null ? (
              <InfoUser authUser={authUser!} />
            ) : (
              <>
                <Grid sx={{ mb: 2 }}>
                  <TextField
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    label="Email"
                    helperText={errorEmail}
                  />
                </Grid>
                <Grid>
                  <TextField
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    label="Password"
                    helperText={errorPassword}
                    type="password"
                  />
                </Grid>
                <Grid sx={{ mt: 2 }}>
                  <Box display="flex">
                    <Button
                      sx={{ mr: 2 }}
                      variant="contained"
                      onClick={() => {
                        setCallbackSign(() => () => onSignEmailClick('login'));
                        setWarningModal(true);
                      }}
                      disabled={loadingSign}
                    >
                      Accedi
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        void onSignEmailClick('signup');
                      }}
                      disabled={loadingSign}
                    >
                      Registrati
                    </Button>
                  </Box>
                </Grid>
                <Divider flexItem sx={{ my: 2 }} textAlign="center">
                  Oppure
                </Divider>
                <Grid>
                  <Button
                    variant="outlined"
                    startIcon={
                      <Image
                        src="/assets/Illustrazioni/google_logo.webp"
                        alt="Google logo"
                        width={20}
                        height={20}
                      />
                    }
                    disabled={loadingSign}
                    onClick={() => {
                      setCallbackSign(() => () => onGoogleClick());
                      setWarningModal(true);
                    }}
                    style={{ textTransform: 'none' }}
                  >
                    Accedi con Google
                  </Button>
                </Grid>
                {loadingSign && (
                  <Grid sx={{ mt: 2 }}>
                    <CircularProgress />
                  </Grid>
                )}
              </>
            )
          ) : (
            <CircularProgress />
          )}
        </Grid>
      </Card>
      <GenericModal
        open={warningModal}
        handleClose={() => setWarningModal(false)}
        content={
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            <Grid>
              <Typography>
                Se accedi con un account già registrato, perderai tutti i dati
                salvati salvati fino ad adesso (per esempio playlist, canti
                preferiti, ecc).
              </Typography>
            </Grid>
            <Grid>
              <Box display="flex" justifyContent="center" mt={2}>
                <Button
                  variant="contained"
                  onClick={() => {
                    callbackSign();
                    setCallbackSign(() => {});
                    setWarningModal(false);
                  }}
                >
                  Continua
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setWarningModal(false)}
                >
                  Indietro
                </Button>
              </Box>
            </Grid>
          </Grid>
        }
      />
    </Box>
  );
}
