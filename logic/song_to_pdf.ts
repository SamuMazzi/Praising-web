import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { renderSong } from './handle_text_song';
import { getSingleSong } from './local_logic';
import { type ChordNotations } from './redux/settings_slice';
import { fetcher } from './hooks/use_content_song';
import { getHtmlPdfPage } from '@/components/pdf_page';

const PAGE_WIDTH = 210; // width of regular a4 paper
const PAGE_HEIGHT = 295; // height of regular a4 paper

interface InfoRendering {
  backgroundColor: string;
  textColor: string;
  chordNotation: ChordNotations;
}

interface DataInfo extends InfoRendering {
  songs: string[];
}

export const printDocument = async (
  idSong: string,
  props: InfoRendering
): Promise<void> => {
  const song = getSingleSong(idSong);
  if (song === undefined) {
    return;
  }
  const pdfSong = new SongPDF(props);
  await pdfSong.createPdf([idSong], song.name);
};

export const playlistToPdf = async (
  title: string,
  data: DataInfo
): Promise<void> => {
  const pdfSong = new SongPDF(data);
  await pdfSong.createPdf(data.songs, title);
};

class SongPDF {
  private readonly pdf: jsPDF;
  private readonly infoRendering: InfoRendering;
  private availableHeightPage: number = PAGE_HEIGHT;

  constructor(infoRendering: InfoRendering) {
    // eslint-disable-next-line new-cap
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.infoRendering = infoRendering;
  }

  public async createPdf(songIds: string[], titleFile: string): Promise<void> {
    const futures = songIds.map(async (idSong) => {
      await this.createSinglePageSong(idSong);
    });
    // TODO: Maybe order is not preserved
    await Promise.all(futures);

    this.pdf.deletePage(1); // To fix the first empty page
    this.pdf.save(`Praising - ${titleFile}.pdf`);
  }

  private async createSinglePageSong(id: string): Promise<void> {
    const data = (await fetcher(`/api/song/${encodeURIComponent(id)}`)) as
      | string
      | undefined
      | null;
    const song = getSingleSong(id);

    if (data === undefined || data === null || song === undefined) {
      return;
    }
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

  private async addSongToPdf(input: HTMLElement): Promise<void> {
    const canvas = await html2canvas(input, {
      backgroundColor: this.infoRendering.backgroundColor
    });
    const imgData = canvas.toDataURL('image/png');
    let yOffset = 0;
    let imgWidth = PAGE_WIDTH;
    let imgHeight = (canvas.height * PAGE_WIDTH) / canvas.width;
    const alreadySongsInPage = this.availableHeightPage !== PAGE_HEIGHT;

    if (imgHeight > PAGE_HEIGHT && !alreadySongsInPage) {
      // If image is too high and the page is free, resize it
      imgHeight = PAGE_HEIGHT;
      imgWidth = canvas.width * (PAGE_HEIGHT / canvas.height);
    }
    if (alreadySongsInPage && imgHeight < this.availableHeightPage) {
      yOffset = PAGE_HEIGHT - this.availableHeightPage;
    } else {
      // Cannot fit more songs in this page, so creating another one and reset the available height
      this.availableHeightPage = PAGE_HEIGHT;
      this.pdf.addPage();
      this.pdf.setFillColor(this.infoRendering.backgroundColor);
      this.pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT + 5, 'F');
    }
    this.pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);
    this.availableHeightPage -= imgHeight;
  }
}
