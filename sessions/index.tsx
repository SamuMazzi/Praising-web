import Container from '@mui/material/Container';
import NavBar from '@/components/navbar';
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { ModalCreateSession } from '@/components/modals';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// import { getActiveSessions } from '@/logic/server/database'
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

// TODO: Il nuovo concept potrebbe essere che semplicemente tu tieni un "pallino" che ti dice se sei in una sessione o meno e se sei tu il proprietario o meno
// cosi da poter fare un "join" o un "leave" della sessione quando vuoi, e puoi vedere/fare le modifiche ai testi dei canti

interface ListSessionsProps {
  center: [number, number];
}

function ListSessions(props: ListSessionsProps) {
  const [sessions, setSessions] = useState<any[]>([]);

  const getActiveSessionsBasedOnPosition = async () => {
    // Find places within 500m of current position
    const radiusInM = 500;
    // const newSessions = await getActiveSessions(props.center, radiusInM);
    // setSessions(newSessions);
  };

  useEffect(() => {
    getActiveSessionsBasedOnPosition();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <List>
      {sessions.map((session) => {
        return (
          <ListItemButton key={session.id}>
            <ListItemIcon></ListItemIcon>
            <ListItemText primary={session.name} secondary={session.owner} />
          </ListItemButton>
        );
      })}
    </List>
  );
}

export default function SessionsPage() {
  const [openModal, setOpenModal] = useState(false);
  const [permissions, setPermissions] = useState<
    'granted' | 'prompt' | 'denied'
  >('prompt');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [error, setError] = useState('');

  function getCurrentPosition() {
    /* return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }); */
    // navigator.geolocation.watchPosition
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true }
    );
  }

  useEffect(() => {
    handlePermission();
  }, []);

  function handlePermission() {
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      setPermissions(result.state);
      result.addEventListener('change', () => {
        setPermissions(result.state);
      });
    });
  }

  return (
    <Container sx={{ minHeight: '100vh' }}>
      <PraisingAppBar title="Sessioni" />
      <Container sx={{ py: verticalPaddingAppBar + 2 }} />
      {permissions !== 'granted' && (
        <>
          <Typography onClick={getCurrentPosition}>
            Serve la tua posizione per usare questa funzionalità
          </Typography>
          <Button
            onClick={() => navigator.permissions.query({ name: 'geolocation' })}
          >
            Concedi i permessi
          </Button>
        </>
      )}
      {permissions === 'granted' && (
        <ListSessions center={[latitude, longitude]} />
      )}
      <Container sx={{ pb: 8 }} />
      <Box display="flex" justifyContent="center">
        <Button
          sx={{ borderRadius: 4 }}
          color="primary"
          style={{ position: 'fixed', bottom: 80 }}
          variant="contained"
          onClick={() => setOpenModal(true)}
          disableElevation
        >
          Inizia una sessione
        </Button>
      </Box>
      <NavBar />
      <ModalCreateSession
        open={openModal}
        handleClose={() => setOpenModal(false)}
        location={[latitude, longitude]}
      />
    </Container>
  );
}
