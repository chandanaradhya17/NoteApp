import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

test('renders welcome or sign-up page', () => {
  render(
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
      <App />
    </GoogleOAuthProvider>
  );

  // Adjust the text according to what exists in your SignUp component
  const signUpText = screen.getByText(/sign up/i);
  expect(signUpText).toBeInTheDocument();
});
