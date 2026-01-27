import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import authRoutes from './routes/auth.js';
import googleAuthRoutes from './routes/googleAuth.js';
import sessionRoutes from './routes/sessions.js';
import receiptRoutes from './routes/receipts.js';
import participantRoutes from './routes/participants.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL].filter(Boolean)
  : ['http://localhost:3000', 'http://localhost:3001', 'https://0ad256c30ad7.ngrok-free.app'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  useTempFiles: false, // Store in memory instead of temp files
  abortOnLimit: true,
  debug: true
}));

// Serve uploaded receipts
app.use('/uploads', express.static('uploads'));
app.use('/api/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/participants', participantRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
