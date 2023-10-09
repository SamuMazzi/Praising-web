import { copyPlaylist } from '@/logic/redux/playlist_slice'
import { useAppDispatch } from '@/logic/redux/store'
import RoutePaths from '@/logic/routes'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import PlaylistPage from './index'
import { useLoaderData } from 'react-router-dom'

export const loaderPlaylistSharedPage = async (context: any) => {
    const {name, songs} = context.query
  
    return {name, songs}
}

interface PropsPlaylistSharedPage {
    name: string
    songs: string[] 
}

export default function PlaylisSharedPage() {
    const props: any = useLoaderData()
    const dispatch = useAppDispatch()
    const router = useRouter()

    useEffect(() => {
        if(props.name && props.songs) {
            dispatch(copyPlaylist({name: props.name, songs: props.songs}))
        }
        router.replace(RoutePaths.Playlist)
        //TODO: Testa se va bene replace
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <PlaylistPage />
    )
  
}