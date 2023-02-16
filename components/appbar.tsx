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
    title: string
    transpose?: number
}

export const SongAppBar = (props: PropsSongAppBar) => {
    const router = useRouter()
    
    return (
      <React.Fragment>
        <CssBaseline />
        <HideOnScroll {...props}>
            <AppBar style={{ backgroundColor: 'white' }}>
                <Toolbar>
                <IconButton edge="start" sx={{ mr: 2 }} onClick={() => router.back()}>
                    <ArrowBackRoundedIcon />
                </IconButton>
                <Typography variant="h1" >
                    {props.title}
                </Typography>
                <Typography variant="h6" textAlign='end' style={{color: 'black'}}>
                    {props.transpose}
                </Typography>
                </Toolbar>
            </AppBar>
        </HideOnScroll>
      </React.Fragment>
    );
}