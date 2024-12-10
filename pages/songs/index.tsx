import Container from '@mui/material/Container';
import NavBar from '@/components/navbar';
import { getLocalSongs } from '@/logic/local_logic';
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar';
import ListSongs from '@/components/list_songs';
import React from 'react';
import { NextSeo } from 'next-seo';

export default function SongsPage() {
  const localSongs = getLocalSongs();

  return (
    <>
      <NextSeo
        title="Canzoni"
        description="Qui troverai tutti i testi e accordi dei tuoi canti preferiti!"
        additionalMetaTags={[
          {
            name: 'keywords',
            content: 'accordi, canzoniere, chords, cristiani, testi'
          }
        ]}
      />
      <main>
        <Container>
          <PraisingAppBar title="Canzoni" homeVersion />
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
