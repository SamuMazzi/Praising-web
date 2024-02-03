import { ThemeOptions, createTheme } from '@mui/material/styles'
import "@fontsource/poppins";
import "@fontsource/poppins/800.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/300.css";

//* https://mui.com/material-ui/icons/#component-prop

const app_theme_options: ThemeOptions = {
    palette: {
        mode: 'light',
        primary: {
            main: '#F0B647',
            //light: '#AFC4FF',
            //dark: '#353E57',
        },
        success: {
            main: '#7DCFB6'
        },
        error: {
            main: '#EF3E36'
        },
        background: {
            default: '#F9F9F9',
        },
        text: {
            primary: '#3A3A3A',
        },
    },
    typography: {
        allVariants: {
            color: '#3A3A3A',
            fontFamily: 'Poppins',
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
                //variantMapping: {},
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: '#E6E6E6',
                },
            },
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    backgroundColor: '#F2F2F2'
                },
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
    },
};


export const light_theme_options: ThemeOptions = app_theme_options

export const dark_theme_options: ThemeOptions = {
    ...app_theme_options,
    palette: {
        ...app_theme_options.palette,
        mode: 'dark',
        background: {
            default: '#3A3A3A',
        },
        text: {
            primary: '#F9F9F9',
        },
    },
    typography: {
        ...app_theme_options.typography,
        allVariants: {
            fontFamily: 'Poppins',
            color: 'white',
        },
    },
    components: {
        ...app_theme_options.components,
        MuiListItem: {
            ...app_theme_options.components?.MuiListItem,
            styleOverrides: {
                ...app_theme_options.components?.MuiListItem?.styleOverrides,
                root: {
                    backgroundColor: 'black'
                },
            }
        },
        MuiTextField: {
            ...app_theme_options.components?.MuiTextField,
            defaultProps: {
                ...app_theme_options.components?.MuiTextField?.defaultProps,
                inputProps: {
                    ...app_theme_options.components?.MuiTextField?.defaultProps?.inputProps,
                    style: {
                        color: '#F9F9F9'
                    }
                }
            }
        }
    }
}
