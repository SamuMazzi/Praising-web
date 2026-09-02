'use client';

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
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
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
import ShimmerSegments from '@/components/shimmer_effect/shimmer_segments';
import { type Config as DriverConfig } from 'driver.js';
import { SongDiv } from '@/components/song_div';
import assert from 'assert';
import useContentSong from '@/logic/hooks/use_content_song';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { EditableSong } from '@/components/editable_song';
import { NextSeo } from 'next-seo';
import { Playlist } from '@/logic/server/database';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import path from 'path';
import { promises as fs } from 'fs';
import songsConfig from '@/logic/songs.config.json';

/** Il player serve solo se l'utente apre il video: lo teniamo fuori dal bundle
 *  iniziale, e senza SSR visto che dipende dall'iframe API di YouTube. */
const YouTube = dynamic(async () => await import('react-youtube'), {
  ssr: false
});

const driverConfig: DriverConfig = {
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
    /* {
      element: 'div #editSong',
      popover: {
        title: 'Modifica',
        description: 'Modifica questo canto. Una volta confermato sarà visibile a tutti ma modificabile solo da te.'
      }
    }, */
    {
      popover: {
        title: 'Schermo',
        description:
          'Grazie a Praising lo schermo non si spegnerà mai automaticamente mentre sei su una canzone.'
      }
    },
    { popover: { title: 'Buon divertimento!', description: ':)' } }
  ]
};

/** driver.js (JS + CSS) viene caricato solo la prima volta che si apre un
 *  canto, quando il tutorial parte davvero. */
const startTutorial = async (): Promise<void> => {
  const { driver } = await import('driver.js');
  await import('driver.js/dist/driver.css');
  driver(driverConfig).drive();
};

const TUTORIAL_SHOWN = 'tutorialShown_0';

interface SongPageProps {
  initialContent: string;
  songId: string;
}

export default function SongPage({ initialContent, songId }: SongPageProps) {
  const router = useRouter();
  const { id, playlistId } = router.query;
  const id_song = (id as string | undefined) ?? songId;
  const playlistIdCode = playlistId as string | undefined;
  const song = getSingleSong(id_song);
  const infoSong: InfoLocalSong | undefined = useAppSelector((state) =>
    song?.id !== undefined ? state.infoSongs.infoSongs[song.id] : undefined
  );
  const searchParams = useSearchParams();

  const vFromUrl = searchParams.get('v') ?? '';
  const [versionSong, setVersionSong] = useState(vFromUrl);
  const { content, versions, fetchSong, loadingContent, error } =
    useContentSong(id_song, versionSong ?? infoSong?.versionId, initialContent);
  const songVersionIndex = versions.findIndex(
    (v) => v.versionId === (versionSong ?? infoSong?.versionId)
  );
  const playlist: Playlist | undefined = useAppSelector((state) =>
    playlistIdCode !== undefined
      ? state.playlist.playlist[playlistIdCode]
      : undefined
  );
  const [openModalPlaylist, setOpenModalPlaylist] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const showChords = useAppSelector((state) => state.settings.showChords);
  const { isSupported, released, request, release } = useWakeLock({});
  const [messageSnackbar, setMessageSnackbar] = useState('');
  const chordNotation = useAppSelector((state) => state.settings.chordNotation);
  const [editMode, setEditMode] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setVersionSong(vFromUrl);
  }, [vFromUrl]);

  useEffect(() => {
    const tutorialNotShown = !(getFromStorage(TUTORIAL_SHOWN) ?? false);
    if (tutorialNotShown) {
      saveToStorage(TUTORIAL_SHOWN, true);
      void startTutorial();
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

    document.addEventListener('visibilitychange', handleVisibilityChange);
    void request();

    return () => {
      if (released === false) {
        // Return of useEffect get executed also on mount, this snippet prevent this
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange
        );
        void release();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const callbackSetVersionSong = (index: number): void => {
    assert(song !== undefined, 'Song is undefined');
    if (index === songVersionIndex) return;
    const idVersion = index === -1 ? undefined : versions[index].versionId;
    // Update URL ---------------
    if (idVersion === undefined) {
      delete router.query.v;
    }
    router.replace(
      {
        query: {
          ...router.query,
          ...(idVersion !== undefined ? { v: idVersion } : {})
        }
      },
      undefined,
      {
        scroll: false,
        shallow: true
      }
    );
    // --------------------------
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
          <Typography sx={{ pt: 15 }} textAlign="center" role="alert">
            Non siamo riusciti a caricare il canto. Controlla la connessione e
            ricarica la pagina.
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

  const songUrl = `https://praising.vercel.app/songs/${song.id}`;
  const songDescription = `Accordi e testo del canto "${song.name}"${song.author ? ` di ${song.author}` : ''}. Trasporta gli accordi, ascolta su YouTube ed esporta in PDF.`;
  const songJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicComposition',
    name: song.name,
    ...(song.author
      ? { composer: { '@type': 'Person', name: song.author } }
      : {}),
    url: songUrl,
    inLanguage: 'it',
    keywords: `accordi, ${song.name}, canti cristiani, liturgia`
  };

  const HeadComponent = () => (
    <>
      <NextSeo
        title={song.name + ' accordi'}
        description={songDescription}
        canonical={songUrl}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: [
              song.name,
              'accordi',
              song.author,
              'canti cristiani',
              'canzoniere',
              'chords',
              'liturgia'
            ]
              .filter(Boolean)
              .join(', ')
          }
        ]}
        openGraph={{
          title: `${song.name} accordi - Praising`,
          description: songDescription,
          url: songUrl,
          type: 'website',
          locale: 'it_IT'
        }}
      />
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(songJsonLd) }}
        />
      </Head>
    </>
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
                ? versions[songVersionIndex].versionId
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
          sx={{
            minHeight: '100vh',
            // `100vw` include la barra di scorrimento verticale e produceva
            // una barra orizzontale su desktop.
            width: '100%',
            backgroundColor: 'background.default'
          }}
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

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = songsConfig.map((song) => ({
    params: { id: song.Id.toString() }
  }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<SongPageProps> = async ({
  params
}) => {
  const id = params?.id as string;
  const songMeta = songsConfig.find((s) => s.Id.toString() === id);

  if (!songMeta) {
    return { notFound: true };
  }

  try {
    const dir = path.resolve('./public', 'accordi');
    const initialContent = await fs.readFile(
      path.join(dir, songMeta['Nome file']),
      'utf8'
    );
    return { props: { initialContent, songId: id } };
  } catch {
    return { props: { initialContent: '', songId: id } };
  }
};

const YoutubeVideoBox = (props: { song: Song; closeVideo: () => void }) => {
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
        <IconButton
          edge="start"
          aria-label="Chiudi il video"
          onClick={props.closeVideo}
        >
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
          aria-label={minimized ? 'Ingrandisci il video' : 'Riduci il video'}
          aria-expanded={!minimized}
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
