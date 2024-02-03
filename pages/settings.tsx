import Container from '@mui/material/Container'
import NavBar from '@/components/navbar'
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar'
import { useState } from 'react'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import InsertCommentRoundedIcon from '@mui/icons-material/InsertCommentRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import { setDarkMode } from "@/logic/redux/settings_slice";
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import Routes from "@/logic/routes";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/logic/redux/store";

export default function SettingsPage() {
    const darkTheme = useAppSelector(state => state.settings.darkMode)
    const dispatch = useAppDispatch()
    const borderRadius = 8;

    return (
        <Container sx={{minHeight: '100vh'}}>
            <PraisingAppBar title='Impostazioni' backIcon/>
            <Container sx={{py: verticalPaddingAppBar + 2}}/>
            <List>
                <ListItem disablePadding sx={{borderTopRightRadius: borderRadius, borderTopLeftRadius: borderRadius}}>
                    <ListItemButton LinkComponent={Link} href={Routes.Login}>
                    <ListItemIcon>
                        <AccountCircleRoundedIcon />
                    </ListItemIcon>
                    <ListItemText primary="Account" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => dispatch(setDarkMode(!darkTheme))}>
                        <ListItemIcon>
                        {
                            darkTheme ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />
                        }
                        </ListItemIcon>
                        <ListItemText primary="Tema" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{borderBottomRightRadius: borderRadius, borderBottomLeftRadius: borderRadius}}>
                    <ListItemButton LinkComponent={Link} href={Routes.Feedback}>
                    <ListItemIcon>
                        <InsertCommentRoundedIcon />
                    </ListItemIcon>
                    <ListItemText primary="Feedback" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Container>
    )
  
}
