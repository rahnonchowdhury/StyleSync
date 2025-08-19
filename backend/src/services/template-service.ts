import { eq } from 'drizzle-orm';
import { db, styleTemplates, StyleTemplate } from '../db';

export class TemplateService {
  private defaultTemplates: StyleTemplate[] = [
    {
      id: 'cinematic',
      name: 'Cinematic',
      description: 'Film-like color grading with dramatic curves and professional look',
      previewUrl: null,
      filterChain: {
        filters: [
          "curves=all='0/0 0.25/0.15 0.75/0.85 1/1'",
          "colorbalance=rs=-0.2:gs=0.1:bs=0.15",
          "eq=brightness=0.1:contrast=1.3:saturation=0.85:gamma=1.1",
          "hue=h=5:s=1.1",
          "unsharp=5:5:1.0:5:5:0.5"
        ],
        audioFilters: ["loudnorm=I=-16:TP=-1.5:LRA=11"]
      },
      createdAt: new Date(),
    },
    {
      id: 'vibrant',
      name: 'Vibrant',
      description: 'High energy, social media style with punchy colors and clarity',
      previewUrl: null,
      filterChain: {
        filters: [
          "eq=saturation=1.6:contrast=1.4:brightness=0.15:gamma=0.9",
          "colorbalance=rs=0.15:gs=-0.1:bs=-0.15",
          "curves=all='0/0 0.2/0.35 0.8/0.75 1/1'",
          "hue=h=-3:s=1.2",
          "unsharp=7:7:1.5:7:7:0.3"
        ],
        audioFilters: ["loudnorm=I=-16:TP=-1.5:LRA=11"]
      },
      createdAt: new Date(),
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Clean, professional aesthetic with subtle adjustments',
      previewUrl: null,
      filterChain: {
        filters: [
          "eq=saturation=0.5:contrast=0.85:brightness=0.2:gamma=1.15",
          "colorbalance=rs=0.08:gs=0.08:bs=0.08",
          "curves=all='0/0.15 0.5/0.5 1/0.85'",
          "hue=h=2:s=0.8"
        ],
        audioFilters: ["loudnorm=I=-16:TP=-1.5:LRA=11"]
      },
      createdAt: new Date(),
    },
    {
      id: 'vintage',
      name: 'Vintage',
      description: 'Retro film aesthetic with warm tones and aging effects',
      previewUrl: null,
      filterChain: {
        filters: [
          "eq=saturation=0.7:contrast=1.2:brightness=0.12:gamma=1.05",
          "colorbalance=rs=0.25:gs=0.15:bs=-0.2",
          "curves=all='0/0.1 0.25/0.2 0.75/0.8 1/0.9'",
          "hue=h=8:s=0.9",
          "vignette=PI/4:0.2",
          "noise=alls=25:allf=t+u"
        ],
        audioFilters: ["loudnorm=I=-16:TP=-1.5:LRA=11"]
      },
      createdAt: new Date(),
    }
  ];

  async getAllTemplates(): Promise<StyleTemplate[]> {
    try {
      // Try to get from database first
      const dbTemplates = await db.select().from(styleTemplates);
      
      // If no templates in database, return defaults
      if (dbTemplates.length === 0) {
        return this.defaultTemplates;
      }
      
      return dbTemplates;
    } catch (error) {
      console.warn('Failed to fetch templates from database, using defaults:', error);
      return this.defaultTemplates;
    }
  }

  async getTemplate(templateId: string): Promise<StyleTemplate | null> {
    try {
      // Try database first
      const [template] = await db.select().from(styleTemplates).where(eq(styleTemplates.id, templateId));
      
      if (template) {
        return template;
      }
      
      // Fallback to defaults
      return this.defaultTemplates.find(t => t.id === templateId) || null;
    } catch (error) {
      console.warn('Failed to fetch template from database, checking defaults:', error);
      return this.defaultTemplates.find(t => t.id === templateId) || null;
    }
  }

  async seedDefaultTemplates(): Promise<void> {
    try {
      for (const template of this.defaultTemplates) {
        await db.insert(styleTemplates).values(template).onConflictDoNothing();
      }
      console.log('Default templates seeded successfully');
    } catch (error) {
      console.warn('Failed to seed templates:', error);
    }
  }
}