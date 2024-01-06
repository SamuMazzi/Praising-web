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
            color: 'black',
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
        MuiButton: {
            styleOverrides: {
                contained: {
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: 14
                }
            }
        }
    },
};


const light_theme_options: ThemeOptions = app_theme_options

const dark_theme_options: ThemeOptions = {
    ...app_theme_options,
    palette: {
        ...app_theme_options.palette,
        mode: 'dark',
        background: {
            default: '#2E294E',
        },
    },
    typography: {
        ...app_theme_options.typography,
        allVariants: {
            ...app_theme_options.typography!.allVariants,
            color: 'white',
        },
    },
}

export const app_theme = createTheme(light_theme_options)
