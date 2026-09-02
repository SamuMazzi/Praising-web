import { type jsPDF } from 'jspdf';
import { renderSong } from './handle_text_song';
import { getSingleSong, VERSION_APP } from './local_logic';
import { type ChordNotations } from './redux/settings_slice';
import { fetcher } from './hooks/use_content_song';
import { getHtmlPdfPage } from '@/components/pdf_page';
import ChordSheetJS from 'chordsheetjs';

const PAGE_WIDTH = 595.28; // width of regular a4 paper
const PAGE_HEIGHT = 841.89; // height of regular a4 paper
const PADDING_PAGE = 10; // Padding between images and page edges

interface InfoRendering {
  backgroundColor: string;
  textColor: string;
  chordNotation: ChordNotations;
}

interface DataInfo extends InfoRendering {
  songs: string[];
}

/* Function to calculate scaled dimensions for an image */
function calculateDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
) {
  const aspectRatio = width / height;
  let renderWidth = maxWidth - PADDING_PAGE * 2;
  let renderHeight = maxWidth / aspectRatio;

  if (renderHeight > maxHeight) {
    renderHeight = maxHeight;
    renderWidth = maxHeight * aspectRatio;
  }

  return {
    width: renderWidth,
    height: renderHeight
  };
}

const generateJsPdfStdObject = async (): Promise<jsPDF> => {
  const jsPDFModule = await import('jspdf');
  return new jsPDFModule.jsPDF('p', 'pt', 'a4', true);
};

export const printDocument = async (
  idSong: string,
  props: InfoRendering
): Promise<void> => {
  const song = getSingleSong(idSong);
  if (song === undefined) {
    return;
  }
  const pdfSong = new SongPDF(await generateJsPdfStdObject(), props);
  await pdfSong.createPdf([idSong], song.name);
};

export const playlistToPdf = async (
  title: string,
  data: DataInfo
): Promise<void> => {
  const pdfSong = new SongPDF(await generateJsPdfStdObject(), data);
  await pdfSong.createPdf(data.songs, title);
};

class SongPDF {
  private readonly infoRendering: InfoRendering;
  private currentY: number = PADDING_PAGE;
  private isFirstImage: boolean = true;

  constructor(
    private readonly pdf: jsPDF,
    infoRendering: InfoRendering
  ) {
    this.infoRendering = infoRendering;
  }

  public async createPdf(songIds: string[], titleFile: string): Promise<void> {
    /* const futures = songIds.map(async (idSong) => {
      await this.createSinglePageSong(idSong);
    });
    // TODO: Order is not preserved
    await Promise.all(futures); */
    this.addPage();
    for (const idSong of songIds) {
      await this.createSinglePageSong(idSong);
    }

    this.pdf.deletePage(1); // To fix the first empty page
    this.pdf.save(`Praising - ${titleFile}.pdf`);
  }

  private async createSinglePageSong(id: string): Promise<void> {
    const data = (await fetcher(
      `/api/song/${encodeURIComponent(id)}`,
      false
    )) as string | undefined | null;
    const song = getSingleSong(id);

    if (data === undefined || data === null || song === undefined) {
      return;
    }
    let songParsed = new ChordSheetJS.ChordProParser().parse(data);
    songParsed = songParsed.changeMetadata('title', song.name);
    const formatter = new ChordSheetJS.PdfFormatter();
    console.log(formatter.configuration);
    formatter.configure({
      version: VERSION_APP,
      normalizeChords: true,
      layout: {
        header: {
          height: 0,
          content: []
        },
        footer: {
          height: 0,
          content: []
        },
        sections: {
          base: {
            display: {
              // lyricsOnly: true
            }
          }
        },
        global: {} // Useless
      }
    });
    formatter.format(songParsed);
    formatter.save();
    const info = renderSong({
      fileContent: data,
      showChords: true,
      transpose: song?.transpose,
      fontSize: song?.scaleFactor,
      chordNotation: this.infoRendering.chordNotation
    });

    const container = document.createElement('tmp_print_div_' + id);
    container.innerHTML = getHtmlPdfPage({ song, info });
    document.body.appendChild(container);

    try {
      await this.addSongToPdf(container);
    } finally {
      // Clean up: remove the temporary container
      document.body.removeChild(container);
    }
  }

  private addPage() {
    this.currentY = PADDING_PAGE;
    this.pdf.addPage();
    this.pdf.setFillColor(this.infoRendering.backgroundColor);
    this.pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT + 5, 'F');
  }

  private async addSongToPdf(input: HTMLElement): Promise<void> {
    /** html2canvas pesa ~500 kB: serve solo qui, quando si esporta il PDF */
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(input, {
      backgroundColor: this.infoRendering.backgroundColor
    });

    const scaledDims = calculateDimensions(
      canvas.width,
      canvas.height,
      PAGE_WIDTH - PADDING_PAGE * 2,
      PAGE_HEIGHT - PADDING_PAGE * 2
    );

    const imgData = canvas.toDataURL('image/png');

    if (
      !this.isFirstImage &&
      this.currentY + scaledDims.height + PADDING_PAGE > PAGE_HEIGHT
    ) {
      this.addPage();
    }
    this.pdf.addImage(
      imgData,
      'PNG',
      PADDING_PAGE,
      this.currentY,
      scaledDims.width,
      scaledDims.height,
      undefined,
      'FAST'
    );

    // Update Y position for next image
    this.currentY += scaledDims.height + PADDING_PAGE;
    this.isFirstImage = false;
  }
}
