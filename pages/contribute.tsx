import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar';
import Link from 'next/link';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

export default function FeedbackPage() {
  return (
    <Container disableGutters sx={{ minHeight: '100vh' }}>
      <PraisingAppBar title="Feedback" backIcon />
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        sx={{ pt: verticalPaddingAppBar * 3 + 2, px: 2, pb: 3 }}
      >
        <Grid item>
          <Typography variant="h2" component="h2" sx={{ pt: 5 }}>
            Contribuisci
          </Typography>
        </Grid>
        <Grid item>
          <Typography
            sx={{ pt: 2 }}
            style={{ maxWidth: 600, whiteSpace: 'pre-wrap' }}
          >
            {
              'Questo prodotto è frutto del lavoro combinato mio, per la parte di sviluppo e accordi, e di mia sorella, '
            }
            <Link
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#d89412' }}
              href="https://www.linkedin.com/in/susanna-mazzi-53a179157/"
            >
              Susanna Mazzi
            </Link>
            {', per la parte grafica (solo le cose belle)\n\n' +
              "Se l'app ti piace e vuoi contribuire al progetto così da aiutare a migliorarlo, puoi farlo anche solo con una piccola offerta!\n" +
              '(Se vuoi metti il tuo nome e magari anche un indirizzo email cosi che possa ringraziarti!)'}
          </Typography>
        </Grid>
        <Grid item sx={{ mt: 4 }}>
          <Button
            variant="contained"
            LinkComponent={Link}
            href={'https://www.paypal.me/samumazzi'}
          >
            Contribuisci!
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
