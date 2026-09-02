'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import CloudDoneRoundedIcon from '@mui/icons-material/CloudDoneRounded';
import CloudDownloadRoundedIcon from '@mui/icons-material/CloudDownloadRounded';
import {
  countCached,
  countExpected,
  isOfflineSupported,
  warmOffline
} from '@/logic/offline_cache';

/**
 * Voce di impostazioni per rendere tutto il repertorio apribile senza rete,
 * anche da link diretto o dopo un refresh.
 *
 * I testi dei canti sono gia' offline da soli (i `.crd` stanno nel precache e
 * i dati delle pagine si scaricano all'avvio). Qui si scaricano i documenti
 * HTML, che pesano molto di piu' e servono solo all'apertura a freddo: per
 * questo sono su richiesta esplicita e non automatici.
 */
export default function OfflineAvailability() {
  const [supported, setSupported] = useState(false);
  const [cached, setCached] = useState(0);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const total = countExpected('pages');

  const refresh = useCallback(() => {
    // setState dentro la callback della promise, non nel corpo dell'effetto:
    // e' un aggiornamento che arriva da un sistema esterno (CacheStorage).
    void countCached('pages').then((done) => {
      setSupported(isOfflineSupported());
      setCached(done);
    });
  }, []);

  useEffect(refresh, [refresh]);

  if (!supported || total === 0) return null;

  const complete = cached >= total;

  const onClick = (): void => {
    if (running) return;
    setRunning(true);
    setProgress(cached / total);
    void warmOffline('pages', (p) => {
      setProgress(p.total === 0 ? 1 : p.done / p.total);
    })
      .then(() => {
        refresh();
      })
      .finally(() => {
        setRunning(false);
      });
  };

  const secondary = running
    ? `Scaricamento in corso… ${Math.round(progress * 100)}%`
    : complete
      ? `Tutti i ${total} canti sono apribili senza rete`
      : `${cached} di ${total} pronti — tocca per scaricare il resto`;

  return (
    <Box sx={{ width: '100%' }}>
      <ListItemButton onClick={onClick} disabled={running}>
        <ListItemIcon>
          {complete && !running ? (
            <CloudDoneRoundedIcon color="success" />
          ) : (
            <CloudDownloadRoundedIcon />
          )}
        </ListItemIcon>
        {/* Lo stato cambia da solo mentre il download va avanti: senza
            `aria-live` chi usa uno screen reader non lo saprebbe mai. */}
        <ListItemText
          primary="Disponibilità offline"
          secondary={secondary}
          slotProps={{ secondary: { 'aria-live': 'polite' } }}
        />
      </ListItemButton>
      {running && (
        <LinearProgress
          variant="determinate"
          value={progress * 100}
          aria-label="Avanzamento del download dei canti"
        />
      )}
    </Box>
  );
}
