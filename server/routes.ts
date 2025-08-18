import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createJobSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
const outputDir = path.join(process.cwd(), 'outputs');

// Ensure directories exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, MOV, and AVI files are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get style templates
  app.get("/api/style-templates", async (req, res) => {
    try {
      const templates = await storage.getStyleTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch style templates" });
    }
  });

  // Upload videos and create processing job
  app.post("/api/upload", upload.fields([
    { name: 'userVideo', maxCount: 1 },
    { name: 'referenceVideo', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { styleTemplate, options } = req.body;

      if (!files.userVideo || files.userVideo.length === 0) {
        return res.status(400).json({ message: "User video is required" });
      }

      if (!files.referenceVideo && !styleTemplate) {
        return res.status(400).json({ message: "Either reference video or style template is required" });
      }

      const userVideoPath = files.userVideo[0].path;
      const referenceVideoPath = files.referenceVideo?.[0]?.path;

      const jobData = {
        userVideoPath,
        referenceVideoPath,
        styleTemplate,
        options: options ? JSON.parse(options) : {},
      };

      const validatedJob = createJobSchema.parse(jobData);
      const job = await storage.createVideoJob(validatedJob);

      // Start processing in background
      processVideoJob(job.id);

      res.json({ jobId: job.id });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Upload failed" });
    }
  });

  // Get job status
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getVideoJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job status" });
    }
  });

  // Download processed video
  app.get("/api/download/:id", async (req, res) => {
    try {
      const job = await storage.getVideoJob(req.params.id);
      if (!job || !job.outputVideoPath) {
        return res.status(404).json({ message: "Video not found or not ready" });
      }

      if (!fs.existsSync(job.outputVideoPath)) {
        return res.status(404).json({ message: "Video file not found" });
      }

      const filename = `styled_video_${job.id}.mp4`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'video/mp4');

      const fileStream = fs.createReadStream(job.outputVideoPath);
      fileStream.pipe(res);
    } catch (error) {
      res.status(500).json({ message: "Download failed" });
    }
  });

  // Serve uploaded videos for preview
  app.get("/api/video/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.setHeader('Content-Type', 'video/mp4');
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Background video processing function
async function processVideoJob(jobId: string) {
  try {
    await storage.updateVideoJob(jobId, { status: 'processing', progress: 0 });

    const job = await storage.getVideoJob(jobId);
    if (!job) throw new Error("Job not found");

    const outputPath = path.join(outputDir, `output_${jobId}.mp4`);

    // Call Python video processor
    const pythonProcess = spawn('python3', [
      path.join(process.cwd(), 'server', 'video_processor.py'),
      job.userVideoPath,
      job.referenceVideoPath || '',
      job.styleTemplate || '',
      JSON.stringify(job.options),
      outputPath,
      jobId
    ]);

    pythonProcess.stdout.on('data', async (data) => {
      const output = data.toString().trim();
      if (output.startsWith('PROGRESS:')) {
        const progress = parseInt(output.split(':')[1]);
        await storage.updateVideoJob(jobId, { progress });
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Video processing error: ${data}`);
    });

    pythonProcess.on('close', async (code) => {
      if (code === 0) {
        await storage.updateVideoJob(jobId, {
          status: 'completed',
          progress: 100,
          outputVideoPath: outputPath,
          completedAt: new Date(),
        });
      } else {
        await storage.updateVideoJob(jobId, {
          status: 'failed',
          errorMessage: 'Video processing failed',
        });
      }
    });

  } catch (error) {
    await storage.updateVideoJob(jobId, {
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
