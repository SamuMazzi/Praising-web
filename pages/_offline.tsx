import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar';

export default function OfflinePage() {
  return (
    <Container
      sx={{ minHeight: '100vh', pt: verticalPaddingAppBar * 3 + 2, pb: 7 }}
    >
      <PraisingAppBar title="Praising" />
      <Typography textAlign="center" sx={{ pt: 2 }}>
        Spiacente, ma la pagina che hai richiesto non è disponibile offline
      </Typography>
    </Container>
  );
}
