import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface OTPResponse {
  message: string;
}

export const authService = {
  // ---------------- Sign-up OTP ----------------
  async sendSignUpOTP(data: { email: string; username: string }): Promise<OTPResponse> {
    const response = await axios.post<OTPResponse>(`${API_URL}/signup/send-otp`, data);
    return response.data;
  },

  async verifySignUpOTP(email: string, otp: string, username?: string): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL}/signup/verify-otp`, { email, otp, username });
    return response.data;
  },

  // ---------------- Sign-in OTP ----------------
  async sendSignInOTP(email: string): Promise<OTPResponse> {
    const response = await axios.post<OTPResponse>(`${API_URL}/signin/send-otp`, { email });
    return response.data;
  },

  async verifySignInOTP(email: string, otp: string): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL}/signin/verify-otp`, { email, otp });
    return response.data;
  },

  // ---------------- Google Sign-in ----------------
  async googleSignIn(credential: string): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL}/google`, { credential });
    return response.data;
  },
};
