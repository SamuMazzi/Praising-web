import ListItemButton from '@mui/material/ListItemButton';
import Container from '@mui/material/Container';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import NavBar from '@/components/navbar';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { NextLinkComposed } from '@/components/link_composed';
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar';
import {
  filterArgomenti,
  filterMomenti,
  getFromStorage,
  getLastRecentsSongs,
  getSingleSong,
  saveToStorage
} from '@/logic/local_logic';
import Routes from '@/logic/routes';
import ListSongs from '@/components/list_songs';
import Link from 'next/link';
import React, { useState } from 'react';
import { ModalNews } from '@/components/modals';
import Carousel from '@/components/carousel';

const NEWS_UPDATE = 'newsUpdate_0';
// TODO: Swiper for arguments and parts
// https://codesandbox.io/p/devbox/swiper-react-effect-coverflow-6pxf4v?file=%2Fsrc%2FApp.jsx%3A26%2C22
// https://swiperjs.com/react#effects

export default function Home(): JSX.Element {
  const recentSongs = getLastRecentsSongs()
    .map((id) => getSingleSong(id))
    .filter((v) => v !== undefined);
  const [showNews, setShowNews] = useState(getFromStorage(NEWS_UPDATE) ?? true);

  return (
    <Container disableGutters sx={{ minHeight: '100vh' }}>
      <PraisingAppBar title="Home" homeVersion />
      <Typography
        variant="h2"
        sx={{ pt: verticalPaddingAppBar * 3 + 2, pl: 2 }}
      >
        Parti della messa
      </Typography>
      <List
        style={{ width: '100%', overflow: 'auto', display: 'flex' }}
        sx={{ py: 2 }}
      >
        <Carousel idDiv='carousel-parts' items={Object.keys(filterMomenti).map((momento) => {
          return (
            <ListItemButton
              LinkComponent={Link}
              href={Routes.FilteredSongs + '/' + momento}
              key={momento}
              style={{ width: 150, height: 75 }}
              sx={{ mx: 1, backgroundColor: '#F5DA81', borderRadius: 2 }}
            >
              <ListItemText
                disableTypography
                primary={
                  <Typography
                    textAlign="center"
                    variant="h5"
                    style={{ color: 'black' }}
                  >
                    {filterMomenti[momento]}
                  </Typography>
                }
              />
            </ListItemButton>
          );
        })} />
      </List>
      <Typography variant="h2" sx={{ pt: 2, pl: 2 }}>
        Argomenti
      </Typography>
      {/* https://stackoverflow.com/questions/68658249/how-to-do-react-horizontal-scroll-using-mouse-wheel */}
      <List
        style={{ width: '100%', overflowX: 'auto', display: 'flex' }}
        sx={{ py: 2 }}
      >
        <Carousel idDiv='carouse-arguments' titles={Object.values(filterArgomenti)} items=
        {Object.keys(filterArgomenti).map((arg) => {
          /* return (
            <ListItemButton
              LinkComponent={Link}
              href={Routes.FilteredSongs + '/' + arg}
              key={arg}
              disableGutters
              style={{ width: 100, height: 100 }}
              sx={{ mx: 1, borderRadius: 2 }}
            >
              <Image
                src={`/assets/Illustrazioni/${filterArgomenti[arg]}2.png`}
                alt={filterArgomenti[arg]}
                width={100}
                height={100}
              />
            </ListItemButton>
          ); */
          return (
            <Container
              disableGutters
              key={arg}
              sx={{ mx: 1, alignItems: 'center', cursor: 'pointer' }}
            >
              <Link href={Routes.FilteredSongs + '/' + arg}>
                <Image
                  src={`/assets/Illustrazioni/${filterArgomenti[arg]}2.png`}
                  alt={filterArgomenti[arg]}
                  width={100}
                  height={100}
                />
              </Link>
            </Container>
          );
        })} />
      </List>
      {recentSongs.length > 0 && (
        <Container sx={{ pb: 7 }}>
          <Typography variant="h2" sx={{ pt: 2, pb: 2, pl: 2 }}>
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
      <NavBar />
      <ModalNews
        open={showNews}
        handleClose={() => {
          setShowNews(false);
          saveToStorage(NEWS_UPDATE, false);
        }}
      />
    </Container>
  );
}
