import Container from '@mui/material/Container';
import PraisingAppBar from '@/components/appbar';
import React from 'react';

export default function FilterPage(): JSX.Element {
  return (
    <Container sx={{ minHeight: '100vh' }}>
      <PraisingAppBar title="Nessun filtro" />
    </Container>
  );
}
