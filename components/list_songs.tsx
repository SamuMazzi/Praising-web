import Container from '@mui/material/Container'
import List from '@mui/material/List'
import { Song } from '@/logic/local_logic'
import SongTile, { PlaylistSongTile, SelectableSongTile } from '@/components/song_tile'
import TypeSearch from '@/components/search_field'
import { useState } from 'react'
import { Playlist } from '@/logic/redux/playlist_slice'

interface PropsListSongs {
    songs: Song[]
    mode: 'normal' | 'selection_playlist' | 'inside_playlist'
    playlist?: Playlist
}

export default function ListSongs(props: PropsListSongs) {
    const [filter, setFilter] = useState("")
    const localSongs = props.songs
        .filter(v => v.name.toLowerCase().includes(filter.toLowerCase()))
        .sort((a,b) => ('' + a.name).localeCompare(b.name))

    return (
        <Container>
            <TypeSearch query={filter} setQuery={setFilter}/>
            <List>
                {
                    localSongs.map(song => {
                        if (props.mode === 'normal') return <SongTile key={song.id} song={song}/>
                        if (props.mode === 'selection_playlist') return <SelectableSongTile key={song.id} song={song} playlist={props.playlist!}/>
                        if (props.mode === 'inside_playlist') return <PlaylistSongTile key={song.id} song={song} playlist={props.playlist!}/>
                    })
                }
            </List>
        </Container>
    )
  
}