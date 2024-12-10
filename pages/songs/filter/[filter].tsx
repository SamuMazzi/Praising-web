import Container from '@mui/material/Container';
import {
  filterArgomenti,
  filterMomenti,
  getLocalSongs
} from '@/logic/local_logic';
import PraisingAppBar from '@/components/appbar';
import ListSongs from '@/components/list_songs';
import React from 'react';

FilterPage.getInitialProps = async (props: any) => {
  const { filter } = props.query;

  return { filter };
};

interface PropsFilterPage {
  filter: string;
}

export default function FilterPage(props: PropsFilterPage) {
  const localSongs = getLocalSongs().filter(
    (v) =>
      (v.argomento?.includes(props.filter) ?? false) ||
      v.parteMessa?.includes(props.filter)
  );
  const nameFilter =
    filterMomenti[props.filter] ?? filterArgomenti[props.filter];

  return (
    <Container>
      <PraisingAppBar title={nameFilter} backIcon />
      <Container sx={{ pt: 4, pb: 7 }} />
      <ListSongs songs={localSongs} mode="normal" />
    </Container>
  );
}
