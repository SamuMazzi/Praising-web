'use client';

import { useAppDispatch, useAppSelector } from '@/logic/redux/store';
import { getFromStorage, type Song } from '@/logic/local_logic';
import Container from '@mui/material/Container';
import LyricsRoundedIcon from '@mui/icons-material/LyricsRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import IconButton from '@mui/material/IconButton';
import { type InfoLocalSong, modifySong } from '@/logic/redux/info_song_slice';
import { setShowChords } from '@/logic/redux/settings_slice';
import Tooltip from '@mui/material/Tooltip';
import { type MouseEventHandler, useEffect, useState } from 'react';
import Slide from '@mui/material/Slide';
import { type CustomSongInfo } from '@/logic/server/database';
import useFirebaseAuth from '@/logic/hooks/use_auth';
import { ModalCreateAccountForThisAction } from './modals';

interface PropsActionSong {
  song: Song;
  versionSong?: CustomSongInfo;
  onPressVideo: () => void;
  videoIsPlaying: boolean;
  setOpenSheet: () => void;
  fontSize: number;
  setEditMode: () => void;
}

const ActionIconButton = (props: {
  title: string;
  children: React.ReactNode;
  index?: number;
  visible?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  id: string;
  color?:
    | 'inherit'
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning';
}) => {
  const { title, children, index, visible, onClick, ...propsIconButton } =
    props;

  if (index === undefined) {
    // Refactor this
    return (
      <Tooltip title={title} placement="left">
        <IconButton
          sx={{
            boxShadow: 10,
            p: 1.5,
            m: 1,
            backgroundColor: 'background.paper'
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onClick !== undefined) {
              onClick(e);
            }
          }}
          {...propsIconButton}
        >
          {children}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Slide
      direction="left"
      in={visible}
      timeout={index * 0.7 * 110 + (visible === true ? 0 : -100)}
      appear
      mountOnEnter
    >
      <Tooltip title={title} placement="left">
        <IconButton
          sx={{
            boxShadow: 10,
            p: 1.5,
            m: 1,
            backgroundColor: 'background.paper'
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onClick !== undefined) {
              onClick(e);
            }
          }}
          {...propsIconButton}
        >
          {children}
        </IconButton>
      </Tooltip>
    </Slide>
  );
};

export default function ActionsSong(props: PropsActionSong) {
  const [openModal, setOpenModal] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(true);
  const { authUser, loading } = useFirebaseAuth();
  const infoSong: InfoLocalSong | undefined = useAppSelector(
    (state) => state.infoSongs.infoSongs[props.song.id]
  );
  const showChords = useAppSelector((state) => state.settings.showChords);
  const dispatch = useAppDispatch();
  const actualTranspose = infoSong?.transpose ?? 0;
  const fontSize = infoSong?.zoom ?? 17;
  useEffect(() => {
    if (props.fontSize !== undefined && props.fontSize !== fontSize) {
      dispatch(modifySong({ id: props.song.id, zoom: props.fontSize }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const canEdit =
    props.versionSong === undefined ||
    props.versionSong.author === authUser?.uid;

  const actionsInfo = [
    {
      id: 'chordsButton',
      title: 'Mostra accordi',
      onClick: () => dispatch(setShowChords(!showChords)),
      color: showChords ? 'primary' : undefined,
      icon: <LyricsRoundedIcon />
    },
    {
      id: 'transposeUpButton',
      title: '+1 #',
      onClick: () =>
        dispatch(
          modifySong({ id: props.song.id, transpose: actualTranspose + 1 })
        ),
      color: actualTranspose > 0 ? 'primary' : undefined,
      icon: <KeyboardArrowUpRoundedIcon />
    },
    {
      id: 'transposeDownButton',
      title: '-1 ♭',
      onClick: () =>
        dispatch(
          modifySong({ id: props.song.id, transpose: actualTranspose - 1 })
        ),
      color: actualTranspose < 0 ? 'primary' : undefined,
      icon: <KeyboardArrowDownRoundedIcon />
    },
    {
      id: 'zoomInButton',
      title: '+ Zoom',
      onClick: () =>
        dispatch(modifySong({ id: props.song.id, zoom: fontSize + 1 })),
      color: fontSize > 17 ? 'primary' : undefined,
      icon: <ZoomInRoundedIcon />
    },
    {
      id: 'zoomOutButton',
      title: '- Zoom',
      onClick: () =>
        dispatch(modifySong({ id: props.song.id, zoom: fontSize - 1 })),
      color: fontSize < 17 ? 'primary' : undefined,
      icon: <ZoomOutRoundedIcon />
    },
    {
      id: 'playButton',
      title: 'Riproduci video',
      onClick: props.onPressVideo,
      color: props.videoIsPlaying ? 'primary' : undefined,
      icon: <PlayArrowRoundedIcon />
    },
    {
      id: 'playlistButton',
      title: 'Aggiungi a playlist',
      onClick: props.setOpenSheet,
      icon: <PlaylistAddRoundedIcon />
    },
    {
      id: 'editSong',
      title: 'Modifica la canzone',
      onClick: () => {
        if (loading) {
          return;
        }
        if (authUser?.email === null) {
          setOpenModal(true);
          return;
        }
        props.setEditMode();
      },
      icon: <EditRoundedIcon />,
      visible: canEdit && menuExpanded
    }
  ];

  return (
    <Container
      disableGutters
      sx={{ width: 30 }}
      style={{
        position: 'fixed',
        top: 70,
        right: 45,
        overflow: 'inherit !important'
      }}
    >
      {/* overflow property is only needed for the tutorial */}
      <ActionIconButton
        id="menuButton"
        color={menuExpanded ? 'primary' : undefined}
        onClick={() => {
          setMenuExpanded(!menuExpanded);
        }}
        title="Mostra menu"
      >
        <MenuRoundedIcon />
      </ActionIconButton>
      {actionsInfo.map((action, index) => (
        <ActionIconButton
          key={index}
          id={action.id}
          title={action.title}
          onClick={action.onClick}
          color={action.color as 'primary' | undefined}
          index={index + 1}
          visible={action.visible ?? menuExpanded}
        >
          {action.icon}
        </ActionIconButton>
      ))}
      <ModalCreateAccountForThisAction
        // title="Modifica la canzone"
        // message="Questa funzionalità sarà disponibile a breve, stay tuned!"
        title="Registrati"
        message="Per poter modificare questa canzone devi prima registrarti"
        open={openModal}
        handleClose={(): void => {
          setOpenModal(false);
        }}
      />
    </Container>
  );
}
