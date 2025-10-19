import { useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';

import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { AuthContainer, RightColumn } from '../components/AuthLayout';

const SignIn = () => {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const formik = useFormik({
    initialValues: { email: '', otp: '' },
    validate: values => {
      const errors: any = {};
      if (!values.email) errors.email = 'Email is required';
      if (isOtpSent && !values.otp) errors.otp = 'OTP is required';
      return errors;
    },
    onSubmit: async values => {
      try {
        setLoading(true);
        if (!isOtpSent) {
          await authService.sendSignInOTP(values.email);
          setIsOtpSent(true);
          toast.success('OTP sent to your email');
        } else {
          const { token, user } = await authService.verifySignInOTP(values.email, values.otp);
          login(token, user);
          toast.success('Sign in successful!');
          navigate('/dashboard');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <AuthContainer>
    <Box
  sx={{
    width: { xs: '100%', sm: '400px' },
    p: { xs: 2, sm: 4 },
    backgroundColor: 'white',
    borderRadius: 2,
    boxShadow: { xs: 'none', sm: '0px 4px 12px rgba(0,0,0,0.1)' },
    mx: 'auto',
  }}
>


        <Typography variant="h1" sx={{ mb: 4 }}>Sign in</Typography>

        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            sx={{ mb: 2 }}
          />

          {isOtpSent && (
            <TextField
              fullWidth
              id="otp"
              name="otp"
              label="Enter OTP"
              value={formik.values.otp}
              onChange={formik.handleChange}
              sx={{ mb: 2 }}
            />
          )}

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : isOtpSent ? 'Verify OTP' : 'Get OTP'}
          </Button>
        </form>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2">
            Don't have an account? 
            <Button color="primary" onClick={() => navigate('/')}>Sign up</Button>
          </Typography>
        </Box>

        <Box sx={{ my: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ mb: 2 }}>Or sign in with</Typography>
          <GoogleLogin
            onSuccess={async credentialResponse => {
              try {
                const { token, user } = await authService.googleSignIn(credentialResponse.credential!);
                login(token, user);
                navigate('/dashboard');
              } catch (err: any) {
                toast.error(err.response?.data?.message || 'Google login failed');
              }
            }}
            onError={() => toast.error('Google login failed')}
          />
        </Box>
      </Box>

      <RightColumn />
    </AuthContainer>
  );
};

export default SignIn;
