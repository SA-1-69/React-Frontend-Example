import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#F26522',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6d6e70',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#a67436',
      contrastText: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#6d6e70',
    },
  },
})
