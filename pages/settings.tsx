import Container from '@mui/material/Container';
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InsertCommentRoundedIcon from '@mui/icons-material/InsertCommentRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import { setDarkMode } from '@/logic/redux/settings_slice';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import Routes from '@/logic/routes';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/logic/redux/store';
// import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import SdStorageRoundedIcon from '@mui/icons-material/SdStorageRounded';
import { clearStorage } from '@/logic/local_logic';
import InstallPWA from '@/components/install_pwa_btn';
import React from 'react';

export default function SettingsPage(): JSX.Element {
  const darkTheme = useAppSelector((state) => state.settings.darkMode);
  const dispatch = useAppDispatch();
  const borderRadius = 8;

  return (
    <main>
      <Container sx={{ minHeight: '100vh' }}>
        <PraisingAppBar title="Impostazioni" backIcon />
        <Container sx={{ py: verticalPaddingAppBar + 2 }} />
        <List>
          <ListItem
            disablePadding
            sx={{
              borderTopRightRadius: borderRadius,
              borderTopLeftRadius: borderRadius
            }}
          >
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
                {darkTheme ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
              </ListItemIcon>
              <ListItemText primary="Tema" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton LinkComponent={Link} href={Routes.Feedback}>
              <ListItemIcon>
                <InsertCommentRoundedIcon />
              </ListItemIcon>
              <ListItemText primary="Feedback" />
            </ListItemButton>
          </ListItem>
          {/* <ListItem disablePadding>
                    <ListItemButton LinkComponent={Link} href={Routes.Contribute}>
                    <ListItemIcon>
                        <VolunteerActivismRoundedIcon />
                    </ListItemIcon>
                        <ListItemText primary="Contribuisci" />
                    </ListItemButton>
                    </ListItem> */}
          <ListItem disablePadding>
            <InstallPWA />
          </ListItem>
          <ListItem
            disablePadding
            sx={{
              borderBottomRightRadius: borderRadius,
              borderBottomLeftRadius: borderRadius
            }}
          >
            <ListItemButton
              onClick={() => {
                clearStorage();
              }}
            >
              <ListItemIcon>
                <SdStorageRoundedIcon />
              </ListItemIcon>
              <ListItemText
                primary="Elimina cache"
                secondary="Eliminerai tutti i dati presenti su questo dispositivo"
              />
            </ListItemButton>
          </ListItem>
        </List>
        <p>Versione: 0.6.0</p>
      </Container>
    </main>
  );
}
