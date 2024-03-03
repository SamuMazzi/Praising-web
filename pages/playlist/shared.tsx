import { copyPlaylist } from '@/logic/redux/playlist_slice'
import { useAppDispatch } from '@/logic/redux/store'
import Routes from '@/logic/routes'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import PlaylistPage from './index'

PlaylisSharedPage.getInitialProps = async (context: any) => {
    const {name, songs} = context.query
  
    return {name, songs}
}

interface PropsPlaylistSharedPage {
    name: string
    songs: string[] | string
}

export default function PlaylisSharedPage(props: PropsPlaylistSharedPage) {
    const dispatch = useAppDispatch()
    const router = useRouter()

    useEffect(() => {
        if(props.name && props.songs) {
            const songs = typeof props.songs === 'string' ? props.songs.split(',') : props.songs
            dispatch(copyPlaylist({name: props.name, songs: songs}))
        }
        router.replace(Routes.Playlist)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <PlaylistPage />
    )
  
}