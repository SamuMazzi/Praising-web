import Container from '@mui/material/Container'
import { filterArgomenti, filterMomenti, getLocalSongs } from '@/logic/local_logic'
import PraisingAppBar from '@/components/appbar'
import ListSongs from '@/components/list_songs'
import { useLoaderData } from 'react-router-dom'

export const loaderFilterPage = async (props: any) => {
    const {filter} = props.params
  
    return {filter}
}

interface PropsFilterPage {
    filter: string
}

export default function FilterPage() {
    const props: any = useLoaderData()
    const localSongs = getLocalSongs()
        .filter(v => v.argomento?.includes(props.filter) || v.parteMessa?.includes(props.filter))
    const nameFilter = filterMomenti[props.filter] || filterArgomenti[props.filter]

    return (
        <Container>
            <PraisingAppBar title={nameFilter} backIcon/>
            <Container sx={{pt: 4, pb: 7}}/>
            <ListSongs songs={localSongs} mode='normal'/>
        </Container>
    )
  
}