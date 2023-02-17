import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import NavBar from '@/components/navbar'
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar'
import useSWR from 'swr'
import Box from '@mui/material/Box'
import dayjs from 'dayjs'
import { useState } from 'react'
import { CalendarSelectSingleDay } from '@/components/calendar'
import 'dayjs/locale/it';

class LiturgyOfDay {
  firstLecture: string;
  psalm: string;
  secondLecture?: string;
  gospel: string;
 
  constructor(body: any) {
    this.firstLecture = body.firstLecture ?? '';
    this.psalm = body.psalm ?? '';
    this.secondLecture = body.secondLecture
    this.gospel = body.gospel ?? '';
  }
}
 

const fetcher = (url: string) => fetch(url).then(async (res) => new LiturgyOfDay(await res.json()));

export default function Lectures() {
  const [dataLiturgia, setDataLiturgia] = useState(dayjs())
  const { data, error, isLoading } = useSWR('/api/lectures/' + dataLiturgia.format('YYYYMMDD'), fetcher)

  return (
    <Container sx={{minHeight: '100vh', pt: verticalPaddingAppBar*3 + 2, pb: 7}} >
        <PraisingAppBar title='Liturgia del giorno (beta)' />
        <Box display='flex' alignItems='center'>
          <CalendarSelectSingleDay daySelected={dataLiturgia} onChangeDate={setDataLiturgia}/>
          <Typography>
            {dataLiturgia.locale('it').format('dddd D MMMM YYYY')}
          </Typography>
        </Box>
        <Container sx={{py: 2}}>
          <Typography variant="h2" sx={{pb: 2}}>
              Prima lettura
          </Typography>
          <Typography>
              {data?.firstLecture}
          </Typography>
        </Container>
        <Container sx={{py: 2}}>
          <Typography variant="h2" sx={{pb: 2}}>
              Salmo
          </Typography>
          <Typography>
              {data?.psalm}
          </Typography>
        </Container>
        <Container sx={{py: 2}}>
          <Typography variant="h2" sx={{pb: 2}}>
              Vangelo
          </Typography>
          <Typography>
              {data?.gospel}
          </Typography>
        </Container>
        <NavBar />
    </Container>
  )
  
}