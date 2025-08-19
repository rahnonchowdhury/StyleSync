import { eq } from 'drizzle-orm';
import { db, jobs, Job, NewJob, JobStatus } from '../db';
import { PythonVideoProcessor } from './python-processor';

// Generate unique ID function
function generateUniqueId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export class JobService {
  private processor: PythonVideoProcessor;

  constructor() {
    this.processor = new PythonVideoProcessor();
  }

  async createJob(jobData: NewJob): Promise<Job> {
    const jobId = generateUniqueId();
    
    const [job] = await db.insert(jobs).values({
      id: jobId,
      ...jobData,
      status: JobStatus.PENDING,
      progress: 0,
    }).returning();

    return job;
  }

  async getJob(jobId: string): Promise<Job | null> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));
    return job || null;
  }

  async getAllJobs(): Promise<Job[]> {
    return await db.select().from(jobs).orderBy(jobs.createdAt);
  }

  async updateJobStatus(jobId: string, status: string, progress?: number, errorMessage?: string): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (progress !== undefined) {
      updateData.progress = progress;
    }

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    await db.update(jobs).set(updateData).where(eq(jobs.id, jobId));
  }

  async updateJobOutput(jobId: string, outputPath: string, metrics: any): Promise<void> {
    await db.update(jobs).set({
      outputPath,
      metrics,
      status: JobStatus.COMPLETED,
      progress: 100,
      updatedAt: new Date(),
    }).where(eq(jobs.id, jobId));
  }

  async startProcessing(jobId: string): Promise<void> {
    const job = await this.getJob(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    // Update status to processing
    await this.updateJobStatus(jobId, JobStatus.PROCESSING, 0);

    // Start video processing asynchronously
    this.processor.processVideo(job).catch(async (error) => {
      console.error(`Job ${jobId} failed:`, error);
      await this.updateJobStatus(jobId, JobStatus.FAILED, 0, error.message);
    });
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = await this.getJob(jobId);
    if (!job || job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED) {
      return false;
    }

    await this.updateJobStatus(jobId, JobStatus.FAILED, job.progress, 'Job cancelled by user');
    return true;
  }
}