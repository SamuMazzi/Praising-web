'use client';

import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import { useRouter } from 'next/router';
import useFirebaseAuth from '@/logic/hooks/use_auth';
import Routes from '@/logic/routes';
import type { UserNotification } from '@/logic/server/database';

/** Firestore entra in gioco solo quando c'e' davvero un avviso da chiudere. */
const database = async () => await import('@/logic/server/database');

/**
 * Avvisa chi ha proposto un canto che il canto e' stato pubblicato.
 *
 * Gli avvisi arrivano dal documento dell'utente, che `useFirebaseAuth` legge
 * gia' all'avvio: qui non si fa nessuna lettura in piu'. Ne mostriamo uno
 * alla volta, il piu' vecchio, e alla chiusura lo togliamo dal profilo, cosi'
 * non ricompare al prossimo accesso ne' sugli altri dispositivi.
 */
export default function NotificationSongPublished() {
  const { authUser, infoProfile } = useFirebaseAuth();
  const router = useRouter();
  /* Chiusi in questa sessione: il profilo in memoria non si rilegge. */
  const [dismissed, setDismissed] = useState<string[]>([]);

  const current: UserNotification | undefined = useMemo(() => {
    const pending = (infoProfile?.notifications ?? []).filter(
      (n) => !dismissed.includes(n.id)
    );
    return [...pending].sort(
      (a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)
    )[0];
  }, [infoProfile, dismissed]);

  if (current === undefined) return null;

  const dismiss = async (notification: UserNotification): Promise<void> => {
    setDismissed((prev) => [...prev, notification.id]);
    if (authUser === null) return;
    try {
      await (
        await database()
      ).dismissUserNotification(authUser.uid, notification);
    } catch (e) {
      // Se la scrittura fallisce l'avviso tornera' al prossimo accesso:
      // fastidioso, non grave, e comunque meglio che perderlo.
      console.error('Avviso non archiviato', e);
    }
  };

  const open = async (notification: UserNotification): Promise<void> => {
    await router.push(`${Routes.Songs}/${notification.songId}`);
    await dismiss(notification);
  };

  return (
    <Snackbar
      open
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      onClose={(_event, reason) => {
        if (reason !== 'clickaway') void dismiss(current);
      }}
    >
      <Alert
        severity="success"
        variant="filled"
        onClose={() => {
          void dismiss(current);
        }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              void open(current);
            }}
          >
            Apri
          </Button>
        }
      >
        {`"${current.songName}" che hai proposto è ora nel repertorio. Grazie!`}
      </Alert>
    </Snackbar>
  );
}
