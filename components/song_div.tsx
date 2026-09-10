import { type InfoLocalSong } from '@/logic/redux/info_song_slice';
import React from 'react';

interface PropsSongDiv {
  html: string;
  infoSong: InfoLocalSong | undefined;
}

export const SongDiv = (props: PropsSongDiv) => {
  return (
    // Accordi e testo non vanno mai tradotti: la traduzione automatica del
    // browser riscrive i nodi di testo e cosi' perde gli accordi (che sono
    // <span> allineati alle sillabe) e storpia le parole del canto.
    <div lang="it" translate="no" className="notranslate">
      <p
        lang="it"
        translate="no"
        className="notranslate"
        style={{ fontSize: props.infoSong?.zoom ?? 17, marginTop: '1.2rem' }}
        dangerouslySetInnerHTML={{ __html: props.html }}
      />
    </div>
  );
};
