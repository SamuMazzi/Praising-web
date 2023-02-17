import Container from '@mui/material/Container'
import List from '@mui/material/List'
import { Song } from '@/logic/local_logic'
import SongTile, { PlaylistSongTile, SelectableSongTile } from '@/components/song_tile'
import TypeSearch from '@/components/search_field'
import { useState } from 'react'
import { Playlist } from '@/logic/redux/playlist_slice'
import { ModalBottomSheetSong } from './bottom_sheet'

interface PropsListSongs {
    songs: Song[]
    mode: 'normal' | 'selection_playlist' | 'inside_playlist'
    playlist?: Playlist
    withSearch?: boolean
}

export default function ListSongs(props: PropsListSongs) {
    const [songModal, setSongModal] = useState('')
    const [filter, setFilter] = useState("")
    const localSongs = props.songs
        .filter(v => v.name.toLowerCase().includes(filter.toLowerCase()))
        .sort((a,b) => ('' + a.name).localeCompare(b.name))

    return (
        <Container>
            {
                props.withSearch === undefined || props.withSearch && <TypeSearch query={filter} setQuery={setFilter}/>
            }
            <List>
                {
                    localSongs.map(song => {
                        if (props.mode === 'normal') return <SongTile key={song.id} song={song} onSecondaryAction={() => setSongModal(song.id)}/>
                        if (props.mode === 'selection_playlist') return <SelectableSongTile key={song.id} song={song} playlist={props.playlist!}/>
                        if (props.mode === 'inside_playlist') return <PlaylistSongTile key={song.id} song={song} playlist={props.playlist!}/>
                    })
                }
            </List>
            <ModalBottomSheetSong open={songModal !== ''} onClose={() => setSongModal('')} song_id={songModal}/>
        </Container>
    )
  
}