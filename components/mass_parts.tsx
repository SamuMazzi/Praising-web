/* Hallmark · component: section (parti della messa) · genre: editorial
 * theme: page-native — ambra dell'appbar + geometria delle schede argomenti
 * pre-emit critique: P5 H5 E5 S5 R5 V4
 * states: default · hover · focus-visible (global ring, globals.css) · active · touch
 * contrast: pass — inchiostro #412D0C, 10:1 sul gradino chiaro, 6.2:1 sul piu' scuro
 */

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { NextLinkComposed } from '@/components/link_composed';
import { verticalPaddingAppBar } from '@/components/appbar';
import { filterMomenti, getFilterCount } from '@/logic/local_logic';
import Routes from '@/logic/routes';

/**
 * La sezione "Parti della messa": dieci schede ambra, una per momento della
 * celebrazione, su due righe fisse.
 *
 * Segue le due regole che la pagina applica gia' altrove: una superficie ambra
 * porta inchiostro scuro (e' l'appbar), e cio' che e' ambra ha gli angoli
 * arrotondati ma non e' una pillola — le pillole qui sono le righe nere dei
 * canti. Il giallo resta acceso anche in dark mode: l'appbar e le schede degli
 * argomenti lo sono, e smorzarlo faceva di questa sezione l'unico elemento
 * slavato della schermata.
 *
 * La scritta e' grande e appoggiata in basso a sinistra, non centrata: una
 * parola piccola al centro di un rettangolo colorato sembra un segnaposto, e
 * qui e' la scritta stessa a dover fare il disegno — le illustrazioni sono
 * solo degli argomenti.
 *
 * Sotto al nome, piu' piccolo e piu' basso di voce, quanti canti contiene la
 * sezione: e' un dato di servizio, non il titolo della scheda, e sta appeso al
 * nome invece che per conto suo in un angolo.
 */
const momenti = Object.keys(filterMomenti);

/**
 * Il fondo di una scheda: non una tinta piatta ma una diagonale fra due
 * gradini della scala sabbia. L'appbar e le illustrazioni sono sfumate, e una
 * campitura piatta in mezzo a loro e' cio' che faceva sembrare la sezione
 * appiccicata dopo.
 */
const gradientOf = (index: number): string => {
  const from = Math.min(index + 1, 10);
  const to = Math.min(index + 5, 12);
  return `linear-gradient(135deg, var(--praising-sand-${from}), var(--praising-sand-${to}))`;
};

/**
 * L'ambra piatta era la cosa che faceva "stampato male": una campitura senza
 * spessore in mezzo a un'appbar sfumata e a undici schede disegnate. Due ombre
 * la staccano dal fondo e un filo di luce sul bordo alto le da' la faccia di
 * una superficie invece che di un rettangolo colorato.
 */
const rilievo =
  '0 1px 1px rgba(0, 0, 0, 0.10), 0 10px 20px -14px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.38)';
const rilievoAlto =
  '0 2px 3px rgba(0, 0, 0, 0.12), 0 18px 30px -18px rgba(0, 0, 0, 0.60), inset 0 1px 0 rgba(255, 255, 255, 0.46)';

export default function MassParts() {
  return (
    <>
      <Typography
        variant="h2"
        component="h2"
        sx={{ pt: verticalPaddingAppBar * 3 + 2, px: 2 }}
      >
        Parti della messa
      </Typography>
      {/* Cinque colonne sempre: `repeat(5, ...)` con un minimo in pixel tiene
          le dieci parti su due righe esatte a ogni larghezza, e quando lo
          schermo non le contiene la griglia scorre in orizzontale invece di
          sfaldarsi in tre o quattro righe. L'ordine resta per righe, cioe'
          quello della celebrazione. */}
      <Box
        component="ul"
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(168px, 1fr))',
          gap: 1.25,
          m: 0,
          px: 2,
          py: 2,
          listStyle: 'none',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' }
        }}
      >
        {momenti.map((momento, index) => {
          const canti = getFilterCount(momento);
          return (
            <Box component="li" key={momento} sx={{ display: 'flex' }}>
              <Box
                component={NextLinkComposed}
                to={{ pathname: Routes.FilteredSongs + '/' + momento }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  // Nome e conteggio stanno insieme in basso, con l'aria
                  // sopra: e' quella a tenere su la composizione.
                  justifyContent: 'flex-end',
                  flex: 1,
                  minWidth: 0,
                  minHeight: 92,
                  textAlign: 'left',
                  textDecoration: 'none',
                  px: 1.75,
                  pt: 1.5,
                  pb: 1.5,
                  // L'angolo delle schede degli argomenti.
                  borderRadius: '20px',
                  backgroundImage: gradientOf(index),
                  boxShadow: rilievo,
                  transition:
                    'transform 160ms var(--praising-ease-out), filter 160ms, box-shadow 160ms',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    filter: 'brightness(0.96)',
                    boxShadow: rilievoAlto
                  },
                  // Su touch il :hover resta appiccicato dopo il tap.
                  '@media (hover: none)': {
                    '&:hover': { transform: 'none', filter: 'none' }
                  },
                  '&:active': { transform: 'translateY(0)' }
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    // L'800 e' un peso vero di Poppins (300/400/700/800): il
                    // 600 del tema verrebbe sintetizzato dal browser e impasta.
                    fontWeight: 800,
                    fontSize: 17,
                    // Interlinea stretta: "Agnello di Dio" si tiene insieme
                    // come un blocco, non come tre righe sparse.
                    lineHeight: 1.05,
                    letterSpacing: '-0.015em',
                    color: 'var(--praising-sand-ink)',
                    // Si va a capo fra una parola e l'altra e basta:
                    // "Introduzione" non si spezza mai a meta'. A 17px nel
                    // peso 800 misura ~122px, e la colonna e' minimo 168 meno
                    // 28 di padding: ci sta con un margine di sicurezza.
                    overflowWrap: 'normal',
                    wordBreak: 'normal',
                    hyphens: 'none'
                  }}
                >
                  {filterMomenti[momento]}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    mt: 0.5,
                    fontWeight: 700,
                    fontSize: 12,
                    lineHeight: 1,
                    // Cifre a larghezza fissa: incolonnate in griglia, i
                    // numeri di due cifre non ballano rispetto a quelli di una.
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--praising-sand-ink)',
                    // Lo stesso inchiostro, solo piu' basso di voce: un
                    // secondo colore qui sarebbe una decorazione in piu'.
                    opacity: 0.55
                  }}
                >
                  {canti} {canti === 1 ? 'canto' : 'canti'}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </>
  );
}
