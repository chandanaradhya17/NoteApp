import { useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { GoogleLogin } from '@react-oauth/google';

import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { AuthContainer, RightColumn } from '../components/AuthLayout';

const SignUp = () => {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const formik = useFormik({
    initialValues: { username: '', email: '', otp: '', dateOfBirth: null },
    validate: values => {
      const errors: any = {};
      if (!values.username) errors.username = 'Username is required';
      if (!values.email) errors.email = 'Email is required';
      if (isOtpSent && !values.otp) errors.otp = 'OTP is required';
      return errors;
    },
    onSubmit: async values => {
      try {
        setLoading(true);
        if (!isOtpSent) {
          await authService.sendSignUpOTP({ email: values.email, username: values.username });
          setIsOtpSent(true);
          toast.success('OTP sent to your email');
        } else {
          const { token, user } = await authService.verifySignUpOTP(values.email, values.otp);
          login(token, user);
          toast.success('Signup successful!');
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


        <Typography variant="h1" sx={{ mb: 4 }}>Sign up</Typography>

        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="username"
            name="username"
            label="Name"
            value={formik.values.username}
            onChange={formik.handleChange}
            sx={{ mb: 2 }}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date of Birth"
              value={formik.values.dateOfBirth}
              onChange={value => formik.setFieldValue('dateOfBirth', value)}
              sx={{ width: '100%', mb: 2 }}
            />
          </LocalizationProvider>

          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            disabled={isOtpSent}
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
            {loading ? <CircularProgress size={24} /> : isOtpSent ? 'Verify OTP' : 'Generate OTP'}
          </Button>
        </form>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2">
            Already have an account?
            <Button color="primary" onClick={() => navigate('/signin')}>Sign in</Button>
          </Typography>
        </Box>

        <Box sx={{ my: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ mb: 2 }}>Or sign up with</Typography>
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

export default SignUp;
