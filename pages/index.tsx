'use client';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import NavBar from '@/components/navbar';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { NextLinkComposed } from '@/components/link_composed';
import PraisingAppBar from '@/components/appbar';
import {
  filterArgomenti,
  getSingleSong,
  RECENTS_KEY,
  type Song
} from '@/logic/local_logic';
import Routes from '@/logic/routes';
import ListSongs from '@/components/list_songs';
import MassParts from '@/components/mass_parts';
import { useMemo, useState, useSyncExternalStore } from 'react';
import { NextSeo } from 'next-seo';

// const NEWS_UPDATE = 'newsUpdate_0';
// TODO: Swiper for arguments and parts
// https://codesandbox.io/p/devbox/swiper-react-effect-coverflow-6pxf4v?file=%2Fsrc%2FApp.jsx%3A26%2C22
// https://swiperjs.com/react#effects

/** I recenti stanno in localStorage, che sul server non esiste: il valore va
 *  letto dopo l'hydration, altrimenti il markup del server e quello del client
 *  non coincidono. Lo snapshot e' la stringa grezza, cosi' resta stabile fra
 *  un render e l'altro. */
const subscribeToRecents = (): (() => void) => () => {};
const getRecentsSnapshot = (): string =>
  window.localStorage.getItem(RECENTS_KEY) ?? '';
const getRecentsServerSnapshot = (): string => '';

export default function Home() {
  const rawRecents = useSyncExternalStore(
    subscribeToRecents,
    getRecentsSnapshot,
    getRecentsServerSnapshot
  );
  const recentSongs: Song[] = useMemo(() => {
    // Gli id vanno letti dallo snapshot, non da localStorage: durante
    // l'hydration lo snapshot e' quello del server (stringa vuota) e leggere
    // direttamente lo storage farebbe divergere il markup.
    if (rawRecents === '') return [];
    let ids: string[];
    try {
      ids = JSON.parse(rawRecents) as string[];
    } catch {
      return [];
    }
    if (!Array.isArray(ids)) return [];
    return ids.map((id) => getSingleSong(id)).filter((v) => v !== undefined);
  }, [rawRecents]);
  const [updatesIsShown, setUpdatesIsShown] = useState(false);

  return (
    <>
      <NextSeo
        titleTemplate="%s"
        title="Praising - Gli accordi per i tuoi canti cristiani"
        description="Accordi e testi dei canti cristiani per la messa: trasporta gli accordi, crea le tue playlist, leggi la liturgia del giorno ed esporta in PDF."
        canonical={Routes.Base + '/'}
        openGraph={{
          title: 'Praising - Gli accordi per i tuoi canti cristiani',
          description:
            'Accordi e testi dei canti cristiani per la messa: trasporta gli accordi, crea le tue playlist ed esporta in PDF.',
          url: Routes.Base + '/',
          type: 'website',
          locale: 'it_IT'
        }}
      />
      <main>
        <Container disableGutters sx={{ minHeight: '100vh' }}>
          <PraisingAppBar
            title="Praising"
            homeVersion
            setShowUpdates={setUpdatesIsShown}
            addSongIcon
          />
          <MassParts />
          <Typography variant="h2" component="h2" sx={{ pt: 2, px: 2 }}>
            Argomenti
          </Typography>
          {/* https://stackoverflow.com/questions/68658249/how-to-do-react-horizontal-scroll-using-mouse-wheel */}
          <ImageList
            style={{ width: '100%', overflowX: 'auto', display: 'flex' }}
            sx={{ py: 2, pl: 2 }}
          >
            {Object.keys(filterArgomenti).map((arg) => {
              return (
                <ImageListItem key={arg} sx={{ mx: 0.5, alignItems: 'center' }}>
                  <NextLinkComposed
                    to={{ pathname: Routes.FilteredSongs + '/' + arg }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textDecoration: 'none'
                    }}
                  >
                    <Image
                      src={
                        '/assets/Illustrazioni/' +
                        filterArgomenti[arg] +
                        '2.webp'
                      }
                      alt=""
                      width={100}
                      height={100}
                    />
                    <Typography
                      textAlign="center"
                      variant="h5"
                      component="span"
                    >
                      {filterArgomenti[arg]}
                    </Typography>
                  </NextLinkComposed>
                </ImageListItem>
              );
            })}
          </ImageList>
          {recentSongs.length > 0 && (
            <Container sx={{ pb: 7 }}>
              <Typography variant="h2" component="h2" sx={{ pt: 2, pl: 2 }}>
                Gli ultimi canti scelti
              </Typography>
              <ListSongs
                songs={recentSongs}
                mode="normal"
                withSearch={false}
                auto_sorting={false}
              />
            </Container>
          )}
          {!updatesIsShown && <NavBar />}
        </Container>
      </main>
    </>
  );
}
