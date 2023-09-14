import { InfoLocalSong } from './redux/info_song_slice'
import { ChordNotations } from './redux/settings_slice'
import songs from './songs.config.json'

export const filterMomenti: Record<string, string> = {
    'Ingr': 'Introduzione',
    'G': 'Gloria',
    'S': 'Salmo',
    'All': 'Alleluia',
    'Lode': 'Lode a Te',
    'Off': 'Offertorio',
    'San': 'Santo',
    'Agn': 'Agnello di Dio',
    'Com': 'Comunione',
    'Fin': 'Finale'
}

export const filterArgomenti: Record<string, string> = {
    'Qua': 'Quaresima',
    'Avv': 'Avvento',
    'Nat': 'Natale',
    'Pas': 'Pasqua',
    'SS': 'Spirito Santo',
    'Mar': 'Maria',
    'Matr': 'Matrimonio',
    'Ado': 'Adorazione',
    'Ingl': 'Inglese',
    'Can': 'Canone'
}

export const saveToStorage = (key: string, value: any) => {
    if (typeof window !== 'undefined') {
        return window.localStorage.setItem(key, value !== undefined ? JSON.stringify(value) : 'null')
    }
}

export const getFromStorage = (key: string) => {
    if (typeof window !== 'undefined') {
        const res = window.localStorage.getItem(key)
        if (res !== null && res !== undefined && res !== 'undefined' && res !== 'null') {
            return JSON.parse(res)
        }
        return null
    }
}

export const clearStorage = () => {
    if (typeof window !== 'undefined') {
        window.localStorage.clear()
    }
}

export interface Song {
    name: string
    id: string
    tonalita?: string
    link?: string
    argomento?: string[]
    parteMessa?: string[]
    transpose?: number
    scaleFactor?: number
}

let localSongs: Song[] = []

export const getLocalSongs = (): Song[] => {
    if (localSongs.length === 0) {
        localSongs = songs.map(v => ({
            name: v.Nome,
            id: v.Id.toString(),
            tonalita: v.Tonalita,
            link: v.Link,
            argomento: v.Caratteristica?.split('-'),
            parteMessa: v['Parte della messa']?.split('-'),
        }))
    }
    return localSongs
}

export const getSingleSong = (id: string) => {
    const songs = getLocalSongs()
    let song: Song | undefined

    for(const s of songs) {
        if (s.id === id){
            song = s
            break
        }
    }
    if (!song) return
    const infoLocalSong: InfoLocalSong | undefined = getFromStorage('song_' + song.id)
    if(infoLocalSong) {
        song.transpose = infoLocalSong.transpose
        song.scaleFactor = infoLocalSong.zoom
    }
    return song
}

export const updateLastRecentsSongs = (song: Song) => {
    const limit = 7
    const recents: string[] = getFromStorage('recents') || []
    if(recents.includes(song.id)) return

    const newRec = [song.id, ...recents]
    let out = newRec
    if(newRec.length > limit) {
        out = newRec.splice(limit - 1)
    }
    saveToStorage('recents', out)
    return out
}

export const getLastRecentsSongs = () => {
    const recents: string[] = getFromStorage('recents') || []
    return recents
}

export const getLocalChordNotation = () => {
    const out: ChordNotations = getFromStorage('chordNotation') || 'ITALIAN'
    return out
}

export const setLocalChordNotation = (notation: ChordNotations) => {
    saveToStorage('chordNotation', notation)
}

export const getInfoSongsStorage = (): Record<string, InfoLocalSong> => {
    return getFromStorage('info_songs') || {}
}