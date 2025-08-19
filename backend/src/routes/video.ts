import express from 'express';
import multer from 'multer';
import path from 'path';
import { insertJobSchema } from '../db/schema';
import { JobService } from '../services/job-service';

const router = express.Router();

// Generate unique filename function
function generateUniqueId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = generateUniqueId();
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept video files only
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  },
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '100000000'), // 100MB default
  },
});

const jobService = new JobService();

// Upload videos and start processing
router.post('/upload', upload.fields([
  { name: 'userVideo', maxCount: 1 },
  { name: 'referenceVideo', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const { styleTemplate, options } = req.body;

    if (!files.userVideo || files.userVideo.length === 0) {
      return res.status(400).json({ error: 'User video is required' });
    }

    const userVideoPath = files.userVideo[0].path;
    const referenceVideoPath = files.referenceVideo?.[0]?.path;

    // Parse options (comes as string from form data)
    let parsedOptions;
    try {
      parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
    } catch (error) {
      return res.status(400).json({ error: 'Invalid options format' });
    }

    // Validate job data
    const jobData = {
      userVideoPath,
      referenceVideoPath,
      styleTemplate,
      options: parsedOptions,
    };

    const validatedData = insertJobSchema.parse(jobData);
    
    // Create and start job
    const job = await jobService.createJob(validatedData);
    await jobService.startProcessing(job.id);

    res.json({ 
      success: true, 
      jobId: job.id,
      message: 'Upload successful. Processing started.'
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: 'errors' in error ? error.errors : []
      });
    }

    res.status(500).json({ 
      error: 'Upload failed', 
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as videoRoutes };