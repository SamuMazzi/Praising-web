import Slide from "@mui/material/Slide";
import CssBaseline from '@mui/material/CssBaseline';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import React from "react";
import Toolbar from "@mui/material/Toolbar";
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import IconButton from "@mui/material/IconButton";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import { Playlist } from "@/logic/redux/playlist_slice";
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import Routes from "@/logic/routes";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/logic/redux/store";
import { modifySong } from "@/logic/redux/info_song_slice";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Badge from "@mui/material/Badge";
import { useTheme } from "@mui/material";
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { setChordNotation } from "@/logic/redux/settings_slice";
import ShareIcon from '@mui/icons-material/Share';
import { RWebShare } from "react-web-share";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { addSongToFavoriteSongs, removeSongFromFavoriteSongs } from "@/logic/redux/user_info_slice";
import { MenuPlaylist } from "./menus";

//TODO: Implementare clide-side routing anche con useRouter

interface PropsHideOnScroll {
    window?: () => Window;
    children: React.ReactElement;
}
  
function HideOnScroll(props: PropsHideOnScroll) {
    const { children, window } = props;
    // Note that you normally won't need to set the window ref as useScrollTrigger
    // will default to window.
    // This is only being set here because the demo is in an iframe.
    const trigger = useScrollTrigger({
      target: window ? window() : undefined,
    });
  
    return (
      <Slide appear={false} direction="down" in={!trigger}>
        {children}
      </Slide>
    );
}

interface PropsAppBar {
    title: string
    backIcon?: boolean
    homeVersion?: boolean
}

export const verticalPaddingAppBar = 3

export default function PraisingAppBar(props: PropsAppBar) {
    const router = useRouter()

    return (
      <React.Fragment>
        <CssBaseline />
        <HideOnScroll {...props}>
            <AppBar style={{ background: "linear-gradient(to right, #F5DA81, #F0B647)" }} sx={{borderBottomLeftRadius: 24, borderBottomRightRadius: 24}}>
              {
                props.homeVersion ?
                <Box sx={{display: props.backIcon ? 'none' : 'flex', justifyContent: "center"}}>
                  <Typography variant="h1" fontSize={24} textAlign='center' style={{color: 'black'}} sx={{py: verticalPaddingAppBar}}>
                    {props.title}
                  </Typography>
                  <IconButton edge="end" style={{color: 'black'}} sx={{ top: "25%", right: "6%", position: "absolute" }} LinkComponent={Link} href={Routes.Settings}>
                    <SettingsRoundedIcon />
                  </IconButton>
                </Box> : props.backIcon ?
                  <Toolbar>
                    <IconButton edge="start" sx={{ mr: 2, color: 'black' }} onClick={() => router.back()}>
                        <ArrowBackRoundedIcon />
                    </IconButton>
                    <Typography variant="h1" textAlign='center' sx={{ color: 'black', py: verticalPaddingAppBar}}>
                        {props.title}
                    </Typography>
                  </Toolbar> : 
                  <Typography variant="h1" textAlign='center' style={{color: 'black'}} sx={{py: verticalPaddingAppBar}}>
                    {props.title}
                  </Typography>                                
              }
              </AppBar>
        </HideOnScroll>
      </React.Fragment>
    );
}

export function FilterAppBar(props: PropsAppBar) {
  const router = useRouter()

  return (
    <React.Fragment>
      <CssBaseline />
      <HideOnScroll {...props}>
          <AppBar style={{ background: "linear-gradient(to right, #F5DA81, #F0B647)" }} sx={{borderBottomLeftRadius: 24, borderBottomRightRadius: 24}}>
              {
                props.backIcon ?
                <Toolbar>
                  <IconButton edge="start" sx={{ mr: 2 }} onClick={() => router.back()}>
                      <ArrowBackRoundedIcon />
                  </IconButton>
                  <Typography variant="h1" textAlign='center' sx={{py: verticalPaddingAppBar}}>
                      {props.title}
                  </Typography>
                </Toolbar> : 
                <Typography variant="h1" textAlign='center' sx={{py: verticalPaddingAppBar}}>
                  {props.title}
                </Typography>
              }
            </AppBar>
      </HideOnScroll>
    </React.Fragment>
  );
}

interface PropsSongAppBar {
    id: string
    title: string
    transpose?: number
    playlist?: Playlist
}

export const SongAppBar = (props: PropsSongAppBar) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const router = useRouter()
    const theme = useTheme()
    const indexInPlaylist = props.playlist?.songs.indexOf(props.id)
    const chordNotation = useAppSelector(state => state.settings.chordNotation)
    const favoriteSongs = useAppSelector(state => state.userInfo.favoriteSongs)
    const dispatch = useAppDispatch()

    const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };
    
    return (
      <React.Fragment>
        <HideOnScroll {...props}>
            <AppBar style={{backgroundColor: theme.palette.background.default, display: 'flex' }}>
                <Toolbar>
                  <IconButton edge="start" sx={{ mr: 2 }} onClick={() => router.back()}>
                      <ArrowBackRoundedIcon />
                  </IconButton>
                  <Box sx={{ flexGrow: 1, display: 'flex' }} alignItems="center">
                    <Typography variant="h1" sx={{py: 1}} >
                        {props.title}
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 0, display: 'flex' }} alignItems="center">
                    {
                      indexInPlaylist !== undefined && indexInPlaylist !== -1 && props.playlist && 
                      <>
                        {
                          indexInPlaylist > 0 &&
                          <Link replace href={Routes.Songs + '/' + props.playlist!.songs[indexInPlaylist - 1] + '?playlist_id=' + props.playlist!.id} passHref> 
                            <IconButton sx={{ ml: 2, mr: 0.5 }} LinkComponent={Link} >
                              <FirstPageRoundedIcon />
                            </IconButton>
                          </Link>
                        }
                        {
                          indexInPlaylist <= props.playlist!.songs.length - 2 &&
                          <Link replace href={Routes.Songs + '/' + props.playlist!.songs[indexInPlaylist + 1] + '?playlist_id=' + props.playlist!.id} passHref>
                            <IconButton sx={{ mr: 2 }} LinkComponent={Link}>
                              <LastPageRoundedIcon />
                            </IconButton>
                          </Link>
                        }
                      </>
                    }
                    <Badge badgeContent={props.transpose}
                      overlap="circular" 
                      invisible={props.transpose === undefined || props.transpose === 0} 
                      color="primary"
                      sx={{ "& .MuiBadge-badge": { fontWeight: 'bold' } }}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                    >
                      <IconButton onClick={openMenu}>
                        <MoreVertIcon color="action" />
                      </IconButton>
                    </Badge>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={() => setAnchorEl(null)}
                    >
                      <RWebShare
                          data={{
                              text: "Leggi " + props.title + " su 'Praising'!",
                              url: Routes.Base + Routes.Songs + "/" + props.id,
                              title: "Condividi questa canzone",
                          }}
                          sites={['facebook', 'twitter', 'whatsapp', 'telegram', 'mail', 'copy']}
                      >
                        <MenuItem>
                          <ListItemIcon>
                            <ShareIcon />
                          </ListItemIcon>
                          <ListItemText primary='Condividi'/>
                        </MenuItem>
                      </RWebShare>
                      <MenuItem onClick={() => {
                        if (favoriteSongs.includes(props.id))
                          dispatch(removeSongFromFavoriteSongs(props.id))
                        else
                          dispatch(addSongToFavoriteSongs(props.id))
                      }}>
                        <ListItemIcon>
                          { favoriteSongs.includes(props.id) ? <FavoriteIcon /> : <FavoriteBorderIcon /> }
                        </ListItemIcon>
                        <ListItemText>Preferiti</ListItemText>
                      </MenuItem>
                      <MenuItem sx={{width: 200}} onClick={() => {
                        if (chordNotation === 'symbol') {
                          dispatch(setChordNotation('solfege'))
                        } else if (chordNotation === 'solfege') {
                          dispatch(setChordNotation('symbol'))
                        }
                      }} style={{fontWeight: 'bold'}}>
                        <ListItemText>Notazione</ListItemText>
                        <Typography variant="body2" color="text.secondary" sx={{ml: 2}}>
                          { chordNotation === 'symbol' ? 'Eng' : 'Ita' }
                        </Typography>
                      </MenuItem>
                      <MenuItem onClick={() => dispatch(modifySong({id: props.id, transpose: 0}))} 
                        style={{fontWeight: 600}}>
                        <ListItemText primary='Transpose'/>
                        {props.transpose || '0'}
                      </MenuItem>
                    </Menu>
                  </Box>
                </Toolbar>
            </AppBar>
        </HideOnScroll>
      </React.Fragment>
    );
}

interface PropsPlaylistAppBar {
  playlist_id: string
}

export const PlaylistAppBar = (props: PropsPlaylistAppBar) => {
  const playlist: Playlist | undefined = useAppSelector(state => state.playlist.playlist[props.playlist_id])
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const router = useRouter()
  const theme = useTheme()

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  return (
    <React.Fragment>
      <CssBaseline />
      <HideOnScroll {...props}>
          <AppBar style={{ backgroundColor: theme.palette.background.default, display: 'flex' }}>
              <Toolbar>
                <IconButton edge="start" sx={{ mr: 2 }} onClick={() => router.back()}>
                    <ArrowBackRoundedIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1, display: 'flex' }} alignItems="center">
                  <Typography variant="h1" sx={{py: 1}} >
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
                      playlist_id={props.playlist_id} 
                      back_on_delete
                    />
                  </Box>
              </Toolbar>
          </AppBar>
      </HideOnScroll>
    </React.Fragment>
  );
}