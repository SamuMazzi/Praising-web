import Container from '@mui/material/Container';
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InsertCommentRoundedIcon from '@mui/icons-material/InsertCommentRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import Routes from '@/logic/routes';
import Link from 'next/link';
import { getSingleSong } from '@/logic/local_logic';
import React, { useState } from 'react';
import { GenericModal } from '@/components/modals';
import usePartsSong from '@/logic/hooks/use_parts_song';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { ModalBottomSheetAddPart } from '@/components/bottom_sheet';
import Button from '@mui/material/Button';

// TODO: Add pending parts if you're the owner

PartsPage.getInitialProps = async (props: any) => {
  const { id } = props.query;
  return { id };
};

interface PropsPartsPage {
  id: string;
}

export default function PartsPage(props: PropsPartsPage): JSX.Element {
  const {
    parts,
    content,
    loadingParts,
    loadingSinglePart,
    fetchSinglePart,
    fetchParts
  } = usePartsSong(props.id);
  const [part, setPart] = useState('');
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
        <Button
          onClick={() => setOpenNewPart(true)}
          variant="outlined"
          sx={{ m: 2 }}
        >
          Carica una nuova parte
        </Button>
        <Typography variant="h2" component="h2" sx={{ mb: 4, mt: 2 }}>
          Seconde voci
        </Typography>
        {loadingParts ? (
          <CircularProgress />
        ) : parts.length === 0 ? (
          <Typography
            style={{
              whiteSpace: 'pre-wrap',
              textAlign: 'center',
              fontWeight: 400
            }}
            variant="h4"
            component="h4"
          >
            {'Nessuna seconda voce è stata ancora caricata!'}
          </Typography>
        ) : (
          <List>
            <ListItem disablePadding>
              <ListItemButton LinkComponent={Link} href={Routes.Login}>
                <ListItemIcon>
                  <AccountCircleRoundedIcon />
                </ListItemIcon>
                <ListItemText primary="Account" />
              </ListItemButton>
            </ListItem>
            {parts.map((p) => {
              return (
                <ListItem disablePadding key={p.idPart}>
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
            <ListItem disablePadding>
              <ListItemButton LinkComponent={Link} href={Routes.Feedback}>
                <ListItemIcon>
                  <InsertCommentRoundedIcon />
                </ListItemIcon>
                <ListItemText primary="Feedback" />
              </ListItemButton>
            </ListItem>
          </List>
        )}
        <GenericModal
          open={part !== ''}
          handleClose={() => setPart('')}
          content={
            loadingSinglePart ? (
              <CircularProgress />
            ) : (
              <AudioPlayer
                autoPlay
                // check https://stackoverflow.com/questions/12951438/play-audio-using-base64-data-in-html5
                src={content}
                showSkipControls={false}
                showJumpControls={false}
                showFilledVolume={false}
                customControlsSection={[
                  RHAP_UI.ADDITIONAL_CONTROLS,
                  RHAP_UI.MAIN_CONTROLS
                ]}
                // customIcons={}
              />
            )
          }
        />
        <ModalBottomSheetAddPart
          open={openNewPart}
          onClose={() => setOpenNewPart(false)}
          afterUpload={() => fetchParts()}
          idSong={props.id}
        />
        {/** TODO: Add button to add parts, and check if name already exists */}
      </Container>
    </main>
  );
}
