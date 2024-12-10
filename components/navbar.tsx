import { NextLinkComposed } from '@/components/link_composed';
import Routes from '@/logic/routes';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import LibraryMusicRoundedIcon from '@mui/icons-material/LibraryMusicRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import ListRoundedIcon from '@mui/icons-material/ListRounded';

export default function NavBar() {
  const router = useRouter();
  const pages = ['Home', 'Canti', 'Letture', 'Playlist'];
  const routesPages = [
    Routes.Home,
    Routes.Songs,
    Routes.LetturaDelGiorno,
    Routes.Playlist
  ];
  const iconsPages = [
    <HomeRoundedIcon key={'home_icon'} />,
    <LibraryMusicRoundedIcon key={'songs_icon'} />,
    <MenuBookRoundedIcon key={'lectures_icon'} />,
    <ListRoundedIcon key={'playlist_icon'} />
  ];
  const findIndexOfPage = (): number => {
    for (let i = routesPages.length; i >= 0; i--) {
      if (router.asPath.includes(routesPages[i])) {
        return i;
      }
    }
    return 0;
  };
  const [pageSelected, setPageSelected] = useState(findIndexOfPage());

  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      elevation={3}
      className="navbar"
    >
      <BottomNavigation
        showLabels
        value={pageSelected}
        onChange={(_, newValue) => {
          setPageSelected(newValue as number);
        }}
        style={{ backgroundColor: 'transparent' }}
      >
        {pages.map((page, index) => {
          return (
            <BottomNavigationAction
              key={page}
              label={page}
              icon={iconsPages[index]}
              component={NextLinkComposed}
              to={{
                pathname: routesPages[index]
              }}
            />
          );
        })}
      </BottomNavigation>
    </Paper>
  );
}
