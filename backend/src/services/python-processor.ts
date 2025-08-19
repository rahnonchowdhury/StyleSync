import { spawn } from 'child_process';
import path from 'path';
import { Job } from '../db';
import { JobService } from './job-service';

export class PythonVideoProcessor {
  private pythonPath: string;
  private scriptPath: string;

  constructor() {
    this.pythonPath = process.env.PYTHON_PATH || 'python3';
    this.scriptPath = process.env.PYTHON_SCRIPT_PATH || path.join(__dirname, '../../../python/style_transfer.py');
  }

  async processVideo(job: Job): Promise<void> {
    return new Promise((resolve, reject) => {
      const outputDir = process.env.OUTPUT_DIR || 'outputs';
      const outputPath = path.join(outputDir, `output_${job.id}.mp4`);
      
      const args = [
        this.scriptPath,
        job.userVideoPath,
        job.referenceVideoPath || '',
        job.styleTemplate || '',
        JSON.stringify(job.options),
        outputPath,
        job.id
      ];

      console.log(`Starting video processing for job ${job.id}`);
      console.log(`Command: ${this.pythonPath} ${args.join(' ')}`);

      const process = spawn(this.pythonPath, args);
      
      let lastProgress = 0;
      let errorOutput = '';

      process.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[${job.id}] ${output}`);

        // Parse progress updates
        const progressMatch = output.match(/PROGRESS:(\d+)/);
        if (progressMatch) {
          const progress = parseInt(progressMatch[1]);
          if (progress > lastProgress) {
            lastProgress = progress;
            this.updateJobProgress(job.id, progress).catch(console.error);
          }
        }

        // Parse metrics (when processing completes)
        const metricsMatch = output.match(/METRICS:(.+)/);
        if (metricsMatch) {
          try {
            const metrics = JSON.parse(metricsMatch[1]);
            this.completeJob(job.id, outputPath, metrics).catch(console.error);
          } catch (error) {
            console.error('Failed to parse metrics:', error);
          }
        }
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`[${job.id}] Error: ${data}`);
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log(`[${job.id}] Processing completed successfully`);
          resolve();
        } else {
          console.error(`[${job.id}] Processing failed with code ${code}`);
          console.error(`[${job.id}] Error output: ${errorOutput}`);
          reject(new Error(`Video processing failed: ${errorOutput || 'Unknown error'}`));
        }
      });

      process.on('error', (error) => {
        console.error(`[${job.id}] Process error:`, error);
        reject(error);
      });
    });
  }

  private async updateJobProgress(jobId: string, progress: number): Promise<void> {
    const jobService = new JobService();
    await jobService.updateJobStatus(jobId, 'processing', progress);
  }

  private async completeJob(jobId: string, outputPath: string, metrics: any): Promise<void> {
    const jobService = new JobService();
    await jobService.updateJobOutput(jobId, outputPath, metrics);
  }
}