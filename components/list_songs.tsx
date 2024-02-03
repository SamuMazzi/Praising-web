import MuiContainer from '@mui/material/Container'
import List from '@mui/material/List'
import { Song } from '@/logic/local_logic'
import SongTile, { PlaylistSongTile, SelectableSongTile } from '@/components/song_tile'
import TypeSearch from '@/components/search_field'
import { useState } from 'react'
import { applyDrag, Playlist } from '@/logic/redux/playlist_slice'
import { ModalBottomSheetSong } from './bottom_sheet'
import DragContainer from './react-smooth-dnd/Container'
import { useAppDispatch, useAppSelector } from '@/logic/redux/store'
import { ModalAddPlaylist } from './modals'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import Box from '@mui/material/Box'
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import IconButton from '@mui/material/IconButton'

interface PropsListSongs {
    songs: Song[]
    mode: 'normal' | 'selection_playlist'
    playlist?: Playlist
    withSearch?: boolean
    auto_sorting?: boolean
}
/**
 * 
 * @param auto_sorting Default = True
 */
export default function ListSongs(props: PropsListSongs) {
    const [songModal, setSongModal] = useState('')
    const [showModalCreatePlaylist, setShowModalCreatePlaylist] = useState(false)
    const [filter, setFilter] = useState("")
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
    const favoriteSongs = useAppSelector(state => state.userInfo.favoriteSongs)
    let localSongs = props.songs.filter(v => 
        (!showOnlyFavorites || (showOnlyFavorites && favoriteSongs.includes(v.id))) && v.name.toLowerCase().includes(filter.toLowerCase()))
    if (props.auto_sorting !== false) {
        localSongs = localSongs.sort((a,b) => ('' + a.name).localeCompare(b.name))
    }

    return (
        props.songs.length === 0 ? <Grid container direction="column" alignItems="center" justifyContent="center">
            <Grid item xs={12} sx={{pt: 4}}>
                <Image src="assets/undraw_illustrations/undraw_more_music.svg" alt="More music" width={200} height={200}/>
            </Grid>
            <Grid item xs={12} sx={{pt: 2}}>
                <Typography align='center' style={{fontWeight: 300}}>
                    Inizia a suonare per riempire la lista
                </Typography>
            </Grid>
        </Grid> :
        <MuiContainer>
            {
                props.withSearch === undefined || props.withSearch && <Box display="flex">
                    <TypeSearch query={filter} setQuery={setFilter}/>
                    <IconButton sx={{ml: 1}} onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}>
                        { showOnlyFavorites ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                </Box>
            }
            <List>
                {
                    localSongs.map(song => {
                        if (props.mode === 'normal') return <SongTile key={song.id} song={song} onSecondaryAction={() => setSongModal(song.id)}/>
                        if (props.mode === 'selection_playlist') return <SelectableSongTile key={song.id} song={song} playlist={props.playlist!}/>
                    })
                }
            </List>
            <ModalBottomSheetSong open={songModal !== ''} onClose={() => setSongModal('')} song_id={songModal} openModalCreate={() => {
                setSongModal('')
                setShowModalCreatePlaylist(true)
            }}/>
            <ModalAddPlaylist open={showModalCreatePlaylist} handleClose={() => setShowModalCreatePlaylist(false)}/>
        </MuiContainer>
    )
  
}

interface PropsListSongsPlaylist {
    songs: Song[]
    playlist_id: string
}

export function ListSongsPlaylist(props: PropsListSongsPlaylist) {
    const dispatch = useAppDispatch()
    const playlist = useAppSelector(state => state.playlist.playlist[props.playlist_id])
    const [songModal, setSongModal] = useState('')
    const [filter, setFilter] = useState("")
    const localSongs = props.songs
        .filter(v => v.name.toLowerCase().includes(filter.toLowerCase()))

    return (
        <MuiContainer sx={{pb: 3}}>
            <TypeSearch query={filter} setQuery={setFilter}/>
            <List>
                <DragContainer dragHandleSelector='.column-drag-handle' onDrop={(e: any) => {
                    dispatch(applyDrag({
                        id: props.playlist_id,
                        dragResult: e 
                    }))
                }}>
                    <>
                    {
                        localSongs.map(song => (
                            <PlaylistSongTile key={song.id} song={song} playlist={playlist!}/>
                        ))
                    }
                    </>
                </DragContainer>
            </List>
            <ModalBottomSheetSong open={songModal !== ''} onClose={() => setSongModal('')} song_id={songModal}/>
        </MuiContainer>
    )
  
}