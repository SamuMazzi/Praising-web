import ChordSheetJS, { Chord, Song } from 'chordsheetjs';
import { CheerioAPI, Element, load } from 'cheerio'
import { ChordNotations } from './redux/settings_slice';

interface ParamsTranslateChord {
    chord: string
    transpose?: number
}

function americanToItalianChord(completeChord: string): string {
    const chordMap: { [key: string]: string } = {
      'Ab': 'Lab',
      'A': 'La',
      'A#': 'La#',
      'Bb': 'Sib',
      'B': 'Si',
      'Cb': 'Dob',
      'C': 'Do',
      'C#': 'Do#',
      'Db': 'Reb',
      'D': 'Re',
      'D#': 'Re#',
      'Eb': 'Mib',
      'E': 'Mi',
      'F': 'Fa',
      'F#': 'Fa#',
      'Gb': 'Solb',
      'G': 'Sol',
      'G#': 'Sol#'
    };
    const chordVariants: { [key: string]: string } = {
      'm': '-',
      'maj': '',
      'dim': 'dim',
      'aug': 'aug',
      'sus': '4',
      'sus2': '2',
      'sus4': '4',
      '2': '2',
      '4': '4',
      '6': '6',
      '7': '7',
      '9': '9',
      '11': '11',
      '13': '13',
      '7+': '7+',
      'maj7': '7+',
      'm7': '-7',
      'm7b5': '-7b5',
      'dim7': 'dim7',
      'm9': '-9'
    };
  
    return completeChord.split('/').map(chord => {
        // Split the chord into its root and variant parts
        const root = chord.match(/[A-G]#?b?/)?.[0];
        const variant = chord.replace(root as string, '');
      
        // Check if the chord has a valid root
        if (!root) {
          return chord;
        }
      
        // Translate the root to Italian
        const italianRoot = chordMap[root];
      
        // Check if the variant is a valid variant
        if (variant && !chordVariants[variant]) {
          return chord;
        }
      
        // Translate the variant to Italian
        const italianVariant = chordVariants[variant] || '';
      
        // Return the translated chord
        return italianRoot + italianVariant;
    }).join('/')
}

const translateChord = (props: ParamsTranslateChord) => {
    const chordVariants: Record<string, string> = {
        'do': 'C',
        're': 'D',
        'mi': 'E',
        'fa': 'F',
        'sol': 'G',
        'la': 'A',
        'si': 'B',
    };

    const out = props.chord.split('/').map(singleChord => {
        for(const itCh of Object.keys(chordVariants)) {
            const checkChord = singleChord.toLowerCase()
            if (checkChord.startsWith(itCh)) {
                let tmp = checkChord.replace(itCh, chordVariants[itCh])
                if(tmp[1] === '-') {
                    tmp = tmp.replace('-', 'm')
                } else if (tmp.length > 2) {
                    if(tmp[1] === '#' && tmp[2] === '-' || tmp[1] === 'b' && tmp[2] === '-') {
                        tmp = tmp.replace('-', 'm')
                    }
                }
                let chord = Chord.parse(tmp)?.useModifier('#');
                if(props.transpose) {
                    chord = chord?.transpose(props.transpose)
                }
                return chord?.toString() || tmp;
            }
        }
        return singleChord
    }).join('/')
   return out
}

interface ParamsRenderSong {
    fileContent: string
    showChords: boolean
    transpose?: number
    fontSize?: number | undefined
    chordNotation: ChordNotations
}

const findLinesChorus = (deserialized: Song) => {
    const linesChorus: number[] = []
    let cont = 0
    deserialized.lines.map((line) => {
        let isChordLyricsPair = false
        if(line.items.every(item => item instanceof ChordSheetJS.ChordLyricsPair)) {
            isChordLyricsPair = true
            //console.log(cont.toString() + ' ' + line.items.map(item => item instanceof ChordSheetJS.ChordLyricsPair && item.lyrics).join(''))
        }
        if(line.isChorus() && isChordLyricsPair) {
            linesChorus.push(cont)
        }
        //* Se la riga è fatta solo di testo+accordi e il testo non è vuoto
        if(isChordLyricsPair && line.items.map(item => item instanceof ChordSheetJS.ChordLyricsPair && item.lyrics).join('').trim() !== '') { //* Aggiorno solo se è una riga che verrà visualizzata
            //console.log(cont.toString() + ' ' + line.items.map(item => item instanceof ChordSheetJS.ChordLyricsPair && item.lyrics).join(''))
            cont += 1
        }
    });
    return linesChorus
}

const toggleShowChords = ($: CheerioAPI, showChords: boolean) => {
    $('.chord').each((i, chord) => {
        if(!showChords) {
            if ($(chord).hasClass('chord')) {
                $(chord).removeClass('chord')
            }
        } else {
            if (!$(chord).hasClass('chord')) {
                $(chord).addClass('chord')
            }
        }
    })
}

const isThereLyricsInRow = ($: CheerioAPI, row: Element) => {
    if ($(row).find('.column > .lyrics').length > 0) {
        const lyricsPieces = $(row).find('.column > .lyrics').filter((i, l) => $(l).text().trim() !== '')
        return lyricsPieces.length !== 0
    }
    return false
}

const boldenChorus = ($: CheerioAPI, linesChorus: number[]) => {
    let cont = -1
    $('.row').each((i, row) => {
        if (isThereLyricsInRow($, row)) {
            cont += 1
        }
        //* Se è Chorus        
        if(linesChorus.includes(cont)) {
            if (!$(row).hasClass('chorus')) {
                $(row).addClass('chorus')
            }
        }
    })
}

const rowHasLyrics = ($: CheerioAPI, el: Element) => {
    const res = $(el).children('.column').filter((i, e) => $(e).children('.lyrics').text().trim() !== '')
    return res.length !== 0
}

const adjustFontSize = ($: CheerioAPI, oldFontSize: number) => {
    if (typeof window === "undefined") {
        return oldFontSize
    }
    let maxLen = 0
    $('.row').each((i, row) => {
        $('.lyrics').each((i, lyrics) => {
            maxLen = Math.max($(lyrics).text().length, maxLen)
        })
    })
    while (maxLen * (oldFontSize / 2) > window.innerWidth) {
        oldFontSize--
    }
    return oldFontSize
}

const editHTML = ($: CheerioAPI, chordNotation: ChordNotations) => {
    $('.row').each((i, row) => {

        removeChordsFromHTML($, row)
        setSpacesBetweenChorusAndVerses($, row)
        if (chordNotation === 'ITALIAN') {
            translateChordsToItalian($)
        }
        //TODO: Testare con Jesus, I trust in you e Abbracciami per ritornello, gloria gen, testa anche con Hearth of Worship (dava "undefined" nella traduzione di Ab in Lab)
        //TODO: Informarsi su come dare le info per la deserializzazione 
        //TODO: Magari vorrei farlo per riga e non per "sezione della riga", sia per correttezza che performance
        $('.lyrics').each((i, lyrics) => {
            const reg = /,\s*,/gm
            // const regSpecialChar = /[^a-zA-Z0-9]\s*,/gm
            const lyr = $(lyrics).text()
            const out = lyr.replace(reg, ',')
            $(lyrics).text(out)
        })
    })
}

const removeChordsFromHTML = ($: CheerioAPI, row: Element) => {
    //* Solo testo
    if($(row).children('.column').length === 1) {
        $(row).find('.column .chord').each((index, lyrics) => {
            if ($(lyrics).hasClass('chord') && !$(lyrics).hasClass('chorus')) {
                $(lyrics).removeClass('chord')
            }
        })
    }

    //* Solo accordi
    if(!rowHasLyrics($, row)) {
        $(row).find('.column .lyrics').each((index, lyrics) => {
            if ($(lyrics).hasClass('lyrics') && !$(lyrics).hasClass('chorus')) {
                $(lyrics).removeClass('lyrics')
            }
        })
    }
}

const setSpacesBetweenChorusAndVerses = ($: CheerioAPI, row: Element) => {
    //* Aggiungi spazi fra chorus e verses
    if($(row).hasClass('chorus') && !$(row).next().hasClass('chorus')) {
        $(row).addClass('last-line-chorus')
    }
    //* Aggiungi spazi fra chorus e verses
    if($(row).hasClass('chorus') && !$(row).prev().hasClass('chorus')) {
        $(row).addClass('first-line-chorus')
    }
}

const translateChordsToItalian = ($: CheerioAPI) => {
    $('.chord').each((i, chord) => {
        const americanChord = $(chord).text()
        $(chord).text(americanToItalianChord(americanChord))
    })
}

const normalizeChords = (serializedSong: any, transpose: number | undefined) => {
    let capoFoundAtLine = -1
    serializedSong.lines.map((line: any, index: number) => {
        if (line.items.length === 1 && line.items[0].type === 'tag' && line.items[0].name.toLowerCase() === 'capo') {
            capoFoundAtLine = index
            transpose = transpose ?? line.items[0].value
        }
        line.items.map((v: any) => {
            if(v.type === 'chordLyricsPair') {
                v.chords = translateChord({
                    chord: v.chords,
                    transpose: transpose
                })
            }
        })
        return line
    })
    if (capoFoundAtLine !== -1) {
        serializedSong.lines.splice(capoFoundAtLine, 1)  // Questo perchè la traduzione automatica degli accordi della libreria va malissimo
        //Quindi togliamo la linea con il capotasto
    }
}

const removeChords = (serializedSong: any) => {
    serializedSong.lines.map((line: any) => {
        line.items.map((v: any) => {
            if(v.type === 'chordLyricsPair') {
                v.chords = ''
                v.chord = null
                // console.log(v.lyrics)
            }
            return v
        })
    })
}

interface InfoRenderSong {
    songText: string
    fontSize: number
}

export const renderSong = (props: ParamsRenderSong): InfoRenderSong => {
    const parser = new ChordSheetJS.ChordProParser();
    const song_parsed = parser.parse(props.fileContent);
    const formatterDiv = new ChordSheetJS.HtmlDivFormatter();
    //* Le virgole ci sono già formattando questo sopra
    const serializedSong = new ChordSheetJS.ChordSheetSerializer().serialize(song_parsed);
    console.log("song parsed", serializedSong)
    normalizeChords(serializedSong, props.transpose)
    if (!props.showChords) {
        removeChords(serializedSong)
    }
    console.log("song parsed2", serializedSong)
    const deserialized = new ChordSheetJS.ChordSheetSerializer().deserialize(serializedSong);
    const disp = formatterDiv.format(deserialized);
    //console.log("songp2", disp)
    const $ = load(disp)

    const linesChorus = findLinesChorus(deserialized)
    toggleShowChords($, props.showChords)
    boldenChorus($, linesChorus)
    editHTML($, props.chordNotation)
    let fontSize = 0
    if(props.fontSize === undefined) { // First time opening the song or zoom not set
        fontSize = adjustFontSize($, 17) //Std zoom level
    } else {
        fontSize = props.fontSize
    }
    return {
        songText: $.html(),
        fontSize: fontSize
    }
}
