'use client';

import Container from '@mui/material/Container';
import {
  filterArgomenti,
  filterMomenti,
  getSongsForFilter,
  type Song
} from '@/logic/local_logic';
import PraisingAppBar from '@/components/appbar';
import ListSongs from '@/components/list_songs';
import React from 'react';
import { NextSeo } from 'next-seo';
import Routes from '@/logic/routes';
import type { GetStaticPaths, GetStaticProps } from 'next';

interface FilterPageProps {
  filter: string;
  nameFilter: string;
  songs: Song[];
}

export default function FilterPage({
  filter,
  nameFilter,
  songs
}: FilterPageProps) {
  const url = `${Routes.Base}${Routes.FilteredSongs}/${filter}`;
  const description = `Accordi e testi dei canti cristiani per ${nameFilter.toLowerCase()}: ${songs.length} canti con accordi trasportabili, da leggere, stampare o esportare in PDF.`;

  return (
    <>
      <NextSeo
        title={`Canti per ${nameFilter} - accordi e testi`}
        description={description}
        canonical={url}
        openGraph={{
          title: `Canti per ${nameFilter} - Praising`,
          description,
          url,
          type: 'website',
          locale: 'it_IT'
        }}
      />
      <main>
        <Container>
          <PraisingAppBar title={nameFilter} backIcon />
          <Container sx={{ pt: 4, pb: 7 }} />
          <ListSongs songs={songs} mode="normal" />
        </Container>
      </main>
    </>
  );
}

/** Tutti i filtri sono noti a build time: una pagina statica per ognuno. */
export const getStaticPaths: GetStaticPaths = () => {
  const filters = [
    ...Object.keys(filterMomenti),
    ...Object.keys(filterArgomenti)
  ];
  return {
    paths: filters.map((filter) => ({ params: { filter } })),
    fallback: false
  };
};

export const getStaticProps: GetStaticProps<FilterPageProps> = ({ params }) => {
  const filter = params?.filter;
  if (typeof filter !== 'string') return { notFound: true };

  const nameFilter = filterMomenti[filter] ?? filterArgomenti[filter];
  if (nameFilter === undefined) return { notFound: true };

  const songs = getSongsForFilter(filter);

  return { props: { filter, nameFilter, songs } };
};
