import express from 'express';
import cors from 'cors';
import { OAuth2Client } from 'google-auth-library';
import { sign as jwtSign } from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { User } from './models/User';
import { Otp } from './models/Otp';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- Google OAuth ----------------
const client = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID);

// ---------------- Nodemailer Transporter ----------------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ---------------- Notes Model ----------------
const NoteSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);
const Note = mongoose.model('Note', NoteSchema);

// ---------------- Helper Functions ----------------
const generateJWT = (payload: object) =>
  jwtSign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

const sendOTPEmail = async (email: string, username: string, otp: string, purpose: string) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Your ${purpose} OTP`,
    text: `Hello ${username},\n\nYour OTP for ${purpose} is ${otp}.\nIt will expire in 5 minutes.`,
  });
};

// ---------------- SIGN-UP OTP ----------------
app.post('/api/auth/signup/send-otp', async (req, res) => {
  try {
    const { email, username } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ email, otp, username }); // store username for signup

    console.log(`SignUp OTP for ${email}: ${otp}`);
    await sendOTPEmail(email, username, otp, 'sign-up');

    res.json({ message: 'OTP sent successfully to email' });
  } catch (error) {
    console.error('SignUp OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

app.post('/api/auth/signup/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpEntry = await Otp.findOne({ email, otp });
    if (!otpEntry) return res.status(400).json({ message: 'OTP invalid or expired' });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, username: otpEntry.username!, password: 'N/A' });
    }

    await Otp.deleteMany({ email });
    const token = generateJWT({ email, id: user._id });
    res.json({ token, user: { id: user._id, email: user.email, username: user.username } });
  } catch (err) {
    console.error('SignUp verify error:', err);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// ---------------- SIGN-IN OTP ----------------
app.post('/api/auth/signin/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found. Please sign up first.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ email, otp });

    console.log(`SignIn OTP for ${email}: ${otp}`);
    await sendOTPEmail(email, user.username, otp, 'sign-in');

    res.json({ message: 'OTP sent successfully to email' });
  } catch (error) {
    console.error('SignIn OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

app.post('/api/auth/signin/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpEntry = await Otp.findOne({ email, otp });
    if (!otpEntry) return res.status(400).json({ message: 'OTP invalid or expired' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    await Otp.deleteMany({ email });
    const token = generateJWT({ email, id: user._id });
    res.json({ token, user: { id: user._id, email: user.email, username: user.username } });
  } catch (err) {
    console.error('SignIn verify error:', err);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// ---------------- GOOGLE SIGN-IN ----------------
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Credential is required' });

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ message: 'Invalid Google token' });

    const email = payload.email!;
    const username = payload.name!;
    const googleId = payload.sub!;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, username, password: 'N/A' });
    }

    const token = generateJWT({ email, id: user._id, sub: googleId });
    res.json({ token, user: { id: user._id, email: user.email, username: user.username } });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({ message: 'Google authentication failed' });
  }
});

// ---------------- NOTES ----------------
app.post('/api/notes', async (req, res) => {
  try {
    const { userId, title, content } = req.body;
    if (!userId || !title || !content) return res.status(400).json({ message: 'Missing fields' });

    const note = new Note({ userId, title, content });
    const savedNote = await note.save();
    res.json(savedNote);
  } catch (err) {
    console.error('Create note error:', err);
    res.status(500).json({ message: 'Failed to create note' });
  }
});

app.get('/api/notes/:userId', async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error('Fetch notes error:', err);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const result = await Note.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error('Delete note error:', err);
    res.status(500).json({ message: 'Failed to delete note' });
  }
});

// ---------------- CONNECT TO MONGO ----------------
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
