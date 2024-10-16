import Container from '@mui/material/Container';
import { SongAppBar } from '@/components/appbar';
import {
  getFromStorage,
  getSingleSong,
  saveToStorage,
  type Song,
  updateLastRecentsSongs
} from '@/logic/local_logic';
import ActionsSong from '@/components/actions_song';
import { ModalBottomSheetSong } from '@/components/bottom_sheet';
import React, { useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import Box from '@mui/material/Box';
import { useWakeLock } from 'react-screen-wake-lock';
import Typography from '@mui/material/Typography';
import { useAppDispatch, useAppSelector } from '@/logic/redux/store';
import {
  setLocalVersionSong,
  type InfoLocalSong
} from '@/logic/redux/info_song_slice';
import { renderSong } from '@/logic/handle_text_song';
import { MessageSnackbar } from '@/components/pers_snackbar';
import IconButton from '@mui/material/IconButton';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { type Playlist } from '@/logic/redux/playlist_slice';
import ShimmerSegments from '@/components/shimmer_effect/shimmer_segments';
import { useTheme } from '@mui/material';
// import LinearProgress from '@mui/material/LinearProgress'
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import Head from 'next/head';
import { SongDiv } from '@/components/song_div';
import assert from 'assert';
import useContentSong from '@/logic/hooks/use_content_song';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { EditableSong } from '@/components/editable_song';

SongPage.getInitialProps = async (props: any) => {
  const { id, playlistId } = props.query;
  return { id, playlistId };
};

interface PropsSongPage {
  id: string;
  playlistId: string | undefined;
}

const driverObj = driver({
  // TODO: Sistema progress
  nextBtnText: 'Avanti',
  prevBtnText: 'Indietro',
  // doneBtnText: '✕',
  showProgress: true,
  disableActiveInteraction: true,
  /* onPopoverRender: (popover, { config, state }) => {
        const index = state.activeIndex ?? 0
        const len = config.steps?.length ?? 1
        const firstButton = <LinearProgress variant="determinate" sx={{width: 20}} value={index/len} />
        popover.footer.innerHTML = renderToString(firstButton);
    }, */
  progressText: '{{current}} di {{total}}',
  steps: [
    {
      popover: {
        title: 'Tutorial',
        description:
          'Ecco un paio di informazioni per usare al meglio Praising.'
      }
    },
    {
      element: 'div #menuButton',
      popover: {
        title: 'Funzionalità',
        description:
          'Premendo questo pulsante puoi sbloccare molte funzionalità di Praising.'
      }
    },
    {
      element: 'div #chordsButton',
      popover: {
        title: 'Accordi',
        description: 'Mostra o nascondi gli accordi'
      }
    },
    {
      element: 'div #transposeUpButton',
      popover: {
        title: 'Trasporta',
        description: 'Trasporta gli accordi in altre tonalità'
      }
    },
    {
      element: 'div #zoomInButton',
      popover: {
        title: 'Zoom',
        description: 'Ingrandisci o rimpicciolisci i caratteri'
      }
    },
    {
      element: 'div #playButton',
      popover: {
        title: 'Ascolta la canzone',
        description:
          'Ascolta la canzone direttamente da Youtube (se possibile).'
      }
    },
    {
      element: 'div #playlistButton',
      popover: {
        title: 'Playlist',
        description: 'Aggiungi la canzone ad una playlist.'
      }
    },
    {
      popover: {
        title: 'Schermo',
        description:
          'Grazie a Praising lo schermo non si spegnerà mai automaticamente mentre sei su una canzone.'
      }
    },
    { popover: { title: 'Buon divertimento!', description: ':)' } }
  ]
});

const TUTORIAL_SHOWN = 'tutorialShown_0';

export default function SongPage(props: PropsSongPage): JSX.Element {
  const song = getSingleSong(props.id);
  const infoSong: InfoLocalSong | undefined = useAppSelector((state) =>
    song?.id !== undefined ? state.infoSongs.infoSongs[song.id] : undefined
  );
  const { content, versions, fetchSong, loadingContent, error } =
    useContentSong(props.id, infoSong?.versionId);
  const songVersionIndex = versions.findIndex(
    (v) => v.idVersion === infoSong?.versionId
  );
  const playlist: Playlist | undefined = useAppSelector((state) =>
    props.playlistId !== undefined
      ? state.playlist.playlist[props.playlistId]
      : undefined
  );
  const [openModalPlaylist, setOpenModalPlaylist] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const showChords = useAppSelector((state) => state.settings.showChords);
  const { isSupported, released, request, release } = useWakeLock({});
  const [messageSnackbar, setMessageSnackbar] = useState('');
  const chordNotation = useAppSelector((state) => state.settings.chordNotation);
  const [editMode, setEditMode] = useState(false);
  const theme = useTheme();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const tutorialNotShown = !(getFromStorage(TUTORIAL_SHOWN) ?? false);
    if (tutorialNotShown) {
      saveToStorage(TUTORIAL_SHOWN, true);
      driverObj.drive();
    }
    const handleVisibilityChange = async (): Promise<void> => {
      if (
        isSupported &&
        (released === true || released === undefined) &&
        document.visibilityState === 'visible'
      ) {
        await request();
      }
    };

    if (song !== undefined) updateLastRecentsSongs(song);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    document.addEventListener('visibilitychange', handleVisibilityChange);
    void request();

    return () => {
      if (released === false) {
        // Return of useEffect get executed also on mount, this snippet prevent this
        document.removeEventListener(
          'visibilitychange',
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          handleVisibilityChange
        );
        void release();
      }
    };
  }, []);

  const callbackSetVersionSong = (index: number): void => {
    assert(song !== undefined, 'Song is undefined');
    if (index === songVersionIndex) return;
    const idVersion = index === -1 ? undefined : versions[index].idVersion;
    dispatch(
      setLocalVersionSong({
        id: song.id,
        versionId: idVersion
      })
    );

    void fetchSong(idVersion);
  };

  const handlePressVideo = (): void => {
    if (song?.link !== undefined) {
      setShowVideo((old) => !old);
    } else {
      setMessageSnackbar('Link non disponibile per questa canzone');
    }
  };

  if (error !== '' || loadingContent) {
    if (error !== '') {
      console.error(error);
    }
    return (
      <Container sx={{ minHeight: '100vh' }}>
        <SongAppBar id={''} title={''} />
        {loadingContent ? (
          <Box sx={{ mt: 15 }}>
            <ShimmerSegments numSegments={30} />
          </Box>
        ) : (
          <Typography sx={{ pt: 15 }} textAlign="center">
            {"C'è stato un'errore, riprovare"}
          </Typography>
        )}
      </Container>
    );
  }

  const info = renderSong({
    fileContent: content,
    showChords,
    transpose: infoSong?.transpose,
    fontSize: infoSong?.zoom,
    chordNotation
  });

  if (info.error !== undefined) {
    return (
      <Container sx={{ minHeight: '100vh' }}>
        <SongAppBar id={''} title={''} />
        <Typography sx={{ pt: 15 }} textAlign="center">
          {info.error}
        </Typography>
      </Container>
    );
  }

  const sections: string[] = info.sections;
  const fontSize: number = info.fontSize;
  // fontsize std: lineHeigth 68, poi -4 tutte le volte
  assert(song !== undefined, 'Song is undefined');

  const HeadComponent = (): JSX.Element => (
    <Head>
      <title>{song.name} - Praising</title>
      <meta
        property="og:title"
        content={'Praising - ' + song.name}
        key="title"
      />
      <meta
        name="og:description"
        content={'Guarda gli accordi della canto ' + song.name}
      />
      <meta
        name="og:keywords"
        content={
          song.name + ', accordi, ' + song.author + ', canzoniere, chords'
        }
      />
    </Head>
  );

  if (editMode) {
    return (
      <>
        <HeadComponent />
        <main>
          <EditableSong
            songId={song.id}
            data={content}
            setEditMode={(reload: boolean, idVersion?: string) => {
              dispatch(
                setLocalVersionSong({
                  id: song.id,
                  versionId: idVersion
                })
              );
              setEditMode(false);
              if (typeof window !== 'undefined' && reload) {
                // TODO: If you edit the same version of the song the page will be reloaded anyway.. fix this sooner or later
                window.location.reload();
              }
            }}
            idExistingVersion={
              songVersionIndex !== -1
                ? versions[songVersionIndex].idVersion
                : undefined
            }
            versionIndex={songVersionIndex}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <HeadComponent />
      <main>
        <Container
          disableGutters
          sx={{ minHeight: '100vh', width: '100vw' }}
          style={{ backgroundColor: theme.palette.background.default }}
        >
          {!isSupported && (
            <Typography>Questo browser non supporta il wakelock</Typography>
          )}
          <SongAppBar
            id={song.id ?? ''}
            title={song.name}
            transpose={infoSong?.transpose}
            playlist={playlist}
            setVersionSong={callbackSetVersionSong}
            versions={versions}
            selectedIndexVersion={songVersionIndex}
          />
          <Container sx={{ py: 3.5 }} />
          <Container disableGutters sx={{ py: 1 }}>
            <SongDiv sections={sections} infoSong={infoSong} />
          </Container>
          <ActionsSong
            song={song}
            fontSize={fontSize}
            videoIsPlaying={showVideo}
            versionSong={
              songVersionIndex !== -1 ? versions[songVersionIndex] : undefined
            }
            onPressVideo={handlePressVideo}
            setOpenSheet={() => {
              setOpenModalPlaylist(true);
            }}
            setEditMode={() => {
              setEditMode(true);
            }}
          />
          {showVideo && song.link !== undefined && (
            <YoutubeVideoBox
              song={song}
              closeVideo={() => {
                setShowVideo(false);
              }}
            />
          )}

          <MessageSnackbar
            handleClose={() => {
              setMessageSnackbar('');
            }}
            message={messageSnackbar}
          />
          <ModalBottomSheetSong
            songId={song.id}
            open={openModalPlaylist}
            onClose={() => {
              setOpenModalPlaylist(false);
            }}
          />
        </Container>
      </main>
    </>
  );
}

const YoutubeVideoBox = (props: {
  song: Song;
  closeVideo: () => void;
}): JSX.Element => {
  const [minimized, setMinimized] = useState(false);

  return (
    <Box
      className="box-video"
      style={{
        position: 'fixed',
        bottom: 20,
        right: 0,
        transition: 'height 0.5s cubic-bezier(0.5, 0, 0.4, 1)'
      }}
      sx={{
        px: 2,
        pb: 2,
        pt: minimized ? 1.2 : 0,
        mr: 3,
        backgroundColor: 'background.paper',
        borderRadius: 4,
        boxShadow: 12,
        width: { xs: '90%', sm: '80%', md: 672 },
        height: 420
      }}
    >
      <Box
        style={{ display: 'flex' }}
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}
      >
        <IconButton edge="start" onClick={props.closeVideo}>
          <CloseRounded />
        </IconButton>
        <Typography
          className="title-video"
          style={{ display: 'none' }}
          sx={{ px: 2 }}
        >
          {props.song.name}
        </Typography>
        <IconButton
          edge="end"
          onClick={() => {
            const newStateMinimized = !minimized;
            const boxVideo = document.getElementsByClassName(
              'box-video'
            )[0] as HTMLElement | null;
            if (boxVideo !== null) {
              boxVideo.classList.toggle('minimized-video', newStateMinimized);
              boxVideo.style.height = newStateMinimized ? '60px' : '420px';
            }
            document
              .querySelector('.title-video')
              ?.setAttribute(
                'style',
                'display: ' + (newStateMinimized ? 'block' : 'none')
              );
            const playerNode = document.getElementsByClassName(
              'video-player'
            )[0] as HTMLElement | null;
            if (playerNode !== null) {
              playerNode.style.display = newStateMinimized ? 'none' : 'block';
            }
            const iconNode = document.getElementsByClassName(
              'icon-minimize-video'
            )[0] as HTMLElement | null;
            if (iconNode !== null) {
              iconNode.style.transform = newStateMinimized
                ? 'rotate(180deg)'
                : '';
            }
            setMinimized(newStateMinimized);
          }}
        >
          <KeyboardArrowDownRoundedIcon
            className="icon-minimize-video"
            style={{ transition: 'transform 0.6s ease' }}
          />
        </IconButton>
      </Box>
      <YouTube
        className="video-player"
        videoId={props.song.link?.split('youtu.be/')[1]}
        opts={{
          width:
            typeof window !== 'undefined'
              ? window.screen.availWidth < 700
                ? (window.screen.availWidth * (4 / 5)).toString()
                : '640'
              : '640',
          playerVars: {
            autoplay: 1
          }
        }}
      />
    </Box>
  );
};
