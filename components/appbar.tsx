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
import Button from "@mui/material/Button";
import { modifySong } from "@/logic/redux/info_song_slice";
import InsertCommentRoundedIcon from '@mui/icons-material/InsertCommentRounded';

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
                  <Typography variant="h1" textAlign='center' sx={{py: verticalPaddingAppBar}}>
                    {props.title}
                  </Typography>
                  <IconButton edge="end" sx={{ top: "25%", right: "6%", position: "absolute" }} LinkComponent={Link} href={Routes.Feedback}>
                    <InsertCommentRoundedIcon />
                  </IconButton>
                </Box> : props.backIcon ?
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
    const router = useRouter()
    const indexInPlaylist = props.playlist?.songs.indexOf(props.id)
    // const chordNotation = useAppSelector(state => state.settings.chordNotation)
    const dispatch = useAppDispatch()
    
    return (
      <React.Fragment>
        <HideOnScroll {...props}>
            <AppBar style={{ backgroundColor: 'white', display: 'flex' }}>
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
                      props.transpose !== undefined && props.transpose !== 0 &&
                      <Button onClick={() => dispatch(modifySong({id: props.id, transpose: 0}))} 
                        style={{fontWeight: 600}} variant="text">
                          {props.transpose}
                      </Button>
                    }
                    
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
                    {
                      /* <Button onClick={() => { //TODO: Non funziona ancora
                        if (chordNotation === 'symbol') {
                          dispatch(setChordNotation('solfege'))
                        } else if (chordNotation === 'solfege') {
                          dispatch(setChordNotation('symbol'))
                        }
                      }} style={{fontWeight: 'bold'}}>
                        {chordNotation === 'symbol' ? 'ENG' : 'ITA'}
                      </Button> */
                    }
                  </Box>
                </Toolbar>
            </AppBar>
        </HideOnScroll>
      </React.Fragment>
    );
}

interface PropsPlaylistAppBar {
  title: string
}

export const PlaylistAppBar = (props: PropsPlaylistAppBar) => {
  const router = useRouter()
  
  return (
    <React.Fragment>
      <CssBaseline />
      <HideOnScroll {...props}>
          <AppBar style={{ backgroundColor: 'white', display: 'flex' }}>
              <Toolbar>
                <IconButton edge="start" sx={{ mr: 2 }} onClick={() => router.back()}>
                    <ArrowBackRoundedIcon />
                </IconButton>
                <Typography variant="h1" sx={{py: 1}} >
                    {props.title}
                </Typography>
              </Toolbar>
          </AppBar>
      </HideOnScroll>
    </React.Fragment>
  );
}