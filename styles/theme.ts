import { type ThemeOptions } from '@mui/material/styles';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  weight: ['300', '400', '700', '800'],
  style: ['normal', 'italic'],
  subsets: ['latin']
  // display: 'swap'
});

//* https://mui.com/material-ui/icons/#component-prop

const appThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#F0B647'
      // light: '#AFC4FF',
      // dark: '#353E57',
    },
    success: {
      main: '#7DCFB6'
    },
    error: {
      main: '#EF3E36'
    },
    background: {
      default: '#F9F9F9'
    },
    text: {
      primary: '#3A3A3A'
    }
  },
  typography: {
    allVariants: {
      color: '#3A3A3A',
      fontFamily: poppins.style.fontFamily
    },
    h1: {
      fontWeight: 700,
      fontSize: 21
    },
    h2: {
      fontWeight: 700,
      fontSize: 18
    },
    h3: {
      fontWeight: 600,
      fontSize: 17
    },
    h4: {
      fontWeight: 600,
      fontSize: 16
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
        root: {
          borderColor: '#E6E6E6'
        }
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          backgroundColor: '#F2F2F2'
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
            color: '#3A3A3A'
          }
        }
      }
    }
  }
};

export const lightThemeOptions: ThemeOptions = appThemeOptions;

export const darkThemeOptions: ThemeOptions = {
  ...appThemeOptions,
  palette: {
    ...appThemeOptions.palette,
    mode: 'dark',
    background: {
      default: '#3A3A3A'
    },
    text: {
      primary: '#F9F9F9'
    }
  },
  typography: {
    ...appThemeOptions.typography,
    allVariants: {
      fontFamily: poppins.style.fontFamily,
      color: 'white'
    }
  },
  components: {
    ...appThemeOptions.components,
    MuiListItem: {
      ...appThemeOptions.components?.MuiListItem,
      styleOverrides: {
        ...appThemeOptions.components?.MuiListItem?.styleOverrides,
        root: {
          backgroundColor: 'black'
        }
      }
    },
    MuiTextField: {
      ...appThemeOptions.components?.MuiTextField,
      defaultProps: {
        ...appThemeOptions.components?.MuiTextField?.defaultProps,
        inputProps: {
          ...appThemeOptions.components?.MuiTextField?.defaultProps?.inputProps,
          style: {
            color: '#F9F9F9'
          }
        }
      }
    }
  }
};
