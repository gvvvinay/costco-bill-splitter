import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import authRoutes from './routes/auth.js';
import googleAuthRoutes from './routes/googleAuth.js';
import sessionRoutes from './routes/sessions.js';
import receiptRoutes from './routes/receipts.js';
import participantRoutes from './routes/participants.js';
import userRoutes from './routes/users.js';
import reportRoutes from './routes/reports.js';
import emailRoutes from './routes/email.js';
import whatsappRoutes from './routes/whatsapp.js';
import { errorHandler } from './middleware/errorHandler.js';
import { startScheduledJobs } from './services/schedulerService.js';

const app = express();
const PORT = process.env.PORT || 9001;

// Middleware
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:9000',
      'https://1bcc33484ef4.ngrok-free.app',
      'https://95cdabbc194b.ngrok-free.app',
      'https://0ad256c30ad7.ngrok-free.app',
      'https://f32a76712c69.ngrok-free.app',
      'https://75f626d0364c.ngrok-free.app'
    ].filter(Boolean) as string[]
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:9000', 'https://1bcc33484ef4.ngrok-free.app', 'https://95cdabbc194b.ngrok-free.app', 'https://0ad256c30ad7.ngrok-free.app', 'https://f32a76712c69.ngrok-free.app', 'https://75f626d0364c.ngrok-free.app'];

app.use(cors({
  origin: allowedOrigins as any,
  credentials: true
}));
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  useTempFiles: false, // Store in memory instead of temp files
  abortOnLimit: true,
  debug: false
}));
app.use(express.json());

// Serve uploaded receipts
app.use('/uploads', express.static('uploads'));
app.use('/api/uploads', express.static('uploads'));

// Serve privacy policy
app.get('/privacy-policy', (req, res) => {
  res.sendFile('privacy-policy.html', { root: '..' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

// Start scheduled jobs (daily email summaries, etc.)
startScheduledJobs();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
