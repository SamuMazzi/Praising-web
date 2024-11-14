import Container from '@mui/material/Container';
import NavBar from '@/components/navbar';
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar';
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { ModalAddPlaylist } from '@/components/modals';
import ListPlaylist from '@/components/list_playlist';
import Box from '@mui/material/Box';
import { NextSeo } from 'next-seo';

export default function PlaylistPage(): JSX.Element {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <NextSeo
        title="Playlist"
        description="Crea le tue playlist per trovare più facilmente gli accordi!"
      />
      <main>
        <Container sx={{ minHeight: '100vh' }}>
          <PraisingAppBar title="Playlist" homeVersion />
          <Container sx={{ py: verticalPaddingAppBar + 2 }} />
          <ListPlaylist />
          <Container sx={{ pb: 8 }} />
          <Box display="flex" justifyContent="center">
            <Button
              sx={{ borderRadius: 4 }}
              color="primary"
              style={{ position: 'fixed', bottom: 90 }}
              variant="contained"
              onClick={() => {
                setOpenModal(true);
              }}
              disableElevation
            >
              Aggiungi playlist
            </Button>
          </Box>
          <NavBar />
          <ModalAddPlaylist
            open={openModal}
            handleClose={() => {
              setOpenModal(false);
            }}
          />
        </Container>
      </main>
    </>
  );
}
