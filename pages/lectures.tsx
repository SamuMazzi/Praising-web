import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import NavBar from '@/components/navbar'
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Lectures() {
  const dataLiturgia = "20230221";
  const { data, error, isLoading } = useSWR('/api/lectures/' + dataLiturgia, fetcher)
  //const {letture, salmo, vangelo} = data

  return (
    <Container sx={{minHeight: '100vh'}}>
        <PraisingAppBar title='Liturgia del giorno' />
        <Typography variant="h2" sx={{pt: verticalPaddingAppBar*3 + 2}}>
            Messa
        </Typography>
        <NavBar />
    </Container>
  )
  
}