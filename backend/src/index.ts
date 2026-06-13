import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { dealsRouter } from './routes/deals.js';
import { approvalRouter } from './routes/approval.js';
import { aiRouter } from './routes/ai.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Security & parsing
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health check (no auth)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// All API routes require authentication
app.use('/api', authMiddleware);

// Routes
app.use('/api/deals', dealsRouter);
app.use('/api/deals', approvalRouter);
app.use('/api/ai', aiRouter);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[deal-one-pager-api] listening on port ${PORT}`);
});

export default app;
