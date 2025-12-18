'use client';

import Container from '@mui/material/Container';
import {
  filterArgomenti,
  filterMomenti,
  getLocalSongs
} from '@/logic/local_logic';
import PraisingAppBar from '@/components/appbar';
import ListSongs from '@/components/list_songs';
import React from 'react';
import { useRouter } from 'next/router';

export default function FilterPage() {
  const router = useRouter();
  const { filter } = router.query;
  if (typeof filter !== 'string') {
    return <>Invalid filter</>;
  }
  const localSongs = getLocalSongs().filter(
    (v) =>
      (v.argomento?.includes(filter) ?? false) || v.parteMessa?.includes(filter)
  );
  const nameFilter = filterMomenti[filter] ?? filterArgomenti[filter];

  return (
    <Container>
      <PraisingAppBar title={nameFilter} backIcon />
      <Container sx={{ pt: 4, pb: 7 }} />
      <ListSongs songs={localSongs} mode="normal" />
    </Container>
  );
}
