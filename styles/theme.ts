'use client';

import { createTheme, useColorScheme } from '@mui/material/styles';
import { Poppins } from 'next/font/google';
import { itIT } from '@mui/x-date-pickers/locales';

const poppins = Poppins({
  weight: ['300', '400', '700', '800'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false
});

declare module '@mui/material/styles' {
  interface TypeBackground {
    listItem: string;
  }

  /** Il tema usa le CSS variables: rende `vars`/`colorSchemes` tipati. */
  interface CssThemeVariables {
    enabled: true;
  }
}

//* https://mui.com/material-ui/icons/#component-prop

/**
 * Tema unico basato sulle CSS variables di MUI: entrambi gli schemi di colore
 * vengono emessi nel CSS e selezionati da `data-mui-color-scheme` sull'<html>.
 * L'attributo viene impostato prima del primo paint da InitColorSchemeScript
 * (vedi `pages/_document.tsx`), cosi' non c'e' nessun flash chiaro -> scuro.
 */
const appTheme = createTheme(
  {
    cssVariables: {
      colorSchemeSelector: 'data-mui-color-scheme'
    },
    colorSchemes: {
      light: {
        palette: {
          primary: {
            main: '#F0B647'
          },
          success: {
            main: '#7DCFB6'
          },
          error: {
            main: '#EF3E36'
          },
          background: {
            default: '#F9F9F9',
            listItem: '#F2F2F2'
          },
          text: {
            primary: '#3A3A3A'
          }
        }
      },
      dark: {
        palette: {
          primary: {
            main: '#F0B647'
          },
          success: {
            main: '#7DCFB6'
          },
          error: {
            main: '#EF3E36'
          },
          background: {
            default: '#3A3A3A',
            listItem: '#000000'
          },
          text: {
            primary: '#F9F9F9'
          }
        }
      }
    },
    typography: {
      allVariants: {
        color: 'var(--mui-palette-text-primary)',
        fontFamily: poppins.style.fontFamily
      },
      h1: {
        fontWeight: 700,
        fontSize: 24
      },
      h2: {
        fontWeight: 700,
        fontSize: 22
      },
      h3: {
        fontWeight: 600,
        fontSize: 19
      },
      h4: {
        fontWeight: 600,
        fontSize: 17
      },
      h5: {
        fontWeight: 600,
        fontSize: 15
      }
    },
    components: {
      MuiTypography: {
        defaultProps: {
          // variantMapping: {},
        }
      },
      MuiDivider: {
        styleOverrides: {
          // Il grigio chiaro fisso spariva sul fondo scuro: la riga segue lo
          // schema attivo tramite la CSS variable.
          root: {
            borderColor: 'var(--mui-palette-divider)'
          }
        }
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--mui-palette-background-listItem)'
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          contained: {
            textTransform: 'none',
            fontWeight: 700,
            fontSize: 14
          }
        }
      },
      MuiTextField: {
        defaultProps: {
          inputProps: {
            style: {
              color: 'var(--mui-palette-text-primary)'
            }
          }
        }
      }
    }
  },
  itIT
);

export default appTheme;

/**
 * Con `cssVariables` attivo, `theme.palette` resta fermo sullo schema di
 * default (light): va bene solo per i valori uguali nei due schemi. Per il CSS
 * si usa `theme.vars.palette.*` (che emette una `var(...)` e segue lo schema
 * attivo), mentre dove serve un colore vero — PDF, canvas — si passa da qui.
 */
export const useSchemePalette = () => {
  const { mode, systemMode } = useColorScheme();
  const scheme = (mode === 'system' ? systemMode : mode) ?? 'light';

  return (appTheme.colorSchemes[scheme] ?? appTheme.colorSchemes.light!)
    .palette;
};
