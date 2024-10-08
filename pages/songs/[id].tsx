import Container from '@mui/material/Container';
import { SongAppBar } from '@/components/appbar';
import {
  getFromStorage,
  getSingleSong,
  saveToStorage,
  updateLastRecentsSongs
} from '@/logic/local_logic';
import ActionsSong from '@/components/actions_song';
import { ModalBottomSheetSong } from '@/components/bottom_sheet';
import React, { useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import Box from '@mui/material/Box';
import { useWakeLock } from 'react-screen-wake-lock';
import Typography from '@mui/material/Typography';
import { useAppSelector } from '@/logic/redux/store';
import { type InfoLocalSong } from '@/logic/redux/info_song_slice';
import { renderSong } from '@/logic/handle_text_song';
import { MessageSnackbar } from '@/components/pers_snackbar';
import IconButton from '@mui/material/IconButton';
import CloseRounded from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import useSWR from 'swr';
import { type Playlist } from '@/logic/redux/playlist_slice';
import ShimmerSegments from '@/components/shimmer_effect/shimmer_segments';
import TextField from '@mui/material/TextField';
import Fab from '@mui/material/Fab';
import { useTheme } from '@mui/material';
// import LinearProgress from '@mui/material/LinearProgress'
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
// import { renderToString } from 'react-dom/server';
import Head from 'next/head';
import { SongDiv } from '@/components/song_div';
import assert from 'assert';

// TODO: Add highlight of parts of text in song (also for sessions) -> take a look at transitions/modal/popover

SongPage.getInitialProps = async (props: any) => {
  const { id, playlistId } = props.query;
  return { id, playlistId };
};

interface PropsSongPage {
  id: string;
  playlistId: string | undefined;
}

const fetcher = async (url: string): Promise<void> =>
  await fetch(url)
    .then(async (res) => await res.json())
    .catch((err) => {
      console.log(err);
    });

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
  const { data, error, isLoading } = useSWR(
    '/api/song/' + encodeURIComponent(props.id),
    fetcher
  );
  const song = getSingleSong(props.id);
  const playlist: Playlist | undefined = useAppSelector((state) =>
    props.playlistId !== undefined
      ? state.playlist.playlist[props.playlistId]
      : undefined
  );
  const [openModalPlaylist, setOpenModalPlaylist] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const infoSong: InfoLocalSong | undefined = useAppSelector((state) =>
    song?.id !== undefined ? state.infoSongs.infoSongs[song.id] : undefined
  );
  const showChords = useAppSelector((state) => state.settings.showChords);
  const { isSupported, released, request, release } = useWakeLock({});
  const [messageSnackbar, setMessageSnackbar] = useState('');
  const chordNotation = useAppSelector((state) => state.settings.chordNotation);
  const [editMode, setEditMode] = useState(false);
  const theme = useTheme();

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

  const handlePressVideo = (): void => {
    if (song?.link !== undefined) {
      setShowVideo((old) => !old);
    } else {
      setMessageSnackbar('Link non disponibile per questa canzone');
    }
  };

  // if(props.fileContent === undefined || props.song === undefined) {
  if (error !== undefined || isLoading) {
    console.log(isLoading);
    console.error(error);
    return (
      <Container sx={{ minHeight: '100vh' }}>
        <SongAppBar id={''} title={''} />
        {isLoading ? (
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
    fileContent: data as unknown as string, // props.fileContent
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

  return (
    <>
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
      <main>
        <Container
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
          />
          <Container sx={{ py: 3.5 }} />
          {!editMode && (
            <ActionsSong
              song={song}
              fontSize={fontSize}
              videoIsPlaying={showVideo}
              onPressVideo={handlePressVideo}
              setOpenSheet={() => {
                setOpenModalPlaylist(true);
              }}
              setEditMode={() => {
                setEditMode(true);
              }}
            />
          )}
          <Container disableGutters sx={{ py: 1 }}>
            {editMode ? (
              <EditableSong
                data={data as unknown as string}
                setEditMode={() => {
                  setEditMode(false);
                }}
              />
            ) : (
              <SongDiv sections={sections} infoSong={infoSong} />
            )}
          </Container>
          {showVideo && song.link !== undefined && (
            <Box
              style={{ position: 'fixed', bottom: 20, right: 0 }}
              sx={{
                px: 2,
                pb: 2,
                mr: 3,
                backgroundColor: 'background.paper',
                borderRadius: 4,
                boxShadow: 12,
                maxWidth: '90%'
              }}
            >
              <IconButton
                edge="start"
                onClick={() => {
                  setShowVideo(false);
                }}
              >
                <CloseRounded />
              </IconButton>
              <YouTube
                videoId={song?.link?.split('youtu.be/')[1]}
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

function EditableSong(props: {
  data: string;
  setEditMode: () => void;
}): JSX.Element {
  const [data, setData] = useState(props.data);
  const theme = useTheme();
  // TODO: Ora va aggiunto upload canzone modificata e check se canzone modificata ad ogni apertura file (si potrebbe tenere un indice per ogni profilo utente per ridurre letture)
  return (
    <>
      <TextField
        // style={{textAlign: 'left'}}
        fullWidth
        multiline
        value={data}
        onChange={(e) => {
          setData(e.target.value);
        }}
        rows={data.split('\n').length}
        sx={{ my: 2 }}
        InputProps={{
          style: { color: theme.palette.mode === 'dark' ? 'white' : 'black' }
        }}
      />
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
        onClick={props.setEditMode}
      >
        <CheckRoundedIcon />
      </Fab>
    </>
  );
}
