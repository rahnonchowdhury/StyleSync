import { pgTable, text, timestamp, integer, jsonb, serial, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Jobs table for tracking video processing
export const jobs = pgTable('jobs', {
  id: text('id').primaryKey(),
  userVideoPath: text('user_video_path').notNull(),
  referenceVideoPath: text('reference_video_path'),
  styleTemplate: text('style_template'),
  options: jsonb('options').notNull(),
  status: text('status').notNull().default('pending'), // pending, processing, completed, failed
  progress: integer('progress').default(0),
  outputPath: text('output_path'),
  errorMessage: text('error_message'),
  metrics: jsonb('metrics'), // processing time, style match, colors analyzed, output size
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Style templates table
export const styleTemplates = pgTable('style_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  previewUrl: text('preview_url'),
  filterChain: jsonb('filter_chain').notNull(), // FFmpeg filter parameters
  createdAt: timestamp('created_at').defaultNow(),
});

// Session table (used by express-session)
export const sessions = pgTable('session', {
  sid: varchar('sid').primaryKey(),
  sess: jsonb('sess').notNull(),
  expire: timestamp('expire').notNull(),
});

// Zod schemas for validation
export const insertJobSchema = createInsertSchema(jobs, {
  userVideoPath: z.string().min(1, 'User video path is required'),
  options: z.object({
    colorPalette: z.boolean().optional(),
    contrastBrightness: z.boolean().optional(),
    filmGrain: z.boolean().optional(),
    matchPacing: z.boolean().optional(),
    autoTransitions: z.boolean().optional(),
    speedAdjustments: z.boolean().optional(),
    audioNormalization: z.boolean().optional(),
    backgroundMusic: z.boolean().optional(),
    soundEffects: z.boolean().optional(),
  }),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStyleTemplateSchema = createInsertSchema(styleTemplates).omit({
  createdAt: true,
});

// TypeScript types
export type Job = typeof jobs.$inferSelect;
export type NewJob = z.infer<typeof insertJobSchema>;
export type StyleTemplate = typeof styleTemplates.$inferSelect;
export type NewStyleTemplate = z.infer<typeof insertStyleTemplateSchema>;

// Job status enum
export const JobStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type JobStatusType = typeof JobStatus[keyof typeof JobStatus];