import { Box, styled } from '@mui/material';

export const AuthContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  minHeight: '100vh',
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
}));

export const RightColumn = styled(Box)(({ theme }) => ({
  flex: 1,
  backgroundImage: `url('/blue-wave.jpg')`,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  width: '100%',
  height: '100vh',
  [theme.breakpoints.down('md')]: {
    display: 'none', // hide background image on mobile & tablets
  },
}));
