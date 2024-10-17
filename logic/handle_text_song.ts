import ChordSheetJS, { type Song, Key, SOLFEGE } from 'chordsheetjs';
import * as cheerio from 'cheerio';
import { type ChordNotations } from './redux/settings_slice';

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
const SECTION_CSS = 'section';

const checkChordLyricsPair = (item: any): boolean =>
  item instanceof ChordSheetJS.ChordLyricsPair;

const findLinesChorus = (deserialized: Song): number[] => {
  const linesChorus: number[] = [];
  let cont = 0;
  deserialized.lines.forEach((line) => {
    let isChordLyricsPair = false;
    if (line.items.every(checkChordLyricsPair)) {
      isChordLyricsPair = true;
    }
    if (line.isChorus() && isChordLyricsPair) {
      linesChorus.push(cont);
    }
    //* Se la riga è fatta solo di testo+accordi e il testo non è vuoto
    if (
      isChordLyricsPair &&
      line.items
        .map(
          (item) => item instanceof ChordSheetJS.ChordLyricsPair && item.lyrics
        )
        .join('')
        .trim() !== ''
    ) {
      //* Aggiorno solo se è una riga che verrà visualizzata
      // console.log(cont.toString() + ' ' + line.items.map(item => item instanceof ChordSheetJS.ChordLyricsPair && item.lyrics).join(''))
      cont += 1;
    }
  });
  return linesChorus;
};

/** Needed to remove the space that .chord css selecter would take */
const toggleShowChords = ($: cheerio.CheerioAPI, showChords: boolean): void => {
  $(`.${CHORD_CSS}`).each((i, chord) => {
    if (!showChords) {
      if ($(chord).hasClass(CHORD_CSS)) {
        $(chord).removeClass(CHORD_CSS);
      }
    } else {
      if (!$(chord).hasClass(CHORD_CSS)) {
        $(chord).addClass(CHORD_CSS);
      }
    }
  });
};

const boldenChorus = ($: cheerio.CheerioAPI, linesChorus: number[]): void => {
  let cont = -1;
  $(`.${ROW_CSS}`).each((i, row) => {
    if (rowHasLyrics($, row)) {
      cont += 1;
    }
    //* Se è Chorus
    if (linesChorus.includes(cont)) {
      if (!$(row).hasClass(CHORUS_CSS)) {
        $(row).addClass(CHORUS_CSS);
      }
    }
  });
};

const rowHasLyrics = ($: cheerio.CheerioAPI, row: any): boolean => {
  const lyricsPieces = $(row)
    .find(`.${COLUMN_CSS} > .${LYRICS_CSS}`)
    .filter((i, l) => $(l).text().trim() !== '');
  return lyricsPieces.length !== 0;
};

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

const adjustFontSize = ($: cheerio.CheerioAPI, oldFontSize: number): number => {
  if (typeof window === 'undefined') {
    return oldFontSize;
  }
  let maxLen = 0;
  let maxLenRow = '';
  $(`.${ROW_CSS}`).each((i, div) => {
    const text = $(div).text();
    const lenText = measureText(text, oldFontSize);
    maxLen = Math.max(lenText, maxLen);
    if (lenText === maxLen) {
      maxLenRow = text;
    }
  });
  let i = oldFontSize;
  for (i = oldFontSize; i > 1; --i) {
    if (measureText(maxLenRow, i) < window.innerWidth) {
      break;
    }
  }
  return i;
};

const editHTML = (
  $: cheerio.CheerioAPI,
  chordNotation: ChordNotations
): string[] => {
  const sections: string[] = [];
  let isChorus = false;
  let $2 = cheerio.load(`<div class=${SECTION_CSS}_0></div>`, {}, true);
  $(`.${LYRICS_CSS}`).each((j, htmlLyrics) => {
    const out = $(htmlLyrics).text().replace(/,\s*,/gm, ',');
    $(htmlLyrics).text(out);
  });
  // Substitutes chords with their variants
  $(`.${CHORD_CSS}`).each((j, htmlChord) => {
    let out = $(htmlChord).text();
    if (chordNotation === SOLFEGE) {
      out = out
        .replace('ma', '+')
        .replace('maj', '+')
        .replace('m', '-')
        .replace(/sus(\d*)/gm, (match, p1) => p1 || '4');
    }
    $(htmlChord).text(out);
  });
  $(`.${ROW_CSS}`).each((i, row) => {
    internalEditTML($, row);
    // Divide in sections
    const isNewChorus = $(row).hasClass(CHORUS_CSS);
    if (isChorus !== isNewChorus) {
      sections.push($2.html());
      $2 = cheerio.load(
        `<div class=${SECTION_CSS}_${sections.length}></div>`,
        {},
        true
      );
    }
    $2(`.${SECTION_CSS}_${sections.length}`).append($(row));
    isChorus = isNewChorus;
  });
  sections.push($2.html());

  return sections;
};

/**
 * It does several things:
 *
 * - It removes chords from the HTML if the user doesn't want to see them
 * - It sets spaces around chords without lyrics
 * - Fix bug in ChordSheetJS: if there's an empty chord with only whitespace lyrics, it renders an empty <div>
 */
const internalEditTML = ($: cheerio.CheerioAPI, row: any): void => {
  // TODO: Understand better the purpose of this function

  //* Only lyrics
  if ($(row).children(`.${COLUMN_CSS}`).length === 1) {
    $(row)
      .find(`.${COLUMN_CSS} .${CHORD_CSS}`)
      .each((index, lyrics) => {
        if ($(lyrics).hasClass(CHORD_CSS) && !$(lyrics).hasClass(CHORUS_CSS)) {
          $(lyrics).removeClass(CHORD_CSS);
        }
      });
  }

  //* Bug in ChordSheetJS: if there's an empty chord with only whitespace lyrics, it renders an empty <div>
  // :has(.no-chord) doesn't work, so this is actually a non-optimal solution, but it should never give any kind of error
  $(row)
    .find(`.${COLUMN_CSS} > .${LYRICS_CSS}`)
    .each((index, lyrics) => {
      if ($(lyrics).text() === '') {
        $(lyrics).text(' ');
      }
    });

  //* Only chords
  if (!rowHasLyrics($, row)) {
    $(row)
      .find(`.${COLUMN_CSS} .${LYRICS_CSS}`)
      .each((index, lyrics) => {
        if ($(lyrics).hasClass(LYRICS_CSS) && !$(lyrics).hasClass(CHORUS_CSS)) {
          $(lyrics).removeClass(LYRICS_CSS);
        }
      });
    //* Put spaces around chords
    $(row)
      .find(`.${COLUMN_CSS} .${CHORD_CSS}`)
      .each((index, chord) => {
        $(chord).text(' ' + $(chord).text() + ' ');
      });
  }
};

const removeChords = (serializedSong: any): void => {
  serializedSong.lines.forEach((line: any) => {
    line.items.map((v: any): any => {
      if (v.type === 'chordLyricsPair') {
        v.chords = '';
        v.chord = null;
      }
      return v;
    });
  });
};

export interface InfoRenderSong {
  sections: string[];
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
    if (props.fileContent.trim() === '') {
      return {
        sections: [],
        fontSize: 17,
        error: 'Il file è vuoto.'
      };
    }
    props.fileContent = props.fileContent.replace(/\n$/, '');
    const songParsed = new ChordSheetJS.ChordProParser().parse(
      props.fileContent
    );

    // if (props.key !== undefined) song_parsed = song_parsed.setKey(props.key) // Serve per poter normalizzare bene gli accordi

    const serializedSong = new ChordSheetJS.ChordSheetSerializer().serialize(
      songParsed
    );
    if (!props.showChords) {
      removeChords(serializedSong);
    }

    let deserialized = new ChordSheetJS.ChordSheetSerializer().deserialize(
      serializedSong
    );
    /* const majorRootKey = Key.parseOrFail(deserialized.key).toMajor()
        if (props.chordNotation === SYMBOL) {
            deserialized = deserialized.setKey(majorRootKey.toChordSymbolString(majorRootKey))
        } else if (props.chordNotation === SOLFEGE) {
            deserialized = deserialized.setKey(majorRootKey.toChordSolfegeString(majorRootKey))
        } */

    if (
      deserialized.capo !== undefined &&
      deserialized.capo !== null &&
      !(deserialized.capo instanceof Array)
    ) {
      const capo = -parseInt(deserialized.capo);
      deserialized = deserialized.setCapo(capo);
    }

    if (props.transpose !== undefined && props.transpose !== 0) {
      deserialized = deserialized.transpose(props.transpose);
    }
    // console.log("key", deserialized.key)

    if (deserialized.key !== null) {
      // This is needed because it seems like the normalization is different between major and minor keys (and we want always the major-like one)
      const majorRootKey = Key.parseOrFail(deserialized.key).toMajor();

      // FIXME: Don't why there's this actually big problem, it can't really change chords from ita to eng
      /*
            if (props.chordNotation === SYMBOL) {
                deserialized = deserialized.transpose(-1, {normalizeChordSuffix: true})
            } */

      // TODO: This does not work when there is capo set
      if (DIESIS_NOTES.includes(majorRootKey.toString())) {
        deserialized = deserialized.useModifier('#');
      } else {
        deserialized = deserialized.useModifier('b');
      }
    }

    deserialized.setMetadata('chord_style', props.chordNotation);

    const disp = new ChordSheetJS.HtmlDivFormatter({
      normalizeChords: true
    }).format(deserialized);
    const $ = cheerio.load(disp);

    const linesChorus = findLinesChorus(deserialized);
    toggleShowChords($, props.showChords);
    boldenChorus($, linesChorus);
    const stdZoomLevel = 17;
    const fontSize = (props.fontSize ??= adjustFontSize($, stdZoomLevel));
    const sections = editHTML($, props.chordNotation);
    // props.fontSize is undefined when first time opening the song or zoom not set
    return {
      // songText: $.html(),
      sections,
      fontSize
    };
  } catch (error: any) {
    console.error(error);
    return {
      sections: [],
      fontSize: 17,
      error:
        "C'è stato un errore nel leggere il file, riprovare.\n" + error.message
    };
  }
};
