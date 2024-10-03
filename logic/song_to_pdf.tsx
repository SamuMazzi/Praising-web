import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { renderSong } from "./handle_text_song";
import ReactDOMServer from "react-dom/server";
import { SongDiv } from "@/components/song_div";
import { getSingleSong } from "./local_logic";
import { ChordNotations } from "./redux/settings_slice";


const PAGE_WIDTH = 210;  // width of regular a4 paper
const PAGE_HEIGHT = 295; // height of regular a4 paper


interface PropsPrintDocument {
    background_color: string
    text_color: string
    title: string
}

export const printDocument = async (id_div: string, props: PropsPrintDocument) => {
    const input = document.getElementById(id_div);
    if (input === null) {
        // setMessageSnackbar('Errore durante la stampa')
        return
    }
    const pdf = new jsPDF("p", "mm", "a4");
    await addSongToPdf(pdf, input, props);
    pdf.deletePage(1);  // To fix the first empty page
    pdf.save(props.title + ".pdf");
}

export const addSongToPdf = async (pdf: jsPDF, input: HTMLElement, props: PropsPrintDocument) => {
    const canvas = await html2canvas(input, {backgroundColor: props.background_color});
    const imgData = canvas.toDataURL('image/png');
    const x_offset = 5;
    const y_offset = 20;  // Ideally the size of the title and subtitle
    const imgWidth = PAGE_WIDTH - x_offset;
    const imgHeight = (canvas.height * PAGE_WIDTH / canvas.width);
    
    pdf.addPage();
    pdf.setFillColor(props.background_color);
    pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT + x_offset, 'F');
    pdf.addImage(imgData, 'PNG', x_offset, y_offset, imgWidth, Math.min(PAGE_HEIGHT - y_offset, imgHeight));
    // Title ------------------------------
    // pdf.addFont("poppins", "poppins", "normal");
    const y_pos_title = 10;
    pdf.setTextColor(props.text_color);
    pdf.setFontSize(25);
    pdf.setFont("Helvetica", "bold");
    pdf.text(props.title, PAGE_WIDTH / 2, y_pos_title, {align: 'center'});
    pdf.setFontSize(15);
    pdf.setFont("Helvetica", "italic");
    pdf.text("Praising", PAGE_WIDTH / 2, y_pos_title + 8, {align: 'center'});
    // ------------------------------------
}

interface InfoRendering {
    background_color: string,
    text_color: string,
    chord_notation: ChordNotations,
}

interface DataInfo extends InfoRendering {
    songs: string[]
}

export const playlistToPdf = async (title: string, data: DataInfo) => {
    // Initialize jsPDF
    const pdf = new jsPDF();

    const futures = data.songs.map(id_song => createSinglePageSong(pdf, id_song, data))
    // TODO: Maybe order is not preserved
    await Promise.all(futures)

    pdf.deletePage(1);  // To fix the first empty page
    pdf.save(title + ".pdf");
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
    const html = ReactDOMServer.renderToString(<SongDiv sections={info.sections} infoSong={song}/>);
    const container = document.createElement('tmp_print_div_' + id);
    container.innerHTML = html;
    document.body.appendChild(container);

    try {
        await addSongToPdf(pdf, container, {
            background_color: info_rendering.background_color,
            text_color: info_rendering.text_color,
            title: getSingleSong(id)?.name ?? ''
        });
    } finally {
    // Clean up: remove the temporary container
    document.body.removeChild(container);
    }
}
