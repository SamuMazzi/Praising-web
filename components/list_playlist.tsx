import List from '@mui/material/List'
import { useAppSelector } from '@/logic/redux/store'
import PlaylistTile, { SelectablePlaylistTile } from '@/components/playlist_tile'
import { useState } from 'react'
import { ModalBottomSheetPlaylist } from './bottom_sheet'
import { ModalEditPlaylist } from './modals'

interface PropsListPlaylist {
    fromSongId?: string
}

export default function ListPlaylist(props: PropsListPlaylist) {
    const all_playlists = useAppSelector(state => state.playlist.playlist)
    const [playlistModal, setPlaylistModal ] = useState<string | undefined>()

    return (
        <List sx={{px: 2}}>
            {
                Object.keys(all_playlists).map(id_p => {
                    const playlist = all_playlists[id_p]
                    return (
                        !props.fromSongId ? 
                        <PlaylistTile key={playlist.id} 
                            playlist={playlist} 
                            onOptionsClick={() => setPlaylistModal(id_p)}
                        /> : 
                        <SelectablePlaylistTile key={playlist.id} 
                            playlist={playlist} 
                            songId={props.fromSongId}
                        />
                    )
                })
            }
            {
                !props.fromSongId &&
                <ModalEditPlaylist open={playlistModal !== undefined} handleClose={() => setPlaylistModal(undefined)} playlist_id={playlistModal ?? ''}/>
            }
        </List>
    )
  
}