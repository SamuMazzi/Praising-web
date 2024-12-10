import Container from '@mui/material/Container';
import PraisingAppBar from '@/components/appbar';

export default function FilterPage() {
  return (
    <Container sx={{ minHeight: '100vh' }}>
      <PraisingAppBar title="Nessun filtro" />
    </Container>
  );
}
