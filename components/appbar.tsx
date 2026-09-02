'use client';

import Slide from '@mui/material/Slide';
import CssBaseline from '@mui/material/CssBaseline';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import React, { useEffect } from 'react';
import Toolbar from '@mui/material/Toolbar';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import IconButton from '@mui/material/IconButton';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import Routes from '@/logic/routes';
import Link from 'next/link';
import { NextLinkComposed } from './link_composed';
import { useAppDispatch, useAppSelector } from '@/logic/redux/store';
import { modifySong } from '@/logic/redux/info_song_slice';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
// import { setChordNotation } from '@/logic/redux/settings_slice';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import {
  addSongToFavoriteSongs,
  removeSongFromFavoriteSongs
} from '@/logic/redux/user_info_slice';
import { MenuPlaylist } from './menus';
// import { SOLFEGE, SYMBOL } from 'chordsheetjs';
import { type Playlist, type CustomSongInfo } from '@/logic/server/database';
/** Firestore (~250 kB) non serve per disegnare la pagina: lo carichiamo solo
 *  quando l'utente fa davvero un'azione che tocca il server. */
const database = async () => await import('@/logic/server/database');

import assert from 'assert';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import InterpreterModeRoundedIcon from '@mui/icons-material/InterpreterModeRounded';
import { PrintButton } from './print_button';
import { useSchemePalette } from '@/styles/theme';
import useFirebaseAuth from '@/logic/hooks/use_auth';
import dynamic from 'next/dynamic';

/** Le novita' si aprono raramente: framer-motion (~78 kB) resta fuori dal
 *  bundle iniziale e il componente si monta solo al primo click. */
const AnimatedOnboardingSlider = dynamic(
  async () => await import('./onboard'),
  { ssr: false }
);
import { ShareSong } from './shares';
import Zoom from '@mui/material/Zoom';
import { ProposeNewSongModal } from './modals';

// This is really useful in the case we'll ever want to split a song in multiple pages (in case it's too long)
/*
interface ColorObj {
  r: string,
  g: string,
  b: string,
  a: string
}

function analyzeLyricsImageCrop(imageData: string, width: number, height: number) {  
  // If the original image is already shorter than the cropped height, no cropping is needed
  if (height <= PAGE_HEIGHT) {
    return {
      isCropped: false,
      suggestedCropHeight: height,
      message: "No cropping needed. Image already fits A4 format."
    };
  }
  
  let lastTextLine = -1;
  
  // Start checking from the bottom of the image
  for (let y = height - 1; y >= 0; y--) {
    let isLineSameColor = true;
    const baseColor = getPixelColor(imageData, 0, y, width);
    
    for (let x = 1; x < width; x++) {
      const pixelColor = getPixelColor(imageData, x, y, width);
      if (!areColorsEqual(baseColor, pixelColor)) {
        isLineSameColor = false;
        break;
      }
    }
    
    // If we find a line that's not all the same color, it means we've hit text
    if (!isLineSameColor) {
      lastTextLine = y;
      break;
    }
  }
  
  // If we didn't find any text, the image can be cropped to ideal A4 size
  if (lastTextLine === -1) {
    return {
      isCropped: height > PAGE_HEIGHT,
      suggestedCropHeight: PAGE_HEIGHT,
      message: "No lyrics detected. Image can be cropped to ideal A4 size."
    };
  }
  
  // Calculate the suggested crop height
  const suggestedCropHeight = Math.min(height, lastTextLine + 1);
  
  // Check if the suggested crop height is less than the ideal A4 height
  if (suggestedCropHeight < PAGE_HEIGHT) {
    return {
      isCropped: true,
      suggestedCropHeight: suggestedCropHeight,
      message: "Lyrics detected. Crop to " + suggestedCropHeight + " pixels height to avoid intersecting lyrics. Note: This will result in an image shorter than ideal A4 format."
    };
  } else {
    return {
      isCropped: height > PAGE_HEIGHT,
      suggestedCropHeight: PAGE_HEIGHT,
      message: "Lyrics detected, but can crop to ideal A4 size without intersecting lyrics."
    };
  }
}

function getPixelColor(imageData: string, x: number, y: number, width: number) {
  const index = (y * width + x) * 4;
  return {
    r: imageData[index],
    g: imageData[index + 1],
    b: imageData[index + 2],
    a: imageData[index + 3]
  };
}

function areColorsEqual(color1: ColorObj, color2: ColorObj) {
  return color1.r === color2.r && 
         color1.g === color2.g && 
         color1.b === color2.b && 
         color1.a === color2.a;
}

function splitSongInPages(pdf, canvas) {
  const originalHeight = canvas.height * PAGE_WIDTH / canvas.width;
  const result = analyzeLyricsImageCrop(imgData, imgWidth, originalHeight);
  let imgHeight = result.suggestedCropHeight;

  pdf.setFillColor(theme.palette.background.default);
  pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT + x_offset, 'F');
  pdf.addImage(imgData, 'PNG', x_offset, y_position, imgWidth, imgHeight);
  let heightLeft = originalHeight - imgHeight;

  while (heightLeft > 0) {
    y_position += heightLeft - imgHeight; // top padding for other pages
    pdf.addPage();
    pdf.setFillColor(theme.palette.background.default);
    pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT + x_offset, 'F');
    pdf.addImage(imgData, 'PNG', x_offset, y_position, imgWidth, imgHeight);
    heightLeft -= PAGE_HEIGHT;
  }
  pdf.save(props.title + ".pdf");
}
*/

interface PropsHideOnScroll {
  window?: () => Window;
  children: React.ReactElement;
}

export const HideOnScroll = (props: PropsHideOnScroll) => {
  const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target: window !== undefined ? window() : undefined
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

interface PropsAppBar {
  title: string;
  backIcon?: boolean;
  homeVersion?: boolean;
  addSongIcon?: boolean;
  setShowUpdates?: (show: boolean) => void;
}

export const verticalPaddingAppBar = 3;

export default function PraisingAppBar(props: PropsAppBar) {
  const router = useRouter();
  const [showNews, setShowNews] = React.useState(false);
  const [newsEverOpened, setNewsEverOpened] = React.useState(false);
  const [showProposeSong, setShowProposeSong] = React.useState(false);
  const [openTooltip, setOpenTooltip] = React.useState(false);

  useEffect(() => {
    const tooltipShown =
      window.localStorage.getItem('tooltip_news_shown') === 'true';
    if (!tooltipShown) {
      setOpenTooltip(true);
      window.localStorage.setItem('tooltip_news_shown', 'true');
      const timer = setTimeout(() => setOpenTooltip(false), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const logEventShow = async () => {
    if (typeof window === 'undefined') return;

    const { getAnalytics, logEvent } = await import('firebase/analytics');
    const fbApp = (await import('../logic/server/firebase_config')).default;
    const analytics = getAnalytics(fbApp);
    logEvent(analytics, 'see_functions_app', {
      firebase_screen: '/home'
    });
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <HideOnScroll {...props}>
        <AppBar
          style={{ background: 'linear-gradient(to right, #F5DA81, #F0B647)' }}
          sx={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
        >
          {props.homeVersion === true ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              {props.addSongIcon && (
                <IconButton
                  aria-label="Proponi un canto"
                  edge="start"
                  sx={{
                    top: '25%',
                    left: { xs: '6%', md: '3%' },
                    position: 'absolute',
                    mr: 2,
                    color: 'black'
                  }}
                  onClick={() => {
                    setShowProposeSong(true);
                  }}
                >
                  <AddRoundedIcon />
                </IconButton>
              )}
              <Typography
                variant="h1"
                component="h1"
                textAlign="center"
                style={{ color: 'black' }}
                sx={{ py: verticalPaddingAppBar }}
              >
                {props.title}
              </Typography>
              <Box
                sx={{
                  top: '25%',
                  right: { xs: '6%', md: '3%' },
                  position: 'absolute'
                }}
              >
                <Tooltip
                  title="Vuoi conoscere i vantaggi dell'app?"
                  placement="bottom-start"
                  arrow
                  enterDelay={200}
                  open={openTooltip}
                  onClose={() => setOpenTooltip(false)}
                  onOpen={() => setOpenTooltip(true)}
                  slots={{
                    transition: Zoom
                  }}
                >
                  <IconButton
                    aria-label="Novità"
                    edge="end"
                    style={{ color: 'black' }}
                    sx={{ mr: 0.5 }}
                    onClick={async () => {
                      if (showNews) {
                        document.body.style.overflow = 'unset';
                      } else {
                        document.body.style.overflow = 'hidden';
                        logEventShow();
                      }
                      props.setShowUpdates?.(!showNews);
                      if (!showNews) setNewsEverOpened(true);
                      setShowNews(!showNews);
                    }}
                  >
                    <HelpRoundedIcon />
                  </IconButton>
                </Tooltip>
                <IconButton
                  edge="end"
                  style={{ color: 'black' }}
                  LinkComponent={Link}
                  aria-label="Vai alle impostazioni"
                  href={Routes.Settings}
                >
                  <SettingsRoundedIcon />
                </IconButton>
              </Box>
            </Box>
          ) : props.backIcon === true ? (
            <Toolbar>
              <IconButton
                aria-label="Torna indietro"
                edge="start"
                sx={{ mr: 2, color: 'black' }}
                onClick={() => {
                  router.back();
                }}
              >
                <ArrowBackRoundedIcon />
              </IconButton>
              <Typography
                variant="h1"
                component="h1"
                textAlign="center"
                sx={{ color: 'black', py: verticalPaddingAppBar }}
              >
                {props.title}
              </Typography>
            </Toolbar>
          ) : (
            <Typography
              variant="h1"
              component="h1"
              textAlign="center"
              style={{ color: 'black' }}
              sx={{ py: verticalPaddingAppBar }}
            >
              {props.title}
            </Typography>
          )}
        </AppBar>
      </HideOnScroll>
      {/* Montato solo dopo la prima apertura, ma poi tenuto in vita per non
          troncare l'animazione di chiusura */}
      {newsEverOpened && (
        <AnimatedOnboardingSlider
          isOpen={showNews}
          closeFn={() => {
            document.body.style.overflow = 'unset';
            props.setShowUpdates?.(false);
            setShowNews(false);
          }}
        />
      )}
      <ProposeNewSongModal
        open={showProposeSong}
        handleClose={() => setShowProposeSong(false)}
      />
    </React.Fragment>
  );
}

interface PropsMenuItemVersions {
  selectedIndexVersion?: number;
  setVersionSong?: (index: number) => void;
  versions?: CustomSongInfo[];
}

function MenuItemVersions(props: PropsMenuItemVersions) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (): void => {
    setAnchorEl(null);
  };

  if (
    props.setVersionSong === undefined ||
    props.versions === undefined ||
    props.selectedIndexVersion === undefined
  )
    return <></>;

  return (
    <div>
      <MenuItem onClick={handleClick}>
        <ListItemText>Versioni</ListItemText>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          {props.selectedIndexVersion === -1
            ? 'Base'
            : 'Ver ' + (props.selectedIndexVersion + 1)}
        </Typography>
      </MenuItem>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <MenuItem
          key="version-song-base"
          onClick={() => {
            assert(props.setVersionSong !== undefined);
            props.setVersionSong(-1);
            handleClose();
          }}
          selected={props.selectedIndexVersion === -1}
        >
          {'Versione base'}
        </MenuItem>
        {props.versions.map((version, index) => (
          <MenuItem
            key={'version-song ' + index}
            onClick={() => {
              assert(props.setVersionSong !== undefined);
              props.setVersionSong(index);
              handleClose();
            }}
            selected={index === props.selectedIndexVersion}
          >
            {version.state === 'pending' && (
              <ListItemIcon>
                <Tooltip title="In revisione, potrai vederla solo tu per ora">
                  <HourglassBottomRoundedIcon />
                </Tooltip>
              </ListItemIcon>
            )}
            {'Versione ' + (index + 1)}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

export const SongTitleAppBar = (props: {
  title: string;
  versionText: string;
}) => {
  return (
    <Box
      sx={{ flexGrow: 1, flexShrink: 1, minWidth: 0, py: 1 }}
      style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
      alignItems="center"
    >
      <Typography variant="h1" noWrap>
        {props.title}
      </Typography>
      <Typography
        variant="subtitle1"
        component="span"
        display="block"
        sx={{ maxLines: 1 }}
        color="textDisabled"
      >
        {props.versionText}
      </Typography>
    </Box>
  );
};

interface PropsSongAppBar extends PropsMenuItemVersions {
  id: string;
  title: string;
  transpose?: number;
  playlist?: Playlist;
}

export const SongAppBar = (props: PropsSongAppBar) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { authUser } = useFirebaseAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const palette = useSchemePalette();
  const indexInPlaylist = props.playlist?.songs.indexOf(props.id);
  const chordNotation = useAppSelector((state) => state.settings.chordNotation);
  const favoriteSongs = useAppSelector((state) => state.userInfo.favoriteSongs);
  const dispatch = useAppDispatch();
  const versionText =
    props.selectedIndexVersion !== undefined &&
    props.selectedIndexVersion !== -1
      ? '(Versione ' + (props.selectedIndexVersion + 1) + ')'
      : '';

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <React.Fragment>
      <HideOnScroll {...props}>
        <AppBar
          sx={{
            backgroundColor: 'background.default',
            display: 'flex'
          }}
        >
          <Toolbar sx={{ pr: { xs: 1, sm: 2 } }}>
            <IconButton
              aria-label="Torna indietro"
              edge="start"
              sx={{ mr: 2 }}
              onClick={() => {
                // console.log("History length:", window.history.length);
                if (window.history.length > 2) {
                  // Still to understand well why the length is 2 in normal cases
                  router.back();
                } else {
                  router.replace(Routes.Songs);
                }
              }}
            >
              <ArrowBackRoundedIcon />
            </IconButton>
            <SongTitleAppBar title={props.title} versionText={versionText} />
            <Box
              sx={{ flexGrow: 0, flexShrink: 0, display: 'flex' }}
              alignItems="center"
            >
              {indexInPlaylist !== undefined &&
                indexInPlaylist !== -1 &&
                props.playlist !== undefined && (
                  <>
                    {/* Il Link non avvolge l'IconButton: `LinkComponent` fa
                        gia' rendere un <a>, e annidarne due e' HTML non valido
                        (il secondo viene scartato dal parser). */}
                    {indexInPlaylist > 0 && (
                      <IconButton
                        aria-label="Canto precedente della playlist"
                        component={NextLinkComposed}
                        replace
                        to={{
                          pathname:
                            Routes.Songs +
                            '/' +
                            props.playlist.songs[indexInPlaylist - 1],
                          query: { playlistId: props.playlist.id }
                        }}
                      >
                        <FirstPageRoundedIcon />
                      </IconButton>
                    )}
                    {indexInPlaylist <= props.playlist.songs.length - 2 && (
                      <IconButton
                        aria-label="Canto successivo della playlist"
                        component={NextLinkComposed}
                        replace
                        to={{
                          pathname:
                            Routes.Songs +
                            '/' +
                            props.playlist.songs[indexInPlaylist + 1],
                          query: { playlistId: props.playlist.id }
                        }}
                      >
                        <LastPageRoundedIcon />
                      </IconButton>
                    )}
                  </>
                )}
              <Badge
                badgeContent={props.transpose}
                overlap="circular"
                invisible={
                  props.transpose === undefined || props.transpose === 0
                }
                color="primary"
                sx={{ '& .MuiBadge-badge': { fontWeight: 'bold' } }}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right'
                }}
              >
                <IconButton aria-label="Altre opzioni" onClick={openMenu}>
                  <MoreVertIcon color="action" />
                </IconButton>
              </Badge>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => {
                  setAnchorEl(null);
                }}
              >
                <ShareSong title={props.title} id={props.id} />
                <MenuItem
                  onClick={() => {
                    if (authUser === null) return;

                    if (favoriteSongs.includes(props.id)) {
                      if (!authUser.isAnonymous)
                        void database().then(
                          async (db) =>
                            await db.removeServerFavoriteSongs(
                              authUser.uid,
                              props.id
                            )
                        );
                      dispatch(removeSongFromFavoriteSongs(props.id));
                    } else {
                      if (!authUser.isAnonymous)
                        void database().then(
                          async (db) =>
                            await db.addServerFavoriteSongs(
                              authUser.uid,
                              props.id
                            )
                        );
                      dispatch(addSongToFavoriteSongs(props.id));
                    }
                  }}
                >
                  <ListItemIcon>
                    {favoriteSongs.includes(props.id) ? (
                      <FavoriteIcon />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText>Preferiti</ListItemText>
                </MenuItem>
                <PrintButton
                  onClick={async () => {
                    const printDocument = (await import('@/logic/song_to_pdf'))
                      .printDocument;
                    await printDocument(props.id, {
                      backgroundColor: palette.background.default,
                      textColor: palette.text.primary,
                      chordNotation
                    });
                  }}
                />
                <MenuItem
                  // FIXME: Href seems to not work
                  onClick={() =>
                    router.push(`${pathname}/parts?${searchParams.toString()}`)
                  }
                  style={{ fontWeight: 600 }}
                >
                  <ListItemIcon>
                    <InterpreterModeRoundedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Seconde voci" />
                </MenuItem>
                {/* <MenuItem
                  sx={{ width: 200 }}
                  onClick={() => {
                    if (chordNotation === SYMBOL) {
                      dispatch(setChordNotation(SOLFEGE));
                    } else if (chordNotation === SOLFEGE) {
                      dispatch(setChordNotation(SYMBOL));
                    }
                  }}
                  style={{ fontWeight: 'bold' }}
                >
                  <ListItemText>Notazione</ListItemText>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 2 }}
                  >
                    {chordNotation === SYMBOL ? 'Eng' : 'Ita'}
                  </Typography>
                </MenuItem> */}
                <MenuItem
                  onClick={() =>
                    dispatch(modifySong({ id: props.id, transpose: 0 }))
                  }
                  style={{ fontWeight: 600 }}
                >
                  <ListItemText primary="Transpose" />
                  {props.transpose ?? '0'}
                </MenuItem>
                <MenuItemVersions
                  versions={props.versions}
                  setVersionSong={props.setVersionSong}
                  selectedIndexVersion={props.selectedIndexVersion}
                />
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
    </React.Fragment>
  );
};

interface PropsPlaylistAppBar {
  playlist: Playlist | undefined;
}

export const PlaylistAppBar = (props: PropsPlaylistAppBar) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const router = useRouter();

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <HideOnScroll {...props}>
        <AppBar
          sx={{
            backgroundColor: 'background.default',
            display: 'flex'
          }}
        >
          <Toolbar>
            <IconButton
              aria-label="Torna indietro"
              edge="start"
              sx={{ mr: 2 }}
              onClick={() => {
                router.back();
              }}
            >
              <ArrowBackRoundedIcon />
            </IconButton>
            <Box
              sx={{ flexGrow: 1, flexShrink: 1, minWidth: 0, display: 'flex' }}
              alignItems="center"
            >
              <Typography variant="h1" component="h1" noWrap sx={{ py: 1 }}>
                {props.playlist?.name}
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 0, display: 'flex' }} alignItems="center">
              <IconButton aria-label="Altre opzioni" onClick={openMenu}>
                <MoreVertIcon color="action" />
              </IconButton>
              <MenuPlaylist
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                playlist={props.playlist}
                back_on_delete
              />
            </Box>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
    </React.Fragment>
  );
};
