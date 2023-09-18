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
    let localSongs = props.songs.filter(v => v.name.toLowerCase().includes(filter.toLowerCase()))
    if (props.auto_sorting === undefined || props.auto_sorting === true) {
        localSongs = localSongs.sort((a,b) => ('' + a.name).localeCompare(b.name))
    }

    return (
        <MuiContainer>
            {
                props.withSearch === undefined || props.withSearch && <TypeSearch query={filter} setQuery={setFilter}/>
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