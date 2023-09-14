import Html from 'react-pdf-html';
import ReactDOMServer from 'react-dom/server';
import { Page, Text, View, Document, StyleSheet, renderToFile } from '@react-pdf/renderer';
import { RenderActualSong } from './render_actual_song';
import { Playlist } from '@/logic/redux/playlist_slice';
import { renderSong } from '@/logic/handle_text_song';
import { useAppSelector } from '@/logic/redux/store';
import { InfoLocalSong } from '@/logic/redux/info_song_slice';
import { getInfoSongsStorage, getLocalChordNotation, getSingleSong } from '@/logic/local_logic';
import { ChordNotations } from '@/logic/redux/settings_slice';


interface PropsPagePDFSong {
    id_song: string
    show_chords: boolean
    chord_notation: ChordNotations
}

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
    const element = <RenderActualSong songHtml={info.songText} fontSize={infoSong?.zoom} />
    const html = ReactDOMServer.renderToStaticMarkup(element);
    return (
        <Page size='A4'>
            <Html>{html}</Html>
        </Page>
    )
}

export const renderPDFPlaylist = async (playlist: Playlist) => {
    const chordNotation = getLocalChordNotation()
    const pagesPDF = [] //TODO: Maybe devi mettere questo in API route
    for (const s of playlist.songs) {
        const pageSong = await getPagePDFSong({id_song: s, show_chords: true, chord_notation: chordNotation}) // TODO: Metti Checkbox per scelta chords
        pagesPDF.push(pageSong)
    }
    const pdf_final = (
        <Document>
            {pagesPDF}
        </Document>
    )
    renderToFile(pdf_final, `${__dirname}/example.pdf`);
}

// 