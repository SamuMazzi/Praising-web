import ChordSheetJS, { Song } from 'chordsheetjs';
import { CheerioAPI, Element, load } from 'cheerio'
import { ChordNotations } from './redux/settings_slice';

const chordVariants: { [key: string]: string } = {
    'm': '-',
    'maj': '',
    'sus2': '2',
    'sus4': '4',
    'sus': '4',
    'maj7': '7+',
    'm7': '-7',
    'm7b5': '-7b5',
    'dim7': 'dim7',
    'm9': '-9'
};

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
        //TODO: Implementare qua ricerca ritornello
        //TODO: Implementare expandable
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
        //TODO: Implementare expandable
        //TODO: Troppa distanza fra accordi e testo (diminuire)
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

const editHTML = ($: CheerioAPI) => {
    $('.row').each((i, row) => {
        removeChordsFromHTML($, row)
        setSpacesBetweenChorusAndVerses($, row)
        //TODO: Testare con Jesus, I trust in you e Abbracciami per ritornello
        //TODO: Informarsi su come dare le info per la deserializzazione 
        //TODO: Magari vorrei farlo per riga e non per "sezione della riga", sia per correttezza che performance
        //TODO: Cambiare sus con 4
        $('.lyrics').each((j, html_lyrics) => {
            const lyrics = $(html_lyrics).text()
            // const regSpecialChar = /[^a-zA-Z0-9]\s*,/gm
            const out = lyrics.replace(/,\s*,/gm, ',')
            $(html_lyrics).text(out)
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
        // $(row).insertAfter('section-chorus')
        // $(row).insertAfter('section-verse')
    }
    //* Aggiungi spazi fra chorus e verses
    if($(row).hasClass('chorus') && !$(row).prev().hasClass('chorus')) {
        $(row).addClass('first-line-chorus')
        // $(row).insertBefore('section-chorus')
        // $(row).insertBefore('section-verse') //TODO Ovviamente da rivedere
    }
    if($(row).hasClass('chorus') && !$(row).prev().hasClass('chorus')) {
        $(row).addClass('first-line-chorus')
    }
    // $(row).wrap
}

/* const normalizeChords = (serializedSong: any, transpose: number | undefined) => {
    serializedSong.lines.map((line: any, index: number) => {
        line.items.map((v: any) => {
            if(v.type === 'chordLyricsPair') {
                for (const [key, value] of Object.entries(chordVariants)) {
                    v.chords = v.chords.replace(key, value)  //TODO: Testa
                }
            }
        })
        return line
    })
} */

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
    songText: string
    fontSize: number
}

/**
 * 
 * @returns An object with the HTML produced and the new size of the text
 */
export const renderSong = (props: ParamsRenderSong): InfoRenderSong => {
    let song_parsed = new ChordSheetJS.ChordProParser().parse(props.fileContent);
    
    song_parsed.setMetadata('chord_style', props.chordNotation)  // TODO: Ancora non funziona

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

    const disp = new ChordSheetJS.HtmlDivFormatter({normalizeChords: true, renderBlankLines: false}).format(deserialized); // TODO: Provare ad utilizzare renderBlankLines
    const $ = load(disp)

    const linesChorus = findLinesChorus(deserialized)
    toggleShowChords($, props.showChords)
    boldenChorus($, linesChorus)
    editHTML($)
    const stdZoomLevel = 17;
    // props.fontSize is undefined when first time opening the song or zoom not set
    return {
        songText: $.html(),
        fontSize: props.fontSize ??= adjustFontSize($, stdZoomLevel) 
    }
}
