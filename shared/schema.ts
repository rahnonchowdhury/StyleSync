import { z } from "zod";

export const videoJobSchema = z.object({
  id: z.string(),
  userVideoPath: z.string(),
  referenceVideoPath: z.string().optional(),
  styleTemplate: z.string().optional(),
  options: z.object({
    colorPalette: z.boolean().default(true),
    contrastBrightness: z.boolean().default(true),
    filmGrain: z.boolean().default(false),
    matchPacing: z.boolean().default(true),
    autoTransitions: z.boolean().default(false),
    speedAdjustments: z.boolean().default(false),
    audioNormalization: z.boolean().default(true),
    backgroundMusic: z.boolean().default(false),
    soundEffects: z.boolean().default(false),
  }),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  progress: z.number().min(0).max(100).default(0),
  outputVideoPath: z.string().optional(),
  createdAt: z.date(),
  completedAt: z.date().optional(),
  errorMessage: z.string().optional(),
  metadata: z.object({
    processing_time: z.string().optional(),
    style_match: z.number().optional(),
    colors_analyzed: z.number().optional(),
    output_size: z.string().optional(),
  }).optional(),
});

export const createJobSchema = videoJobSchema.omit({
  id: true,
  status: true,
  progress: true,
  outputVideoPath: true,
  createdAt: true,
  completedAt: true,
  errorMessage: true,
  metadata: true,
});

export type VideoJob = z.infer<typeof videoJobSchema>;
export type CreateVideoJob = z.infer<typeof createJobSchema>;

export const styleTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  previewUrl: z.string().optional(),
});

export type StyleTemplate = z.infer<typeof styleTemplateSchema>;
