import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { type InfoRenderSong, renderSong } from './handle_text_song';
import ReactDOMServer from 'react-dom/server';
import { SongDiv } from '@/components/song_div';
import { getSingleSong, type Song } from './local_logic';
import { type ChordNotations } from './redux/settings_slice';
import React from 'react';
import { fetcher } from './hooks/use_content_song';

const PAGE_WIDTH = 210; // width of regular a4 paper
const PAGE_HEIGHT = 295; // height of regular a4 paper
// FIXME: Fix the size of the page (Acclamate a Dio)

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
  // eslint-disable-next-line new-cap
  const pdf = new jsPDF('p', 'mm', 'a4');

  await createSinglePageSong(pdf, idSong, props);
  pdf.deletePage(1); // To fix the first empty page
  pdf.save('Praising - ' + song.name + '.pdf');
};

export const playlistToPdf = async (
  title: string,
  data: DataInfo
): Promise<void> => {
  // eslint-disable-next-line new-cap
  const pdf = new jsPDF();

  const futures = data.songs.map(async (idSong) => {
    await createSinglePageSong(pdf, idSong, data);
  });
  // TODO: Maybe order is not preserved
  await Promise.all(futures);

  pdf.deletePage(1); // To fix the first empty page
  pdf.save(`Praising - ${title}.pdf`);
};

const addSongToPdf = async (
  pdf: jsPDF,
  input: HTMLElement,
  props: InfoRendering
): Promise<void> => {
  const canvas = await html2canvas(input, {
    backgroundColor: props.backgroundColor
  });
  const imgData = canvas.toDataURL('image/png');
  const imgWidth = PAGE_WIDTH;
  const imgHeight = (canvas.height * PAGE_WIDTH) / canvas.width;

  pdf.addPage();
  pdf.setFillColor(props.backgroundColor);
  pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT + 5, 'F');
  pdf.addImage(imgData, 'PNG', 0, -5, imgWidth, imgHeight);
};

function PagePDFSong(props: {
  song: Song | undefined;
  info: InfoRenderSong;
}): JSX.Element {
  if (props.song === undefined) {
    return <div></div>;
  }

  return (
    <>
      <div style={{display: "flex", alignItems: "center"}}>
        <p style={{ fontSize: 40, fontWeight: 'bold', lineHeight: 1, marginLeft: 30 }}>
          {props.song.name}
        </p>
        <p style={{fontSize: 25, fontStyle: "italic", lineHeight: 1, marginLeft: 10}}> - Praising</p>
      </div>
      <SongDiv sections={props.info.sections} infoSong={props.song} />
    </>
  );
}

const createSinglePageSong = async (
  pdf: jsPDF,
  id: string,
  infoRendering: InfoRendering
): Promise<void> => {
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
    chordNotation: infoRendering.chordNotation
  });
  const html = ReactDOMServer.renderToString(
    <PagePDFSong song={song} info={info} />
  );
  const container = document.createElement('tmp_print_div_' + id);
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    await addSongToPdf(pdf, container, infoRendering);
  } finally {
    // Clean up: remove the temporary container
    document.body.removeChild(container);
  }
};
