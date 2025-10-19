import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: { main: '#2563EB' },
    background: { default: '#FFFFFF' },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2rem', '@media (max-width:600px)': { fontSize: '1.5rem' } },
    body1: { fontSize: '1rem', '@media (max-width:600px)': { fontSize: '0.875rem' } },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: 'inherit',
          '@media (min-width:600px)': {
            padding: '10px 16px',
          },
          '@media (max-width:599px)': {
            padding: '8px 12px',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { borderRadius: '8px' },
        },
      },
    },
  },
});

export default theme;
