import Container from '@mui/material/Container';
import NavBar from '@/components/navbar';
import { getLocalSongs } from '@/logic/local_logic';
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar';
import ListSongs from '@/components/list_songs';
import React from 'react';
import { NextSeo } from 'next-seo';
import Routes from '@/logic/routes';

export default function SongsPage() {
  const localSongs = getLocalSongs();

  return (
    <>
      <NextSeo
        title="Canzoni - accordi e testi dei canti cristiani"
        description="Tutti i testi e gli accordi dei canti cristiani per la messa: cerca un canto, trasporta gli accordi ed esporta in PDF."
        canonical={Routes.Base + Routes.Songs}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: 'accordi, canzoniere, chords, cristiani, testi'
          }
        ]}
      />
      <main>
        <Container>
          <PraisingAppBar title="Canzoni" homeVersion addSongIcon />
          <Container
            disableGutters
            sx={{ pt: verticalPaddingAppBar * 3 + 2, pb: 7 }}
          >
            <ListSongs songs={localSongs} mode="normal" withSearch />
          </Container>
          <NavBar />
        </Container>
      </main>
    </>
  );
}
