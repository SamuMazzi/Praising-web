// Import per nome, non l'export di default della libreria: quel default e' un
// oggetto che tiene insieme tutti i formatter (PdfFormatter, i measurer,
// ecc.), quindi usarlo impedisce il tree-shaking e si porta dietro l'intera
// chordsheetjs — 597 kB gzip invece di 281.
import {
  ChordLyricsPair,
  ChordProParser,
  ChordSheetSerializer,
  HtmlDivFormatter,
  Key,
  type SerializedSong,
  type Song
} from 'chordsheetjs';
import { type ChordNotations } from './redux/settings_slice';
import { SOLFEGE } from './local_logic';
import type { Document, Element } from 'domhandler';
import {
  addClass,
  byClass,
  childrenByClass,
  getText,
  hasClass,
  parseHtml,
  removeClass,
  renderNodes,
  setText
} from './dom_light';

interface ParamsRenderSong {
  fileContent: string;
  showChords: boolean;
  transpose?: number;
  fontSize?: number | undefined;
  chordNotation: ChordNotations;
}

const DIESIS_NOTES = [
  'C',
  'G',
  'D',
  'A',
  'E',
  'B',
  'F#',
  'C#',
  'Do',
  'Sol',
  'Re',
  'La',
  'Mi',
  'Si',
  'Fa#',
  'Do#'
];

const CHORUS_CSS = 'chorus';
const CHORD_CSS = 'chord';
const COLUMN_CSS = 'column';
const LYRICS_CSS = 'lyrics';
const ROW_CSS = 'row';
/** Prima riga di un blocco strofa/ritornello: in CSS prende lo spazio sopra
 *  che una volta davano le sezioni comprimibili. */
const BLOCK_START_CSS = 'block-start';
/** Margine orizzontale del testo, per lato (vedi `SongDiv`). */
export const SONG_SIDE_PADDING = 20;

const findLinesChorus = (deserialized: Song): number[] => {
  const linesChorus: number[] = [];
  let cont = 0;
  deserialized.lines.forEach((line) => {
    let isChordLyricsPair = false;
    if (line.items.every((item) => item instanceof ChordLyricsPair)) {
      isChordLyricsPair = true;
    }
    if (isChordLyricsPair) {
      const lyrics = line.items
        .map((item) => item instanceof ChordLyricsPair && item.lyrics)
        .join('')
        .trim();
      if (line.isChorus() && lyrics !== '') {
        linesChorus.push(cont);
      }
      //* Se la riga è fatta solo di testo+accordi e il testo non è vuoto
      if (lyrics !== '') {
        //* Aggiorno solo se è una riga che verrà visualizzata
        cont += 1;
      }
    }
  });
  return linesChorus;
};

/** Needed to remove the space that .chord css selecter would take */
const toggleShowChords = (doc: Document, showChords: boolean): void => {
  byClass(doc, CHORD_CSS).forEach((chord) => {
    if (!showChords) {
      removeClass(chord, CHORD_CSS);
    } else {
      addClass(chord, CHORD_CSS);
    }
  });
};

const boldenChorus = (doc: Document, linesChorus: number[]): void => {
  let cont = -1;
  byClass(doc, ROW_CSS).forEach((row) => {
    if (rowHasLyrics(row)) {
      cont += 1;
    }
    //* Se è Chorus
    if (linesChorus.includes(cont)) {
      addClass(row, CHORUS_CSS);
    }
  });
};

/** I `.lyrics` figli diretti di una `.column` dentro la riga. */
const lyricsOfRow = (row: Element): Element[] =>
  byClass(row, COLUMN_CSS).flatMap((column) =>
    childrenByClass(column, LYRICS_CSS)
  );

const getLyricsRow = (row: Element): string =>
  lyricsOfRow(row)
    .filter((l) => getText(l).trim() !== '')
    .map((l) => getText(l))
    .join('');

const rowHasLyrics = (row: Element): boolean => getLyricsRow(row).length !== 0;

const measureText = (text: string, fontSize: number): number => {
  const widths = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0.230999755859375, 0.3, 0.3, 0.840625, 0.6234375, 0.8,
    0.8, 0.2, 0.5, 0.4546875, 0.5, 0.684375, 0.3, 0.5515625, 0.2109375, 0.5,
    0.628125, 0.3203125, 0.6, 0.6, 0.6296875, 0.628125, 0.6359375, 0.6, 0.63125,
    0.63125, 0.2140625, 0.2640625, 0.55625, 0.7234375, 0.5390625, 0.525,
    1.0140625, 0.7, 0.6140625, 0.8, 0.7078125, 0.5140625, 0.5046875, 0.8, 0.7,
    0.246875, 0.53125, 0.6, 0.5, 0.8625, 0.703125, 0.8, 0.6, 0.8, 0.609375, 0.6,
    0.6, 0.675, 0.7, 1, 0.621875, 0.6, 0.5421875, 0.4234375, 0.659375,
    0.4234375, 0.6296875, 0.734375, 0.3, 0.6765625, 0.7, 0.6078125, 0.6765625,
    0.6203125, 0.3296875, 0.6765625, 0.640625, 0.246875, 0.3484375, 0.6,
    0.246875, 1.03125, 0.640625, 0.640625, 0.7, 0.6765625, 0.4, 0.5234375, 0.4,
    0.640625, 0.6, 0.9, 0.5, 0.6, 0.5, 0.4625, 0.2921875, 0.4625, 0.5203125
  ];
  const avg = 0.5736980237458884;
  return (
    text
      .split('')
      .map((c) =>
        c.charCodeAt(0) < widths.length ? widths[c.charCodeAt(0)] : avg
      )
      .reduce((cur, acc) => acc + cur, 0) * fontSize
  );
};

const adjustFontSize = (doc: Document, oldFontSize: number): number => {
  if (typeof window === 'undefined') {
    return oldFontSize;
  }
  let maxLen = 0;
  let maxLenRow = '';
  byClass(doc, ROW_CSS).forEach((div) => {
    const text = getText(div);
    const lenText = measureText(text, oldFontSize);
    maxLen = Math.max(lenText, maxLen);
    if (lenText === maxLen) {
      maxLenRow = text;
    }
  });
  let i = oldFontSize;
  for (i = oldFontSize; i > 1; --i) {
    if (measureText(maxLenRow, i) < window.innerWidth - 2 * SONG_SIDE_PADDING) {
      break;
    }
  }
  return i;
};

const editHTML = (doc: Document, chordNotation: ChordNotations): string => {
  byClass(doc, LYRICS_CSS).forEach((htmlLyrics) => {
    setText(htmlLyrics, getText(htmlLyrics).replace(/,\s*,/gm, ','));
  });
  // Substitutes chords with their variants
  byClass(doc, CHORD_CSS).forEach((htmlChord) => {
    let out = getText(htmlChord);
    if (chordNotation === SOLFEGE) {
      out = out
        .replace('ma', '+')
        .replace('maj', '+')
        .replace('m', '-')
        .replace(/sus(\d*)/gm, (match, p1) => p1 || '4');
    }
    setText(htmlChord, out);
  });
  const rows = byClass(doc, ROW_CSS);
  let isChorus = false;
  rows.forEach((row, i) => {
    internalEditTML(row);
    const isNewChorus = hasClass(row, CHORUS_CSS);
    if (i > 0 && isChorus !== isNewChorus) {
      addClass(row, BLOCK_START_CSS);
    }
    isChorus = isNewChorus;
  });

  return renderNodes(rows);
};

/**
 * It does several things:
 *
 * - It removes chords from the HTML if the user doesn't want to see them
 * - It sets spaces around chords without lyrics
 * - Fix bug in ChordSheetJS: if there's an empty chord with only whitespace lyrics, it renders an empty <div>
 */
const internalEditTML = (row: Element): void => {
  // TODO: Understand better the purpose of this function

  /** Discendenti con quella classe, passando per le `.column` della riga:
   *  e' il vecchio selettore `.column .classe`. */
  const underColumns = (name: string): Element[] =>
    byClass(byClass(row, COLUMN_CSS), name);

  //* Only lyrics
  if (childrenByClass(row, COLUMN_CSS).length === 1) {
    underColumns(CHORD_CSS).forEach((lyrics) => {
      if (hasClass(lyrics, CHORD_CSS) && !hasClass(lyrics, CHORUS_CSS)) {
        removeClass(lyrics, CHORD_CSS);
      }
    });
  }

  //* Bug in ChordSheetJS: if there's an empty chord with only whitespace lyrics, it renders an empty <div>
  // :has(.no-chord) doesn't work, so this is actually a non-optimal solution, but it should never give any kind of error
  lyricsOfRow(row).forEach((lyrics) => {
    if (getText(lyrics) === '') {
      setText(lyrics, ' ');
    }
  });

  //* Only chords
  if (!rowHasLyrics(row)) {
    underColumns(LYRICS_CSS).forEach((lyrics) => {
      if (hasClass(lyrics, LYRICS_CSS) && !hasClass(lyrics, CHORUS_CSS)) {
        removeClass(lyrics, LYRICS_CSS);
      }
    });
    //* Put spaces around chords
    underColumns(CHORD_CSS).forEach((chord) => {
      setText(chord, ' ' + getText(chord) + ' ');
    });
  }
};

const removeChords = (serializedSong: SerializedSong): void => {
  serializedSong.lines.forEach((line) => {
    line.items.map((v) => {
      //@ts-expect-error SerializedChordLyricsPair
      if (v.type === 'chordLyricsPair') {
        //@ts-expect-error SerializedChordLyricsPair.chords
        v.chords = '';
        //@ts-expect-error SerializedChordLyricsPair.chord
        v.chord = null;
      }
      return v;
    });
  });
};

export interface InfoRenderSong {
  html: string;
  fontSize: number;
  error?: string;
}

/**
 *
 * @returns An object with the HTML produced and the new size of the text
 */
export const renderSong = (props: ParamsRenderSong): InfoRenderSong => {
  try {
    // This is because of a probable ChordSheetJS bug which renders "null" text at the end of the song if there's a blank line (i.e. with "Chiamati per nome")
    props.fileContent = props.fileContent.trim();
    if (props.fileContent === '') {
      return {
        html: '',
        fontSize: 17,
        error: 'Il file è vuoto.'
      };
    }
    const songParsed = new ChordProParser().parse(props.fileContent);

    const serializedSong = new ChordSheetSerializer().serialize(songParsed);
    if (!props.showChords) {
      removeChords(serializedSong);
    }

    let deserialized = new ChordSheetSerializer().deserialize(serializedSong);

    const transpose = props.transpose ?? 0;
    // FIXME: Don't why there's this actually big problem, it can't really change chords from ita to eng
    // if (props.chordNotation === 'symbol') {
    //   transpose = 2 * transpose - 2;
    //   console.log('transpose', transpose);
    // }

    if (transpose !== 0) {
      deserialized = deserialized.transpose(transpose);
    }

    if (deserialized.key !== null) {
      // This is needed because it seems like the normalization is different between major and minor keys (and we want always the major-like one)
      try {
        const majorRootKey = Key.parseOrFail(deserialized.key).toMajor();

        if (DIESIS_NOTES.includes(majorRootKey.toString())) {
          deserialized = deserialized.useAccidental('#');
        } else {
          deserialized = deserialized.useAccidental('b');
        }
      } catch (e) {
        console.error(e);
      }
    }

    deserialized = deserialized.changeMetadata(
      'chord_style',
      props.chordNotation
    );

    const disp = new HtmlDivFormatter({
      normalizeChords: true
    }).format(deserialized);
    const doc = parseHtml(disp);

    const linesChorus = findLinesChorus(deserialized);
    toggleShowChords(doc, props.showChords);
    boldenChorus(doc, linesChorus);
    const stdZoomLevel = 17;
    const fontSize = (props.fontSize ??= adjustFontSize(doc, stdZoomLevel));
    const html = editHTML(doc, props.chordNotation);
    // props.fontSize is undefined when first time opening the song or zoom not set
    return {
      html,
      fontSize
    };
  } catch (error) {
    console.error(error);
    return {
      html: '',
      fontSize: 17,
      error:
        "C'è stato un errore nel leggere il file, riprovare.\n" +
        (error instanceof Error ? error.message : 'Errore sconosciuto')
    };
  }
};
