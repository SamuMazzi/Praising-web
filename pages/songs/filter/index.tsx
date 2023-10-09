import Container from '@mui/material/Container'
import PraisingAppBar from '@/components/appbar'

export default function EmptyFilterPage() {
    return (
        <Container sx={{minHeight: '100vh'}}>
            <PraisingAppBar title='Nessun filtro'/>
        </Container>
    )
}