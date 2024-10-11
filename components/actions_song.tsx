import { useAppDispatch, useAppSelector } from '@/logic/redux/store';
import { type Song } from '@/logic/local_logic';
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
import React, { useEffect, useState } from 'react';
import Slide from '@mui/material/Slide';
import { type CustomSongInfo } from '@/logic/server/database';
import useFirebaseAuth from '@/logic/hooks/use_auth';

interface PropsActionSong {
  song: Song;
  versionSong?: CustomSongInfo;
  onPressVideo: () => void;
  videoIsPlaying: boolean;
  setOpenSheet: () => void;
  fontSize: number;
  setEditMode: () => void;
}

const ActionIconButton = (props: any): JSX.Element => {
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
              onClick();
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
              onClick();
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

export default function ActionsSong(props: PropsActionSong): JSX.Element {
  const [menuExpanded, setMenuExpanded] = useState(true);
  const { authUser } = useFirebaseAuth();
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
  }, []);
  const canEdit = false; // props.versionSong === undefined || props.versionSong.author === authUser?.uid;

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
      onClick: props.setEditMode,
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
          color={action.color}
          index={index + 1}
          visible={action.visible ?? menuExpanded}
        >
          {action.icon}
        </ActionIconButton>
      ))}
    </Container>
  );
}
