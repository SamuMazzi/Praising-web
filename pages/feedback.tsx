'use client';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar';
import Link from 'next/link';
import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Image from 'next/image';
import Card from '@mui/material/Card';

export default function FeedbackPage() {
  const [body, setBody] = useState('');

  return (
    <Container disableGutters sx={{ minHeight: '100vh' }}>
      <PraisingAppBar title="Feedback (beta)" backIcon />
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        sx={{ pt: verticalPaddingAppBar * 3 + 2, px: 2, pb: 3 }}
      >
        <Grid sx={{ mb: 2 }}>
          <Card elevation={8} sx={{ borderRadius: 4, p: 2 }}>
            <Image
              src="assets/undraw_illustrations/undraw_feedback.svg"
              alt="feedback"
              width={230}
              height={230}
            />
          </Card>
        </Grid>
        <Grid>
          <Typography sx={{ maxWidth: 600 }} style={{ whiteSpace: 'pre-wrap' }}>
            {'Inserisci qui i problemi che vuoi segnalare o i consigli che vuoi dare: saranno accolti con piacere!\n' +
              "Non essendo il mio lavoro a tempo pieno potrei metterci un po' a rispondere, ma lo farò sicuramente.\n" +
              'Grazie del tuo supporto!'}
            {/** #eca113 */}
          </Typography>
        </Grid>
        <Grid>
          <TextField
            id="outlined-controlled"
            label=""
            placeholder="Scrivi qui..."
            value={body}
            sx={{ mt: 4 }}
            multiline
            minRows={3}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setBody(event.target.value);
            }}
          />
        </Grid>
        <Grid sx={{ mt: 2 }}>
          <Button
            variant="contained"
            LinkComponent={Link}
            href={
              'mailto:samuelemazziapp@gmail.com?subject=Feedback%20Praising&body=' +
              encodeURIComponent(body)
            }
          >
            Invia il tuo parere!
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
