import React, { useState } from 'react';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import TextField from '@mui/material/TextField';
import Fab from '@mui/material/Fab';
import { addModifiedSongToServerStorage } from '@/logic/server/storage';
import {
  addEditedSongToDatabase,
  deleteEditedSongFromDatabase,
  editEditedSongToDatabase
} from '@/logic/server/database';
import useFirebaseAuth from '@/logic/hooks/use_auth';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { Container, useTheme } from '@mui/material';
import CloseRounded from '@mui/icons-material/CloseRounded';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { HideOnScroll, SongTitleAppBar } from './appbar';
import { getSingleSong } from '@/logic/local_logic';
import { EmailPayloadVersionSong } from '@/logic/server/emails';

interface PropsSongAppBar {
  id: string;
  title: string;
  versionIndex: number;
  goBack: () => void;
  deleteSong: () => Promise<void>;
}

const EditableSongAppBar = (props: PropsSongAppBar) => {
  const theme = useTheme();

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
            <IconButton edge="start" sx={{ mr: 2 }} onClick={props.goBack}>
              <ArrowBackRoundedIcon />
            </IconButton>
            <SongTitleAppBar
              title={props.title}
              versionText={
                props.versionIndex === -1 ? '' : `Ver ${props.versionIndex + 1}`
              }
            />
            <Box sx={{ flexGrow: 0, display: 'flex' }} alignItems="center">
              {props.versionIndex !== -1 && (
                <IconButton
                  onClick={() => {
                    if (props.versionIndex === -1) {
                      return;
                    }
                    void props.deleteSong();
                  }}
                >
                  <DeleteRoundedIcon color="action" />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
    </React.Fragment>
  );
};

export const EditableSong = (props: {
  songId: string;
  data: string;
  setEditMode: (reload: boolean, idVersion?: string) => void;
  idExistingVersion?: string;
  versionIndex: number;
}) => {
  const { authUser, infoProfile, loading } = useFirebaseAuth();
  const [data, setData] = useState(props.data);
  const song = getSingleSong(props.songId);
  const theme = useTheme();

  const handleSave = async (): Promise<void> => {
    if (authUser === null || infoProfile === undefined || loading) {
      // TODO: Implement error handling for loading === true
      return;
    }
    if (
      infoProfile.counter_pending_songs !== undefined &&
      infoProfile.counter_pending_songs > 10
    ) {
      // TODO: This should be implemented also on server side
      alert(
        'Hai troppe canzoni in attesa di revisione. Attendi che vengano revisionate.'
      );
      return;
    }
    let idVersion = '';
    if (props.idExistingVersion === undefined) {
      idVersion = await addEditedSongToDatabase(authUser.uid, props.songId);
    } else {
      idVersion = props.idExistingVersion;
      await editEditedSongToDatabase(props.songId, idVersion);
    }
    await addModifiedSongToServerStorage(idVersion, data, props.songId);
    props.setEditMode(true, idVersion);

    // Email notification
    const emailData: EmailPayloadVersionSong = {
      userId: authUser.uid,
      songId: props.songId,
      versionId: idVersion,
      nameSong: song?.name ?? '',
      email: authUser.email ?? ''
    };
    const response = await fetch('/api/notification-song-version', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });
    if (response.status !== 200) {
      const text = await response.text();
      console.error('Error sending email.', text);
    }
  };

  return (
    <Container
      disableGutters
      sx={{ minHeight: '100vh', width: '100vw' }}
      style={{ backgroundColor: theme.palette.background.default }}
    >
      <EditableSongAppBar
        id={props.songId}
        title={song?.name ?? ''}
        versionIndex={props.versionIndex}
        goBack={() => {
          props.setEditMode(false, props.idExistingVersion);
        }}
        deleteSong={async () => {
          if (props.idExistingVersion === undefined) {
            return;
          }
          await deleteEditedSongFromDatabase(
            authUser?.uid ?? '',
            props.songId,
            props.idExistingVersion
          );
          props.setEditMode(true);
        }}
      />
      <Container sx={{ py: 3.5 }} />
      <Container disableGutters sx={{ py: 1 }}>
        <TextField
          fullWidth
          multiline
          value={data}
          onChange={(e) => {
            setData(e.target.value);
          }}
          rows={data.split('\n').length}
          sx={{ mt: 2, mb: 10, px: 0.5 }}
          slotProps={{
            input: {
              style: {
                color: theme.palette.mode === 'dark' ? 'white' : 'black'
              }
            }
          }}
        />
        <Fab
          size="medium"
          style={{
            margin: 0,
            top: 'auto',
            right: 87,
            bottom: 22.5,
            left: 'auto',
            position: 'fixed'
          }}
          color="warning"
          onClick={() => {
            props.setEditMode(false, props.idExistingVersion);
          }}
        >
          <CloseRounded />
        </Fab>
        <Fab
          style={{
            margin: 0,
            top: 'auto',
            right: 20,
            bottom: 20,
            left: 'auto',
            position: 'fixed'
          }}
          color="primary"
          aria-label="Confirm"
          onClick={() => {
            void handleSave();
          }}
        >
          <CheckRoundedIcon />
        </Fab>
      </Container>
    </Container>
  );
};
