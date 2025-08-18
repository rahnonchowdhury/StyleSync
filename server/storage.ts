import { type VideoJob, type CreateVideoJob, type StyleTemplate } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Video Jobs
  createVideoJob(job: CreateVideoJob): Promise<VideoJob>;
  getVideoJob(id: string): Promise<VideoJob | undefined>;
  updateVideoJob(id: string, updates: Partial<VideoJob>): Promise<VideoJob | undefined>;
  getAllVideoJobs(): Promise<VideoJob[]>;
  
  // Style Templates
  getStyleTemplates(): Promise<StyleTemplate[]>;
}

export class MemStorage implements IStorage {
  private videoJobs: Map<string, VideoJob>;
  private styleTemplates: StyleTemplate[];

  constructor() {
    this.videoJobs = new Map();
    this.styleTemplates = [
      {
        id: "cinematic",
        name: "Cinematic",
        description: "Film-like color grading",
      },
      {
        id: "vibrant",
        name: "Vibrant",
        description: "High saturation, punchy",
      },
      {
        id: "minimal",
        name: "Minimal",
        description: "Clean, muted tones",
      },
      {
        id: "vintage",
        name: "Vintage",
        description: "Retro film aesthetic",
      },
    ];
  }

  async createVideoJob(jobData: CreateVideoJob): Promise<VideoJob> {
    const id = randomUUID();
    const job: VideoJob = {
      ...jobData,
      id,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
    };
    this.videoJobs.set(id, job);
    return job;
  }

  async getVideoJob(id: string): Promise<VideoJob | undefined> {
    return this.videoJobs.get(id);
  }

  async updateVideoJob(id: string, updates: Partial<VideoJob>): Promise<VideoJob | undefined> {
    const job = this.videoJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.videoJobs.set(id, updatedJob);
    return updatedJob;
  }

  async getAllVideoJobs(): Promise<VideoJob[]> {
    return Array.from(this.videoJobs.values());
  }

  async getStyleTemplates(): Promise<StyleTemplate[]> {
    return this.styleTemplates;
  }
}

export const storage = new MemStorage();
