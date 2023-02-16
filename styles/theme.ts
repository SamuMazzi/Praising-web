import { createTheme } from '@mui/material/styles'
import "@fontsource/poppins";
import "@fontsource/poppins/800.css";
import "@fontsource/poppins/700.css";

//* https://mui.com/material-ui/icons/#component-prop

export const app_theme = createTheme({
    palette: {
        primary: {
            main: '#F0B647',
            //light: '#AFC4FF',
            //dark: '#353E57',
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
})
