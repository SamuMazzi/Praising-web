'use client';

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
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import Routes from '@/logic/routes';
import Link from 'next/link';
import { useColorScheme } from '@mui/material/styles';
// import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import SdStorageRoundedIcon from '@mui/icons-material/SdStorageRounded';
import { clearStorage, VERSION_APP } from '@/logic/local_logic';
import InstallPWA from '@/components/install_pwa_btn';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ConfirmModal } from '@/components/modals';
import OfflineAvailability from '@/components/offline_availability';
import React from 'react';

export default function SettingsPage() {
  const { mode, systemMode, setMode } = useColorScheme();
  const [openClearCache, setOpenClearCache] = React.useState(false);
  const borderRadius = 8;
  const currentMode = mode === 'system' ? systemMode : mode;

  const toggleTheme = (): void => {
    setMode(currentMode === 'dark' ? 'light' : 'dark');
  };

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
            <ListItemButton onClick={toggleTheme}>
              {/* Le due icone sono sempre entrambe nel markup e vengono
                  mostrate via CSS in base allo schema di colore: cosi' il
                  render del server combacia con quello del client. */}
              <ListItemIcon>
                <LightModeRoundedIcon
                  sx={(theme) => ({
                    display: 'inline-block',
                    ...theme.applyStyles('dark', { display: 'none' })
                  })}
                />
                <DarkModeRoundedIcon
                  sx={(theme) => ({
                    display: 'none',
                    ...theme.applyStyles('dark', { display: 'inline-block' })
                  })}
                />
              </ListItemIcon>
              {/* Come per le icone, lo schema attivo lo dice il CSS e non il
                  render: `mode` lato server e' sempre undefined. */}
              <ListItemText
                primary="Tema"
                secondary={
                  <>
                    <Box
                      component="span"
                      sx={(theme) => ({
                        display: 'inline',
                        ...theme.applyStyles('dark', { display: 'none' })
                      })}
                    >
                      Chiaro
                    </Box>
                    <Box
                      component="span"
                      sx={(theme) => ({
                        display: 'none',
                        ...theme.applyStyles('dark', { display: 'inline' })
                      })}
                    >
                      Scuro
                    </Box>
                  </>
                }
              />
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
          <ListItem disablePadding>
            <OfflineAvailability />
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
                setOpenClearCache(true);
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
        <ConfirmModal
          open={openClearCache}
          handleClose={() => {
            setOpenClearCache(false);
          }}
          title="Eliminare la cache?"
          message="Perderai playlist, preferiti e canti recenti salvati su questo dispositivo. I dati del tuo account restano al sicuro."
          confirmLabel="Elimina"
          onConfirm={() => {
            clearStorage();
          }}
        />
        <Typography sx={{ py: 2 }}>Versione: {VERSION_APP}</Typography>
      </Container>
    </main>
  );
}
