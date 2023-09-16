import Html from 'react-pdf-html';
import ReactDOMServer from 'react-dom/server';
import { Page, Text, View, Document, PDFDownloadLink } from '@react-pdf/renderer';
import { RenderActualSong } from './render_actual_song';
import { Playlist } from '@/logic/redux/playlist_slice';
import { renderSong } from '@/logic/handle_text_song';
import { InfoLocalSong } from '@/logic/redux/info_song_slice';
import { getInfoSongsStorage, getLocalChordNotation, getSingleSong } from '@/logic/local_logic';
import { ChordNotations } from '@/logic/redux/settings_slice';
import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { Typography } from '@mui/material';


interface PropsPagePDFSong {
    id_song: string
    show_chords: boolean
    chord_notation: ChordNotations
}
const MyDocument = () => (
    <Document>
      <Page>
        <View>
          <h1>Hello, this is your PDF!</h1>
        </View>
      </Page>
    </Document>
  );

const getPagePDFSong = async (props: PropsPagePDFSong) => {
    const song = getSingleSong(props.id_song)
    if (!song) {
        return null
    }
    const res = await fetch('/api/song/' + props.id_song)
    const data = await res.json()
    const infoSong: InfoLocalSong | undefined = getInfoSongsStorage()[props.id_song]
    const info = renderSong({
        fileContent: data,
        showChords: props.show_chords,
        transpose: infoSong?.transpose,
        zoomLevel: infoSong?.zoom,
        chordNotation: props.chord_notation,
    })
    // TODO: Check infoSong.zoom o info.zoomLevel
    const element = <html>
        <body>
            <RenderActualSong songHtml={info.songText} fontSize={infoSong?.zoom} />
        </body>
    </html>
    const html = ReactDOMServer.renderToString(element);
    console.log(html)
    return (
        <Page size='A4'>
            <View>
                <Html>{html}</Html>
            </View>
        </Page>
    )
}

//TODO: Add space and a little bit of rounding in menu
//TODO: ShowChords in pdf non implementato effettivamente

interface PropsRenderPDFPlaylist {
    playlist: Playlist
    show_chords: boolean
}

const renderPDFPlaylist = async (props: PropsRenderPDFPlaylist) => {
    const chordNotation = getLocalChordNotation()
    const pagesPDF = []
    for (const s of props.playlist.songs) {
        const pageSong = await getPagePDFSong({id_song: s, show_chords: props.show_chords, chord_notation: chordNotation})
        pagesPDF.push(pageSong)
    }
    return (
        <Document>
            {pagesPDF}
        </Document>
    )
}


interface PropsRenderPDFPlaylist {
    playlist: Playlist
    show_chords: boolean
}

export const PDFDownloadButton = (props: PropsRenderPDFPlaylist) => {
    const [doc, setDoc] = useState<JSX.Element | null>(null)
    
    useEffect(() => {
        renderPDFPlaylist(props).then((newDoc) => {
            setDoc(newDoc)
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div>
            {
                doc === null ? <CircularProgress /> :
                <PDFDownloadLink document={doc} fileName={"Playlist_" + props.playlist.name + ".pdf"}>
                    {({ blob, url, loading, error }) =>
                    <Typography>
                        {loading ? 'Loading document...' : 'Download now!'}
                    </Typography>
                    }
                </PDFDownloadLink>
            }
        </div>
    );
}