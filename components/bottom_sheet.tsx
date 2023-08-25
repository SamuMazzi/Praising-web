import Sheet from 'react-modal-sheet';
import ListSongs from './list_songs';
import { getLocalSongs } from '@/logic/local_logic';
import { useAppSelector } from '@/logic/redux/store';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Box from '@mui/material/Box';
import ListPlaylist from './list_playlist';
import Button from '@mui/material/Button';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

interface PropsModalBottomSheet {
    open: boolean
    onClose: Function
}
// TODO: Dalla versione 2.0 di react-modal-sheet dovrebbe essere possibile scrollare sia contenuto che modal
// TODO: Rendere lo sfondo in background non cliccabile quando modal è aperto
interface PropsModalBottomSheetPlaylist extends PropsModalBottomSheet {
    playlist_id: string | undefined
}

export function ModalBottomSheetPlaylist(props: PropsModalBottomSheetPlaylist) {
    const songs = getLocalSongs()
    const playlist = useAppSelector(state => state.playlist.playlist[props.playlist_id!])

  return (
    <>
      <Sheet isOpen={props.open} onClose={() => props.onClose()} 
        snapPoints={[0.6]}
        initialSnap={0}
      >
        <Sheet.Container>
            <Sheet.Header>
                <TitleModal onClose={props.onClose} title={"Canzoni per " + playlist?.name}/>
            </Sheet.Header>
            <Sheet.Content>
              <Sheet.Scroller>
                <ListSongs songs={songs} playlist={playlist} mode='selection_playlist' />
              </Sheet.Scroller>
            </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop />
      </Sheet>
    </>
  );
}

interface PropsModalBottomSheetSong extends PropsModalBottomSheet {
    song_id: string
    openModalCreate?: () => void
}

export function ModalBottomSheetSong(props: PropsModalBottomSheetSong) {
  return (
    <>
      <Sheet isOpen={props.open} onClose={() => props.onClose()} 
        snapPoints={[0.6]}
        initialSnap={0}
      >
        <Sheet.Container>
            <Sheet.Header>
                <TitleModal onClose={props.onClose} title="Playlist" openModal={props.openModalCreate}/>
            </Sheet.Header>
            <Sheet.Content>
              <Sheet.Scroller>
                <ListPlaylist fromSongId={props.song_id}/>
              </Sheet.Scroller>
            </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop />
      </Sheet>
    </>
  );
}

interface PropsTitleModal {
    onClose: Function
    title: string
    openModal?: () => void
}

function TitleModal(props: PropsTitleModal) {
  return (
      <Box display='flex' alignItems='center' justifyContent='space-between' sx={{pt: 1}}>
          <IconButton edge='start' onClick={() => props.onClose()} sx={{ml: 1}}>
              <CloseRoundedIcon />
          </IconButton>
          <Typography textAlign='center'>
              {props.title}
          </Typography>
          {
            props.openModal ? 
            <Button 
              startIcon={<AddRoundedIcon />} 
              sx={{mr: 2}} 
              onClick={props.openModal}
            >
              <Typography display={{ xs: 'none', md: 'none' }}>
                Nuova playlist
              </Typography>
            </Button>
            : <Box />
          }
      </Box>
  )
}