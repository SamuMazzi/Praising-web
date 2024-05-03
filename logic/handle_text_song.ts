import ChordSheetJS, { Song } from 'chordsheetjs';
import { CheerioAPI, Element, load } from 'cheerio'
import { ChordNotations } from './redux/settings_slice';

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
        // console.log(lyricsPieces)
        return lyricsPieces.length !== 0
    }
    return false
}

/**
 const boldenChorus = ($: CheerioAPI) => {
    let isChorus= false
    $('.row').each((i, row) => {
        const text = $(row).text()
        console.log(text)
        if (text.startsWith('{soc}')) {
            isChorus = true
        } else if (text.startsWith('{eoc}')) {
            isChorus = false
        }
        if (isChorus) {
            if (!$(row).hasClass('chorus')) {
                $(row).addClass('chorus')
            }
        }
    })
    } 
 */

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

function measureText(text: string, fontSize: number) {
    const widths = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.230999755859375,0.3,0.3,0.840625,0.6234375,0.8,0.8,0.2,0.5,0.4546875,0.5,0.684375,0.3,0.5515625,0.2109375,0.5,0.628125,0.3203125,0.6,0.6,0.6296875,0.628125,0.6359375,0.6,0.63125,0.63125,0.2140625,0.2640625,0.55625,0.7234375,0.5390625,0.525,1.0140625,0.7,0.6140625,0.8,0.7078125,0.5140625,0.5046875,0.8,0.7,0.246875,0.53125,0.6,0.5,0.8625,0.703125,0.8,0.6,0.8,0.609375,0.6,0.6,0.675,0.7,1,0.621875,0.6,0.5421875,0.4234375,0.659375,0.4234375,0.6296875,0.734375,0.3,0.6765625,0.7,0.6078125,0.6765625,0.6203125,0.3296875,0.6765625,0.640625,0.246875,0.3484375,0.6,0.246875,1.03125,0.640625,0.640625,0.7,0.6765625,0.4,0.5234375,0.4,0.640625,0.6,0.9,0.5,0.6,0.5,0.4625,0.2921875,0.4625,0.5203125]
    const avg = 0.5736980237458884
    return text
      .split('')
      .map(c => c.charCodeAt(0) < widths.length ? widths[c.charCodeAt(0)] : avg)
      .reduce((cur, acc) => acc + cur) * fontSize
}

const adjustFontSize = ($: CheerioAPI, oldFontSize: number) => {
    if (typeof window === "undefined") {
        return oldFontSize
    }
    let maxLen = 0
    let maxLenRow = ''
    $('.row').each((i, div) => {
        const text = $(div).text()
        maxLen = Math.max(measureText(text, oldFontSize), maxLen)
        if (measureText(text, oldFontSize) === maxLen) {
            maxLenRow = text
        }
    })
    let i = oldFontSize;
    for (i = oldFontSize; i > 1; --i) {
        if ((measureText(maxLenRow, i) < window.innerWidth)) {
            break
        }
    }
    return i
}

//FIXME: La#- non diventa Sib-
const editHTML = ($: CheerioAPI, chordNotation: ChordNotations) => {
    const out: string[] = []
    let isChorus = false;
    let $2 = load(`<div class=section_0></div>`, {}, true);
    $('.lyrics').each((j, html_lyrics) => {
        const out = $(html_lyrics).text().replace(/,\s*,/gm, ',')
        $(html_lyrics).text(out)
    })
    // Substitutes chords with their variants
    $('.chord').each((j, html_chord) => {
        let out = $(html_chord).text()
        if (chordNotation === 'solfege') {
            // TODO: Finish to fix maj thing
            out = out
                .replace("ma", "+")
                .replace("maj", "+")
                .replace("m", "-")
                .replace(/sus(\d*)/gm, (match, p1) => p1 ? p1 : '4');
        }
        $(html_chord).text(out)
    })
    $('.row').each((i, row) => {
        removeChordsFromHTML($, row)
        removeNullsFromHTML($, row)
        // Divide in sections
        const isNewChorus = $(row).hasClass('chorus')
        if (isChorus !== isNewChorus) {
            out.push($2.html())
            $2 = load(`<div class=section_` + out.length + `></div>`, {}, true);
            $2('.section_' + out.length).append($(row))
        } else {
            $2('.section_' + out.length).append($(row))
        }
        isChorus = isNewChorus;
    })
    out.push($2.html())

    return out;
}

/* It also set spaces around chords without lyrics */
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
        //* Put spaces around chords
        $(row).find('.column .chord').each((index, chord) => {
            $(chord).text(' ' + $(chord).text() + ' ')
        })
    }
}

/** This is because of a bug in ChordSheetJS */
const removeNullsFromHTML = ($: CheerioAPI, row: Element) => {
    if($(row).children('.label').length >= 1) {
        $(row).find('.label').each((index, label) => {
            if($(label).text() === 'null') {
                $(label).text('')
            }
        })
    }
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

interface InfoRenderSong {
    // songText: string
    sections: string[]
    fontSize: number
    error?: string
}

/**
 * 
 * @returns An object with the HTML produced and the new size of the text
 */
export const renderSong = (props: ParamsRenderSong): InfoRenderSong => {
    try {
        // This is because of a probable ChordSheetJS bug which renders "null" text at the end of the song if there's a blank line (i.e. with "Chiamati per nome")
        props.fileContent = props.fileContent.replace(/\n$/, '');
        const song_parsed = new ChordSheetJS.ChordProParser().parse(props.fileContent);
    
        // if (props.key !== undefined) song_parsed = song_parsed.setKey(props.key) // Serve per poter normalizzare bene gli accordi
        
        const serializedSong = new ChordSheetJS.ChordSheetSerializer().serialize(song_parsed);
        if (!props.showChords) {
            removeChords(serializedSong)
        }
    
        let deserialized = new ChordSheetJS.ChordSheetSerializer().deserialize(serializedSong);
        if (deserialized.capo !== undefined && !(deserialized.capo instanceof Array)) {
            const capo = -parseInt(deserialized.capo)
            deserialized = deserialized.setCapo(capo)
        }
    
        if (props.transpose !== undefined && props.transpose !== 0) {
            deserialized = deserialized.transpose(props.transpose)
        }
    
        deserialized.setMetadata('chord_style', props.chordNotation)
    
        const disp = new ChordSheetJS.HtmlDivFormatter({normalizeChords: true, renderBlankLines: false}).format(deserialized);
        const $ = load(disp)
    
        const linesChorus = findLinesChorus(deserialized)
        toggleShowChords($, props.showChords)
        boldenChorus($, linesChorus)
        const stdZoomLevel = 17;
        const fontSize = props.fontSize ??= adjustFontSize($, stdZoomLevel)
        const sections = editHTML($, props.chordNotation)
        // props.fontSize is undefined when first time opening the song or zoom not set
        return {
            // songText: $.html(),
            sections: sections,
            fontSize:  fontSize
        }
    } catch (error) {
        return {
            sections: [],
            fontSize: 17,
            error: "C'è stato un errore nel leggere il file, riprovare"
        }
    }
}
