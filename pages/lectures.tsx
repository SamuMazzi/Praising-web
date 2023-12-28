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
import { Lettura, LiturgyOfDay } from '@/logic/scraper_liturgy'
import ShimmerSegments from '@/components/shimmer_effect/shimmer_segments'

const fetcher = (url: string) => fetch(url).then(async (res) => new LiturgyOfDay(await res.json()));

interface PropsSingleLecture {
  lecture: Lettura | undefined
  isLoading: boolean
  isGospel?: boolean
}

const SingleLecture = (props: PropsSingleLecture) => {
  if (props.isLoading) {
    return <ShimmerSegments numSegments={20} />
  }

  return (
    <>
      <Typography>
        {props.lecture?.titolo}
      </Typography>
      <Typography sx={{pb: 2, pt: 0.5}} style={{fontStyle: 'italic'}}>
        {props.lecture?.versetto}
      </Typography>
      <Typography>
        {props.lecture?.content}
      </Typography>
      <Typography>
        {props.isGospel ? '\nParola del Signore.' : '\nParola di Dio.'}
      </Typography>
    </>
  )
}

export default function Lectures() {
  const [dataLiturgia, setDataLiturgia] = useState(dayjs())
  const { data, error, isLoading } = useSWR('/api/lectures/' + dataLiturgia.format('YYYYMMDD'), fetcher)

  return (
    <Container sx={{minHeight: '100vh', pt: verticalPaddingAppBar*3 + 2, pb: 7, whiteSpace: 'pre-wrap'}} >
        <PraisingAppBar title='Liturgia del giorno (beta)' homeVersion/>
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
          <SingleLecture isLoading={isLoading} lecture={data?.firstLecture}/>
        </Container>
        <Container sx={{py: 2}}>
          <>
          <Typography variant="h2">
              Salmo Responsoriale
          </Typography>
          {
            data?.psalm ?
            <>
              <Typography variant="h4" sx={{pb: 2}} style={{fontWeight: 'normal'}}>
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
              } </> :
              <ShimmerSegments numSegments={10}/>
          }
          </>
        </Container>
        {data?.secondLecture && 
          <Container sx={{py: 2}}>
            <Typography variant="h2" sx={{pb: 2}}>
                Seconda Lettura
            </Typography>
            <SingleLecture isLoading={isLoading} lecture={data?.secondLecture}/>
          </Container>
        }
        <Container sx={{py: 2}}>
          <Typography variant="h2" sx={{pb: 2}}>
              Vangelo
          </Typography>
          <SingleLecture isLoading={isLoading} lecture={data?.gospel} isGospel/>
        </Container>
        <NavBar />
    </Container>
  )
  
}