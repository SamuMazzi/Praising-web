'use client';

import * as React from 'react';
import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import { useRouter } from 'next/router';
import { styled } from '@mui/material/styles';

// Add support for the sx prop for consistency with the other branches.
// NextLink renderizza gia' il tag <a>: se lo avvolgessimo in un altro <a>
// otterremmo anchor annidati (HTML non valido) e il link visibile resterebbe
// senza href, quindi non crawlabile.
const Anchor = styled(NextLink)({});

interface NextLinkComposedProps
  extends
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>,
    Omit<
      NextLinkProps,
      'href' | 'as' | 'passHref' | 'onMouseEnter' | 'onClick' | 'onTouchStart'
    > {
  to: NextLinkProps['href'];
}

export const NextLinkComposed = React.forwardRef<
  HTMLAnchorElement,
  NextLinkComposedProps
>(function NextLinkComposed(props, ref) {
  const {
    to,
    replace,
    scroll,
    shallow,
    // Prefetch automatico disattivato: le tile di navigazione sono tante e
    // tutte visibili insieme, quindi Next le prefetcherebbe tutte durante il
    // caricamento della pagina (un chunk + un JSON ciascuna). Lo facciamo
    // invece "a intenzione", qui sotto.
    prefetch = false,
    locale,
    onMouseEnter,
    onFocus,
    onPointerDown,
    ...other
  } = props;

  const router = useRouter();
  const alreadyPrefetched = React.useRef(false);

  /**
   * Prefetch quando l'utente mostra l'intenzione di aprire il link (hover,
   * focus da tastiera, dito che scende): si guadagnano ~100-200 ms sulla
   * navigazione senza scaricare nulla per i link che nessuno aprira'.
   */
  const prefetchOnIntent = React.useCallback((): void => {
    if (alreadyPrefetched.current || prefetch !== false) return;
    const href = typeof to === 'string' ? to : to.pathname;
    if (href === undefined || href === null || href === '') return;
    alreadyPrefetched.current = true;
    // In sviluppo router.prefetch e' un no-op: nessun problema.
    void router.prefetch(href).catch(() => {
      // Un prefetch fallito non deve rompere nulla: al click si naviga e basta.
      alreadyPrefetched.current = false;
    });
  }, [router, to, prefetch]);

  return (
    <Anchor
      href={to}
      prefetch={prefetch}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      locale={locale}
      ref={ref}
      onMouseEnter={(event) => {
        prefetchOnIntent();
        onMouseEnter?.(event);
      }}
      onFocus={(event) => {
        prefetchOnIntent();
        onFocus?.(event);
      }}
      onPointerDown={(event) => {
        prefetchOnIntent();
        onPointerDown?.(event);
      }}
      {...other}
    />
  );
});
