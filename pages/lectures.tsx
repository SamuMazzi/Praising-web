import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar'
import useSWR from 'swr'
import Box from '@mui/material/Box'
import dayjs from 'dayjs'
import { useState } from 'react'
import { CalendarSelectSingleDay } from '@/components/calendar'
import 'dayjs/locale/it';
import { LiturgyOfDay } from '@/logic/scraper_liturgy'
import CircularProgress from '@mui/material/CircularProgress'

const fetcher = (url: string) => fetch(url).then(async (res) => new LiturgyOfDay(await res.json()));

export default function Lectures() {
  const [dataLiturgia, setDataLiturgia] = useState(dayjs())
  const { data, error, isLoading } = useSWR('/api/lectures/' + dataLiturgia.format('YYYYMMDD'), fetcher)

  if (isLoading) return (

    <Container sx={{minHeight: '100vh', pt: verticalPaddingAppBar*3 + 2, pb: 7}} >
        <PraisingAppBar title='Liturgia del giorno (beta)' />
        <Box display='flex' alignItems='center'>
          <CalendarSelectSingleDay daySelected={dataLiturgia} onChangeDate={setDataLiturgia}/>
          <Typography>
            {dataLiturgia.locale('it').format('dddd D MMMM YYYY')}
          </Typography>
        </Box>
        <CircularProgress />
    </Container>
  )

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
              {data?.firstLecture.titolo}
          </Typography>
          <Typography sx={{pb: 2}}>
              {data?.firstLecture.versetto}
          </Typography>
          <Typography>
              {data?.firstLecture.content}
          </Typography>
        </Container>
        <Container sx={{py: 2}}>
          <>
          <Typography variant="h2">
              Salmo Responsoriale
          </Typography>
          <Typography variant="h2" sx={{pb: 2}}>
              {data?.psalm.titolo}
          </Typography>
          <Typography style={{fontWeight: 'bold'}} sx={{pb: 2}}>
              R. {data?.psalm.rit}
          </Typography>
          {
            data?.psalm.versi.map((verso) => {
              if (verso.trim() !== '') {
                return (
                  <Typography key={verso} sx={{pb: 1}}>
                    {verso.trim()} <strong> R.</strong>
                  </Typography>
                )
              }
            })
          }
          </>
        </Container>
        <Container sx={{py: 2}}>
          <Typography variant="h2" sx={{pb: 2}}>
              Vangelo
          </Typography>
          <Typography>
              {data?.gospel.titolo}
          </Typography>
          <Typography sx={{pb: 2}}>
              {data?.gospel.versetto}
          </Typography>
          <Typography>
              {data?.gospel.content}
          </Typography>
        </Container>
    </Container>
  )
  
}