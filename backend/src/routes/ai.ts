import { Router, Request, Response } from 'express';
import multer from 'multer';
import { aiService } from '../services/ai.js';

export const aiRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      'image/png',
      'image/jpeg',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// Upload a document and extract deal fields using AI
aiRouter.post('/extract', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  try {
    const suggestions = await aiService.extractDealFields(req.file.buffer, req.file.mimetype);
    res.json({
      suggestions,
      message: 'AI suggestions generated. Review and edit before accepting.',
    });
  } catch (err) {
    console.error('[AI Extract Error]', err);
    res.status(500).json({
      error: 'Failed to process document',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});
