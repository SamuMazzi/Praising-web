import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar'
import Link from 'next/link'
import { useState } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Image from 'next/image'


export default function FeedbackPage() {
  const [body, setBody] = useState("")

  return (
    <Container disableGutters sx={{minHeight: '100vh'}}>
        <PraisingAppBar title='Feedback' backIcon/>
        <Grid container direction="column" justifyContent="center" alignItems="center" sx={{pt: verticalPaddingAppBar*3 + 2, px: 2, pb: 3 }}>
            <Grid item xs={12} md={6}>
                <Image src="assets/undraw_illustrations/undraw_feedback.svg" alt="feedback" width={230} height={230}/>
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography sx={{maxWidth: 600}} style={{whiteSpace: 'pre-wrap'}}>
                    {"Inserisci qui i problemi che vuoi segnalare o i consigli che vuoi dare: saranno accolti con gratitudine!\n"+
                    "Questo non è il mio lavoro e sto sviluppando quest'app praticamente da solo (se non per buona parte della grafica che è merito di mia sorella, "}
                    <Link target="_blank" rel="noopener noreferrer" style={{color: '#d89412'}} href="https://www.linkedin.com/in/susanna-mazzi-53a179157/">Susanna Mazzi</Link>
                    {") quindi potrei metterci un po' a rispondere, ma risponderò sicuramente.\n"+
                    "Grazie e che Dio ti benedica!"}
                    {/** #eca113 */}
                </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography variant="h2" sx={{pt: 5}}>
                    Messaggio
                </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    id="outlined-controlled"
                    label="Controlled"
                    value={body}
                    sx={{ mt: 4 }}
                    multiline
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setBody(event.target.value);
                    }}
                />
            </Grid>
            <Grid item xs={12} md={6} sx={{mt: 2}}>
                <Button variant="contained" LinkComponent={Link} href={"mailto:samuelemazziapp@gmail.com?subject=Feedback%20Praising&body="+encodeURIComponent(body)}>
                    Invia il messaggio!
                </Button>
            </Grid>
            <Divider />
            <Grid item xs={12} md={6}>
                <Typography variant="h2" sx={{pt: 5}}>
                    Contribuisci
                </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography sx={{pt: 2}} style={{maxWidth: 600, whiteSpace: "pre-wrap"}}>
                    {"L'app ti piace e vuoi contribuire al progetto così da aiutarmi a migliorarlo? Anche solo una piccola offerta sarà gradita!\n"+
                    "(Nel caso ricordati di mettere il tuo nome e magari anche indirizzo email cosi che possa ringraziarti!)"}
                </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{mt: 2}}>
                <Button variant="contained" LinkComponent={Link} href={"https://www.paypal.me/samumazzi"}>
                    Contribuisci!
                </Button>
            </Grid>
        </Grid>
    </Container>
  )
  
}