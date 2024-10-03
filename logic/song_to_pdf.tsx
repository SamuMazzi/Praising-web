import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { InfoRenderSong, renderSong } from "./handle_text_song";
import ReactDOMServer from "react-dom/server";
import { SongDiv } from "@/components/song_div";
import { getSingleSong, Song } from "./local_logic";
import { ChordNotations } from "./redux/settings_slice";


const PAGE_WIDTH = 210;  // width of regular a4 paper
const PAGE_HEIGHT = 295; // height of regular a4 paper

interface InfoRendering {
    background_color: string,
    text_color: string,
    chord_notation: ChordNotations,
}

interface DataInfo extends InfoRendering {
    songs: string[]
}

export const printDocument = async (id_song: string, props: InfoRendering) => {
    const song = getSingleSong(id_song)
    if (!song) {
        return
    }
    const pdf = new jsPDF("p", "mm", "a4");

    await createSinglePageSong(pdf, id_song, props);
    pdf.deletePage(1);  // To fix the first empty page
    pdf.save("Praising - " + song.name + ".pdf");
}

export const playlistToPdf = async (title: string, data: DataInfo) => {
    const pdf = new jsPDF();

    const futures = data.songs.map(id_song => createSinglePageSong(pdf, id_song, data))
    // TODO: Maybe order is not preserved
    await Promise.all(futures)

    pdf.deletePage(1);  // To fix the first empty page
    pdf.save("Praising - " + title + ".pdf");
}

const addSongToPdf = async (pdf: jsPDF, input: HTMLElement, props: InfoRendering) => {
    const canvas = await html2canvas(input, {backgroundColor: props.background_color});
    const imgData = canvas.toDataURL('image/png');
    const x_offset = 5;
    const y_offset = 5;
    const imgWidth = PAGE_WIDTH - x_offset;
    const imgHeight = (canvas.height * PAGE_WIDTH / canvas.width);
    
    pdf.addPage();
    pdf.setFillColor(props.background_color);
    pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT + x_offset, 'F');
    pdf.addImage(imgData, 'PNG', x_offset, y_offset, imgWidth, Math.min(PAGE_HEIGHT - y_offset, imgHeight));
}

function PagePDFSong(props: {song: Song | undefined, info: InfoRenderSong}) {
    if (props.song === undefined) {
        return <div></div>
    }

    return (
        <div>
            <p style={{fontSize: 40, fontWeight: "bold", lineHeight: 1}}>{props.song.name}</p>
            {/* FIXME: Fix spacing */}
            {/* <p style={{fontSize: 25, fontStyle: "italic", lineHeight: 1}}>Praising</p> */}
            <SongDiv sections={props.info.sections} infoSong={props.song}/>
        </div>
    )
}
  
const createSinglePageSong = async (pdf: jsPDF, id: string, info_rendering: InfoRendering) => {
    const data = await (await fetch('/api/song/' + encodeURIComponent(id))).json()
    const song = getSingleSong(id)

    if (!data) {
        return
    }
    const info = renderSong({
        fileContent: data,
        showChords: true,
        transpose: song?.transpose,
        fontSize: song?.scaleFactor,
        chordNotation: info_rendering.chord_notation
    })
    const html = ReactDOMServer.renderToString(<PagePDFSong song={song} info={info}/>);
    const container = document.createElement('tmp_print_div_' + id);
    container.innerHTML = html;
    document.body.appendChild(container);

    try {
        await addSongToPdf(pdf, container, info_rendering);
    } finally {
        // Clean up: remove the temporary container
        document.body.removeChild(container);
    }
}
