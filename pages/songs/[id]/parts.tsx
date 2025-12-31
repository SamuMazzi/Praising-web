'use client';

import Container from '@mui/material/Container';
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { getSingleSong } from '@/logic/local_logic';
import React, { useState } from 'react';
import { GenericModal } from '@/components/modals';
import usePartsSong from '@/logic/hooks/use_parts_song';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { ModalBottomSheetAddPart } from '@/components/bottom_sheet';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import PlayCircleFilledRoundedIcon from '@mui/icons-material/PlayCircleFilledRounded';
import PauseCircleFilledRoundedIcon from '@mui/icons-material/PauseCircleFilledRounded';
import Forward5RoundedIcon from '@mui/icons-material/Forward5Rounded';
import Replay5RoundedIcon from '@mui/icons-material/Replay5Rounded';
import { type NextPageContext } from 'next';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { deletePartSongFromDatabase } from '@/logic/server/database';
import { deletePartSongFromServerStorage } from '@/logic/server/storage';

PartsPage.getInitialProps = async (props: NextPageContext) => {
  const { id } = props.query;
  return { id };
};

interface PropsPartsPage {
  id: string;
}

export default function PartsPage(props: PropsPartsPage) {
  const {
    parts,
    content,
    loadingParts,
    loadingSinglePart,
    fetchSinglePart,
    fetchParts
  } = usePartsSong(props.id);
  const [part, setPart] = useState('');
  const [partToDelete, setPartToDelete] = useState('');
  const [openNewPart, setOpenNewPart] = useState(false);
  const song = getSingleSong(props.id);

  return (
    <main>
      <Container
        sx={{
          minHeight: '100vh'
        }}
      >
        <PraisingAppBar title={'Parti - ' + song?.name} backIcon />
        <Container sx={{ py: verticalPaddingAppBar + 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
          <Typography variant="h2" component="h2" sx={{ mr: 2 }}>
            Seconde voci
          </Typography>
          <IconButton color="primary" onClick={() => setOpenNewPart(true)}>
            <AddRoundedIcon />
          </IconButton>
        </Box>
        {loadingParts ? (
          <CircularProgress />
        ) : parts.length === 0 ? (
          <Typography
            style={{
              whiteSpace: 'pre-wrap',
              textAlign: 'center',
              fontWeight: 400
            }}
            sx={{ mt: 4 }}
            variant="h4"
            component="h4"
          >
            {'Nessuna seconda voce è stata ancora caricata!'}
          </Typography>
        ) : (
          <List>
            {parts.map((p) => {
              return (
                <ListItem
                  key={p.idPart}
                  sx={{ my: 1, borderRadius: 8 }}
                  secondaryAction={
                    <IconButton onClick={() => {}}>
                      <DeleteRoundedIcon />
                    </IconButton>
                  }
                >
                  {p.state === 'pending' && (
                    <ListItemIcon>
                      <Tooltip title="In revisione, potrai vederla solo tu per ora">
                        <HourglassBottomRoundedIcon />
                      </Tooltip>
                    </ListItemIcon>
                  )}
                  <ListItemButton
                    onClick={() => {
                      setPart(p.idPart);
                      fetchSinglePart(p.idPart);
                    }}
                  >
                    <ListItemText primary={p.name} secondary={p.author} />
                    {/** TODO: Add rates/reviews as starts, at the end */}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
        <GenericModal
          open={part !== ''}
          handleClose={() => setPart('')}
          content={
            loadingSinglePart || !song ? (
              <CircularProgress />
            ) : (
              <>
                {/* <MultitrackMixer song={song} /> */}
                <Typography variant="h4" component="h4" sx={{ mb: 2 }}>
                  {parts.find((p) => p.idPart === part)?.name}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="textDisabled"
                  sx={{ mb: 2 }}
                >
                  {parts.find((p) => p.idPart === part)?.author}
                </Typography>
                <AudioPlayer
                  autoPlay
                  // check https://stackoverflow.com/questions/12951438/play-audio-using-base64-data-in-html5
                  src={content}
                  showSkipControls={false}
                  showJumpControls
                  showFilledVolume={false}
                  customControlsSection={[
                    RHAP_UI.ADDITIONAL_CONTROLS,
                    RHAP_UI.MAIN_CONTROLS
                  ]}
                  customIcons={{
                    play: <PlayCircleFilledRoundedIcon />,
                    pause: <PauseCircleFilledRoundedIcon />,
                    forward: <Forward5RoundedIcon />,
                    rewind: <Replay5RoundedIcon />
                  }}
                />
              </>
            )
          }
        />
        <GenericModal
          open={partToDelete !== ''}
          handleClose={() => setPartToDelete('')}
          content={
            <>
              <Typography>Elimina parte</Typography>
              <Typography>
                {`Sei sicuro di voler eliminare la parte ${parts.find((p) => p.idPart === partToDelete)?.name}? L'operazione non è reversibile.`}
              </Typography>
              <Box sx={{ mt: 3 }} display="flex" justifyContent="flex-end">
                <Button
                  onClick={() => {
                    setPartToDelete('');
                  }}
                  variant="outlined"
                  sx={{ mr: 2, textTransform: 'none' }}
                >
                  Annulla
                </Button>
                <Button
                  variant="contained"
                  onClick={async () => {
                    const infoPart = parts.find(
                      (p) => p.idPart === partToDelete
                    );
                    if (!infoPart) {
                      return;
                    }
                    await deletePartSongFromDatabase(
                      infoPart.userId,
                      props.id,
                      partToDelete
                    );
                    await deletePartSongFromServerStorage(
                      partToDelete,
                      props.id
                    );
                    setPartToDelete('');
                    fetchParts();
                  }}
                >
                  Conferma
                </Button>
              </Box>
            </>
          }
        />
        <ModalBottomSheetAddPart
          open={openNewPart}
          onClose={() => setOpenNewPart(false)}
          afterUpload={() => fetchParts()}
          idSong={props.id}
        />
      </Container>
    </main>
  );
}
