import ChordSheetJS, { Chord, Song } from 'chordsheetjs';
import { Cheerio, CheerioAPI, load } from 'cheerio'

interface ParamsTranslateChord {
    chord: string
    transpose?: number
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
                if(props.transpose !== undefined && props.transpose !== 0) {
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
}

const findLinesChorus = (deserialized: Song) => {
    const linesChorus: number[] = []
    let cont = 0
    deserialized.lines.map((line) => {
        let isChordLyricsPair = false
        if(line.items.every(item => item instanceof ChordSheetJS.ChordLyricsPair)) {
            isChordLyricsPair = true
        }
        if(line.isChorus() && isChordLyricsPair) {
            linesChorus.push(cont)
        }
        if(isChordLyricsPair) { //* Aggiorno solo se è una riga che verrà visualizzata
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

const boldenChorus = ($: CheerioAPI, linesChorus: number[]) => {
    $('.row').each((i, lyrics) => {
        //* Se è Chorus
        if(linesChorus.includes(i)) {
            if (!$(lyrics).hasClass('chorus')) {
                $(lyrics).addClass('chorus')
            }
        }
    })
}

const removeChordsFromHTML = ($: CheerioAPI) => {
    $('.row').each((i, row) => {
        //console.log($(row).text())
        //* Solo testo
        if($(row).children('.column').length === 1) {
            $(row).find('.column .chord').each((index, lyrics) => {
                if ($(lyrics).hasClass('chord') && !$(lyrics).hasClass('chorus')) {
                    $(lyrics).removeClass('chord')
                }
            })
        }
    })
}

const normalizeChords = (serializedSong: any, transpose: number | undefined) => {
    serializedSong.lines.map((line: any) => {
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
}

const removeChords = (serializedSong: any) => {
    serializedSong.lines.map((line: any) => {
        line.items.map((v: any) => {
            if(v.type === 'chordLyricsPair') {
                v.chords = ''
                v.chord = null
            }
            return v
        })
    })
}

export const renderSong = (props: ParamsRenderSong) => {
    const parser = new ChordSheetJS.ChordProParser();
    const song_parsed = parser.parse(props.fileContent);
    const formatterDiv = new ChordSheetJS.HtmlDivFormatter();
    const serializedSong = new ChordSheetJS.ChordSheetSerializer().serialize(song_parsed);
    normalizeChords(serializedSong, props.transpose)
    if (!props.showChords) {
        removeChords(serializedSong)
    }
    const deserialized = new ChordSheetJS.ChordSheetSerializer().deserialize(serializedSong);
    const disp = formatterDiv.format(deserialized);
    const $ = load(disp)

    const linesChorus = findLinesChorus(deserialized)
    toggleShowChords($, props.showChords)
    boldenChorus($, linesChorus)
    removeChordsFromHTML($)
    return $.html()
}

/**
 * let newSong = deserialized.mapLines((line) => {
        //* Rimuovi le righe di accordi vuote
        if (
            line.items.every(item => item instanceof ChordSheetJS.ChordLyricsPair 
                && item.chords.trim() === '' 
                && (item.lyrics === null || item.lyrics?.trim() === '') )) {
                return null;
            }
        //* Rimuovi le righe di Tag
        if (line.items.every(item => item instanceof ChordSheetJS.Tag )) {
            return null;
        }
                
        return line;
    });
 */

/**
 * serializedSong.lines.map(line => {
        if(line.items.length === 0 || (line.items.length === 1 && line.items[0].type === 'tag')) {
            line.items = [...line.items, {
                type: 'chordLyricsPair',
                chords: '',
                lyrics: ' '
            }]
            return line
        }
        line.items.map(v => {
            if(v.type === 'chordLyricsPair') {
                v.chords = translateChord({
                    chord: v.chords,
                    transpose: props.transpose
                })
            }
        })
        return line
    })
 */

/**
 * class MyRenderedSong {
    formatter: HtmlDivFormatter
    song_parsed: Song

    constructor(fileContent: string) {
        const parser = new ChordSheetJS.ChordProParser();
        this.song_parsed = parser.parse(fileContent);
        this.formatter = new ChordSheetJS.HtmlDivFormatter();
    }
    
    editChords() {
        const serializedSong = new ChordSheetJS.ChordSheetSerializer().serialize(this.song_parsed);

    }
}
 */