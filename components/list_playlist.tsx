import List from '@mui/material/List'
import { useAppSelector } from '@/logic/redux/store'
import PlaylistTile, { SelectablePlaylistTile } from '@/components/playlist_tile'

interface PropsListPlaylist {
    fromSongId?: string
}

export default function ListPlaylist(props: PropsListPlaylist) {
    const all_playlists = useAppSelector(state => state.playlist.playlist)

    return (
        <List sx={{px: 2}}>
            {
                Object.keys(all_playlists).map(id_p => {
                    const playlist = all_playlists[id_p]
                    return (
                        props.fromSongId ? 
                        <SelectablePlaylistTile key={playlist.id} 
                            playlist={playlist} 
                            songId={props.fromSongId}
                        /> :
                        <PlaylistTile key={playlist.id} 
                            playlist={playlist} 
                        />
                    )
                })
            }
        </List>
    )
}