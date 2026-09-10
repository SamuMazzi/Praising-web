'use client';

import List from '@mui/material/List';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { type Song } from '@/logic/local_logic';

/**
 * Lista di canti che monta solo le tile effettivamente visibili.
 *
 * Il repertorio e' di oltre 230 canti e ogni tile e' un `ListItem` MUI con
 * icona, testo secondario e un `IconButton`: montarle tutte insieme voleva
 * dire qualche migliaio di nodi e altrettante regole emotion a ogni apertura
 * della pagina Canti. Qui ne restano in pagina una decina, quelle nella
 * finestra di scorrimento piu' un po' di margine.
 *
 * Si usa il virtualizer "di finestra" perche' a scorrere e' la pagina, non un
 * contenitore interno: la barra di navigazione in basso e lo scroll nativo
 * restano quelli di prima.
 */

/** Altezza di partenza di una tile, prima che venga misurata davvero. */
const ESTIMATED_TILE_HEIGHT = 76;

interface PropsVirtualizedSongList {
  songs: Song[];
  children: (song: Song) => React.ReactNode;
}

export default function VirtualizedSongList(props: PropsVirtualizedSongList) {
  const listRef = useRef<HTMLDivElement | null>(null);
  // Quanto della pagina sta sopra la lista: serve al virtualizer per tradurre
  // lo scroll della finestra in indici. Va riletto dopo il mount (a quel
  // punto la ref esiste) e a ogni resize, perche' l'appbar cambia altezza.
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    const update = (): void => {
      setScrollMargin(listRef.current?.offsetTop ?? 0);
    };
    update();
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
    };
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: props.songs.length,
    estimateSize: () => ESTIMATED_TILE_HEIGHT,
    overscan: 6,
    scrollMargin,
    getItemKey: (index) => props.songs[index].id
  });

  return (
    // `component="div"`: le tile sono ancore, non `<li>`, e i contenitori di
    // posizionamento del virtualizer non sarebbero figli validi di un `<ul>`.
    <List
      component="div"
      ref={listRef}
      sx={{ position: 'relative', height: virtualizer.getTotalSize() }}
    >
      {virtualizer.getVirtualItems().map((item) => (
        <div
          key={item.key}
          data-index={item.index}
          ref={virtualizer.measureElement}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${item.start - scrollMargin}px)`
          }}
        >
          {props.children(props.songs[item.index])}
        </div>
      ))}
    </List>
  );
}
