'use client';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import NavBar from '@/components/navbar';
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar';
import Box from '@mui/material/Box';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { CalendarSelectSingleDay } from '@/components/calendar';
import 'dayjs/locale/it';
import { type Lettura } from '@/logic/liturgy';
import ShimmerSegments from '@/components/shimmer_effect/shimmer_segments';
import useLecture from '@/logic/hooks/use_lecture';
import { NextSeo } from 'next-seo';
import Routes from '@/logic/routes';

// TODO: 19 agosto 2024 check because it give some "formatting" error

interface PropsSingleLecture {
  lecture: Lettura | undefined;
  isLoading: boolean;
  isGospel?: boolean;
}

const SingleLecture = (props: PropsSingleLecture) => {
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

export default function Lectures() {
  const [dataLiturgia, setDataLiturgia] = useState(dayjs());
  const { content, error, loading } = useLecture(
    `/api/lectures/${dataLiturgia.format('YYYYMMDD')}`
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
          <Typography>{error}</Typography>
        </Box>
        <NavBar />
      </Container>
    );
  }

  return (
    <main>
      <NextSeo
        title="Liturgia del giorno - letture e Vangelo"
        description="Le letture e il Vangelo della liturgia del giorno, insieme agli accordi dei canti per la messa."
        canonical={Routes.Base + Routes.LetturaDelGiorno}
      />
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
        <Container sx={{ pb: 2, pt: 4 }}>
          <Typography variant="h2" component="h2" sx={{ pb: 2 }}>
            Prima lettura
          </Typography>
          <SingleLecture isLoading={loading} lecture={content?.firstLecture} />
        </Container>
        <Container sx={{ py: 2 }}>
          <>
            <Typography variant="h2" component="h2" sx={{ pb: 1 }}>
              Salmo Responsoriale
            </Typography>
            {content?.psalm !== undefined ? (
              <div key="div_psalm">
                <Typography
                  variant="h4"
                  component="h4"
                  sx={{ pb: 2 }}
                  style={{ fontWeight: 'normal' }}
                >
                  {content?.psalm.title}
                </Typography>
                {content?.psalm.chorus.map((chorus, index) => {
                  const lastChorus = index === content?.psalm.chorus.length - 1;
                  return (
                    <div key={'chorus_psalm_' + index}>
                      <Typography
                        style={{ fontWeight: 'bold' }}
                        sx={{ pb: lastChorus ? 2 : 1 }}
                      >
                        R. {chorus}
                      </Typography>
                      {!lastChorus && (
                        <Typography
                          style={{ fontStyle: 'italic', paddingBottom: '8px' }}
                        >
                          Oppure
                        </Typography>
                      )}
                    </div>
                  );
                })}
                {content?.psalm.verses.map((verse, index) => {
                  if (verse.trim() !== '') {
                    return (
                      <Typography key={'verse_psalm_' + index} sx={{ pb: 1 }}>
                        {verse.trim()} <strong> R.</strong>
                      </Typography>
                    );
                  }
                  return <></>;
                })}{' '}
              </div>
            ) : (
              <ShimmerSegments numSegments={10} />
            )}
          </>
        </Container>
        {content?.secondLecture !== undefined && (
          <Container sx={{ py: 2 }}>
            <Typography variant="h2" component="h2" sx={{ pb: 2 }}>
              Seconda Lettura
            </Typography>
            <SingleLecture
              isLoading={loading}
              lecture={content?.secondLecture}
            />
          </Container>
        )}
        <Container sx={{ py: 2 }}>
          <Typography variant="h2" component="h2" sx={{ pb: 2 }}>
            Vangelo
          </Typography>
          <SingleLecture
            isLoading={loading}
            lecture={content?.gospel}
            isGospel
          />
        </Container>
        <NavBar />
      </Container>
    </main>
  );
}
