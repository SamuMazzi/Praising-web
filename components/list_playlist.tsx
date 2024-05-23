import List from '@mui/material/List'
import { useAppSelector } from '@/logic/redux/store'
import PlaylistTile, { SelectablePlaylistTile } from '@/components/playlist_tile'
import Image from 'next/image'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

interface PropsListPlaylist {
    fromSongId?: string
}

/**
 * List of songs displayed in the playlist page.
 * If there are no playlists, a message with an image is displayed.
 */
export default function ListPlaylist(props: PropsListPlaylist) {
    const all_playlists = useAppSelector(state => state.playlist.playlist)

    return (
        <List sx={{px: 2}}>
            {
                Object.keys(all_playlists).length === 0 &&
                <Grid container direction="column" justifyContent="center" alignItems="center">
                    <Grid item sx={{pb: 3, pt: 20}}>
                        <Image src="assets/undraw_illustrations/undraw_compose_music.svg" alt="Compose music" width="230" height="230"/>
                    </Grid>
                    <Grid item>
                        <Typography variant="h3" sx={{textAlign: 'center'}}>
                            Inizia a creare delle playlist!
                        </Typography>
                    </Grid>
                </Grid>
            }
            {
                Object.keys(all_playlists).map(id_p => {
                    const playlist = all_playlists[id_p]
                    return (
                        !props.fromSongId ? 
                        <PlaylistTile key={playlist.id} playlist={playlist}/> : 
                        <SelectablePlaylistTile key={playlist.id} 
                            playlist={playlist} 
                            songId={props.fromSongId}
                        />
                    )
                })
            }
        </List>
    )
  
}