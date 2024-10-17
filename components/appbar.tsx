import Slide from '@mui/material/Slide';
import CssBaseline from '@mui/material/CssBaseline';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import React from 'react';
import Toolbar from '@mui/material/Toolbar';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import IconButton from '@mui/material/IconButton';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import { type Playlist } from '@/logic/redux/playlist_slice';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import Routes from '@/logic/routes';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/logic/redux/store';
import { modifySong } from '@/logic/redux/info_song_slice';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Badge from '@mui/material/Badge';
import { useTheme } from '@mui/material';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { setChordNotation } from '@/logic/redux/settings_slice';
import ShareIcon from '@mui/icons-material/Share';
import PrintIcon from '@mui/icons-material/PrintRounded';
import { RWebShare } from 'react-web-share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  addSongToFavoriteSongs,
  removeSongFromFavoriteSongs
} from '@/logic/redux/user_info_slice';
import { MenuPlaylist } from './menus';
import { SOLFEGE, SYMBOL } from 'chordsheetjs';
import { printDocument } from '@/logic/song_to_pdf';
import { type CustomSongInfo } from '@/logic/server/database';
import assert from 'assert';

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

export const HideOnScroll = (props: PropsHideOnScroll): JSX.Element => {
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
}

export const verticalPaddingAppBar = 3;

export default function PraisingAppBar(props: PropsAppBar): JSX.Element {
  const router = useRouter();

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
                display: props.backIcon === true ? 'none' : 'flex',
                justifyContent: 'center'
              }}
            >
              <Typography
                variant="h1"
                fontSize={24}
                textAlign="center"
                style={{ color: 'black' }}
                sx={{ py: verticalPaddingAppBar }}
              >
                {props.title}
              </Typography>
              <IconButton
                edge="end"
                style={{ color: 'black' }}
                sx={{ top: '25%', right: '6%', position: 'absolute' }}
                LinkComponent={Link}
                href={Routes.Settings}
              >
                <SettingsRoundedIcon />
              </IconButton>
            </Box>
          ) : props.backIcon === true ? (
            <Toolbar>
              <IconButton
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
                textAlign="center"
                sx={{ color: 'black', py: verticalPaddingAppBar }}
              >
                {props.title}
              </Typography>
            </Toolbar>
          ) : (
            <Typography
              variant="h1"
              textAlign="center"
              style={{ color: 'black' }}
              sx={{ py: verticalPaddingAppBar }}
            >
              {props.title}
            </Typography>
          )}
        </AppBar>
      </HideOnScroll>
    </React.Fragment>
  );
}

interface PropsMenuItemVersions {
  selectedIndexVersion?: number;
  setVersionSong?: (index: number) => void;
  versions?: CustomSongInfo[];
}

function MenuItemVersions(props: PropsMenuItemVersions): JSX.Element {
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
}): JSX.Element => {
  return (
    <Box sx={{ flexGrow: 1 }} alignItems="center">
      <Typography
        variant="h1"
        sx={{ py: 1, width: { xs: '16rem', md: '40rem' } }}
        noWrap
        style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {props.title}
        <Typography
          variant="subtitle1"
          sx={{ maxLines: 1 }}
          color="textDisabled"
        >
          {props.versionText}
        </Typography>
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

export const SongAppBar = (props: PropsSongAppBar): JSX.Element => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const router = useRouter();
  const theme = useTheme();
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
          style={{
            backgroundColor: theme.palette.background.default,
            display: 'flex'
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              sx={{ mr: 2 }}
              onClick={() => {
                router.back();
              }}
            >
              <ArrowBackRoundedIcon />
            </IconButton>
            <SongTitleAppBar title={props.title} versionText={versionText} />
            <Box sx={{ flexGrow: 0, display: 'flex' }} alignItems="center">
              {indexInPlaylist !== undefined &&
                indexInPlaylist !== -1 &&
                props.playlist !== undefined && (
                  <>
                    {indexInPlaylist > 0 && (
                      <Link
                        replace
                        href={
                          Routes.Songs +
                          '/' +
                          props.playlist.songs[indexInPlaylist - 1] +
                          '?playlistId=' +
                          props.playlist.id
                        }
                        passHref
                      >
                        <IconButton
                          sx={{ ml: 2, mr: 0.5 }}
                          LinkComponent={Link}
                        >
                          <FirstPageRoundedIcon />
                        </IconButton>
                      </Link>
                    )}
                    {indexInPlaylist <= props.playlist.songs.length - 2 && (
                      <Link
                        replace
                        href={
                          Routes.Songs +
                          '/' +
                          props.playlist.songs[indexInPlaylist + 1] +
                          '?playlistId=' +
                          props.playlist.id
                        }
                        passHref
                      >
                        <IconButton sx={{ mr: 2 }} LinkComponent={Link}>
                          <LastPageRoundedIcon />
                        </IconButton>
                      </Link>
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
                <IconButton onClick={openMenu}>
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
                <RWebShare
                  data={{
                    text:
                      'Visualizza la canzone ' +
                      props.title +
                      " su 'Praising'!",
                    url: Routes.Base + Routes.Songs + '/' + props.id,
                    title: 'Condividi questa canzone'
                  }}
                  sites={['facebook', 'whatsapp', 'telegram', 'mail', 'copy']}
                >
                  <MenuItem>
                    <ListItemIcon>
                      <ShareIcon />
                    </ListItemIcon>
                    <ListItemText primary="Condividi" />
                  </MenuItem>
                </RWebShare>
                <MenuItem
                  onClick={() => {
                    if (favoriteSongs.includes(props.id))
                      dispatch(removeSongFromFavoriteSongs(props.id));
                    else dispatch(addSongToFavoriteSongs(props.id));
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
                <MenuItem
                  onClick={() => {
                    void printDocument(props.id, {
                      backgroundColor: theme.palette.background.default,
                      textColor: theme.palette.text.primary,
                      chordNotation
                    });
                  }}
                >
                  <ListItemIcon>
                    <PrintIcon />
                  </ListItemIcon>
                  <ListItemText primary="Stampa (beta)" />
                </MenuItem>
                <MenuItem
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
                </MenuItem>
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
  playlistId: string;
}

export const PlaylistAppBar = (props: PropsPlaylistAppBar): JSX.Element => {
  const playlist: Playlist | undefined = useAppSelector(
    (state) => state.playlist.playlist[props.playlistId]
  );
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const router = useRouter();
  const theme = useTheme();

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <HideOnScroll {...props}>
        <AppBar
          style={{
            backgroundColor: theme.palette.background.default,
            display: 'flex'
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              sx={{ mr: 2 }}
              onClick={() => {
                router.back();
              }}
            >
              <ArrowBackRoundedIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1, display: 'flex' }} alignItems="center">
              <Typography variant="h1" sx={{ py: 1 }}>
                {playlist.name}
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 0, display: 'flex' }} alignItems="center">
              <IconButton onClick={openMenu}>
                <MoreVertIcon color="action" />
              </IconButton>
              <MenuPlaylist
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                playlistId={props.playlistId}
                back_on_delete
              />
            </Box>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
    </React.Fragment>
  );
};
