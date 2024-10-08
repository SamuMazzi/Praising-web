import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import NavBar from '@/components/navbar';
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar';
import useSWR from 'swr';
import Box from '@mui/material/Box';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { CalendarSelectSingleDay } from '@/components/calendar';
import 'dayjs/locale/it';
import { type Lettura, LiturgyOfDay } from '@/logic/scraper_liturgy';
import ShimmerSegments from '@/components/shimmer_effect/shimmer_segments';

// TODO: 19 agosto 2024 check because it give some "formatting" error

const fetcher = async (url: string): Promise<LiturgyOfDay | undefined> =>
  await fetch(url).then(async (res) => {
    if (res.status === 200) {
      const json = await res.json();
      return new LiturgyOfDay(json);
    }
    if (res.status === 500) {
      const msg = JSON.parse(await res.text()).error;
      throw Error(msg as string);
    }
  });

interface PropsSingleLecture {
  lecture: Lettura | undefined;
  isLoading: boolean;
  isGospel?: boolean;
}

const SingleLecture = (props: PropsSingleLecture): JSX.Element => {
  if (props.isLoading) {
    return <ShimmerSegments numSegments={20} />;
  }

  return (
    <>
      <Typography>{props.lecture?.title}</Typography>
      <Typography sx={{ pb: 2, pt: 0.5 }} style={{ fontStyle: 'italic' }}>
        {props.lecture?.verse}
      </Typography>
      <Typography>{props.lecture?.content}</Typography>
      <Typography>
        {props.isGospel !== undefined && props.isGospel
          ? '\nParola del Signore.'
          : '\nParola di Dio.'}
      </Typography>
    </>
  );
};

export default function Lectures(): JSX.Element {
  const [dataLiturgia, setDataLiturgia] = useState(dayjs());
  const { data, error, isLoading } = useSWR(
    '/api/lectures/' + dataLiturgia.format('YYYYMMDD'),
    fetcher
  );

  if (error !== undefined) {
    return (
      <Container
        sx={{
          minHeight: '100vh',
          pt: verticalPaddingAppBar * 3 + 2,
          pb: 7,
          whiteSpace: 'pre-wrap'
        }}
      >
        <PraisingAppBar title="Liturgia del giorno" homeVersion />
        <Box display="flex" alignItems="center" justifyContent="center">
          <Typography>{error.message}</Typography>
        </Box>
        <NavBar />
      </Container>
    );
  }

  return (
    <Container
      sx={{
        minHeight: '100vh',
        pt: verticalPaddingAppBar * 3 + 2,
        pb: 7,
        whiteSpace: 'pre-wrap'
      }}
    >
      <PraisingAppBar title="Liturgia del giorno" homeVersion />
      <CalendarSelectSingleDay
        daySelected={dataLiturgia}
        onChangeDate={setDataLiturgia}
      />
      <Container sx={{ py: 2 }}>
        <Typography variant="h2" sx={{ pb: 2 }}>
          Prima lettura
        </Typography>
        <SingleLecture isLoading={isLoading} lecture={data?.firstLecture} />
      </Container>
      <Container sx={{ py: 2 }}>
        <>
          <Typography variant="h2">Salmo Responsoriale</Typography>
          {data?.psalm !== undefined ? (
            <>
              <Typography
                variant="h4"
                sx={{ pb: 2 }}
                style={{ fontWeight: 'normal' }}
              >
                {data?.psalm.title}
              </Typography>
              <Typography style={{ fontWeight: 'bold' }} sx={{ pb: 2 }}>
                R. {data?.psalm.chorus}
              </Typography>
              {data?.psalm.verses.map((verso): JSX.Element => {
                if (verso.trim() !== '') {
                  return (
                    <Typography key={verso} sx={{ pb: 1 }}>
                      {verso.trim()} <strong> R.</strong>
                    </Typography>
                  );
                }
                return <></>;
              })}{' '}
            </>
          ) : (
            <ShimmerSegments numSegments={10} />
          )}
        </>
      </Container>
      {data?.secondLecture !== undefined && (
        <Container sx={{ py: 2 }}>
          <Typography variant="h2" sx={{ pb: 2 }}>
            Seconda Lettura
          </Typography>
          <SingleLecture isLoading={isLoading} lecture={data?.secondLecture} />
        </Container>
      )}
      <Container sx={{ py: 2 }}>
        <Typography variant="h2" sx={{ pb: 2 }}>
          Vangelo
        </Typography>
        <SingleLecture isLoading={isLoading} lecture={data?.gospel} isGospel />
      </Container>
      <NavBar />
    </Container>
  );
}
